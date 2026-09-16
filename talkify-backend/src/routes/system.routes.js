// src/routes/system.routes.js

import { Router } from 'express';
import * as systemController from '../controllers/system.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.post('/broadcast', systemController.sendBroadcast);
router.get('/broadcast/history', systemController.getBroadcastHistory);

router.post('/message', systemController.sendManualMessage);

router.get('/account', systemController.getSystemAccount);

export default router;
