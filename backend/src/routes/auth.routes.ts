import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateLogin } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user with DAN
 * @access  Public
 */
router.post('/login', validateLogin, (req: Request, res: Response) => authController.login(req, res));

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (req: Request, res: Response) => authController.refreshToken(req, res));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, (req: Request, res: Response) => authController.logout(req, res));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, (req: Request, res: Response) => authController.getCurrentUser(req, res));

export default router;
