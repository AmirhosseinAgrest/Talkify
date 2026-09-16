// src/routes/suspension.routes.js

import { Router } from 'express';
import * as suspensionController from '../controllers/suspension.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/check', suspensionController.checkSuspension);

router.post('/', requireAdmin, suspensionController.suspendUser);
router.delete('/:suspensionId', requireAdmin, suspensionController.unsuspendUser);
router.get('/active', requireAdmin, suspensionController.getActiveSuspensions);
router.get('/all', requireAdmin, suspensionController.getAllSuspensions);

export default router;
