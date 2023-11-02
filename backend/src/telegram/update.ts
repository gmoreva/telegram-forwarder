import { Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context, Scenes } from 'telegraf';
import {
  CONNECTOR,
  CONNECTOR_ADMIN,
} from './scenes';
import { Injectable, Logger } from '@nestjs/common';
import { ConnectorService } from './connector/connector.service';
import { COMMAND_CONNECT, TelegramService } from './telegram.service';

@Update()
@Injectable()
export class AppUpdate {
  private readonly logger = new Logger(AppUpdate.name);

  constructor(
    private connectorService: ConnectorService,
    private telegramService: TelegramService,
  ) {
  }

  @Start()
  async start(@Ctx() ctx: Scenes.SceneContext) {
    await this.help(ctx);
  }

  @Command(COMMAND_CONNECT)
  async connect(@Ctx() ctx: Scenes.SceneContext) {
    await ctx.scene.enter(CONNECTOR);
  }

  async help(@Ctx() ctx: Context) {
    await ctx.reply(
      `Добрый день! С Вами говорит виртуальный помощник \${username}. Вам доступны следующие команды:` +
      '\n\n' +
      '/connect - связаться с \${username}' +
      '\n' +
      '/help - увидеть это сообщение'
    );
  }

  @On('message')
  async onMessage(@Ctx() ctx: Scenes.SceneContext) {
    if (ctx.message['group_chat_created']) {
      this.logger.log(
        'just created new chat and me was added to this',
        ctx.message.chat['title'],
        ctx.message.chat.id,
      );
      return;
    }
    if (ctx.message['left_chat_participant']?.id === ctx.botInfo.id) {
      this.logger.log(
        'i was deleted from chat',
        ctx.message.chat['title'],
        ctx.message.chat.id,
      );
      return;
    }
    if (ctx.message['new_chat_member']?.id === ctx.botInfo.id) {
      this.logger.log(
        'i was added to chat',
        ctx.message.chat['title'],
        ctx.message.chat.id,
      );
      return;
    }
    this.logger.log('Handling update');
    const allChatsConfig = {
      supportAdminTelegramId: this.connectorService.getSupportAdminTelegramId(),
    };
    this.logger.log(`Current settings: ${JSON.stringify(allChatsConfig)}`);
    switch (ctx.chat.id) {
      case allChatsConfig.supportAdminTelegramId:
        this.logger.log('Enter Support admin');
        await ctx.scene.enter(CONNECTOR_ADMIN);
        break;
      default:
        await this.help(ctx);
    }
  }
}
