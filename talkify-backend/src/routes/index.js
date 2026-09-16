// src/routes/index.js

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import chatRoutes from './chat.routes.js';
import userRoutes from './user.routes.js';
import channelRoutes from './channel.routes.js';
import adminRoutes from './admin.routes.js';
import reportRoutes from './report.routes.js';
import blockRoutes from './block.routes.js';
import suspensionRoutes from './suspension.routes.js';
import systemRoutes from './system.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/users', userRoutes);
router.use('/channels', channelRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportRoutes);
router.use('/blocks', blockRoutes);
router.use('/suspensions', suspensionRoutes);
router.use('/system', systemRoutes);

export default router;
