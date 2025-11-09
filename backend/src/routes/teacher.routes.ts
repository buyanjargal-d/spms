import { Router, Request, Response } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();
const teacherController = new TeacherController();

/**
 * @route   GET /api/v1/teachers/me/class
 * @desc    Get teacher's assigned class
 * @access  Private (Teacher, Admin)
 */
router.get('/me/class', authenticate, authorize([UserRole.TEACHER, UserRole.ADMIN]), (req: Request, res: Response) => teacherController.getMyClass(req, res));

/**
 * @route   GET /api/v1/teachers/me/students
 * @desc    Get students in teacher's class
 * @access  Private (Teacher, Admin)
 */
router.get('/me/students', authenticate, authorize([UserRole.TEACHER, UserRole.ADMIN]), (req: Request, res: Response) => teacherController.getMyStudents(req, res));

/**
 * @route   GET /api/v1/teachers/me/stats
 * @desc    Get teacher's dashboard statistics
 * @access  Private (Teacher, Admin)
 */
router.get('/me/stats', authenticate, authorize([UserRole.TEACHER, UserRole.ADMIN]), (req: Request, res: Response) => teacherController.getDashboardStats(req, res));

/**
 * @route   GET /api/v1/teachers/me/pickup-summary
 * @desc    Get today's pickup summary for teacher's class
 * @access  Private (Teacher, Admin)
 */
router.get('/me/pickup-summary', authenticate, authorize([UserRole.TEACHER, UserRole.ADMIN]), (req: Request, res: Response) => teacherController.getPickupSummary(req, res));

export default router;
