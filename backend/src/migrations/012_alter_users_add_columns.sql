-- ============================================
-- Migration: Add Security and Preference Columns to Users
-- Description: Add login tracking, account security, and notification preferences
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 1 (Critical)
-- ============================================

-- ============================================
-- 1. Add new columns to users table
-- ============================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"in_app": true, "sms": false}'::jsonb;

-- ============================================
-- 2. Update existing rows with default values
-- ============================================

UPDATE users
SET
    failed_login_attempts = 0
WHERE failed_login_attempts IS NULL;

UPDATE users
SET
    notification_preferences = '{"in_app": true, "sms": false}'::jsonb
WHERE notification_preferences IS NULL;

-- ============================================
-- 3. Make failed_login_attempts NOT NULL after setting defaults
-- ============================================

ALTER TABLE users
    ALTER COLUMN failed_login_attempts SET NOT NULL;

-- ============================================
-- 4. Add check constraint for failed login attempts
-- ============================================

ALTER TABLE users
    ADD CONSTRAINT IF NOT EXISTS check_failed_login_attempts
    CHECK (failed_login_attempts >= 0 AND failed_login_attempts <= 10);

-- ============================================
-- 5. Create indexes for performance
-- ============================================

-- Index for finding recently logged in users
CREATE INDEX IF NOT EXISTS idx_users_last_login
    ON users(last_login_at DESC NULLS LAST);

-- Index for finding locked accounts
CREATE INDEX IF NOT EXISTS idx_users_locked_accounts
    ON users(account_locked_until)
    WHERE account_locked_until > NOW();

-- ============================================
-- 6. Create function to check if account is locked
-- ============================================

CREATE OR REPLACE FUNCTION is_account_locked(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT account_locked_until INTO locked_until
    FROM users
    WHERE id = user_id;

    -- Account is locked if locked_until is in the future
    RETURN locked_until IS NOT NULL AND locked_until > NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Create function to record login attempt
-- ============================================

CREATE OR REPLACE FUNCTION record_login_attempt(
    p_user_id UUID,
    p_success BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    IF p_success THEN
        -- Successful login: reset failed attempts and record login time
        UPDATE users
        SET
            last_login_at = NOW(),
            failed_login_attempts = 0,
            account_locked_until = NULL
        WHERE id = p_user_id;
    ELSE
        -- Failed login: increment counter
        UPDATE users
        SET
            failed_login_attempts = failed_login_attempts + 1,
            -- Lock account for 30 minutes after 5 failed attempts
            account_locked_until = CASE
                WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
                ELSE account_locked_until
            END
        WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Add comments for documentation
-- ============================================

COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN users.account_locked_until IS 'Account locked until this timestamp (NULL if not locked)';
COMMENT ON COLUMN users.notification_preferences IS 'User notification channel preferences (JSON)';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE 'Migration 012 completed successfully';
    RAISE NOTICE 'Added security and preference columns to % users', user_count;
    RAISE NOTICE 'SECURITY: Account will auto-lock for 30 minutes after 5 failed login attempts';
    RAISE NOTICE 'Use record_login_attempt(user_id, success) function to track logins';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP FUNCTION IF EXISTS record_login_attempt(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS is_account_locked(UUID);

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS check_failed_login_attempts,
    DROP COLUMN IF EXISTS last_login_at,
    DROP COLUMN IF EXISTS failed_login_attempts,
    DROP COLUMN IF EXISTS account_locked_until,
    DROP COLUMN IF EXISTS notification_preferences;
*/
