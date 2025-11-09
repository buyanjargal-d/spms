import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntity } from '../models/AuditLog';
import { AppDataSource } from '../config/database';

export interface AuditLogData {
  userId?: string;
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  statusCode?: number;
  isError?: boolean;
  errorMessage?: string;
}

export class AuditLogService {
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create an audit log entry
   */
  async log(data: AuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(data);
    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * Log successful login
   */
  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGIN,
      entityType: AuditEntity.USER,
      entityId: userId,
      description: 'User logged in successfully',
      ipAddress,
      userAgent,
      statusCode: 200,
      isError: false,
    });
  }

  /**
   * Log failed login attempt
   */
  async logLoginFailed(
    danId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
    userId?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGIN_FAILED,
      entityType: AuditEntity.USER,
      entityId: userId,
      description: `Failed login attempt for DAN ID: ${danId}`,
      ipAddress,
      userAgent,
      statusCode: 401,
      isError: true,
      errorMessage: reason,
    });
  }

  /**
   * Log account locked event
   */
  async logAccountLocked(
    userId: string,
    attempts: number,
    lockUntil: Date,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.ACCOUNT_LOCKED,
      entityType: AuditEntity.USER,
      entityId: userId,
      description: `Account locked after ${attempts} failed login attempts`,
      newValues: {
        failedAttempts: attempts,
        lockedUntil: lockUntil.toISOString(),
      },
      ipAddress,
      userAgent,
      statusCode: 401,
      isError: true,
      errorMessage: 'Account locked due to multiple failed login attempts',
    });
  }

  /**
   * Log logout
   */
  async logLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGOUT,
      entityType: AuditEntity.USER,
      entityId: userId,
      description: 'User logged out',
      ipAddress,
      userAgent,
      statusCode: 200,
      isError: false,
    });
  }

  /**
   * Log token refresh
   */
  async logTokenRefresh(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.TOKEN_REFRESH,
      entityType: AuditEntity.USER,
      entityId: userId,
      description: 'Access token refreshed',
      ipAddress,
      userAgent,
      statusCode: 200,
      isError: false,
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs by action type
   */
  async getLogsByAction(action: AuditAction, limit: number = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get failed login attempts
   */
  async getFailedLogins(limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { action: AuditAction.LOGIN_FAILED },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs with pagination
   */
  async getLogs(
    page: number = 1,
    limit: number = 50,
    filters?: Partial<AuditLogData>
  ): Promise<{ logs: AuditLog[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: filters,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      logs,
      total,
      page,
      limit,
    };
  }
}
