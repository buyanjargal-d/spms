import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Student } from './Student';
import { User } from './User';

@Entity('student_guardians')
@Unique(['studentId', 'guardianId'])
export class StudentGuardian {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId!: string;

  @Column({ type: 'uuid', name: 'guardian_id' })
  guardianId!: string;

  @Column({ type: 'varchar', length: 50 })
  relationship!: string;

  @Column({ type: 'boolean', default: false, name: 'is_primary' })
  isPrimary!: boolean;

  @Column({ type: 'boolean', default: true, name: 'is_authorized' })
  isAuthorized!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Student, (student) => student.guardians, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ManyToOne(() => User, (user) => user.studentGuardians, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guardian_id' })
  guardian!: User;
}
