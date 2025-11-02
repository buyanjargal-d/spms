import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntity } from '../models/AuditLog';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

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

/**
 * AuditService
 *
 * Provides comprehensive audit logging for security, compliance, and forensics
 * Implements thesis requirement Section 4.3.5 - Comprehensive Audit Logging
 *
 * Features:
 * - Immutable audit trail
 * - Automatic request metadata capture
 * - Support for before/after state tracking
 * - Error and success logging
 * - Query and reporting capabilities
 */
export class AuditService {
  private auditRepository: Repository<AuditLog>;

  constructor() {
    this.auditRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create an audit log entry
   * This is the primary method for logging all auditable events
   */
  async log(data: AuditLogData): Promise<AuditLog | null> {
    try {
      const auditLog = this.auditRepository.create(data);
      const saved = await this.auditRepository.save(auditLog);

      // Also log to Winston for immediate monitoring
      logger.info('Audit log created', {
        auditId: saved.id,
        action: data.action,
        entityType: data.entityType,
        userId: data.userId,
      });

      return saved;
    } catch (error) {
      // Don't throw - audit logging should never break the main application flow
      logger.error('Failed to create audit log', { error, data });
      return null;
    }
  }

  /**
   * Log a CREATE operation
   */
  async logCreate(
    entityType: AuditEntity,
    entityId: string,
    newValues: Record<string, any>,
    userId?: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.CREATE,
      entityType,
      entityId,
      newValues,
      userId,
      description: `Created ${entityType} with ID ${entityId}`,
      ...metadata,
    });
  }

  /**
   * Log an UPDATE operation
   */
  async logUpdate(
    entityType: AuditEntity,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    userId?: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      oldValues,
      newValues,
      userId,
      description: `Updated ${entityType} with ID ${entityId}`,
      ...metadata,
    });
  }

  /**
   * Log a DELETE operation
   */
  async logDelete(
    entityType: AuditEntity,
    entityId: string,
    oldValues: Record<string, any>,
    userId?: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.DELETE,
      entityType,
      entityId,
      oldValues,
      userId,
      description: `Deleted ${entityType} with ID ${entityId}`,
      ...metadata,
    });
  }

  /**
   * Log a LOGIN event
   */
  async logLogin(
    userId: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.LOGIN,
      entityType: AuditEntity.USER,
      entityId: userId,
      userId,
      description: `User logged in`,
      ...metadata,
    });
  }

  /**
   * Log a LOGOUT event
   */
  async logLogout(
    userId: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.LOGOUT,
      entityType: AuditEntity.USER,
      entityId: userId,
      userId,
      description: `User logged out`,
      ...metadata,
    });
  }

  /**
   * Log an APPROVE action (for pickup requests and guest approvals)
   */
  async logApprove(
    entityType: AuditEntity,
    entityId: string,
    userId: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.APPROVE,
      entityType,
      entityId,
      userId,
      description: `Approved ${entityType} with ID ${entityId}`,
      ...metadata,
    });
  }

  /**
   * Log a REJECT action
   */
  async logReject(
    entityType: AuditEntity,
    entityId: string,
    userId: string,
    reason?: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.REJECT,
      entityType,
      entityId,
      userId,
      description: `Rejected ${entityType} with ID ${entityId}${reason ? `: ${reason}` : ''}`,
      ...metadata,
    });
  }

  /**
   * Log a COMPLETE action (for pickup completion)
   */
  async logComplete(
    entityType: AuditEntity,
    entityId: string,
    userId: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.COMPLETE,
      entityType,
      entityId,
      userId,
      description: `Completed ${entityType} with ID ${entityId}`,
      ...metadata,
    });
  }

  /**
   * Log a CANCEL action
   */
  async logCancel(
    entityType: AuditEntity,
    entityId: string,
    userId: string,
    metadata?: Partial<AuditLogData>
  ): Promise<AuditLog | null> {
    return this.log({
      action: AuditAction.CANCEL,
      entityType,
      entityId,
      userId,
      description: `Cancelled ${entityType} with ID ${entityId}`,
      ...metadata,
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLogs(
    entityType: AuditEntity,
    entityId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get recent audit logs
   */
  async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * Get error logs for investigation
   */
  async getErrorLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { isError: true },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * Get audit logs by action type
   */
  async getLogsByAction(action: AuditAction, limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  /**
   * Search audit logs with date range
   */
  async searchLogs(
    startDate: Date,
    endDate: Date,
    filters?: {
      userId?: string;
      action?: AuditAction;
      entityType?: AuditEntity;
      isError?: boolean;
    }
  ): Promise<AuditLog[]> {
    const queryBuilder = this.auditRepository
      .createQueryBuilder('audit')
      .where('audit.createdAt >= :startDate', { startDate })
      .andWhere('audit.createdAt <= :endDate', { endDate });

    if (filters?.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters?.isError !== undefined) {
      queryBuilder.andWhere('audit.isError = :isError', { isError: filters.isError });
    }

    queryBuilder.orderBy('audit.createdAt', 'DESC').leftJoinAndSelect('audit.user', 'user');

    return queryBuilder.getMany();
  }
}
