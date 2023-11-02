import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ConnectorEntity } from './connector.entity';

@Injectable()
export class ConnectorService {
  private userChats = {};
  private messageUsers = {};

  constructor(
    @InjectEntityManager()
    private readonly man: EntityManager,
  ) {
  }

  public async getInitAdminConnection(userId: number): Promise<ConnectorEntity> {
    const el = await this.man.findOne(ConnectorEntity, {
      where: {
        userId,
        isInit: true
      }
    });
    return el;
  }

  public async getChatByMessageId(messageId: number) {
    const el = await this.getConnection(messageId);
    return el.userId;
  }

  public async getConnection(messageId: number): Promise<ConnectorEntity> {
    const el = await this.man.findOne(ConnectorEntity, {
      where: {
        adminMessageId: messageId,
      }
    });
    return el;
  }

  public async saveChatMessageId(userId: number, userMessageId: number, adminMessageId: number, isInit: boolean = false): Promise<void> {
    const element = this.man.create(ConnectorEntity, {
      userMessageId,
      adminMessageId,
      userId,
      isInit,
    });
    await this.man.save(element);
  }

  public pushMessageUsers(userId: number, messageId: number) {
    this.messageUsers[messageId] = userId;
  }

  public getSupportAdminTelegramId(): number {
    return Number(process.env.AMOREV_SUPPORT_CHAT.toString());
  }
}
