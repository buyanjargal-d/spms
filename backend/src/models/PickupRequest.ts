import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Student } from './Student';
import { User } from './User';
import { GuestPickupApproval } from './GuestPickupApproval';

export enum RequestType {
  STANDARD = 'standard',
  ADVANCE = 'advance',
  GUEST = 'guest',
}

export enum RequestStatus {
  PENDING = 'pending', // Standard pickup pending teacher approval
  PENDING_PARENT_APPROVAL = 'pending_parent_approval', // Guest pickup waiting for parent approval
  CONFIRMED = 'confirmed', // Confirmed by teacher (or parent+teacher for guest) - ready for pickup
  REJECTED = 'rejected', // Rejected by teacher or parent
  CANCELLED = 'cancelled', // Cancelled by requester
}

@Entity('pickup_requests')
export class PickupRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId!: string;

  @Column({ type: 'uuid', name: 'requester_id' })
  requesterId!: string;

  @Column({ type: 'uuid', nullable: true, name: 'pickup_person_id' })
  pickupPersonId?: string;

  @Column({
    type: 'enum',
    enum: RequestType,
    default: RequestType.STANDARD,
    name: 'request_type',
  })
  requestType!: RequestType;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @Column({ type: 'timestamp with time zone', name: 'requested_time' })
  requestedTime!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'scheduled_pickup_time' })
  scheduledPickupTime?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'actual_pickup_time' })
  actualPickupTime?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true, name: 'request_location_lat' })
  requestLocationLat?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true, name: 'request_location_lng' })
  requestLocationLng?: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true, name: 'pickup_location_lat' })
  pickupLocationLat?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true, name: 'pickup_location_lng' })
  pickupLocationLng?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason?: string;

  @Column({ type: 'text', nullable: true, name: 'special_instructions' })
  specialInstructions?: string;

  // Guest pickup fields
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'guest_name' })
  guestName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'guest_phone' })
  guestPhone?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'guest_id_number' })
  guestIdNumber?: string;

  @Column({ type: 'text', nullable: true, name: 'guest_photo_url' })
  guestPhotoUrl?: string;

  // QR Code fields (Section 5)
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'qr_code' })
  qrCode?: string;

  @Column({ type: 'text', nullable: true, name: 'qr_code_data' })
  qrCodeData?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'qr_code_token' })
  qrCodeToken?: string;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'qr_expires_at' })
  qrExpiresAt?: Date;

  // Verification fields (Section 5)
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'verification_method'
  })
  verificationMethod?: 'qr' | 'manual' | 'emergency';

  @Column({ type: 'uuid', nullable: true, name: 'completed_by' })
  completedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'completed_at' })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true, name: 'verification_notes' })
  verificationNotes?: string;

  @Column({ type: 'boolean', default: false, name: 'photo_verified' })
  photoVerified?: boolean;

  // Emergency pickup fields (Section 5)
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'emergency_pickup_person' })
  emergencyPickupPerson?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'emergency_pickup_phone' })
  emergencyPickupPhone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'emergency_pickup_relationship' })
  emergencyPickupRelationship?: string;

  @Column({ type: 'text', nullable: true, name: 'emergency_pickup_reason' })
  emergencyPickupReason?: string;

  @Column({ type: 'boolean', default: false, name: 'requires_admin_review' })
  requiresAdminReview?: boolean;

  // Approval tracking
  @Column({ type: 'uuid', nullable: true, name: 'approver_id' })
  approverId?: string;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'approved_at' })
  approvedAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.pickupRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ManyToOne(() => User, (user) => user.pickupRequests)
  @JoinColumn({ name: 'requester_id' })
  requester!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pickup_person_id' })
  pickupPerson?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approver_id' })
  approver?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'completed_by' })
  guard?: User;

  @OneToMany(() => GuestPickupApproval, (approval) => approval.pickupRequest)
  guestApprovals?: GuestPickupApproval[];
}
