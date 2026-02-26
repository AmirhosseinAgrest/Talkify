// src/routes/chat.routes.js

import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', chatController.getChats);
router.post('/', chatController.createChat);
router.get('/:chatId', chatController.getChat);
router.get('/:chatId/messages', chatController.getMessages);
router.post('/:chatId/messages', chatController.sendMessage);

router.post('/:chatId/messages/upload', upload.single('file'), chatController.sendMessageWithFile);

router.put('/messages/:messageId', chatController.editMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);

router.post('/messages/:messageId/reactions', chatController.addReaction);
router.delete('/messages/:messageId/reactions', chatController.removeReaction);

router.post('/find-or-create', chatController.findOrCreateChat);
export default router;