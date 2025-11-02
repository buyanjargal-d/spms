-- Migration: Update Audit Logs Table
-- Description: Adds missing columns for comprehensive audit logging
-- Author: System
-- Date: 2025-10-30

-- ============================================
-- 1. Add missing columns
-- ============================================

-- Add old_values column for before-state tracking
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS old_values JSONB;

-- Add new_values column for after-state tracking
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS new_values JSONB;

-- Add description column
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add status_code column
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS status_code INTEGER;

-- Rename success to is_error (inverted logic)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'audit_logs' AND column_name = 'success') THEN
        -- Add is_error column
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS is_error BOOLEAN DEFAULT FALSE;

        -- Copy inverted values from success to is_error
        UPDATE audit_logs SET is_error = NOT COALESCE(success, TRUE);

        -- Drop old success column
        ALTER TABLE audit_logs DROP COLUMN IF EXISTS success;
    ELSE
        -- Just add is_error if success doesn't exist
        ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS is_error BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ============================================
-- 2. Update indexes
-- ============================================

-- Index for error tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_errors
ON audit_logs(is_error, created_at DESC)
WHERE is_error = TRUE;

-- ============================================
-- 3. Update comments
-- ============================================

COMMENT ON COLUMN audit_logs.old_values IS 'JSON snapshot of entity state before change';
COMMENT ON COLUMN audit_logs.new_values IS 'JSON snapshot of entity state after change';
COMMENT ON COLUMN audit_logs.description IS 'Human-readable description of the action';
COMMENT ON COLUMN audit_logs.status_code IS 'HTTP response status code';
COMMENT ON COLUMN audit_logs.is_error IS 'Whether the operation resulted in an error';
