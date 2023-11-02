import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Scenes, Telegraf } from 'telegraf';

export const COMMAND_CONNECT = 'connect';


@Injectable()
export class TelegramService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectBot() private bot: Telegraf<Scenes.SceneContext>
  ) {
    this.bot.telegram.getMe().then(r => {
      this.logger.log('started bot: @' + r.username);
    })
  }

  public getUserAvailableCommands(userId: number = null): [string] {
    return [
      COMMAND_CONNECT
    ];
  }
}
