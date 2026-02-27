// src/services/db.service.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../../data');

const readJsonFile = async (filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJsonFile(filename, []);
      return [];
    }
    throw error;
  }
};

const writeJsonFile = async (filename, data) => {
  const filePath = path.join(dataDir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

export const getUsers = async () => {
  return await readJsonFile('users.json');
};

export const getUserById = async (id) => {
  const users = await getUsers();
  return users.find((user) => user.id === id) || null;
};

export const getUserByEmail = async (email) => {
  const users = await getUsers();
  return users.find((user) => user.email === email) || null;
};

export const getUserByUsername = async (username) => {
  const users = await getUsers();
  return users.find((user) => user.username === username) || null;
};

export const createUser = async (userData) => {
  const users = await getUsers();
  users.push(userData);
  await writeJsonFile('users.json', users);
  return userData;
};

export const updateUser = async (id, updates) => {
  const users = await getUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  await writeJsonFile('users.json', users);
  return users[index];
};

export const getChats = async () => {
  return await readJsonFile('chats.json');
};

export const getChatById = async (id) => {
  const chats = await getChats();
  return chats.find((chat) => chat.id === id) || null;
};

export const getChatsByUserId = async (userId) => {
  const chats = await getChats();
  return chats.filter((chat) => chat.participantIds.includes(userId));
};

export const getChatByParticipants = async (userId1, userId2) => {
  const chats = await getChats();
  return (
    chats.find(
      (chat) =>
        chat.participantIds.includes(userId1) &&
        chat.participantIds.includes(userId2)
    ) || null
  );
};

export const createChat = async (chatData) => {
  const chats = await getChats();
  chats.push(chatData);
  await writeJsonFile('chats.json', chats);
  return chatData;
};

export const updateChat = async (id, updates) => {
  const chats = await getChats();
  const index = chats.findIndex((chat) => chat.id === id);
  if (index === -1) return null;

  chats[index] = { ...chats[index], ...updates };
  await writeJsonFile('chats.json', chats);
  return chats[index];
};

export const getMessages = async () => {
  return await readJsonFile('messages.json');
};

export const getMessagesByChatId = async (chatId) => {
  const messages = await getMessages();
  return messages
    .filter((msg) => msg.chatId === chatId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const getMessagesByChannelId = async (channelId) => {
  const messages = await getMessages();
  return messages
    .filter((msg) => msg.channelId === channelId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export const createMessage = async (messageData) => {
  const messages = await getMessages();
  messages.push(messageData);
  await writeJsonFile('messages.json', messages);
  return messageData;
};

export const updateMessage = async (id, updates) => {
  const messages = await getMessages();
  const index = messages.findIndex((msg) => msg.id === id);
  if (index === -1) return null;

  messages[index] = { ...messages[index], ...updates };
  await writeJsonFile('messages.json', messages);
  return messages[index];
};

export const updateMessageStatus = async (messageId, status) => {
  return await updateMessage(messageId, { status });
};

export const getChannels = async () => {
  return await readJsonFile('channels.json');
};

export const getChannelById = async (id) => {
  const channels = await getChannels();
  return channels.find((channel) => channel.id === id) || null;
};

export const getChannelByUsername = async (username) => {
  const channels = await getChannels();
  return channels.find((channel) => channel.username === username) || null;
};

export const getChannelsByUserId = async (userId) => {
  const channels = await getChannels();
  return channels.filter((channel) => channel.memberIds.includes(userId));
};

export const createChannel = async (channelData) => {
  const channels = await getChannels();
  channels.push(channelData);
  await writeJsonFile('channels.json', channels);
  return channelData;
};

export const updateChannel = async (id, updates) => {
  const channels = await getChannels();
  const index = channels.findIndex((channel) => channel.id === id);
  if (index === -1) return null;

  channels[index] = { ...channels[index], ...updates };
  await writeJsonFile('channels.json', channels);
  return channels[index];
};

export const deleteChannel = async (id) => {
  const channels = await getChannels();
  const filtered = channels.filter((channel) => channel.id !== id);
  await writeJsonFile('channels.json', filtered);
};

export const getMessageById = async (id) => {
  const messages = await getMessages();
  return messages.find((msg) => msg.id === id) || null;
};

export const deleteMessage = async (id) => {
  const messages = await getMessages();
  const filtered = messages.filter((msg) => msg.id !== id);
  await writeJsonFile('messages.json', filtered);
};

export const getReactions = async () => {
  return await readJsonFile('reactions.json');
};

export const getReactionsByMessageId = async (messageId) => {
  const reactions = await getReactions();
  return reactions.filter((r) => r.messageId === messageId);
};

export const addReaction = async (reactionData) => {
  const reactions = await getReactions();

  const existing = reactions.find(
    (r) =>
      r.messageId === reactionData.messageId &&
      r.userId === reactionData.userId &&
      r.emoji === reactionData.emoji
  );

  if (existing) return existing;

  reactions.push(reactionData);
  await writeJsonFile('reactions.json', reactions);
  return reactionData;
};

export const removeReaction = async (messageId, userId, emoji) => {
  const reactions = await getReactions();
  const filtered = reactions.filter(
    (r) =>
      !(
        r.messageId === messageId &&
        r.userId === userId &&
        r.emoji === emoji
      )
  );
  await writeJsonFile('reactions.json', filtered);
};

export const getReports = async () => {
  return await readJsonFile('reports.json');
};

export const getReportById = async (id) => {
  const reports = await getReports();
  return reports.find((r) => r.id === id) || null;
};

export const createReport = async (reportData) => {
  const reports = await getReports();
  reports.push(reportData);
  await writeJsonFile('reports.json', reports);
  return reportData;
};

export const updateReport = async (id, updates) => {
  const reports = await getReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return null;

  reports[index] = { ...reports[index], ...updates };
  await writeJsonFile('reports.json', reports);
  return reports[index];
};

export const getBlocks = async () => {
  return await readJsonFile('blocks.json');
};

export const getBlocksByUserId = async (userId) => {
  const blocks = await getBlocks();
  return blocks.filter((b) => b.blockerId === userId);
};

export const getBlockedByUserId = async (userId) => {
  const blocks = await getBlocks();
  return blocks.filter((b) => b.blockedId === userId);
};

export const isBlocked = async (blockerId, blockedId) => {
  const blocks = await getBlocks();
  return blocks.some(
    (b) => b.blockerId === blockerId && b.blockedId === blockedId
  );
};

export const createBlock = async (blockData) => {
  const blocks = await getBlocks();
  blocks.push(blockData);
  await writeJsonFile('blocks.json', blocks);
  return blockData;
};

export const removeBlock = async (blockerId, blockedId) => {
  const blocks = await getBlocks();
  const filtered = blocks.filter(
    (b) => !(b.blockerId === blockerId && b.blockedId === blockedId)
  );
  await writeJsonFile('blocks.json', filtered);
};

export const getSuspensions = async () => {
  return await readJsonFile('suspensions.json');
};

export const getActiveSuspension = async (userId) => {
  const suspensions = await getSuspensions();
  const now = new Date();
  return (
    suspensions.find(
      (s) => s.userId === userId && s.isActive && new Date(s.expiresAt) > now
    ) || null
  );
};

export const createSuspension = async (suspensionData) => {
  const suspensions = await getSuspensions();
  suspensions.push(suspensionData);
  await writeJsonFile('suspensions.json', suspensions);
  return suspensionData;
};

export const updateSuspension = async (id, updates) => {
  const suspensions = await getSuspensions();
  const index = suspensions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  suspensions[index] = { ...suspensions[index], ...updates };
  await writeJsonFile('suspensions.json', suspensions);
  return suspensions[index];
};

export const getBroadcasts = async () => {
  return await readJsonFile('broadcasts.json');
};

export { readJsonFile, writeJsonFile };
