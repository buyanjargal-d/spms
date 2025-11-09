import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

/**
 * UserSession entity - Tracks active user sessions across devices
 * Supports multi-device login tracking and remote logout
 */
@Entity('user_sessions')
@Index(['userId', 'isActive'])
@Index(['jti'])
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // User relationship
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // JWT Token Identifier (unique for each session)
  @Column({ type: 'varchar', length: 255, unique: true })
  jti!: string;

  // Session metadata
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'user_agent' })
  userAgent?: string;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device?: string; // Extracted from user agent

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser?: string; // Extracted from user agent

  @Column({ type: 'varchar', length: 100, nullable: true })
  os?: string; // Extracted from user agent

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string; // Approximate location from IP

  // Session status
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'timestamp with time zone', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'last_activity_at' })
  lastActivityAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'revoked_at' })
  revokedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'revoke_reason' })
  revokeReason?: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
