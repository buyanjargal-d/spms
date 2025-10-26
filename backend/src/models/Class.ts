import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Student } from './Student';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, name: 'class_name' })
  className!: string;

  @Column({ type: 'integer', name: 'grade_level' })
  gradeLevel!: number;

  @Column({ type: 'uuid', nullable: true, name: 'teacher_id' })
  teacherId?: string;

  @Column({ type: 'varchar', length: 20, name: 'school_year' })
  schoolYear!: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher?: User;

  @OneToMany(() => Student, (student) => student.class)
  students?: Student[];
}
