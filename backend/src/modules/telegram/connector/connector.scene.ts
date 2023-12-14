import { Command, Ctx, On, Scene, SceneEnter, SceneLeave, } from 'nestjs-telegraf';
import { Context, Scenes } from 'telegraf';
import { CONNECTOR } from './../scenes';
import { Injectable, Logger } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ConfigService } from '@nestjs/config';
import type { Message } from "telegraf/types";
import { Sender } from '@modules/telegram/entities/connector.entity';
import { Update } from 'typegram';
import EditedMessageUpdate = Update.EditedMessageUpdate;

@Scene(CONNECTOR)
@Injectable()
export class ConnectorScene {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private connectorService: ConnectorService, private readonly configService: ConfigService) {
  }

  @SceneEnter()
  async help(@Ctx() ctx: Context) {
    const connectorService = this.connectorService;
    await ctx.reply(
      'Пишите мне также, как писали бы обычному человеку. Я буду вашим связным:)',
    );
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.id;
    const text = '!NEW! ' + username;
    let adminTelegramId = this.configService.get('telegram.chats.adminSupportChatId');
    let sendMessageExtra: Parameters<typeof ctx.telegram.sendMessage>[2] = {};
    let canCreateTopic = this.configService.get('telegram.connector.topics');
    if (canCreateTopic) {
      try {
        const createdTopic = await ctx.telegram.createForumTopic(adminTelegramId, `Chat_${ctx.from.id}`);
        sendMessageExtra.message_thread_id = createdTopic.message_thread_id;
        await this.connectorService.saveChatMessageId(ctx.from.id, ctx.message.message_id, sendMessageExtra.message_thread_id, false, true, Sender.USER);
        this.logger.log(`Created topic for message: Name: ${createdTopic.name}, MessageId: ${createdTopic.message_thread_id}`);
      } catch (e) {
        this.logger.warn(`Topics are not supported in this chat`);
        this.logger.warn(e);
        canCreateTopic = false;
      }
    }
    const data = await ctx.telegram.sendMessage(
      adminTelegramId,
      text,
      sendMessageExtra
    );
    if (!canCreateTopic) {
      const url =
        '\n[ТРЕД](https://t.me/c/' +
        adminTelegramId.toString().slice(4) +
        '/' +
        data.message_id +
        '?thread=' +
        data.message_id +
        ')';
      await ctx.telegram.editMessageText(
        adminTelegramId,
        data.message_id,
        null,
        `${text} ${url}`,
        {
          parse_mode: 'Markdown',
        },
      );
    }
    await connectorService.saveChatMessageId(
      ctx.from.id,
      (ctx.update as any).message.message_id,
      data.message_id,
      true,
      false,
      Sender.USER
    );
  }

  @SceneLeave()
  async leavingScene(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.reply('Спасибо за диалог');
  }

  @Command('cancel')
  async cancel(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.scene.leave();
  }

  @On('edited_message')
  async onEditedMessage(@Ctx() ctx: Context<EditedMessageUpdate<any>>) {
    const foundUserMessage = await this.connectorService.getConnectionByUserMessageId(ctx.update.edited_message.from.id, ctx.update.edited_message.message_id);
    if (foundUserMessage) {
      await this.connectorService.handleEditMessage(ctx, this.configService.get('telegram.chats.adminSupportChatId'), foundUserMessage.adminMessageId);
    }
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context<Update.MessageUpdate<Message.TextMessage>>) {
    this.logger.log(ctx.update);
    if (!ctx.update.message) {
      this.logger.warn(`Unknown update`);
    }
    let connection = await this.connectorService.getInitAdminConnection(ctx.from.id);
    if (!connection) return;
    connection = (
        this.configService.get('telegram.connector.topics') &&
        await this.connectorService.getTopicAdminConnection(ctx.from.id))
      || connection;
    const replyToMessageIdAsTopic = connection.adminMessageId;
    const replyToFromMessage = ctx.update.message.reply_to_message?.message_id;
    let finalReplyTo = replyToMessageIdAsTopic;
    if (replyToFromMessage) {
      const connectedRepliedMessage = await this.connectorService.getConnectionByUserMessageId(ctx.update.message.from.id, replyToFromMessage);
      finalReplyTo = connectedRepliedMessage ? connectedRepliedMessage.adminMessageId : replyToMessageIdAsTopic;
    }

    const copiedMessage = await ctx.copyMessage(
      this.connectorService.getSupportAdminTelegramId(),
      {
        reply_to_message_id: finalReplyTo || replyToMessageIdAsTopic,
      },
    );
    await this.connectorService.saveChatMessageId(
      ctx.from.id,
      ctx.message.message_id,
      copiedMessage.message_id,
      false,
      false,
      Sender.USER
    );
  }
}
