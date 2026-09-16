// src/services/system.service.js

import { v4 as uuidv4 } from 'uuid';
import * as db from './db.service.js';
import { MESSAGE_STATUS, MESSAGE_TYPE } from '../utils/constants.js';

export const getSystemAccount = async () => {
  const users = await db.getUsers();
  return users.find((u) => u.isSystemAccount === true) || null;
};

export const sendSystemMessage = async (userId, content, type = 'notification') => {
  const systemAccount = await getSystemAccount();
  if (!systemAccount) {
    console.error('❌ System account not found!');
    return null;
  }

  let chat = await db.getChatByParticipants(systemAccount.id, userId);

  if (!chat) {
    chat = {
      id: uuidv4(),
      participantIds: [systemAccount.id, userId],
      isSystemChat: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.createChat(chat);
  }

  const message = {
    id: uuidv4(),
    chatId: chat.id,
    senderId: systemAccount.id,
    content,
    type: MESSAGE_TYPE.TEXT,
    systemMessageType: type,
    isSystemMessage: true,
    status: MESSAGE_STATUS.SENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.createMessage(message);

  await db.updateChat(chat.id, {
    updatedAt: new Date().toISOString(),
  });

  return { chat, message };
};

export const sendWelcomeMessage = async (userId, username) => {
  const content = `👋 Hi ${username}!

Welcome to Talkify! 🎉

We're excited to have you here. In this messenger, you can:

✅ Chat with your friends  
✅ Follow different channels  
✅ Send photos, videos, and files  
✅ And enjoy many more features!

If you have any questions, feel free to ask here (our support team reviews all messages).

Best regards,  
The Talkify Team 💙`;

  return await sendSystemMessage(userId, content, 'welcome');
};

export const sendSuspensionNotification = async (userId, reason, expiresAt, isPermanent) => {
  const formatDuration = () => {
    if (isPermanent) return 'permanently';

    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `for ${days} day(s) and ${hours} hour(s)`;
    return `for ${hours} hour(s)`;
  };

  const content = `⚠️ Account Suspension Notice

Your account has been suspended ${formatDuration()}.

📌 Reason: ${reason}
⏰ Suspension Ends: ${isPermanent ? 'Unknown (Permanent)' : new Date(expiresAt).toLocaleString('en-US')}

During this period:
❌ You cannot send messages in chats
❌ You cannot send messages in channels
✅ You can still view channel content

If you believe this is a mistake, please contact support.`;

  return await sendSystemMessage(userId, content, 'suspension');
};

export const sendBlockNotification = async (userId, blockerUsername) => {
  const content = `🚫 Notification

User "${blockerUsername}" has blocked you.

This means:
❌ You cannot send messages to this user
❌ This user cannot send messages to you

Date: ${new Date().toLocaleString('en-US')}`;

  return await sendSystemMessage(userId, content, 'block');
};

export const sendBroadcastMessage = async (content, adminId) => {
  const systemAccount = await getSystemAccount();
  if (!systemAccount) {
    throw new Error('System account not found');
  }

  const users = await db.getUsers();
  const results = [];

  const targetUsers = users.filter(
    (u) => !u.isSystemAccount && u.role !== 'admin' && u.role !== 'super_admin' && !u.isDeleted
  );

  const broadcastContent = `📢 Global Announcement from Talkify

${content}

---
Date: ${new Date().toLocaleString('en-US')}`;

  for (const user of targetUsers) {
    try {
      await sendSystemMessage(user.id, broadcastContent, 'broadcast');
      results.push({ userId: user.id, success: true });
    } catch (error) {
      results.push({ userId: user.id, success: false, error: error.message });
    }
  }

  const broadcasts = await db.readJsonFile('broadcasts.json').catch(() => []);
  broadcasts.push({
    id: uuidv4(),
    content,
    adminId,
    sentTo: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    createdAt: new Date().toISOString(),
  });
  await db.writeJsonFile('broadcasts.json', broadcasts);

  return {
    total: targetUsers.length,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  };
};

export const sendManualMessage = async (userId, content) => {
  return await sendSystemMessage(userId, content, 'manual');
};

export const isSystemChat = async (chatId) => {
  const chat = await db.getChatById(chatId);
  if (!chat) return false;

  const systemAccount = await getSystemAccount();
  if (!systemAccount) return false;

  return chat.participantIds.includes(systemAccount.id);
};

export const isSystemUser = async (userId) => {
  const user = await db.getUserById(userId);
  return user?.isSystemAccount === true;
};
