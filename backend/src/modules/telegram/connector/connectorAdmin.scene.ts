import { Ctx, Help, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Injectable, Logger } from '@nestjs/common';
import { ExtraCopyMessage } from 'telegraf/typings/telegram-types';
import { ConfigService } from '@nestjs/config';
import { Update } from 'typegram';
import { Sender } from '@modules/telegram/entities/connector.entity';
import MessageUpdate = Update.MessageUpdate;
import EditedMessageUpdate = Update.EditedMessageUpdate;
import { handleEditMessage } from '@modules/telegram/connector/helpers';
import { ConnectorService } from './connector.service';
import { CONNECTOR_ADMIN } from '../scenes';

@Scene(CONNECTOR_ADMIN)
@Injectable()
export class ConnectorAdminScene {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private connectorService: ConnectorService,
    private config: ConfigService,
  ) {}

  @SceneEnter()
  async help(@Ctx() ctx: Context<any>) {
    this.logger.log('Enter Support admin');
    return this.onMessage(ctx);
  }

  @Help()
  async helpSupport(@Ctx() ctx: Context) {
    await ctx.reply(
      'Для ответа пользователю нужно ответить на сообщение через reply. Или перейти в тред по ссылке головного сообщения и писать ответы там',
    );
  }

  @On('edited_message')
  async onEditedMessage(@Ctx() ctx: Context<EditedMessageUpdate<any>>) {
    const foundUserMessage =
      await this.connectorService.getConnectionByAdminChatId(
        ctx.update.edited_message.message_id,
      );
    if (foundUserMessage) {
      await handleEditMessage(
        ctx,
        foundUserMessage.userId,
        foundUserMessage.userMessageId,
      );
    }
  }

  // @On('rem')

  @On('message')
  async onMessage(@Ctx() ctx: Context<MessageUpdate<any>>) {
    this.logger.log(ctx.update);
    if (!ctx.update.message) {
      this.logger.warn(`Unknown update`);
    }
    const { message } = ctx.update;
    const replyTo = message.reply_to_message?.message_id;
    if (replyTo) {
      const foundChat = await this.connectorService.getConnectionByAdminChatId(
        replyTo,
      );
      if (foundChat) {
        let extra: ExtraCopyMessage = {};
        if (!foundChat.isInit && !foundChat.isTopicStart) {
          extra = {
            reply_to_message_id: foundChat.userMessageId,
          };
        }
        try {
          const copyResult = await ctx.copyMessage(foundChat.userId, extra);
          await this.connectorService.saveChatMessageId(
            foundChat.userId,
            copyResult.message_id,
            ctx.message.message_id,
            false,
            false,
            Sender.ADMIN,
          );
        } catch (e) {
          this.logger.error(e);
        }
      }
    }
  }
}
