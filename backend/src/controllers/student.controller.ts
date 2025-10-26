import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';

const studentService = new StudentService();

export class StudentController {
  /**
   * Get all students with filters
   * GET /api/v1/students
   */
  async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const { classId, gradeLevel, isActive, search } = req.query;

      const filters: any = {};
      if (classId) filters.classId = classId as string;
      if (gradeLevel) filters.gradeLevel = parseInt(gradeLevel as string);
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (search) filters.search = search as string;

      const students = await studentService.getAllStudents(filters);

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch students',
      });
    }
  }

  /**
   * Get student by ID
   * GET /api/v1/students/:id
   */
  async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const student = await studentService.getStudentById(id);

      if (!student) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Student not found',
        });
        return;
      }

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch student',
      });
    }
  }

  /**
   * Get student guardians
   * GET /api/v1/students/:id/guardians
   */
  async getStudentGuardians(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const guardians = await studentService.getStudentGuardians(id);

      res.json({
        success: true,
        data: guardians,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch student guardians',
      });
    }
  }
}
