import { Ctx, Help, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { CONNECTOR_ADMIN } from '../scenes';
import { Injectable, Logger } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ExtraCopyMessage } from 'telegraf/typings/telegram-types';
import { ConfigService } from '@nestjs/config';
import { Update } from 'typegram';
import MessageUpdate = Update.MessageUpdate;

@Scene(CONNECTOR_ADMIN)
@Injectable()
export class ConnectorAdminScene {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private connectorService: ConnectorService, private config: ConfigService) {
  }

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

  @On('message')
  async onMessage(@Ctx() ctx: Context<MessageUpdate<any>>) {
    this.logger.log(ctx.update);
    if (!ctx.update.message) {
      this.logger.warn(`Unknown update`);
    }
    const message: any = ctx.update.message;
    const replyTo = message.reply_to_message?.message_id;
    if (replyTo) {
      const foundChat = await this.connectorService.getConnectionByAdminChatId(replyTo);
      if (foundChat) {
        await this.connectorService.saveChatMessageId(
          foundChat.userId,
          foundChat.userMessageId,
          ctx.message.message_id,
        );
        let extra: ExtraCopyMessage = {};
        if (!foundChat.isInit) {
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
          );
        } catch (e) {
          this.logger.error(e);
        }
      }
    }
  }
}
