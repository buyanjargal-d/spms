import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize([UserRole.ADMIN]));

// ==================== USER MANAGEMENT ====================
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.patch('/users/:userId/status', adminController.toggleUserStatus);
router.post('/users/:userId/reset-password', adminController.resetUserPassword);
router.post('/users/:userId/unlock', adminController.unlockUserAccount);

// ==================== STUDENT MANAGEMENT ====================
router.get('/students', adminController.getAllStudents);
router.get('/students/:studentId', adminController.getStudentById);
router.post('/students', adminController.createStudent);
router.put('/students/:studentId', adminController.updateStudent);
router.delete('/students/:studentId', adminController.deleteStudent);
router.post('/students/:studentId/assign-class', adminController.assignStudentToClass);

// ==================== GUARDIAN MANAGEMENT ====================
router.post('/students/:studentId/guardians', adminController.addGuardianToStudent);
router.delete('/students/:studentId/guardians/:guardianId', adminController.removeGuardianFromStudent);
router.patch('/students/:studentId/guardians/:guardianId/authorization', adminController.updateGuardianAuthorization);

// ==================== CLASS MANAGEMENT ====================
router.get('/classes', adminController.getAllClasses);
router.get('/classes/:classId', adminController.getClassById);

// ==================== SYSTEM SETTINGS ====================
router.get('/settings', adminController.getSettings);
router.get('/settings/:key', adminController.getSetting);
router.put('/settings/:key', adminController.updateSetting);

// ==================== STATISTICS ====================
router.get('/dashboard/stats', adminController.getDashboardStats);

export default router;
