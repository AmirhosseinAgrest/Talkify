// src/routes/admin.routes.js

import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminController.getAllUsers);
router.post('/users/:userId/verify', adminController.verifyUser);
router.delete('/users/:userId/verify', adminController.unverifyUser);

router.get('/channels', adminController.getAllChannels);
router.post('/channels/:channelId/verify', adminController.verifyChannel);
router.delete('/channels/:channelId/verify', adminController.unverifyChannel);

router.post('/users/:userId/admin', requireSuperAdmin, adminController.addSystemAdmin);
router.delete('/users/:userId/admin', requireSuperAdmin, adminController.removeSystemAdmin);

export default router;
