export const telegram = () => {
  return {
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      ownerName: process.env.OWNER_NAME,
      chats: {
        adminSupportChatId: process.env.ADMIN_SUPPORT_CHAT
      },
      connector: {
        topics: process.env.WORK_WITH_TOPICS === '1'
      }
    }
  };
};