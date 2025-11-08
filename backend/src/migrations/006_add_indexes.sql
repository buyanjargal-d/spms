-- Migration: Add Performance Indexes
-- Description: Adds comprehensive indexes for query performance
-- Author: System
-- Date: 2025-11-08
-- Priority: HIGH

-- ============================================
-- Users Table Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_dan_id ON users(dan_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

COMMENT ON INDEX idx_users_dan_id IS 'Fast lookup by DAN ID';
COMMENT ON INDEX idx_users_role IS 'Filter users by role';
COMMENT ON INDEX idx_users_active IS 'Partial index for active users only';

-- ============================================
-- Students Table Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade_level);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_students_name ON students(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);

COMMENT ON INDEX idx_students_class IS 'Fast lookup of students by class';
COMMENT ON INDEX idx_students_grade IS 'Filter students by grade level';
COMMENT ON INDEX idx_students_name IS 'Search students by name';

-- ============================================
-- Classes Table Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON classes(grade_level);
CREATE INDEX IF NOT EXISTS idx_classes_year ON classes(school_year);
CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(class_name);

COMMENT ON INDEX idx_classes_teacher IS 'Find classes by teacher';
COMMENT ON INDEX idx_classes_grade IS 'Filter classes by grade level';

-- ============================================
-- Pickup Requests Table Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pickup_requests_student ON pickup_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_requester ON pickup_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_pickup_person ON pickup_requests(pickup_person_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_type ON pickup_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_date ON pickup_requests(requested_time DESC);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_created_at ON pickup_requests(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pickup_requests_student_status
    ON pickup_requests(student_id, status, requested_time DESC);

-- Skipping partial index with IN clause - will be added later if needed
-- CREATE INDEX IF NOT EXISTS idx_pickup_requests_active
--     ON pickup_requests(status, requested_time DESC)
--     WHERE status IN ('pending', 'pending_parent_approval', 'approved', 'in_progress');

-- Skipping partial index with status check
-- CREATE INDEX IF NOT EXISTS idx_pickup_requests_scheduled
--     ON pickup_requests(scheduled_pickup_time)
--     WHERE scheduled_pickup_time IS NOT NULL AND status = 'approved';

COMMENT ON INDEX idx_pickup_requests_student IS 'Fast lookup of requests by student';
COMMENT ON INDEX idx_pickup_requests_status IS 'Filter requests by status';

-- ============================================
-- Student Guardians Table Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_student_guardians_student ON student_guardians(student_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_guardian ON student_guardians(guardian_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_authorized
    ON student_guardians(is_authorized)
    WHERE is_authorized = true;

CREATE INDEX IF NOT EXISTS idx_student_guardians_primary
    ON student_guardians(student_id, is_primary)
    WHERE is_primary = true;

COMMENT ON INDEX idx_student_guardians_student IS 'Find guardians for a student';
COMMENT ON INDEX idx_student_guardians_guardian IS 'Find students for a guardian';
COMMENT ON INDEX idx_student_guardians_primary IS 'Quickly find primary guardian for each student';

-- ============================================
-- Guest Pickup Approvals Table Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_guest_approvals_request ON guest_pickup_approvals(pickup_request_id);
CREATE INDEX IF NOT EXISTS idx_guest_approvals_parent ON guest_pickup_approvals(parent_id);
CREATE INDEX IF NOT EXISTS idx_guest_approvals_status ON guest_pickup_approvals(status);

CREATE INDEX IF NOT EXISTS idx_guest_approvals_pending
    ON guest_pickup_approvals(parent_id, status)
    WHERE status = 'pending';

COMMENT ON INDEX idx_guest_approvals_pending IS 'Partial index for pending approvals by parent';

-- ============================================
-- Notifications Table Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_request ON notifications(related_request_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON notifications(user_id, is_read, created_at DESC)
    WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_unsent
    ON notifications(is_sent, created_at)
    WHERE is_sent = false;

COMMENT ON INDEX idx_notifications_user IS 'Get notifications for a user ordered by date';
COMMENT ON INDEX idx_notifications_unread IS 'Partial index for unread notifications';
COMMENT ON INDEX idx_notifications_unsent IS 'Find notifications that need to be sent';

-- ============================================
-- Audit Logs Table Indexes (already created in migration 003)
-- ============================================

-- These should already exist from migration 003, but adding IF NOT EXISTS for safety
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_errors ON audit_logs(is_error, created_at DESC) WHERE is_error = TRUE;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit_logs(entity_type, action, created_at DESC);

-- ============================================
-- School Settings Table Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_school_settings_key ON school_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_school_settings_updated ON school_settings(updated_at DESC);

-- ============================================
-- Pickup Approvals Table Indexes (if table exists)
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pickup_approvals') THEN
        CREATE INDEX IF NOT EXISTS idx_pickup_approvals_request ON pickup_approvals(request_id);
        CREATE INDEX IF NOT EXISTS idx_pickup_approvals_approver ON pickup_approvals(approver_id);
        CREATE INDEX IF NOT EXISTS idx_pickup_approvals_action ON pickup_approvals(action);
        CREATE INDEX IF NOT EXISTS idx_pickup_approvals_created_at ON pickup_approvals(created_at DESC);

        RAISE NOTICE 'Created indexes for pickup_approvals table';
    END IF;
END $$;

-- ============================================
-- Summary
-- ============================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';

    RAISE NOTICE 'Total indexes in public schema: %', index_count;
    RAISE NOTICE 'Index creation completed successfully!';
END $$;
