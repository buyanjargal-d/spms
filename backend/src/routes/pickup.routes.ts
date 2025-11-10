import { Router, Request, Response } from 'express';
import { PickupController } from '../controllers/pickup.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { validatePickupRequest } from '../validators/pickup.validator';

const router = Router();
const pickupController = new PickupController();

/**
 * @route   POST /api/v1/pickup/request
 * @desc    Create new pickup request
 * @access  Private (Parent)
 */
router.post('/request', authenticate, authorize([UserRole.PARENT]), validatePickupRequest, (req: Request, res: Response) => pickupController.createPickupRequest(req, res));

/**
 * @route   GET /api/v1/pickup/requests
 * @desc    Get pickup requests with filters
 * @access  Private
 */
router.get('/requests', authenticate, (req, res) => pickupController.getPickupRequests(req, res));

/**
 * @route   GET /api/v1/pickup/pending
 * @desc    Get pending pickup requests
 * @access  Private (Teacher)
 */
router.get('/pending', authenticate, authorize([UserRole.TEACHER, UserRole.ADMIN]), (req, res) => pickupController.getPendingRequests(req, res));

/**
 * @route   GET /api/v1/pickup/history
 * @desc    Get pickup history
 * @access  Private
 */
router.get('/history', authenticate, (req, res) => pickupController.getPickupHistory(req, res));

/**
 * @route   GET /api/v1/pickup/:id
 * @desc    Get pickup request by ID
 * @access  Private
 */
router.get('/:id', authenticate, (req, res) => pickupController.getPickupRequestById(req, res));

/**
 * @route   PATCH /api/v1/pickup/:id/approve
 * @desc    Approve pickup request
 * @access  Private (Teacher)
 */
router.patch('/:id/approve', authenticate, authorize([UserRole.TEACHER, UserRole.ADMIN]), (req, res) => pickupController.approvePickupRequest(req, res));

/**
 * @route   PATCH /api/v1/pickup/:id/reject
 * @desc    Reject pickup request
 * @access  Private (Teacher)
 */
router.patch('/:id/reject', authenticate, authorize([UserRole.TEACHER, UserRole.ADMIN]), (req, res) => pickupController.rejectPickupRequest(req, res));

/**
 * @route   PATCH /api/v1/pickup/:id/complete
 * @desc    Complete pickup
 * @access  Private (Teacher/Guard)
 */
router.patch('/:id/complete', authenticate, authorize([UserRole.TEACHER, UserRole.GUARD, UserRole.ADMIN]), (req, res) => pickupController.completePickupRequest(req, res));

/**
 * @route   PATCH /api/v1/pickup/:id/cancel
 * @desc    Cancel pickup request
 * @access  Private
 */
router.patch('/:id/cancel', authenticate, (req, res) => pickupController.cancelPickupRequest(req, res));

/**
 * @route   GET /api/v1/pickup/:id/qrcode
 * @desc    Get QR code for pickup request
 * @access  Private (Parent, Teacher, Admin)
 */
router.get('/:id/qrcode', authenticate, authorize([UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN]), (req, res) => pickupController.getQRCode(req, res));

/**
 * @route   POST /api/v1/pickup/verify-qr
 * @desc    Verify QR code
 * @access  Private (Guard, Admin)
 */
router.post('/verify-qr', authenticate, authorize([UserRole.GUARD, UserRole.ADMIN]), (req, res) => pickupController.verifyQRCode(req, res));

export default router;
