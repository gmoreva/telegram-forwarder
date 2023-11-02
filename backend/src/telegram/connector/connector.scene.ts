import {
  Update,
  Ctx,
  Start,
  Help,
  On,
  Hears,
  Scene,
  SceneEnter,
  Command,
  SceneLeave,
} from 'nestjs-telegraf';
import { Context, Scenes } from 'telegraf';
import { CONNECTOR } from './../scenes';
import { Injectable } from '@nestjs/common';
import { ConnectorService } from './connector.service';

@Scene(CONNECTOR)
@Injectable()
export class ConnectorScene {
  constructor(private connectorService: ConnectorService) {
  }

  @SceneEnter()
  async help(@Ctx() ctx: Context) {
    const connectorService = this.connectorService;
    await ctx.reply(
      'Пишите мне также, как писали бы Антону. Я буду вашим связным:)',
    );
    const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.id;
    let text = '!NEW! ' + username;
    const data = await ctx.telegram.sendMessage(
      connectorService.getSupportAdminTelegramId(),
      text,
    );
    const url =
      '\n[ТРЕД](https://t.me/c/' +
      connectorService.getSupportAdminTelegramId().toString().slice(4) +
      '/' +
      data.message_id +
      '?thread=' +
      data.message_id + ')';
    await ctx.telegram.editMessageText(
      connectorService.getSupportAdminTelegramId(),
      data.message_id,
      null,
      text + ' ' + url,
      {
        parse_mode: 'Markdown'
      }
    );
    await connectorService.saveChatMessageId(ctx.from.id, (ctx.update as any).message.message_id, data.message_id, true);
  }

  @SceneLeave()
  async leavingScene(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.reply('Спасибо за диалог');
  }

  @Command('cancel')
  async cancel(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.scene.leave();
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const connection = await this.connectorService.getInitAdminConnection(ctx.from.id);
    if (!connection) return;
    const copiedMessage = await ctx.copyMessage(
      this.connectorService.getSupportAdminTelegramId(),
      {
        reply_to_message_id: connection.adminMessageId,
      },
    );
    await this.connectorService.pushMessageUsers(
      ctx.from.id,
      copiedMessage.message_id,
    );
  }
}
