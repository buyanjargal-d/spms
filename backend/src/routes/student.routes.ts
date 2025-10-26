import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();
const studentController = new StudentController();

/**
 * @route   GET /api/v1/students
 * @desc    Get all students
 * @access  Private (Teacher/Admin)
 */
router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.TEACHER]), (req, res) => studentController.getAllStudents(req, res));

/**
 * @route   GET /api/v1/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', authenticate, (req, res) => studentController.getStudentById(req, res));

/**
 * @route   GET /api/v1/students/:id/guardians
 * @desc    Get student's guardians
 * @access  Private
 */
router.get('/:id/guardians', authenticate, (req, res) => studentController.getStudentGuardians(req, res));

export default router;
