-- ============================================
-- Migration: Add Password Column to Users
-- Description: Add password field for local testing fallback
-- Author: D.Buyanjargal
-- Date: 2025-11-09
-- Phase: 3 (DAN Integration - Password Fallback)
-- ============================================

-- Add password column to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN users.password IS 'Hashed password for local testing (fallback when DAN unavailable)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 013 completed successfully';
    RAISE NOTICE '🔐 Added password column for local testing fallback';
END $$;
