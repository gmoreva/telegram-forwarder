import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Scenes, Telegraf } from 'telegraf';

export const COMMAND_CONNECT = 'connect';

@Injectable()
export class TelegramService implements OnApplicationBootstrap {
  private readonly logger = new Logger(this.constructor.name);

  constructor(@InjectBot() private bot: Telegraf<Scenes.SceneContext>) {}

  public async middleware(ctx: Context, next: any) {
    try {
      await next();
    } catch (e) {
      this.logger.error(`Error when handling update`);
      this.logger.error(ctx);
      this.logger.error(e);
    }
  }

  async onApplicationBootstrap(): Promise<any> {
    this.bot.use(this.middleware);
    this.bot.telegram.getMe().then((r) => {
      this.logger.log(`started bot: @${r.username}`);
    });
  }
}
