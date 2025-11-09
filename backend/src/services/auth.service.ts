import jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User, UserRole } from '../models/User';
import { AppDataSource } from '../config/database';
import { ENV } from '../config/env';
import { LoginRequest, LoginResponse, TokenPayload } from '../types/auth.types';
import { AuditLogService } from './auditLog.service';
import { SessionService } from './session.service';
import { danService } from './dan.service';
import { verifyPassword } from '../utils/password.util';

export class AuthService {
  private userRepository: Repository<User>;
  private auditLogService: AuditLogService;
  private sessionService: SessionService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.auditLogService = new AuditLogService();
    this.sessionService = new SessionService();
  }

  /**
   * Login with DAN ID (Digital Authentication Number)
   * Supports both DAN authentication and password-based fallback
   */
  async login(loginData: LoginRequest, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    const { danId, password, role, rememberMe } = loginData;

    let user: User | null = null;

    // If password provided, use password authentication (fallback for local testing)
    if (password) {
      user = await this.loginWithPassword(danId, password);
    } else {
      // Otherwise, use DAN authentication
      user = await this.loginWithDan(danId, role);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact administrator.');
    }

    // Check if account is locked
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      const lockDuration = Math.ceil((new Date(user.accountLockedUntil).getTime() - Date.now()) / (1000 * 60));
      throw new Error(`Account is locked. Try again in ${lockDuration} minute(s).`);
    }

    // Successful login - reset failed attempts and update last login
    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      accountLockedUntil: undefined,
      lastLoginAt: new Date(),
    });

    // Log successful login
    await this.auditLogService.logLogin(user.id, ipAddress, userAgent);

    // Create session with appropriate expiry
    const expiryDays = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const { jti } = await this.sessionService.createSession({
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
    });

    // Generate tokens with JTI
    const accessToken = this.generateAccessToken(user, jti);
    const refreshToken = this.generateRefreshToken(user, jti, rememberMe);

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
   * Login with DAN authentication
   */
  private async loginWithDan(danId: string, role?: string): Promise<User> {
    // Step 1: Verify DAN ID with DAN service
    const danResponse = await danService.verifyDanId(danId);

    if (!danResponse.success) {
      throw new Error(danResponse.errorMessage || 'DAN verification failed');
    }

    // Step 2: Find or create user in our database
    let user = await this.userRepository.findOne({
      where: { danId },
    });

    // Auto-register user if verified by DAN but not in our system
    if (!user) {
      const newUser = this.userRepository.create({
        danId: danResponse.danId,
        fullName: danResponse.fullName,
        phone: danResponse.phone,
        email: danResponse.email,
        role: (role || UserRole.PARENT) as UserRole, // Default to parent role if not specified
        isActive: true,
        failedLoginAttempts: 0,
      });
      user = await this.userRepository.save(newUser);
    }

    return user;
  }

  /**
   * Login with password (fallback for local testing)
   */
  private async loginWithPassword(danId: string, password: string): Promise<User> {
    // Find user with password field
    const user = await this.userRepository.findOne({
      where: { danId },
      select: [
        'id',
        'danId',
        'fullName',
        'role',
        'phone',
        'email',
        'profilePhotoUrl',
        'isActive',
        'lastLoginAt',
        'failedLoginAttempts',
        'accountLockedUntil',
        'notificationPreferences',
        'createdAt',
        'updatedAt',
        'password',
      ],
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }

  /**
   * Record failed login attempt and potentially lock account
   */
  async recordFailedLogin(danId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { danId },
    });

    if (!user) {
      // Log failed login even if user doesn't exist (but don't reveal this)
      await this.auditLogService.logLoginFailed(
        danId,
        'Invalid credentials - user not found',
        ipAddress,
        userAgent
      );
      return; // Don't reveal if user exists
    }

    const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
    const maxAttempts = 5;
    const lockDurationMinutes = 15;

    let accountLockedUntil: Date | undefined = undefined;

    if (newFailedAttempts >= maxAttempts) {
      accountLockedUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);
    }

    await this.userRepository.update(user.id, {
      failedLoginAttempts: newFailedAttempts,
      accountLockedUntil,
    });

    if (accountLockedUntil) {
      // Log account locked
      await this.auditLogService.logAccountLocked(
        user.id,
        newFailedAttempts,
        accountLockedUntil,
        ipAddress,
        userAgent
      );
      throw new Error(`Account locked due to multiple failed login attempts. Try again in ${lockDurationMinutes} minutes.`);
    } else {
      // Log failed login attempt
      await this.auditLogService.logLoginFailed(
        danId,
        `Failed login attempt ${newFailedAttempts}/${maxAttempts}`,
        ipAddress,
        userAgent,
        user.id
      );
      const attemptsRemaining = maxAttempts - newFailedAttempts;
      throw new Error(`Invalid credentials. ${attemptsRemaining} attempt(s) remaining.`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, ENV.JWT.REFRESH_SECRET) as TokenPayload;

      // Validate session
      if (payload.jti) {
        const isValidSession = await this.sessionService.validateSession(payload.jti);
        if (!isValidSession) {
          throw new Error('Session expired or revoked');
        }
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.userId, isActive: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Keep the same JTI (session) for token refresh
      const jti = payload.jti || '';
      const newAccessToken = this.generateAccessToken(user, jti);
      const newRefreshToken = this.generateRefreshToken(user, jti, false);

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

      // Validate session if JTI is present
      if (payload.jti) {
        const isValidSession = await this.sessionService.validateSession(payload.jti);
        if (!isValidSession) {
          throw new Error('Session expired or revoked');
        }
      }

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
  private generateAccessToken(user: User, jti: string): string {
    const payload: TokenPayload = {
      userId: user.id,
      danId: user.danId,
      role: user.role,
      jti,
    };

    return jwt.sign(payload, ENV.JWT.SECRET);
  }

  /**
   * Generate JWT refresh token
   * @param jti - JWT Token Identifier for session tracking
   * @param rememberMe - If true, token expires in 30 days, otherwise 7 days
   */
  private generateRefreshToken(user: User, jti: string, rememberMe?: boolean): string {
    const payload: TokenPayload = {
      userId: user.id,
      danId: user.danId,
      role: user.role,
      jti,
    };

    const expiresIn = rememberMe ? '30d' : '7d';
    return jwt.sign(payload, ENV.JWT.REFRESH_SECRET, { expiresIn });
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
