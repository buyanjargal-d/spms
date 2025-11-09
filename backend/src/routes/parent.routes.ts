import { Router, Request, Response } from 'express';
import { ParentController } from '../controllers/parent.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();
const parentController = new ParentController();

/**
 * @route   GET /api/v1/parents/me/children
 * @desc    Get parent's children
 * @access  Private (Parent)
 */
router.get('/me/children', authenticate, authorize([UserRole.PARENT]), (req: Request, res: Response) => parentController.getMyChildren(req, res));

/**
 * @route   GET /api/v1/parents/me/requests
 * @desc    Get parent's pickup requests
 * @access  Private (Parent)
 */
router.get('/me/requests', authenticate, authorize([UserRole.PARENT]), (req: Request, res: Response) => parentController.getMyRequests(req, res));

/**
 * @route   GET /api/v1/parents/me/guardians/:studentId
 * @desc    Get authorized guardians for a student
 * @access  Private (Parent)
 */
router.get('/me/guardians/:studentId', authenticate, authorize([UserRole.PARENT]), (req: Request, res: Response) => parentController.getAuthorizedGuardians(req, res));

/**
 * @route   GET /api/v1/parents/me/stats
 * @desc    Get parent's dashboard statistics
 * @access  Private (Parent)
 */
router.get('/me/stats', authenticate, authorize([UserRole.PARENT]), (req: Request, res: Response) => parentController.getDashboardStats(req, res));

export default router;
