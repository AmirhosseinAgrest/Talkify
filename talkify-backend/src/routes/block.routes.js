// src/routes/block.routes.js

import { Router } from 'express';
import * as blockController from '../controllers/block.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', blockController.blockUser);
router.delete('/', blockController.unblockUser);
router.get('/', blockController.getBlockedUsers);
router.get('/check/:userId', blockController.checkBlockStatus);

export default router;
