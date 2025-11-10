import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ScheduleType {
  HOLIDAY = 'holiday',
  EARLY_DISMISSAL = 'early_dismissal',
  LATE_START = 'late_start',
  HALF_DAY = 'half_day',
}

@Entity('school_schedules')
export class SchoolSchedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date', name: 'schedule_date' })
  scheduleDate!: Date;

  @Column({ type: 'varchar', length: 50, name: 'schedule_type' })
  scheduleType!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'time', nullable: true, name: 'start_time' })
  startTime?: string;

  @Column({ type: 'time', nullable: true, name: 'end_time' })
  endTime?: string;

  @Column({ type: 'boolean', default: false, name: 'is_recurring' })
  isRecurring!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
