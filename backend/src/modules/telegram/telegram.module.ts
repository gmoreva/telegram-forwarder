import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { AppUpdate } from './update';
import { ConnectorModule } from './connector/connector.module';
import { Postgres } from '@telegraf/session/pg';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('database');
        return {
          token: configService.get('telegram.botToken'),
          middlewares: [session({
            store: Postgres({
              host: config.host,
              user: config.username,
              password: config.password,
              port: Number(config.port),
              database: config.database,
            })
          })],
        };
      },
    }),
    ConnectorModule,
  ],
  providers: [AppUpdate, TelegramService]
})
export class TelegramModule {
}
