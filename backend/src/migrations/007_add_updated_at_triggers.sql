-- Migration: Add Updated At Triggers
-- Description: Adds updated_at columns and triggers to auto-update timestamps
-- Author: System
-- Date: 2025-11-08
-- Priority: MEDIUM

-- ============================================
-- 1. Create generic updated_at trigger function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Generic trigger function to update updated_at timestamp';

-- ============================================
-- 2. Add updated_at to classes table
-- ============================================

ALTER TABLE classes
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

DROP TRIGGER IF EXISTS trigger_update_classes_timestamp ON classes;

CREATE TRIGGER trigger_update_classes_timestamp
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. Ensure users table has updated_at trigger
-- ============================================

-- Column should already exist, just add trigger
DROP TRIGGER IF EXISTS trigger_update_users_timestamp ON users;

CREATE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Ensure students table has updated_at trigger
-- ============================================

DROP TRIGGER IF EXISTS trigger_update_students_timestamp ON students;

CREATE TRIGGER trigger_update_students_timestamp
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Ensure pickup_requests table has updated_at trigger
-- ============================================

DROP TRIGGER IF EXISTS trigger_update_pickup_requests_timestamp ON pickup_requests;

CREATE TRIGGER trigger_update_pickup_requests_timestamp
    BEFORE UPDATE ON pickup_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. Guest pickup approvals already has trigger from migration 001
-- ============================================

-- Just ensure it exists
DROP TRIGGER IF EXISTS trigger_update_guest_approval_timestamp ON guest_pickup_approvals;

CREATE TRIGGER trigger_update_guest_approval_timestamp
    BEFORE UPDATE ON guest_pickup_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Add updated_at to notifications if missing
-- ============================================

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

DROP TRIGGER IF EXISTS trigger_update_notifications_timestamp ON notifications;

CREATE TRIGGER trigger_update_notifications_timestamp
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. School settings already has updated_at
-- ============================================

DROP TRIGGER IF EXISTS trigger_update_school_settings_timestamp ON school_settings;

CREATE TRIGGER trigger_update_school_settings_timestamp
    BEFORE UPDATE ON school_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Add to student_guardians
-- ============================================

ALTER TABLE student_guardians
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

DROP TRIGGER IF EXISTS trigger_update_student_guardians_timestamp ON student_guardians;

CREATE TRIGGER trigger_update_student_guardians_timestamp
    BEFORE UPDATE ON student_guardians
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. Add to pickup_approvals if exists
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pickup_approvals') THEN
        ALTER TABLE pickup_approvals
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

        DROP TRIGGER IF EXISTS trigger_update_pickup_approvals_timestamp ON pickup_approvals;

        CREATE TRIGGER trigger_update_pickup_approvals_timestamp
            BEFORE UPDATE ON pickup_approvals
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Added updated_at to pickup_approvals table';
    END IF;
END $$;

-- ============================================
-- 11. Summary
-- ============================================

-- Updated_at triggers added successfully to all tables!
