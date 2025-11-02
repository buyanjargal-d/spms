import { Router } from 'express';
import {
  getPendingApprovals,
  approveGuest,
  rejectGuest,
  getPickupApprovals,
  getMyApprovalRequests,
} from '../controllers/guestApproval.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

/**
 * Guest Approval Routes
 *
 * All routes require authentication
 * Most routes are restricted to parents only
 */

// Get pending approval requests for logged-in parent
router.get(
  '/pending',
  authenticate,
  authorize([UserRole.PARENT]),
  getPendingApprovals
);

// Get all approval requests for logged-in parent
router.get(
  '/my-requests',
  authenticate,
  authorize([UserRole.PARENT]),
  getMyApprovalRequests
);

// Approve a guest pickup request
router.post(
  '/:id/approve',
  authenticate,
  authorize([UserRole.PARENT]),
  approveGuest
);

// Reject a guest pickup request
router.post(
  '/:id/reject',
  authenticate,
  authorize([UserRole.PARENT]),
  rejectGuest
);

// Get all approvals for a specific pickup request
// (accessible by teachers, admins, and the requester)
router.get(
  '/pickup/:pickupRequestId',
  authenticate,
  getPickupApprovals
);

export default router;
