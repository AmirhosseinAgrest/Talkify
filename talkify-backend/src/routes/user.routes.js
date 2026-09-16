// src/routes/user.routes.js

import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadAvatar } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUser);

router.put('/profile', userController.updateProfile);
router.put('/profile/avatar', uploadAvatar.single('avatar'), userController.updateAvatar);
router.delete('/profile/avatar', userController.deleteAvatar);

router.put('/password', userController.changePassword);

router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

router.delete('/account', userController.deleteAccount);

export default router;
