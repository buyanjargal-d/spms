import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserRole } from '../models/User';

const userService = new UserService();

export class UserController {
  /**
   * Get all users (Admin only)
   * GET /api/v1/users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role, isActive } = req.query;

      const filters: any = {};
      if (role) filters.role = role as UserRole;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const users = await userService.getAllUsers(filters);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch users',
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Failed to fetch user',
      });
    }
  }

  /**
   * Update user profile
   * PATCH /api/v1/users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { phone, email, profilePhotoUrl } = req.body;

      // Check if user is updating their own profile or is admin
      if (req.user?.id !== id && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'You can only update your own profile',
        });
        return;
      }

      const user = await userService.updateUserProfile(id, {
        phone,
        email,
        profilePhotoUrl,
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  }

  /**
   * Deactivate user (Admin only)
   * DELETE /api/v1/users/:id
   */
  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await userService.deactivateUser(id);

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Failed to deactivate user',
      });
    }
  }
}
