import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ConnectorEntity, Sender } from '../entities/connector.entity';

@Injectable()
export class ConnectorService {
  constructor(
    @InjectEntityManager()
    private readonly man: EntityManager,
  ) {}

  public async getInitAdminConnection(
    userId: number,
  ): Promise<ConnectorEntity> {
    return this.man.findOne(ConnectorEntity, {
      where: {
        userId,
        isInit: true,
      },
    });
  }

  public async getTopicAdminConnection(
    userId: number,
  ): Promise<ConnectorEntity> {
    return this.man.findOne(ConnectorEntity, {
      where: {
        userId,
        isTopicStart: true,
      },
    });
  }

  public async getConnectionByAdminChatId(
    messageId: number,
  ): Promise<ConnectorEntity> {
    return this.man.findOne(ConnectorEntity, {
      where: {
        adminMessageId: messageId,
      },
    });
  }

  public async getConnectionByUserMessageId(
    userId: number,
    userMessageId: number,
  ): Promise<ConnectorEntity> {
    return this.man.findOne(ConnectorEntity, {
      where: {
        userId,
        userMessageId,
      },
    });
  }

  public async saveChatMessageId(
    userId: number,
    userMessageId: number,
    adminMessageId: number,
    isInit: boolean,
    isTopicStart: boolean,
    sender: Sender,
  ): Promise<void> {
    const element = this.man.create(ConnectorEntity, {
      userMessageId,
      adminMessageId,
      userId,
      isInit,
      isTopicStart,
      sender,
    });
    await this.man.save(element);
  }

  public getSupportAdminTelegramId(): number {
    return Number(process.env.ADMIN_SUPPORT_CHAT.toString());
  }
}
