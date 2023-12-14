import { Context } from 'telegraf';
import { Message } from 'telegraf/types';
import { Update } from 'typegram';
import EditedMessageUpdate = Update.EditedMessageUpdate;

export async function handleEditMessage(
  ctx: Context<EditedMessageUpdate<any>>,
  chatId: number,
  messageId: number,
): Promise<void> {
  const { update } = ctx;
  const editedMessage = update.edited_message as unknown;
  const editedTextMessage = editedMessage as Message.TextMessage;
  const editedPhoto = editedMessage as Message.PhotoMessage;
  if (editedTextMessage.text)
    await ctx.telegram.editMessageText(
      chatId,
      messageId,
      undefined,
      update.edited_message.text,
    );
  if (editedPhoto.photo) {
    const photoId = editedPhoto.photo[0].file_id;
    await ctx.telegram.editMessageMedia(chatId, messageId, undefined, {
      type: 'photo',
      media: photoId,
      caption: editedPhoto.caption,
    });
  }
}
