import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PickupRequest } from './PickupRequest';
import { User } from './User';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Guest Pickup Approval Model
 * Tracks parent/guardian approval for guest pickup requests
 *
 * Workflow:
 * 1. Guardian creates guest pickup request (PickupRequest with type='guest')
 * 2. System creates GuestPickupApproval records for all authorized parents
 * 3. At least one parent must approve before request goes to teacher
 * 4. Teacher then approves/rejects the pickup request
 */
@Entity('guest_pickup_approvals')
export class GuestPickupApproval {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'pickup_request_id' })
  pickupRequestId!: string;

  @Column({ type: 'uuid', name: 'parent_id', comment: 'Parent/Guardian who needs to approve' })
  parentId!: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status!: ApprovalStatus;

  @Column({ type: 'text', nullable: true, comment: 'Approval or rejection reason' })
  notes?: string;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'responded_at' })
  respondedAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => PickupRequest, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pickup_request_id' })
  pickupRequest!: PickupRequest;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'parent_id' })
  parent!: User;
}
