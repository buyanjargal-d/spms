import { Request, Response } from 'express';
import { ReportsService } from '../services/reports.service';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  // ==================== DAILY REPORT ====================

  getDailyReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date, classId, gradeLevel, status } = req.query;

      const reportDate = date ? new Date(date as string) : new Date();

      const filters: any = {};
      if (classId) filters.classId = classId as string;
      if (gradeLevel) filters.gradeLevel = parseInt(gradeLevel as string);
      if (status) filters.status = status as string;

      const report = await this.reportsService.generateDailyReport(reportDate, filters);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Error generating daily report:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate daily report',
      });
    }
  };

  // ==================== MONTHLY REPORT ====================

  getMonthlyReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { year, month, classId } = req.query;

      if (!year || !month) {
        res.status(400).json({
          success: false,
          message: 'Year and month are required',
        });
        return;
      }

      const reportYear = parseInt(year as string);
      const reportMonth = parseInt(month as string);

      const filters: any = {};
      if (classId) filters.classId = classId as string;

      const report = await this.reportsService.generateMonthlyReport(reportYear, reportMonth, filters);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Error generating monthly report:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate monthly report',
      });
    }
  };

  // ==================== STUDENT HISTORY REPORT ====================

  getStudentHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;
      const { startDate, endDate, guardianId, type, status } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
        return;
      }

      const filters: any = {};
      if (guardianId) filters.guardianId = guardianId as string;
      if (type) filters.type = type as string;
      if (status) filters.status = status as string;

      const report = await this.reportsService.generateStudentHistoryReport(
        studentId,
        new Date(startDate as string),
        new Date(endDate as string),
        filters
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Error generating student history report:', error);
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate student history report',
      });
    }
  };

  // ==================== ANALYTICS ====================

  getPickupTrends = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, groupBy } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
        return;
      }

      const validGroupBy = ['day', 'week', 'month'];
      const group = (groupBy && validGroupBy.includes(groupBy as string))
        ? (groupBy as 'day' | 'week' | 'month')
        : 'day';

      const trends = await this.reportsService.getPickupTrends(
        new Date(startDate as string),
        new Date(endDate as string),
        group
      );

      res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error) {
      console.error('Error getting pickup trends:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get pickup trends',
      });
    }
  };

  getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.reportsService.getDashboardStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get dashboard stats',
      });
    }
  };

  // ==================== REPORT TYPES ====================

  getReportTypes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const reportTypes = [
        {
          id: 'daily',
          name: 'Өдрийн тайлан',
          description: 'Өнөөдрийн авалтын нэгтгэл',
          icon: 'Calendar',
        },
        {
          id: 'monthly',
          name: 'Сарын тайлан',
          description: 'Сарын дүн шинжилгээ',
          icon: 'TrendingUp',
        },
        {
          id: 'student',
          name: 'Сурагчийн түүх',
          description: 'Нэг сурагчийн авалтын түүх',
          icon: 'User',
        },
        {
          id: 'guardian',
          name: 'Асран хамгаалагчийн идэвхи',
          description: 'Асран хамгаалагчийн үр дүн',
          icon: 'Users',
        },
        {
          id: 'class',
          name: 'Ангиудын харьцуулалт',
          description: 'Ангиудын дүн шинжилгээ',
          icon: 'BarChart',
        },
      ];

      res.status(200).json({
        success: true,
        data: reportTypes,
      });
    } catch (error) {
      console.error('Error getting report types:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get report types',
      });
    }
  };
}
