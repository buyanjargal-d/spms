import { Router, Request, Response } from 'express';
import guardController from '../controllers/guard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @route   POST /api/v1/guards/verify-qr
 * @desc    Verify pickup by QR code
 * @access  Private (Guard, Admin)
 */
router.post('/verify-qr', authenticate, authorize([UserRole.GUARD, UserRole.ADMIN]), (req: Request, res: Response) => guardController.verifyByQR(req, res));

/**
 * @route   POST /api/v1/guards/verify-student
 * @desc    Verify pickup by student ID (manual entry)
 * @access  Private (Guard, Admin)
 */
router.post('/verify-student', authenticate, authorize([UserRole.GUARD, UserRole.ADMIN]), (req: Request, res: Response) => guardController.verifyByStudentId(req, res));

/**
 * @route   POST /api/v1/guards/complete/:pickupId
 * @desc    Complete pickup verification
 * @access  Private (Guard, Admin)
 */
router.post('/complete/:pickupId', authenticate, authorize([UserRole.GUARD, UserRole.ADMIN]), (req: Request, res: Response) => guardController.completePickup(req, res));

/**
 * @route   GET /api/v1/guards/queue
 * @desc    Get real-time pickup queue
 * @access  Private (Guard, Admin)
 */
router.get('/queue', authenticate, authorize([UserRole.GUARD, UserRole.ADMIN]), (req: Request, res: Response) => guardController.getQueue(req, res));

/**
 * @route   POST /api/v1/guards/emergency
 * @desc    Create emergency pickup
 * @access  Private (Guard, Admin)
 */
router.post('/emergency', authenticate, authorize([UserRole.GUARD, UserRole.ADMIN]), (req: Request, res: Response) => guardController.createEmergencyPickup(req, res));

/**
 * @route   GET /api/v1/guards/stats
 * @desc    Get guard dashboard statistics
 * @access  Private (Guard, Admin)
 */
router.get('/stats', authenticate, authorize([UserRole.GUARD, UserRole.ADMIN]), (req: Request, res: Response) => guardController.getStats(req, res));

export default router;
