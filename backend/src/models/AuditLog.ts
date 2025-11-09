import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
}

export enum AuditEntity {
  USER = 'User',
  STUDENT = 'Student',
  PICKUP_REQUEST = 'PickupRequest',
  GUEST_APPROVAL = 'GuestApproval',
  NOTIFICATION = 'Notification',
}

/**
 * AuditLog Model
 *
 * Provides immutable audit trail for all sensitive operations
 * Implements thesis requirement Section 4.3.5 - Comprehensive Audit Logging
 *
 * Features:
 * - Immutable records (no updates or deletes allowed)
 * - Tracks who, what, when, and where for all operations
 * - Stores before/after state for data changes
 * - Records IP address and user agent
 * - Supports compliance and security investigations
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditEntity,
    name: 'entity_type',
  })
  entityType!: AuditEntity;

  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'old_values' })
  oldValues?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'new_values' })
  newValues?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'request_method' })
  requestMethod?: string;

  @Column({ type: 'text', nullable: true, name: 'request_path' })
  requestPath?: string;

  @Column({ type: 'integer', nullable: true, name: 'status_code' })
  statusCode?: number;

  @Column({ type: 'boolean', default: false, name: 'is_error' })
  isError!: boolean;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  // No update or delete methods - audit logs are immutable
}
