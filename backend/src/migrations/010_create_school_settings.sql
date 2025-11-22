-- ============================================
-- Migration: Create School Settings Table
-- Description: Configure school parameters without code changes
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 1 (Critical)
-- ============================================

-- ============================================
-- 1. Create school_settings table
-- ============================================

CREATE TABLE IF NOT EXISTS school_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Create indexes
-- ============================================

-- Unique index on setting_key for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_school_settings_key
    ON school_settings(setting_key);

-- Index for recently updated settings
CREATE INDEX IF NOT EXISTS idx_school_settings_updated
    ON school_settings(updated_at DESC);

-- ============================================
-- 3. Create trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_school_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_school_settings_timestamp ON school_settings;

CREATE TRIGGER trigger_update_school_settings_timestamp
    BEFORE UPDATE ON school_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_school_settings_timestamp();

-- ============================================
-- 4. Insert default settings
-- ============================================

INSERT INTO school_settings (setting_key, setting_value, description) VALUES
    ('school_name', 'School Name', 'Name of the school'),
    ('school_start_time', '08:00:00', 'School start time (HH:MM:SS)'),
    ('school_end_time', '16:00:00', 'School end time (HH:MM:SS)'),
    ('pickup_start_time', '15:30:00', 'Earliest pickup time allowed (HH:MM:SS)'),
    ('pickup_end_time', '17:00:00', 'Latest pickup time allowed (HH:MM:SS)'),
    ('max_advance_request_days', '7', 'Maximum days in advance to create pickup request'),
    ('auto_approve_primary_guardian', 'false', 'Auto-approve requests from primary guardian (true/false)'),
    ('qr_code_expiry_minutes', '30', 'QR code validity period in minutes'),
    ('max_pickup_requests_per_day', '3', 'Maximum pickup requests per student per day'),
    ('school_phone', '+976-XXXX-XXXX', 'School contact phone number'),
    ('school_address', 'School Address', 'School physical address'),
    ('timezone', 'Asia/Ulaanbaatar', 'School timezone'),
    ('guest_approval_required', 'true', 'Require parent approval for guest pickup requests (true/false)')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 5. Add comments for documentation
-- ============================================

COMMENT ON TABLE school_settings IS 'System-wide configuration settings';
COMMENT ON COLUMN school_settings.setting_key IS 'Unique key identifier for the setting';
COMMENT ON COLUMN school_settings.setting_value IS 'Value of the setting (stored as text)';
COMMENT ON COLUMN school_settings.description IS 'Human-readable description of what this setting does';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
DECLARE
    setting_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO setting_count FROM school_settings;
    RAISE NOTICE 'Migration 010 completed successfully';
    RAISE NOTICE 'Created school_settings table with % default settings', setting_count;
    RAISE NOTICE 'INFO: Admin can now configure school parameters without code changes';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_update_school_settings_timestamp ON school_settings;
DROP FUNCTION IF EXISTS update_school_settings_timestamp();
DROP TABLE IF EXISTS school_settings CASCADE;
*/
