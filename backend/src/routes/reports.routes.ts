import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();
const reportsController = new ReportsController();

// All report routes require authentication and admin role
router.use(authenticate);
router.use(authorize([UserRole.ADMIN]));

// ==================== REPORT TYPES ====================
router.get('/types', reportsController.getReportTypes);

// ==================== REPORTS ====================
router.get('/daily', reportsController.getDailyReport);
router.get('/monthly', reportsController.getMonthlyReport);
router.get('/student/:studentId/history', reportsController.getStudentHistory);

// ==================== ANALYTICS ====================
router.get('/analytics/trends', reportsController.getPickupTrends);
router.get('/analytics/dashboard', reportsController.getDashboardStats);

export default router;
