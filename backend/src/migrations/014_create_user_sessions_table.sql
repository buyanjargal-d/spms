-- ============================================
-- Migration: Create User Sessions Table
-- Description: Multi-device session tracking with JTI validation
-- Author: D.Buyanjargal
-- Date: 2025-11-09
-- Phase: 4 (Advanced Security - Session Management)
-- ============================================

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jti VARCHAR(255) NOT NULL UNIQUE,

    -- Session metadata
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),
    device VARCHAR(100),
    browser VARCHAR(100),
    os VARCHAR(100),
    location VARCHAR(100),

    -- Session status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoke_reason VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_active
    ON user_sessions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_jti
    ON user_sessions(jti);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at
    ON user_sessions(expires_at);

-- Add comments for documentation
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions across multiple devices';
COMMENT ON COLUMN user_sessions.jti IS 'JWT Token Identifier - unique for each session';
COMMENT ON COLUMN user_sessions.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN user_sessions.ip_address IS 'Client IP address';
COMMENT ON COLUMN user_sessions.revoke_reason IS 'Reason for session revocation (logout, security, etc)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 014 completed successfully';
    RAISE NOTICE '📱 Created user_sessions table for multi-device tracking';
END $$;
