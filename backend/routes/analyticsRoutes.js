import express from 'express';
import { getAdminOverview, getEmployeeOverview } from '../controllers/analyticsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/admin-overview', authMiddleware, getAdminOverview);
router.get('/employee/:id', authMiddleware, getEmployeeOverview);

export default router;
