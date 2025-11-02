-- Migration: Create Audit Logs Table
-- Description: Creates comprehensive audit logging system for security and compliance
-- Author: System
-- Date: 2025-10-30
-- Thesis Reference: Section 4.3.5 - Comprehensive Audit Logging

-- ============================================
-- 1. Create audit action enum
-- ============================================

CREATE TYPE audit_action AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'APPROVE',
    'REJECT',
    'COMPLETE',
    'CANCEL'
);

-- ============================================
-- 2. Create audit entity enum
-- ============================================

CREATE TYPE audit_entity AS ENUM (
    'User',
    'Student',
    'PickupRequest',
    'GuestApproval',
    'Notification'
);

-- ============================================
-- 3. Create audit_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    entity_type audit_entity NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(20),
    request_path TEXT,
    status_code INTEGER,
    is_error BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. Create indexes for performance
-- ============================================

-- Index for user activity lookup
CREATE INDEX IF NOT EXISTS idx_audit_logs_user
ON audit_logs(user_id, created_at DESC);

-- Index for entity tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
ON audit_logs(entity_type, entity_id, created_at DESC);

-- Index for action filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs(action, created_at DESC);

-- Index for error tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_errors
ON audit_logs(is_error, created_at DESC)
WHERE is_error = TRUE;

-- Index for time-based queries (for compliance reports)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON audit_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite
ON audit_logs(entity_type, action, created_at DESC);

-- ============================================
-- 5. Prevent updates and deletes (immutability)
-- ============================================

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Audit logs are immutable and cannot be updated';
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Audit logs are immutable and cannot be deleted';
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_audit_log_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER trigger_prevent_audit_log_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();

-- ============================================
-- 6. Add table and column comments
-- ============================================

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all sensitive operations - compliance and security logging';

COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action (NULL for system actions)';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (CREATE, UPDATE, DELETE, etc.)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN audit_logs.old_values IS 'JSON snapshot of entity state before change';
COMMENT ON COLUMN audit_logs.new_values IS 'JSON snapshot of entity state after change';
COMMENT ON COLUMN audit_logs.description IS 'Human-readable description of the action';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'Browser/client user agent string';
COMMENT ON COLUMN audit_logs.request_method IS 'HTTP method (GET, POST, PUT, DELETE)';
COMMENT ON COLUMN audit_logs.request_path IS 'API endpoint path';
COMMENT ON COLUMN audit_logs.status_code IS 'HTTP response status code';
COMMENT ON COLUMN audit_logs.is_error IS 'Whether the operation resulted in an error';
COMMENT ON COLUMN audit_logs.error_message IS 'Error message if operation failed';
COMMENT ON COLUMN audit_logs.created_at IS 'Timestamp when the action occurred';

-- ============================================
-- 7. Create audit log retention policy function
-- ============================================

-- Function to archive old audit logs (for compliance - typically 7 years retention)
-- This is a placeholder - actual archival would move to cold storage
CREATE OR REPLACE FUNCTION archive_old_audit_logs(retention_days INTEGER DEFAULT 2555)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- In production, this would move to archive table or cold storage
    -- For now, just count what would be archived
    SELECT COUNT(*) INTO archived_count
    FROM audit_logs
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;

    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_old_audit_logs IS 'Returns count of audit logs older than retention period (default 7 years). In production, would archive to cold storage.';
