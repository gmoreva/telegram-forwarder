import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ConnectorEntity, Sender } from '../entities/connector.entity';
import { Context } from 'telegraf';
import { Update } from 'typegram';
import { Message } from 'telegraf/types';
import EditedMessageUpdate = Update.EditedMessageUpdate;

@Injectable()
export class ConnectorService {
  constructor(
    @InjectEntityManager()
    private readonly man: EntityManager,
  ) {
  }

  public async getInitAdminConnection(
    userId: number,
  ): Promise<ConnectorEntity> {
    return await this.man.findOne(ConnectorEntity, {
      where: {
        userId,
        isInit: true,
      },
    });
  }

  public async getTopicAdminConnection(
    userId: number,
  ): Promise<ConnectorEntity> {
    return await this.man.findOne(ConnectorEntity, {
      where: {
        userId,
        isTopicStart: true,
      },
    });
  }

  public async getConnectionByAdminChatId(messageId: number): Promise<ConnectorEntity> {
    return await this.man.findOne(ConnectorEntity, {
      where: {
        adminMessageId: messageId,
      },
    });
  }

  public async getConnectionByUserMessageId(userId: number, userMessageId: number): Promise<ConnectorEntity> {
    return await this.man.findOne(ConnectorEntity, {
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
    isInit = false,
    isTopicStart = false,
    sender: Sender,
  ): Promise<void> {
    const element = this.man.create(ConnectorEntity, {
      userMessageId,
      adminMessageId,
      userId,
      isInit,
      isTopicStart,
      sender
    });
    await this.man.save(element);
  }

  public getSupportAdminTelegramId(): number {
    return Number(process.env.ADMIN_SUPPORT_CHAT.toString());
  }

  public async handleEditMessage(ctx: Context<EditedMessageUpdate<any>>, chatId: number, messageId: number) {
    const update = ctx.update;
    const editedMessage = update.edited_message as unknown;
    let editedTextMessage = editedMessage as Message.TextMessage;
    let editedPhoto = editedMessage as Message.PhotoMessage;
    if (editedTextMessage.text)
      await ctx.telegram.editMessageText(chatId, messageId, undefined, update.edited_message.text);
    if (editedPhoto.photo) {
      const photoId = editedPhoto.photo[0].file_id;
      await ctx.telegram.editMessageMedia(chatId, messageId, undefined, {
        type: 'photo',
        media: photoId,
        caption: editedPhoto.caption
      });
    }
  }
}
