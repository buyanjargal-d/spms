import { AppDataSource } from '../config/database';

async function runMigration() {
  try {
    console.log('🔧 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    console.log('🔧 Running Section 5 (Guard Functionality) migration...');
    await AppDataSource.query(`
      -- Add QR code fields to pickup_requests
      ALTER TABLE pickup_requests
      ADD COLUMN IF NOT EXISTS qr_code VARCHAR(500),
      ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
      ADD COLUMN IF NOT EXISTS qr_code_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS qr_expires_at TIMESTAMP WITH TIME ZONE;

      -- Add verification fields to pickup_requests
      ALTER TABLE pickup_requests
      ADD COLUMN IF NOT EXISTS verification_method VARCHAR(20) CHECK (verification_method IN ('qr', 'manual', 'emergency')),
      ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS verification_notes TEXT,
      ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN DEFAULT FALSE;

      -- Add emergency pickup fields to pickup_requests
      ALTER TABLE pickup_requests
      ADD COLUMN IF NOT EXISTS emergency_pickup_person VARCHAR(255),
      ADD COLUMN IF NOT EXISTS emergency_pickup_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS emergency_pickup_relationship VARCHAR(100),
      ADD COLUMN IF NOT EXISTS emergency_pickup_reason TEXT,
      ADD COLUMN IF NOT EXISTS requires_admin_review BOOLEAN DEFAULT FALSE;

      -- Add approval tracking fields to pickup_requests
      ALTER TABLE pickup_requests
      ADD COLUMN IF NOT EXISTS approver_id UUID REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

      -- Create security_alerts table
      CREATE TABLE IF NOT EXISTS security_alerts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          type VARCHAR(50) NOT NULL,
          severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
          request_id UUID REFERENCES pickup_requests(id),
          guard_id UUID NOT NULL REFERENCES users(id),
          details TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'investigating', 'resolved')),
          reviewed_by UUID REFERENCES users(id),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for security_alerts
      CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
      CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);
      CREATE INDEX IF NOT EXISTS idx_security_alerts_guard ON security_alerts(guard_id);
      CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);

      -- Create indexes for pickup_requests new fields
      CREATE INDEX IF NOT EXISTS idx_pickup_requests_qr_code ON pickup_requests(qr_code) WHERE qr_code IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_pickup_requests_completed_by ON pickup_requests(completed_by) WHERE completed_by IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_pickup_requests_approver ON pickup_requests(approver_id) WHERE approver_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_pickup_requests_admin_review ON pickup_requests(requires_admin_review) WHERE requires_admin_review = TRUE;
    `);

    console.log('✅ Migration completed successfully');
    console.log('📱 Added Section 5 fields to pickup_requests table');
    console.log('🔒 Created security_alerts table');
    console.log('📊 Created performance indexes');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migration:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runMigration();
