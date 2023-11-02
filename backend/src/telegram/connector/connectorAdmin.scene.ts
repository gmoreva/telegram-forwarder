import { Ctx, Help, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { CONNECTOR_ADMIN } from '../scenes';
import { Injectable } from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ExtraCopyMessage } from 'telegraf/typings/telegram-types';

@Scene(CONNECTOR_ADMIN)
@Injectable()
export class ConnectorAdminScene {
  constructor(private connectorService: ConnectorService) {
  }

  @SceneEnter()
  async help(@Ctx() ctx: Context) {
    await ctx.reply('Admin system started');
    return this.onMessage(ctx);
  }

  @Help()
  async helpSupport(@Ctx() ctx: Context) {
    await ctx.reply(
      'Для ответа пользователю нужно ответить на сообщение через reply. Или перейти в тред по ссылке головного сообщения и писать ответы там',
    );
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const message: any = ctx.update.message;
    const replyTo = message.reply_to_message?.message_id;
    if (replyTo) {
      const foundChat = await this.connectorService.getConnection(replyTo);
      await this.connectorService.saveChatMessageId(
        foundChat.userId,
        foundChat.userMessageId,
        ctx.message.message_id,
      );
      if (foundChat) {
        let extra: ExtraCopyMessage = {};
        if (!foundChat.isInit) {
          extra = {
            reply_to_message_id: foundChat.userMessageId
          };
        }

        await ctx.copyMessage(foundChat.userId, extra);
      }
    }
  }
}
