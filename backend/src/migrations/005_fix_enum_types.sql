-- Migration: Fix Enum Types
-- Description: Creates proper enum types and migrates VARCHAR columns to use them
-- Author: System
-- Date: 2025-11-08
-- Priority: HIGH

-- ============================================
-- 1. Create user_role enum (if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent', 'guard');
    END IF;
END $$;

-- ============================================
-- 2. Create request_type enum (if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type') THEN
        CREATE TYPE request_type AS ENUM ('standard', 'advance', 'guest');
    END IF;
END $$;

-- ============================================
-- 3. Create request_status enum (if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM (
            'pending',
            'pending_parent_approval',
            'approved',
            'rejected',
            'completed',
            'cancelled',
            'in_progress'
        );
    END IF;
END $$;

-- ============================================
-- 4. Create approval_status enum (if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- ============================================
-- 5. Create notification_type enum (if not exists)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'pickup_request_created',
            'pickup_request_approved',
            'pickup_request_rejected',
            'pickup_request_completed',
            'guest_approval_requested',
            'guest_approval_approved',
            'guest_approval_rejected',
            'student_arrived',
            'reminder',
            'system_alert'
        );
    END IF;
END $$;

-- ============================================
-- 6. Migrate users.role to enum
-- ============================================

DO $$
BEGIN
    -- Check if column is not already an enum
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role'
        AND data_type = 'character varying'
    ) THEN
        -- Alter column to use enum
        ALTER TABLE users
            ALTER COLUMN role TYPE user_role
            USING role::user_role;

        RAISE NOTICE 'Migrated users.role to user_role enum';
    ELSE
        RAISE NOTICE 'users.role is already an enum or does not exist';
    END IF;
END $$;

-- ============================================
-- 7. Drop views and indexes that depend on pickup_requests
-- ============================================

DROP VIEW IF EXISTS v_active_pickup_requests CASCADE;
DROP VIEW IF EXISTS v_student_guardians CASCADE;
DROP INDEX IF EXISTS idx_pickup_requests_active CASCADE;
DROP INDEX IF EXISTS idx_pickup_requests_scheduled CASCADE;
DROP INDEX IF EXISTS idx_guest_approvals_pending CASCADE;
DROP INDEX IF EXISTS idx_notifications_unread CASCADE;

-- ============================================
-- 8. Migrate pickup_requests.request_type to enum
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pickup_requests'
        AND column_name = 'request_type'
        AND data_type = 'character varying'
    ) THEN
        -- Remove default first
        ALTER TABLE pickup_requests
            ALTER COLUMN request_type DROP DEFAULT;

        -- Migrate to enum
        ALTER TABLE pickup_requests
            ALTER COLUMN request_type TYPE request_type
            USING request_type::request_type;

        -- Add default back
        ALTER TABLE pickup_requests
            ALTER COLUMN request_type SET DEFAULT 'standard'::request_type;

        RAISE NOTICE 'Migrated pickup_requests.request_type to request_type enum';
    ELSE
        RAISE NOTICE 'pickup_requests.request_type is already an enum or does not exist';
    END IF;
END $$;

-- ============================================
-- 8. Migrate pickup_requests.status to enum
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pickup_requests'
        AND column_name = 'status'
        AND data_type = 'character varying'
    ) THEN
        -- Drop old constraint first
        ALTER TABLE pickup_requests
            DROP CONSTRAINT IF EXISTS pickup_requests_status_check;

        -- Remove default
        ALTER TABLE pickup_requests
            ALTER COLUMN status DROP DEFAULT;

        -- Alter column to use enum
        ALTER TABLE pickup_requests
            ALTER COLUMN status TYPE request_status
            USING status::request_status;

        -- Add default back
        ALTER TABLE pickup_requests
            ALTER COLUMN status SET DEFAULT 'pending'::request_status;

        RAISE NOTICE 'Migrated pickup_requests.status to request_status enum';
    ELSE
        RAISE NOTICE 'pickup_requests.status is already an enum or does not exist';
    END IF;
END $$;

-- ============================================
-- 9. Migrate guest_pickup_approvals.status to enum
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'guest_pickup_approvals'
        AND column_name = 'status'
        AND data_type = 'character varying'
    ) THEN
        -- Drop old constraint first
        ALTER TABLE guest_pickup_approvals
            DROP CONSTRAINT IF EXISTS guest_approval_status_check;

        -- Remove default
        ALTER TABLE guest_pickup_approvals
            ALTER COLUMN status DROP DEFAULT;

        -- Alter column to use enum
        ALTER TABLE guest_pickup_approvals
            ALTER COLUMN status TYPE approval_status
            USING status::approval_status;

        -- Add default back
        ALTER TABLE guest_pickup_approvals
            ALTER COLUMN status SET DEFAULT 'pending'::approval_status;

        RAISE NOTICE 'Migrated guest_pickup_approvals.status to approval_status enum';
    ELSE
        RAISE NOTICE 'guest_pickup_approvals.status is already an enum or does not exist';
    END IF;
END $$;

-- ============================================
-- 10. Migrate notifications.notification_type to enum
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'notification_type'
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE notifications
            ALTER COLUMN notification_type TYPE notification_type
            USING notification_type::notification_type;

        RAISE NOTICE 'Migrated notifications.notification_type to notification_type enum';
    ELSE
        RAISE NOTICE 'notifications.notification_type is already an enum or does not exist';
    END IF;
END $$;

-- ============================================
-- 11. Fix audit_logs.action to use audit_action enum
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs'
        AND column_name = 'action'
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE audit_logs
            ALTER COLUMN action TYPE audit_action
            USING action::audit_action;

        RAISE NOTICE 'Migrated audit_logs.action to audit_action enum';
    ELSE
        RAISE NOTICE 'audit_logs.action is already an enum or does not exist';
    END IF;
END $$;

-- ============================================
-- 12. Fix audit_logs.entity_type to use audit_entity enum
-- ============================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs'
        AND column_name = 'entity_type'
        AND data_type = 'character varying'
    ) THEN
        ALTER TABLE audit_logs
            ALTER COLUMN entity_type TYPE audit_entity
            USING entity_type::audit_entity;

        RAISE NOTICE 'Migrated audit_logs.entity_type to audit_entity enum';
    ELSE
        RAISE NOTICE 'audit_logs.entity_type is already an enum or does not exist';
    END IF;
END $$;

-- ============================================
-- 13. Add comments
-- ============================================

COMMENT ON TYPE user_role IS 'User roles in the system: admin, teacher, parent, guard';
COMMENT ON TYPE request_type IS 'Pickup request types: standard, advance, guest';
COMMENT ON TYPE request_status IS 'Pickup request statuses';
COMMENT ON TYPE approval_status IS 'Guest pickup approval statuses';
COMMENT ON TYPE notification_type IS 'Types of notifications sent to users';

-- ============================================
-- 14. Recreate views with proper types
-- ============================================

CREATE OR REPLACE VIEW v_active_pickup_requests AS
SELECT
  pr.id,
  pr.status,
  pr.request_type,
  pr.scheduled_pickup_time,
  s.student_code,
  s.first_name || ' ' || s.last_name AS student_name,
  c.class_name,
  u_req.full_name AS requester_name,
  u_req.phone AS requester_phone,
  u_pickup.full_name AS pickup_person_name,
  pr.notes,
  pr.created_at
FROM pickup_requests pr
JOIN students s ON pr.student_id = s.id
LEFT JOIN classes c ON s.class_id = c.id
JOIN users u_req ON pr.requester_id = u_req.id
LEFT JOIN users u_pickup ON pr.pickup_person_id = u_pickup.id
WHERE pr.status = 'pending'::request_status OR pr.status = 'approved'::request_status
ORDER BY pr.scheduled_pickup_time;

CREATE OR REPLACE VIEW v_student_guardians AS
SELECT
  s.id AS student_id,
  s.student_code,
  s.first_name || ' ' || s.last_name AS student_name,
  u.id AS guardian_id,
  u.dan_id,
  u.full_name AS guardian_name,
  u.phone AS guardian_phone,
  sg.relationship,
  sg.is_primary,
  sg.is_authorized
FROM students s
JOIN student_guardians sg ON s.id = sg.student_id
JOIN users u ON sg.guardian_id = u.id
WHERE s.is_active = true AND u.is_active = true;
