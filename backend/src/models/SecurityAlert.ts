import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { PickupRequest } from './PickupRequest';

export enum AlertType {
  FAILED_VERIFICATION = 'failed_verification',
  EXPIRED_QR = 'expired_qr',
  MULTIPLE_FAILURES = 'multiple_failures',
  UNAUTHORIZED_PERSON = 'unauthorized_person',
  QR_REUSE = 'qr_reuse',
  TIME_WINDOW_VIOLATION = 'time_window_violation',
  OTHER = 'other',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum AlertStatus {
  PENDING = 'pending',
  DISMISSED = 'dismissed',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
}

@Entity('security_alerts')
export class SecurityAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  severity!: string;

  @Column({ type: 'uuid', nullable: true, name: 'request_id' })
  requestId?: string;

  @Column({ type: 'uuid', name: 'guard_id' })
  guardId!: string;

  @Column({ type: 'text' })
  details!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: AlertStatus.PENDING,
  })
  status!: string;

  @Column({ type: 'uuid', nullable: true, name: 'reviewed_by' })
  reviewedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'reviewed_at' })
  reviewedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => PickupRequest)
  @JoinColumn({ name: 'request_id' })
  pickupRequest?: PickupRequest;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'guard_id' })
  guard!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User;
}
