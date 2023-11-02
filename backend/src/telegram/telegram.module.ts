import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { SQLite } from '@telegraf/session/sqlite';
import * as path from 'path';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { AppUpdate } from './update';
import { ConnectorService } from './connector/connector.service';
import { ConnectorModule } from './connector/connector.module';
import * as fs from 'fs';
import { settings } from '../const';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectorEntity } from './connector/connector.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectorEntity]),
    TelegrafModule.forRootAsync({
      useFactory: async () => {
        console.log('creating telegram module');
        const store = SQLite({
          filename: settings.sqlitePath,
        });

        return {
          token: process.env.TELEGRAM_BOT_TOKEN,
          middlewares: [session({store})],
        };
      },
    }),
    ConnectorModule,
  ],
  providers: [AppUpdate, TelegramService, ConnectorService]
})
export class TelegramModule {
}
