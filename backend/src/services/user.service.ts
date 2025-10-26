import { Repository } from 'typeorm';
import { User, UserRole } from '../models/User';
import { AppDataSource } from '../config/database';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters?: { role?: UserRole; isActive?: boolean }): Promise<User[]> {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.userRepository.find({
      where,
      order: { fullName: 'ASC' },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  /**
   * Get user by DAN ID
   */
  async getUserByDanId(danId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { danId },
    });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: {
      phone?: string;
      email?: string;
      profilePhotoUrl?: string;
    }
  ): Promise<User> {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (data.phone) user.phone = data.phone;
    if (data.email) user.email = data.email;
    if (data.profilePhotoUrl) user.profilePhotoUrl = data.profilePhotoUrl;

    return this.userRepository.save(user);
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: string): Promise<User> {
    const user = await this.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    return this.userRepository.save(user);
  }
}
