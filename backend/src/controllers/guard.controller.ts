import { Request, Response } from 'express';
import guardService from '../services/guard.service';

export class GuardController {
  /**
   * Verify pickup by QR code
   * POST /api/v1/guards/verify-qr
   */
  async verifyByQR(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { qrToken } = req.body;

      if (!qrToken) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'QR токен шаардлагатай',
        });
        return;
      }

      const result = await guardService.verifyByQRCode(qrToken, req.user.id);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'Verification Failed',
          message: result.message,
        });
        return;
      }

      res.json({
        success: true,
        message: result.message,
        data: {
          pickup: result.pickup,
          student: result.student,
          authorizedPerson: result.authorizedPerson,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'QR код баталгаажуулахад алдаа гарлаа',
      });
    }
  }

  /**
   * Verify pickup by student ID
   * POST /api/v1/guards/verify-student
   */
  async verifyByStudentId(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { studentId } = req.body;

      if (!studentId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Сурагчийн ID шаардлагатай',
        });
        return;
      }

      const result = await guardService.verifyByStudentId(studentId, req.user.id);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'Verification Failed',
          message: result.message,
        });
        return;
      }

      res.json({
        success: true,
        message: result.message,
        data: {
          pickup: result.pickup,
          student: result.student,
          authorizedPerson: result.authorizedPerson,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Сурагчийн мэдээлэл хайхад алдаа гарлаа',
      });
    }
  }

  /**
   * Complete pickup verification
   * POST /api/v1/guards/complete/:pickupId
   */
  async completePickup(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { pickupId } = req.params;
      const { photoVerified } = req.body;

      if (!pickupId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Pickup ID шаардлагатай',
        });
        return;
      }

      const result = await guardService.completePickup(
        pickupId,
        req.user.id,
        photoVerified || false
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'Completion Failed',
          message: result.message,
        });
        return;
      }

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Авалтыг биелүүлэхэд алдаа гарлаа',
      });
    }
  }

  /**
   * Get pickup queue
   * GET /api/v1/guards/queue
   */
  async getQueue(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const queue = await guardService.getPickupQueue(req.user.id);

      res.json({
        success: true,
        data: {
          queue,
          count: queue.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Дараалал татахад алдаа гарлаа',
      });
    }
  }

  /**
   * Create emergency pickup
   * POST /api/v1/guards/emergency
   */
  async createEmergencyPickup(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const { studentId, pickupPersonName, pickupPersonPhone, relationship, reason, guardNotes } = req.body;

      // Validate required fields
      if (!studentId || !pickupPersonName || !pickupPersonPhone || !relationship || !reason) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Бүх шаардлагатай мэдээллийг оруулна уу',
        });
        return;
      }

      const result = await guardService.createEmergencyPickup(
        {
          studentId,
          pickupPersonName,
          pickupPersonPhone,
          relationship,
          reason,
          guardNotes,
        },
        req.user.id
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'Emergency Pickup Failed',
          message: result.message,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          pickupId: result.pickupId,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Яаралтай авалт үүсгэхэд алдаа гарлаа',
      });
    }
  }

  /**
   * Get guard dashboard statistics
   * GET /api/v1/guards/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await guardService.getGuardStats(req.user.id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Статистик татахад алдаа гарлаа',
      });
    }
  }
}

export default new GuardController();
