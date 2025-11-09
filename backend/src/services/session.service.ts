import { Repository } from 'typeorm';
import { UserSession } from '../models/UserSession';
import { AppDataSource } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface CreateSessionParams {
  userId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionInfo {
  id: string;
  jti: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  ipAddress?: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActivityAt?: Date;
  createdAt: Date;
  expiresAt: Date;
}

export class SessionService {
  private sessionRepository: Repository<UserSession>;

  constructor() {
    this.sessionRepository = AppDataSource.getRepository(UserSession);
  }

  /**
   * Create a new session
   */
  async createSession(params: CreateSessionParams): Promise<{ session: UserSession; jti: string }> {
    const jti = uuidv4();

    // Parse user agent to extract device info
    const deviceInfo = this.parseUserAgent(params.userAgent);

    const session = await this.sessionRepository.save({
      userId: params.userId,
      jti,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      isActive: true,
      expiresAt: params.expiresAt,
      lastActivityAt: new Date(),
    });

    return { session, jti };
  }

  /**
   * Validate session by JTI
   */
  async validateSession(jti: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { jti, isActive: true },
    });

    if (!session) {
      return false;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      // Mark as inactive
      await this.sessionRepository.update(session.id, {
        isActive: false,
        revokedAt: new Date(),
        revokeReason: 'Session expired'
      });
      return false;
    }

    // Update last activity
    await this.sessionRepository.update(session.id, {
      lastActivityAt: new Date(),
    });

    return true;
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string, currentJti?: string): Promise<SessionInfo[]> {
    const sessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return sessions.map(session => ({
      id: session.id,
      jti: session.jti,
      device: session.device,
      browser: session.browser,
      os: session.os,
      location: session.location,
      ipAddress: session.ipAddress,
      isActive: session.isActive,
      isCurrent: session.jti === currentJti,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, userId: string, reason: string = 'User logged out'): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return false;
    }

    await this.sessionRepository.update(sessionId, {
      isActive: false,
      revokedAt: new Date(),
      revokeReason: reason,
    });

    return true;
  }

  /**
   * Revoke session by JTI
   */
  async revokeSessionByJti(jti: string, reason: string = 'User logged out'): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { jti },
    });

    if (!session) {
      return false;
    }

    await this.sessionRepository.update(session.id, {
      isActive: false,
      revokedAt: new Date(),
      revokeReason: reason,
    });

    return true;
  }

  /**
   * Revoke all sessions for a user except current one
   */
  async revokeAllUserSessions(
    userId: string,
    exceptJti?: string,
    reason: string = 'Logged out from all devices'
  ): Promise<number> {
    const sessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
    });

    let revokedCount = 0;

    for (const session of sessions) {
      if (session.jti !== exceptJti) {
        await this.sessionRepository.update(session.id, {
          isActive: false,
          revokedAt: new Date(),
          revokeReason: reason,
        });
        revokedCount++;
      }
    }

    return revokedCount;
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({
        isActive: false,
        revokedAt: new Date(),
        revokeReason: 'Session expired'
      })
      .where('expires_at < :now', { now: new Date() })
      .andWhere('is_active = :isActive', { isActive: true })
      .execute();

    return result.affected || 0;
  }

  /**
   * Parse user agent string to extract device information
   */
  private parseUserAgent(userAgent?: string): { device?: string; browser?: string; os?: string } {
    if (!userAgent) {
      return {};
    }

    const result: { device?: string; browser?: string; os?: string } = {};

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      result.browser = 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      result.browser = 'Safari';
    } else if (userAgent.includes('Firefox')) {
      result.browser = 'Firefox';
    } else if (userAgent.includes('Edg')) {
      result.browser = 'Edge';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      result.os = 'Windows';
    } else if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
      result.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      result.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      result.os = 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      result.os = 'iOS';
    }

    // Detect device type
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      result.device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      result.device = 'Tablet';
    } else {
      result.device = 'Desktop';
    }

    return result;
  }
}
