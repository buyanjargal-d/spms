-- ============================================
-- Migration: Create Notifications Table
-- Description: Enable system to notify users about pickup request status
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 1 (Critical)
-- ============================================

-- ============================================
-- 1. Create notifications table
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_request_id UUID REFERENCES pickup_requests(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Create indexes for performance
-- ============================================

-- Index for getting user's unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications(user_id, is_read, created_at DESC);

-- Index for filtering by notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type
    ON notifications(notification_type);

-- Index for finding notifications related to a pickup request
CREATE INDEX IF NOT EXISTS idx_notifications_request
    ON notifications(related_request_id)
    WHERE related_request_id IS NOT NULL;

-- Partial index for unread notifications only (faster queries)
CREATE INDEX IF NOT EXISTS idx_notifications_unread_only
    ON notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;

-- ============================================
-- 3. Add check constraint for notification types
-- ============================================

ALTER TABLE notifications ADD CONSTRAINT check_notification_type CHECK (
    notification_type IN (
        'pickup_request_created',
        'pickup_request_approved',
        'pickup_request_rejected',
        'pickup_completed',
        'guest_approval_needed',
        'guest_approval_received',
        'system_announcement'
    )
);

-- ============================================
-- 4. Create trigger to auto-set read_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION auto_set_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_set_read_at ON notifications;

CREATE TRIGGER trigger_auto_set_read_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_read_at();

-- ============================================
-- 5. Add comments for documentation
-- ============================================

COMMENT ON TABLE notifications IS 'System notifications and alerts for users';
COMMENT ON COLUMN notifications.user_id IS 'User who receives this notification';
COMMENT ON COLUMN notifications.title IS 'Short notification title/subject';
COMMENT ON COLUMN notifications.message IS 'Full notification message content';
COMMENT ON COLUMN notifications.notification_type IS 'Type of notification for filtering and routing';
COMMENT ON COLUMN notifications.related_request_id IS 'Optional reference to related pickup request';
COMMENT ON COLUMN notifications.is_read IS 'Whether user has read this notification';
COMMENT ON COLUMN notifications.read_at IS 'When the notification was marked as read';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 008 completed successfully';
    RAISE NOTICE '📊 Created notifications table with indexes and triggers';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_auto_set_read_at ON notifications;
DROP FUNCTION IF EXISTS auto_set_read_at();
DROP TABLE IF EXISTS notifications CASCADE;
*/
