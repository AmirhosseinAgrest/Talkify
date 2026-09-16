// src/routes/report.routes.js

import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', reportController.createReport);
router.get('/', requireAdmin, reportController.getAllReports);
router.put('/:reportId/review', requireAdmin, reportController.reviewReport);
router.put('/:reportId/dismiss', requireAdmin, reportController.dismissReport);

export default router;
