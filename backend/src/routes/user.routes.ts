import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();
const userController = new UserController();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, authorize([UserRole.ADMIN]), (req, res) => userController.getAllUsers(req, res));

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authenticate, (req, res) => userController.getUserById(req, res));

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user profile
 * @access  Private
 */
router.patch('/:id', authenticate, (req, res) => userController.updateUser(req, res));

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Deactivate user
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), (req, res) => userController.deactivateUser(req, res));

export default router;
