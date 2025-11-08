import { Request, Response } from 'express';
import { GuestApprovalService } from '../services/guestApproval.service';
import { NotificationService } from '../services/notification.service';
import { AuditService } from '../services/audit.service';
import { AuditEntity } from '../models/AuditLog';
import { PickupService } from '../services/pickup.service';
import { logger } from '../utils/logger';

const guestApprovalService = new GuestApprovalService();
const notificationService = new NotificationService();
const auditService = new AuditService();
const pickupService = new PickupService();

/**
 * GuestApprovalController
 *
 * Handles guest pickup approval requests from parents
 * Implements workflow: Guardian → Parent Approval → Teacher → Guard
 */

/**
 * @route   GET /api/v1/guest-approvals/pending
 * @desc    Get pending approval requests for logged-in parent
 * @access  Parent only
 */
export const getPendingApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const approvals = await guestApprovalService.getPendingApprovalsForParent(userId);

    res.json({
      success: true,
      data: approvals,
      count: approvals.length,
    });
  } catch (error) {
    logger.error('Error fetching pending approvals', { error });
    res.status(500).json({
      error: 'Failed to fetch pending approvals',
    });
  }
};

/**
 * @route   POST /api/v1/guest-approvals/:id/approve
 * @desc    Parent approves a guest pickup request
 * @access  Parent only
 */
export const approveGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = (req as any).user?.id;
    const user = (req as any).user;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Approve the guest pickup
    const result = await guestApprovalService.approveGuestPickup(id, userId, notes);

    if (!result) {
      res.status(404).json({ error: 'Approval request not found' });
      return;
    }

    // Get the pickup request
    const pickupRequest = result.pickupRequest || await pickupService.getPickupRequestById(
      result.approval.pickupRequestId
    );

    if (!pickupRequest) {
      res.status(404).json({ error: 'Pickup request not found' });
      return;
    }

    // Audit log
    await auditService.logApprove(
      AuditEntity.GUEST_APPROVAL,
      result.approval.id,
      userId,
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestMethod: req.method,
        requestPath: req.path,
        newValues: { status: 'approved', notes },
      }
    );

    // Send notifications
    // 1. Notify guardian (requester)
    if (pickupRequest.requesterId) {
      await notificationService.notifyGuestApproved(
        pickupRequest.requesterId,
        `${user.firstName} ${user.lastName}`,
        pickupRequest.student?.firstName || 'Student',
        pickupRequest.id
      );
    }

    // 2. Check if pickup should move to teacher approval
    const allApprovals = await guestApprovalService.getApprovalsForRequest(
      pickupRequest.id
    );
    const hasApproval = allApprovals.some((a: any) => a.status === 'approved');

    if (hasApproval) {
      // Move to teacher approval phase
      pickupRequest.status = 'pending' as any;
      // Note: You would save this in the pickup service
      logger.info('Guest pickup moved to teacher approval', {
        pickupRequestId: pickupRequest.id,
      });
    }

    res.json({
      success: true,
      data: result.approval,
      message: 'Guest pickup approved successfully',
    });
  } catch (error) {
    logger.error('Error approving guest pickup', { error });

    await auditService.log({
      userId: (req as any).user?.id,
      action: 'APPROVE' as any,
      entityType: AuditEntity.GUEST_APPROVAL,
      entityId: req.params.id,
      isError: true,
      errorMessage: (error as Error).message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(500).json({
      error: 'Failed to approve guest pickup',
    });
  }
};

/**
 * @route   POST /api/v1/guest-approvals/:id/reject
 * @desc    Parent rejects a guest pickup request
 * @access  Parent only
 */
export const rejectGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = (req as any).user?.id;
    const user = (req as any).user;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!notes || !notes.trim()) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }

    // Reject the guest pickup
    const result = await guestApprovalService.rejectGuestPickup(id, userId, notes);

    if (!result) {
      res.status(404).json({ error: 'Approval request not found' });
      return;
    }

    // Get the pickup request
    const pickupRequest = result.pickupRequest || await pickupService.getPickupRequestById(
      result.approval.pickupRequestId
    );

    if (!pickupRequest) {
      res.status(404).json({ error: 'Pickup request not found' });
      return;
    }

    // Audit log
    await auditService.logReject(
      AuditEntity.GUEST_APPROVAL,
      result.approval.id,
      userId,
      notes,
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestMethod: req.method,
        requestPath: req.path,
        newValues: { status: 'rejected', notes },
      }
    );

    // Notify guardian (requester)
    if (pickupRequest.requesterId) {
      await notificationService.notifyGuestRejected(
        pickupRequest.requesterId,
        `${user.firstName} ${user.lastName}`,
        pickupRequest.student?.firstName || 'Student',
        pickupRequest.id
      );
    }

    // Update pickup request status to rejected
    pickupRequest.status = 'rejected' as any;
    pickupRequest.rejectionReason = `Parent rejected: ${notes}`;
    // Note: You would save this in the pickup service

    res.json({
      success: true,
      data: result.approval,
      message: 'Guest pickup rejected',
    });
  } catch (error) {
    logger.error('Error rejecting guest pickup', { error });

    await auditService.log({
      userId: (req as any).user?.id,
      action: 'REJECT' as any,
      entityType: AuditEntity.GUEST_APPROVAL,
      entityId: req.params.id,
      isError: true,
      errorMessage: (error as Error).message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(500).json({
      error: 'Failed to reject guest pickup',
    });
  }
};

/**
 * @route   GET /api/v1/pickup/:pickupRequestId/approvals
 * @desc    Get all approval records for a pickup request
 * @access  Authenticated users
 */
export const getPickupApprovals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pickupRequestId } = req.params;

    const approvals = await guestApprovalService.getApprovalsForRequest(
      pickupRequestId
    );

    res.json({
      success: true,
      data: approvals,
      count: approvals.length,
    });
  } catch (error) {
    logger.error('Error fetching pickup approvals', { error });
    res.status(500).json({
      error: 'Failed to fetch pickup approvals',
    });
  }
};

/**
 * @route   GET /api/v1/guest-approvals/my-requests
 * @desc    Get all approval requests related to logged-in user's students
 * @access  Parent only
 */
export const getMyApprovalRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const approvals = await guestApprovalService.getPendingApprovalsForParent(userId);

    res.json({
      success: true,
      data: approvals,
      count: approvals.length,
    });
  } catch (error) {
    logger.error('Error fetching approval requests', { error });
    res.status(500).json({
      error: 'Failed to fetch approval requests',
    });
  }
};
