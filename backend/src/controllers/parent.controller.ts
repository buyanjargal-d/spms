import { Request, Response } from 'express';
import { ParentService } from '../services/parent.service';
import { UserRole } from '../models/User';

const parentService = new ParentService();

export class ParentController {
  /**
   * Get parent's children
   * GET /api/v1/parents/me/children
   */
  async getMyChildren(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const children = await parentService.getParentChildren(req.user.id);

      res.json({
        success: true,
        data: children,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch children',
      });
    }
  }

  /**
   * Get parent's pickup requests
   * GET /api/v1/parents/me/requests
   */
  async getMyRequests(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { status, startDate, endDate } = req.query;

      const requests = await parentService.getParentRequests(req.user.id, {
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch requests',
      });
    }
  }

  /**
   * Get authorized guardians for a student
   * GET /api/v1/parents/me/guardians/:studentId
   */
  async getAuthorizedGuardians(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { studentId } = req.params;

      // Verify parent has access to this student
      const hasAccess = await parentService.canAccessStudent(req.user.id, studentId);

      if (!hasAccess && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You do not have access to this student',
        });
        return;
      }

      const guardians = await parentService.getStudentGuardians(studentId);

      res.json({
        success: true,
        data: guardians,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch guardians',
      });
    }
  }

  /**
   * Get parent's dashboard statistics
   * GET /api/v1/parents/me/stats
   */
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await parentService.getParentStats(req.user.id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch statistics',
      });
    }
  }
}
