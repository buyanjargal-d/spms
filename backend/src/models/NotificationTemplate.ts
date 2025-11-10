import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateType {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app',
}

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'template_key' })
  templateKey!: string;

  @Column({ type: 'varchar', length: 255, name: 'template_name' })
  templateName!: string;

  @Column({ type: 'varchar', length: 50, name: 'template_type' })
  templateType!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject?: string;

  @Column({ type: 'text', name: 'body_mn' })
  bodyMn!: string;

  @Column({ type: 'text', nullable: true, name: 'body_en' })
  bodyEn?: string;

  @Column({ type: 'jsonb', nullable: true })
  variables?: string[];

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
