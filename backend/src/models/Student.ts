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
import { Class } from './Class';
import { StudentGuardian } from './StudentGuardian';
import { PickupRequest } from './PickupRequest';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'student_code' })
  studentCode!: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth?: Date;

  @Column({ type: 'integer', nullable: true, name: 'grade_level' })
  gradeLevel?: number;

  @Column({ type: 'uuid', nullable: true, name: 'class_id' })
  classId?: string;

  @Column({ type: 'text', nullable: true, name: 'profile_photo_url' })
  profilePhotoUrl?: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Class, (c) => c.students)
  @JoinColumn({ name: 'class_id' })
  class?: Class;

  @OneToMany(() => StudentGuardian, (sg) => sg.student)
  guardians?: StudentGuardian[];

  @OneToMany(() => PickupRequest, (pr) => pr.student)
  pickupRequests?: PickupRequest[];

  // Helper method
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
