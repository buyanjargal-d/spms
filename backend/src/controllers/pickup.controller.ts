import { Request, Response } from 'express';
import { PickupService } from '../services/pickup.service';
import { StudentService } from '../services/student.service';
import { CreatePickupRequestDTO, PickupRequestFilters } from '../types/pickup.types';
import { RequestStatus, RequestType } from '../models/PickupRequest';
import { UserRole } from '../models/User';

const pickupService = new PickupService();
const studentService = new StudentService();

export class PickupController {
  /**
   * Create a new pickup request
   * POST /api/v1/pickup/request
   */
  async createPickupRequest(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const requestData: CreatePickupRequestDTO = req.body;

      // Verify user can pickup this student
      const canPickup = await studentService.canUserPickupStudent(req.user.id, requestData.studentId);

      if (!canPickup && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.TEACHER) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You are not authorized to request pickup for this student',
        });
        return;
      }

      const pickupRequest = await pickupService.createPickupRequest(req.user.id, requestData);

      res.status(201).json({
        success: true,
        message: 'Pickup request created successfully',
        data: pickupRequest,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to create pickup request',
      });
    }
  }

  /**
   * Get pickup requests with filters
   * GET /api/v1/pickup/requests
   */
  async getPickupRequests(req: Request, res: Response): Promise<void> {
    try {
      const { status, studentId, requestType, startDate, endDate } = req.query;

      const filters: PickupRequestFilters = {};
      if (status) filters.status = status as RequestStatus;
      if (studentId) filters.studentId = studentId as string;
      if (requestType) filters.requestType = requestType as RequestType;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      // If not admin/teacher/guard, only show user's own requests
      if (req.user && ![UserRole.ADMIN, UserRole.TEACHER, UserRole.GUARD].includes(req.user.role)) {
        filters.requesterId = req.user.id;
      }

      const requests = await pickupService.getPickupRequests(filters);

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch pickup requests',
      });
    }
  }

  /**
   * Get pending pickup requests
   * GET /api/v1/pickup/pending
   */
  async getPendingRequests(_req: Request, res: Response): Promise<void> {
    try {
      const requests = await pickupService.getPendingRequests();

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch pending requests',
      });
    }
  }

  /**
   * Get pickup request by ID
   * GET /api/v1/pickup/:id
   */
  async getPickupRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const request = await pickupService.getPickupRequestById(id);

      if (!request) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Pickup request not found',
        });
        return;
      }

      res.json({
        success: true,
        data: request,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch pickup request',
      });
    }
  }

  /**
   * Approve pickup request
   * PATCH /api/v1/pickup/:id/approve
   */
  async approvePickupRequest(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { id } = req.params;

      const request = await pickupService.approvePickupRequest(id, req.user.id);

      res.json({
        success: true,
        message: 'Pickup request approved',
        data: request,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Failed to approve request',
      });
    }
  }

  /**
   * Reject pickup request
   * PATCH /api/v1/pickup/:id/reject
   */
  async rejectPickupRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Rejection reason is required',
        });
        return;
      }

      const request = await pickupService.rejectPickupRequest(id, rejectionReason);

      res.json({
        success: true,
        message: 'Pickup request rejected',
        data: request,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Failed to reject request',
      });
    }
  }

  /**
   * Complete pickup request
   * PATCH /api/v1/pickup/:id/complete
   */
  async completePickupRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { pickupPersonId, actualPickupTime, pickupLocationLat, pickupLocationLng } = req.body;

      const request = await pickupService.completePickupRequest(id, {
        pickupPersonId,
        actualPickupTime: actualPickupTime ? new Date(actualPickupTime) : undefined,
        pickupLocationLat,
        pickupLocationLng,
      });

      res.json({
        success: true,
        message: 'Pickup completed successfully',
        data: request,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Failed to complete pickup',
      });
    }
  }

  /**
   * Cancel pickup request
   * PATCH /api/v1/pickup/:id/cancel
   */
  async cancelPickupRequest(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { id } = req.params;

      const request = await pickupService.cancelPickupRequest(id, req.user.id);

      res.json({
        success: true,
        message: 'Pickup request cancelled',
        data: request,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Failed to cancel request',
      });
    }
  }

  /**
   * Get pickup history
   * GET /api/v1/pickup/history
   */
  async getPickupHistory(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.query;

      if (!studentId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Student ID is required',
        });
        return;
      }

      const history = await pickupService.getStudentPickupHistory(studentId as string);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch pickup history',
      });
    }
  }
}
