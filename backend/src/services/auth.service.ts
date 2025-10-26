import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';
import { ENV } from '../config/env';
import { LoginRequest, LoginResponse, TokenPayload } from '../types/auth.types';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Login with DAN ID (Digital Authentication Number)
   * In production, this would integrate with actual DAN system
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const { danId } = loginData;

    // Find user by DAN ID
    const user = await this.userRepository.findOne({
      where: { danId, isActive: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // TODO: In production, validate against DAN system
    // For now, we're using simple authentication for testing

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        danId: user.danId,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        profilePhotoUrl: user.profilePhotoUrl,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, ENV.JWT.REFRESH_SECRET) as TokenPayload;

      const user = await this.userRepository.findOne({
        where: { id: payload.userId, isActive: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Verify access token and return user
   */
  async verifyAccessToken(token: string): Promise<User> {
    try {
      const payload = jwt.verify(token, ENV.JWT.SECRET) as TokenPayload;

      const user = await this.userRepository.findOne({
        where: { id: payload.userId, isActive: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      danId: user.danId,
      role: user.role,
    };

    return jwt.sign(payload, ENV.JWT.SECRET);
  }

  /**
   * Generate JWT refresh token
   */
  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      danId: user.danId,
      role: user.role,
    };

    return jwt.sign(payload, ENV.JWT.REFRESH_SECRET);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }
}
