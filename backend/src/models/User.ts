import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StudentGuardian } from './StudentGuardian';
import { PickupRequest } from './PickupRequest';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  PARENT = 'parent',
  GUARD = 'guard',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'dan_id' })
  danId!: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true, name: 'profile_photo_url' })
  profilePhotoUrl?: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password?: string;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;

  @Column({ type: 'integer', default: 0, name: 'failed_login_attempts' })
  failedLoginAttempts!: number;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'account_locked_until' })
  accountLockedUntil?: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'notification_preferences' })
  notificationPreferences?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => StudentGuardian, (sg) => sg.guardian)
  studentGuardians?: StudentGuardian[];

  @OneToMany(() => PickupRequest, (pr) => pr.requester)
  pickupRequests?: PickupRequest[];

  // Virtual field - don't store password in this system (using DAN)
  // If you need local passwords for testing, add a separate field
}
