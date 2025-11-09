import { Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';

const teacherService = new TeacherService();

export class TeacherController {
  /**
   * Get teacher's class
   * GET /api/v1/teachers/me/class
   */
  async getMyClass(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const teacherClass = await teacherService.getTeacherClass(req.user.id);

      if (!teacherClass) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Teacher has no assigned class',
        });
        return;
      }

      res.json({
        success: true,
        data: teacherClass,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch class',
      });
    }
  }

  /**
   * Get teacher's students
   * GET /api/v1/teachers/me/students
   */
  async getMyStudents(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const students = await teacherService.getTeacherStudents(req.user.id);

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch students',
      });
    }
  }

  /**
   * Get teacher's dashboard statistics
   * GET /api/v1/teachers/me/stats
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

      const stats = await teacherService.getTeacherStats(req.user.id);

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

  /**
   * Get today's pickup summary
   * GET /api/v1/teachers/me/pickup-summary
   */
  async getPickupSummary(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      // Optional date parameter
      const date = req.query.date ? new Date(req.query.date as string) : undefined;

      const summary = await teacherService.getPickupSummary(req.user.id, date);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch pickup summary',
      });
    }
  }
}
