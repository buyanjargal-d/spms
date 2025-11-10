import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { UserRole } from '../models/User';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // ==================== USER MANAGEMENT ====================

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { role, isActive, search } = req.query;

      const filters: any = {};
      if (role) filters.role = role as UserRole;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (search) filters.search = search as string;

      const users = await this.adminService.getAllUsers(filters);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users',
      });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const user = await this.adminService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'User not found',
      });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const createdBy = req.user!.id;

      const user = await this.adminService.createUser(userData, createdBy);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user',
      });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      const updatedBy = req.user!.id;

      const user = await this.adminService.updateUser(userId, updateData, updatedBy);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const deletedBy = req.user!.id;

      const result = await this.adminService.deleteUser(userId, deletedBy);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user',
      });
    }
  };

  toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;
      const updatedBy = req.user!.id;

      const user = await this.adminService.toggleUserStatus(userId, isActive, updatedBy);

      res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user,
      });
    } catch (error) {
      console.error('Error in toggleUserStatus:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user status',
      });
    }
  };

  resetUserPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      const resetBy = req.user!.id;

      if (!newPassword || newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
        return;
      }

      const result = await this.adminService.resetUserPassword(userId, newPassword, resetBy);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in resetUserPassword:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reset password',
      });
    }
  };

  unlockUserAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const unlockedBy = req.user!.id;

      const result = await this.adminService.unlockUserAccount(userId, unlockedBy);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in unlockUserAccount:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unlock account',
      });
    }
  };

  // ==================== STUDENT MANAGEMENT ====================

  getAllStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { classId, isActive, search } = req.query;

      const filters: any = {};
      if (classId) filters.classId = classId as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (search) filters.search = search as string;

      const students = await this.adminService.getAllStudents(filters);

      res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error('Error in getAllStudents:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch students',
      });
    }
  };

  getStudentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;

      const student = await this.adminService.getStudentById(studentId);

      res.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error('Error in getStudentById:', error);
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Student not found',
      });
    }
  };

  createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const studentData = req.body;
      const createdBy = req.user!.id;

      const student = await this.adminService.createStudent(studentData, createdBy);

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student,
      });
    } catch (error) {
      console.error('Error in createStudent:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create student',
      });
    }
  };

  updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;
      const updateData = req.body;
      const updatedBy = req.user!.id;

      const student = await this.adminService.updateStudent(studentId, updateData, updatedBy);

      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: student,
      });
    } catch (error) {
      console.error('Error in updateStudent:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update student',
      });
    }
  };

  deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;
      const deletedBy = req.user!.id;

      const result = await this.adminService.deleteStudent(studentId, deletedBy);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete student',
      });
    }
  };

  // ==================== GUARDIAN MANAGEMENT ====================

  addGuardianToStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;
      const { guardianId, relationship, isPrimary } = req.body;
      const authorizedBy = req.user!.id;

      const guardian = await this.adminService.addGuardianToStudent(
        studentId,
        guardianId,
        relationship,
        isPrimary || false,
        authorizedBy
      );

      res.status(201).json({
        success: true,
        message: 'Guardian added successfully',
        data: guardian,
      });
    } catch (error) {
      console.error('Error in addGuardianToStudent:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add guardian',
      });
    }
  };

  removeGuardianFromStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId, guardianId } = req.params;
      const removedBy = req.user!.id;

      const result = await this.adminService.removeGuardianFromStudent(studentId, guardianId, removedBy);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in removeGuardianFromStudent:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove guardian',
      });
    }
  };

  updateGuardianAuthorization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId, guardianId } = req.params;
      const { isAuthorized, notes } = req.body;
      const updatedBy = req.user!.id;

      const guardian = await this.adminService.updateGuardianAuthorization(
        studentId,
        guardianId,
        isAuthorized,
        notes || '',
        updatedBy
      );

      res.status(200).json({
        success: true,
        message: 'Guardian authorization updated successfully',
        data: guardian,
      });
    } catch (error) {
      console.error('Error in updateGuardianAuthorization:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update authorization',
      });
    }
  };

  // ==================== CLASS MANAGEMENT ====================

  getAllClasses = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive, gradeLevel } = req.query;

      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (gradeLevel) filters.gradeLevel = parseInt(gradeLevel as string);

      const classes = await this.adminService.getAllClasses(filters);

      res.status(200).json({
        success: true,
        data: classes,
      });
    } catch (error) {
      console.error('Error in getAllClasses:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch classes',
      });
    }
  };

  getClassById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { classId } = req.params;

      const classEntity = await this.adminService.getClassById(classId);

      res.status(200).json({
        success: true,
        data: classEntity,
      });
    } catch (error) {
      console.error('Error in getClassById:', error);
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Class not found',
      });
    }
  };

  assignStudentToClass = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;
      const { classId } = req.body;
      const assignedBy = req.user!.id;

      const result = await this.adminService.assignStudentToClass(studentId, classId, assignedBy);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in assignStudentToClass:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign student to class',
      });
    }
  };

  // ==================== SYSTEM SETTINGS ====================

  getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.query;

      const settings = await this.adminService.getSettings(category as string);

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error('Error in getSettings:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch settings',
      });
    }
  };

  getSetting = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;

      const setting = await this.adminService.getSetting(key);

      if (!setting) {
        res.status(404).json({
          success: false,
          message: 'Setting not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: setting,
      });
    } catch (error) {
      console.error('Error in getSetting:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch setting',
      });
    }
  };

  updateSetting = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const updatedBy = req.user!.id;

      const setting = await this.adminService.updateSetting(key, value, updatedBy);

      res.status(200).json({
        success: true,
        message: 'Setting updated successfully',
        data: setting,
      });
    } catch (error) {
      console.error('Error in updateSetting:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update setting',
      });
    }
  };

  // ==================== STATISTICS ====================

  getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.adminService.getDashboardStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch statistics',
      });
    }
  };
}
