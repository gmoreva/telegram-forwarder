import { Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context, Scenes } from 'telegraf';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONNECTOR, CONNECTOR_ADMIN } from './scenes';
import { COMMAND_CONNECT } from './telegram.service';

@Update()
@Injectable()
export class AppUpdate {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private config: ConfigService) {}

  @Start()
  async start(@Ctx() ctx: Scenes.SceneContext): Promise<void> {
    await this.help(ctx);
  }

  @Command(COMMAND_CONNECT)
  async connect(@Ctx() ctx: Scenes.SceneContext): Promise<void> {
    await ctx.scene.enter(CONNECTOR);
  }

  async help(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply(
      `Добрый день! С Вами говорит виртуальный помощник ${this.config.get(
        'telegram.ownerName',
        `$\{username}`,
      )}. Вам доступны следующие команды:

/connect - связаться с $\{username}
/help - увидеть это сообщение`,
    );
  }

  @On('message')
  async onMessage(@Ctx() ctx: Scenes.SceneContext): Promise<void> {
    this.logger.log(`Message: ${JSON.stringify(ctx.message)}`);
    this.logger.log(
      `Current settings: ${JSON.stringify(this.config.get('telegram.chats'))}`,
    );
    const common = this.handleCommonUpdates(ctx);
    if (!common) {
      return;
    }
    switch (ctx.chat.id.toString()) {
      case this.config.get('telegram.chats.adminSupportChatId'):
        await ctx.scene.enter(CONNECTOR_ADMIN);
        break;
      default:
        await this.help(ctx);
    }
  }

  private handleCommonUpdates(@Ctx() ctx: Scenes.SceneContext): boolean {
    if (ctx.message.group_chat_created) {
      this.logger.log(
        'just created new chat and me was added to this',
        ctx.message.chat.title,
        ctx.message.chat.id,
      );
      return false;
    }
    if (ctx.message.left_chat_participant?.id === ctx.botInfo.id) {
      this.logger.log(
        'i was deleted from chat',
        ctx.message.chat.title,
        ctx.message.chat.id,
      );
      return false;
    }
    if (ctx.message.new_chat_member?.id === ctx.botInfo.id) {
      this.logger.log(
        'i was added to chat',
        ctx.message.chat.title,
        ctx.message.chat.id,
      );
      return false;
    }

    return true;
  }
}
