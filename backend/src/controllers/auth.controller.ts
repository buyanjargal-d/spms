import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../types/auth.types';

const authService = new AuthService();

export class AuthController {
  /**
   * Login with DAN ID
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(loginData, ipAddress, userAgent);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      // If login failed due to invalid credentials (not locked account)
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials';
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Only record failed login if it's not already a locked account error
      if (!errorMessage.includes('Account is locked') && !errorMessage.includes('Account locked')) {
        try {
          await authService.recordFailedLogin(req.body.danId, ipAddress, userAgent);
        } catch (lockError) {
          // lockError contains the updated message with attempts remaining or lock status
          res.status(401).json({
            success: false,
            error: 'Authentication Failed',
            message: lockError instanceof Error ? lockError.message : 'Invalid credentials',
          });
          return;
        }
      }

      res.status(401).json({
        success: false,
        error: 'Authentication Failed',
        message: errorMessage,
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Token Refresh Failed',
        message: error instanceof Error ? error.message : 'Invalid refresh token',
      });
    }
  }

  /**
   * Logout (client-side token removal)
   * POST /api/v1/auth/logout
   */
  async logout(_req: Request, res: Response): Promise<void> {
    // In JWT-based auth, logout is typically handled client-side
    // Optionally implement token blacklisting here
    res.json({
      success: true,
      message: 'Logout successful',
    });
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: req.user.id,
          danId: req.user.danId,
          fullName: req.user.fullName,
          role: req.user.role,
          email: req.user.email,
          phone: req.user.phone,
          profilePhotoUrl: req.user.profilePhotoUrl,
          isActive: req.user.isActive,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to get current user',
      });
    }
  }
}
