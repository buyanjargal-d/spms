import { AppDataSource } from '../config/database';

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected to database');

    console.log('Running Section 6 (Admin Functionality) migration...');
    await AppDataSource.query(`
      -- Add security and tracking fields to users table
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS notification_preferences JSONB,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

      -- Add enhanced fields to students table
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
      ADD COLUMN IF NOT EXISTS allergies TEXT,
      ADD COLUMN IF NOT EXISTS medications TEXT,
      ADD COLUMN IF NOT EXISTS emergency_notes TEXT,
      ADD COLUMN IF NOT EXISTS pickup_instructions TEXT,
      ADD COLUMN IF NOT EXISTS enrollment_date DATE DEFAULT CURRENT_DATE,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

      -- Add guardian authorization fields to student_guardians
      ALTER TABLE student_guardians
      ADD COLUMN IF NOT EXISTS is_authorized BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS authorized_by UUID REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS authorized_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS authorization_notes TEXT;

      -- Ensure only one primary guardian per student
      CREATE UNIQUE INDEX IF NOT EXISTS idx_student_primary_guardian
      ON student_guardians(student_id)
      WHERE is_primary = TRUE;

      -- Enhance classes table
      ALTER TABLE classes
      ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20),
      ADD COLUMN IF NOT EXISTS room_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 30,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS notes TEXT;

      -- Create school_settings table (if not exists)
      CREATE TABLE IF NOT EXISTS school_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
          setting_type VARCHAR(50), -- string, number, boolean, json
          description TEXT,
          category VARCHAR(50), -- general, pickup, security, notifications
          updated_by UUID REFERENCES users(id),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Add missing columns to school_settings table if they don't exist
      ALTER TABLE school_settings
      ADD COLUMN IF NOT EXISTS setting_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS category VARCHAR(50);

      -- Create notification_templates table
      CREATE TABLE IF NOT EXISTS notification_templates (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          template_key VARCHAR(100) NOT NULL UNIQUE,
          template_name VARCHAR(255) NOT NULL,
          template_type VARCHAR(50) NOT NULL, -- sms, email, push, in_app
          subject VARCHAR(255), -- for email
          body_mn TEXT NOT NULL, -- Mongolian
          body_en TEXT, -- English
          variables JSONB, -- list of available variables
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create school_schedules table (holidays, special schedules)
      CREATE TABLE IF NOT EXISTS school_schedules (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          schedule_date DATE NOT NULL,
          schedule_type VARCHAR(50) NOT NULL, -- holiday, early_dismissal, late_start, half_day
          name VARCHAR(255) NOT NULL,
          description TEXT,
          start_time TIME,
          end_time TIME,
          is_recurring BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for school_settings
      CREATE INDEX IF NOT EXISTS idx_settings_category ON school_settings(category);
      CREATE INDEX IF NOT EXISTS idx_settings_key ON school_settings(setting_key);

      -- Create indexes for notification_templates
      CREATE INDEX IF NOT EXISTS idx_templates_type ON notification_templates(template_type);
      CREATE INDEX IF NOT EXISTS idx_templates_key ON notification_templates(template_key);

      -- Create indexes for school_schedules
      CREATE INDEX IF NOT EXISTS idx_schedules_date ON school_schedules(schedule_date);
      CREATE INDEX IF NOT EXISTS idx_schedules_type ON school_schedules(schedule_type);

      -- Create indexes for users
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);
      CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

      -- Create indexes for students
      CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);
      CREATE INDEX IF NOT EXISTS idx_students_class_active ON students(class_id, is_active);

      -- Create indexes for classes
      CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade_level) WHERE is_active = TRUE;
      CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id) WHERE is_active = TRUE;
      CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);

      -- Create indexes for student_guardians
      CREATE INDEX IF NOT EXISTS idx_student_guardians_student ON student_guardians(student_id);
      CREATE INDEX IF NOT EXISTS idx_student_guardians_guardian ON student_guardians(guardian_id);
      CREATE INDEX IF NOT EXISTS idx_student_guardians_authorized ON student_guardians(is_authorized);

      -- Insert default school settings
      INSERT INTO school_settings (setting_key, setting_value, setting_type, description, category)
      VALUES
        ('school_name', 'SPMS School', 'string', 'School name', 'general'),
        ('school_start_time', '08:00', 'string', 'School start time', 'pickup'),
        ('school_end_time', '16:00', 'string', 'School end time', 'pickup'),
        ('pickup_window_start', '15:30', 'string', 'Pickup window start time', 'pickup'),
        ('pickup_window_end', '16:30', 'string', 'Pickup window end time', 'pickup'),
        ('advance_request_min_hours', '2', 'number', 'Minimum hours for advance request', 'pickup'),
        ('advance_request_max_days', '7', 'number', 'Maximum days for advance request', 'pickup'),
        ('require_parent_approval_guest', 'true', 'boolean', 'Require parent approval for guest pickup', 'pickup'),
        ('require_photo_guest', 'true', 'boolean', 'Require photo for guest pickup', 'pickup'),
        ('session_timeout_minutes', '60', 'number', 'Session timeout in minutes', 'security'),
        ('max_failed_login_attempts', '5', 'number', 'Maximum failed login attempts', 'security'),
        ('account_lockout_duration_minutes', '30', 'number', 'Account lockout duration in minutes', 'security')
      ON CONFLICT (setting_key) DO NOTHING;

      -- Insert default notification templates
      INSERT INTO notification_templates (template_key, template_name, template_type, body_mn, variables)
      VALUES
        ('pickup_request_created', 'Pickup Request Created', 'sms', 'Сайн байна уу {parentName}, {studentName} сурагчийн авах хүсэлт амжилттай үүслээ. Хүсэлтийн дугаар: {requestId}', '["parentName", "studentName", "requestId"]'::jsonb),
        ('pickup_request_approved', 'Pickup Request Approved', 'sms', 'Сайн байна уу {parentName}, {studentName} сурагчийн авах хүсэлт батлагдлаа. Авах цаг: {pickupTime}', '["parentName", "studentName", "pickupTime"]'::jsonb),
        ('pickup_request_rejected', 'Pickup Request Rejected', 'sms', 'Сайн байна уу {parentName}, {studentName} сурагчийн авах хүсэлт татгалзагдлаа. Шалтгаан: {reason}', '["parentName", "studentName", "reason"]'::jsonb),
        ('pickup_completed', 'Pickup Completed', 'sms', 'Сайн байна уу {parentName}, {studentName} сурагчийг амжилттай авлаа. Цаг: {completedTime}', '["parentName", "studentName", "completedTime"]'::jsonb),
        ('emergency_pickup', 'Emergency Pickup Alert', 'sms', 'Анхааруулга! {studentName} сурагчийг яаралтай авлаа. Админ хянах шаардлагатай. Хүсэлт: {requestId}', '["studentName", "requestId"]'::jsonb)
      ON CONFLICT (template_key) DO NOTHING;
    `);

    console.log('Migration completed successfully');
    console.log('Added Section 6 fields to users, students, classes tables');
    console.log('Enhanced student_guardians with authorization tracking');
    console.log('Created school_settings table with defaults');
    console.log('Created notification_templates table with defaults');
    console.log('Created school_schedules table');
    console.log('Created performance indexes');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('ERROR: Error running migration:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runMigration();
