-- ============================================
-- Migration: Add QR Code and Verification Columns to Pickup Requests
-- Description: Add QR code, verification tracking, and approval tracking
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 1 (Critical)
-- ============================================

-- ============================================
-- 1. Add new columns to pickup_requests
-- ============================================

ALTER TABLE pickup_requests
    ADD COLUMN IF NOT EXISTS qr_code VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
    ADD COLUMN IF NOT EXISTS verified_by_user_id UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 2. Create indexes for new columns
-- ============================================

-- Index for QR code lookups (guard scans QR)
CREATE INDEX IF NOT EXISTS idx_pickup_requests_qr
    ON pickup_requests(qr_code)
    WHERE qr_code IS NOT NULL;

-- Index for verification code lookups (backup PIN entry)
CREATE INDEX IF NOT EXISTS idx_pickup_requests_verification_code
    ON pickup_requests(verification_code)
    WHERE verification_code IS NOT NULL;

-- Index for finding requests verified by a specific guard
CREATE INDEX IF NOT EXISTS idx_pickup_requests_verified_by
    ON pickup_requests(verified_by_user_id)
    WHERE verified_by_user_id IS NOT NULL;

-- Index for finding requests approved by a specific teacher
CREATE INDEX IF NOT EXISTS idx_pickup_requests_approved_by
    ON pickup_requests(approved_by_user_id)
    WHERE approved_by_user_id IS NOT NULL;

-- ============================================
-- 3. Create QR code generation function
-- ============================================

CREATE OR REPLACE FUNCTION generate_qr_code(request_id UUID)
RETURNS VARCHAR(100) AS $$
DECLARE
    qr_string VARCHAR(100);
    unique_found BOOLEAN := FALSE;
BEGIN
    -- Generate unique QR code using request ID and timestamp
    -- Format: SPMS-[TIMESTAMP]-[FIRST_8_CHARS_OF_UUID]
    WHILE NOT unique_found LOOP
        qr_string := 'SPMS-' ||
                     TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' ||
                     SUBSTRING(request_id::TEXT, 1, 8);

        -- Check if QR code already exists
        IF NOT EXISTS (SELECT 1 FROM pickup_requests WHERE qr_code = qr_string) THEN
            unique_found := TRUE;
        END IF;
    END LOOP;

    RETURN qr_string;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Create verification PIN generation function
-- ============================================

CREATE OR REPLACE FUNCTION generate_verification_pin()
RETURNS VARCHAR(6) AS $$
DECLARE
    pin VARCHAR(6);
BEGIN
    -- Generate random 6-digit PIN
    pin := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    RETURN pin;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create trigger to auto-generate codes on approval
-- ============================================

CREATE OR REPLACE FUNCTION auto_generate_codes_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- When status changes to 'approved', generate QR and PIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- Generate QR code if not already set
        IF NEW.qr_code IS NULL THEN
            NEW.qr_code := generate_qr_code(NEW.id);
        END IF;

        -- Generate verification PIN if not already set
        IF NEW.verification_code IS NULL THEN
            NEW.verification_code := generate_verification_pin();
        END IF;

        -- Set approved_at timestamp if not already set
        IF NEW.approved_at IS NULL THEN
            NEW.approved_at := NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_codes ON pickup_requests;

CREATE TRIGGER trigger_auto_generate_codes
    BEFORE INSERT OR UPDATE ON pickup_requests
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_codes_on_approval();

-- ============================================
-- 6. Add check constraint for verification code format
-- ============================================

ALTER TABLE pickup_requests
    ADD CONSTRAINT IF NOT EXISTS check_verification_code_format
    CHECK (verification_code IS NULL OR verification_code ~ '^[0-9]{6}$');

-- ============================================
-- 7. Add comments for documentation
-- ============================================

COMMENT ON COLUMN pickup_requests.qr_code IS 'Unique QR code for guard to scan at pickup';
COMMENT ON COLUMN pickup_requests.verification_code IS '6-digit PIN for backup verification';
COMMENT ON COLUMN pickup_requests.verified_by_user_id IS 'Guard who verified and completed the pickup';
COMMENT ON COLUMN pickup_requests.approved_by_user_id IS 'Teacher/admin who approved the request';
COMMENT ON COLUMN pickup_requests.approved_at IS 'Timestamp when request was approved';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 011 completed successfully';
    RAISE NOTICE '📊 Added QR code, verification code, and approval tracking columns';
    RAISE NOTICE '🔧 Created auto-generation functions and triggers';
    RAISE NOTICE 'ℹ️  QR codes and PINs will be auto-generated when request is approved';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_auto_generate_codes ON pickup_requests;
DROP FUNCTION IF EXISTS auto_generate_codes_on_approval();
DROP FUNCTION IF EXISTS generate_verification_pin();
DROP FUNCTION IF EXISTS generate_qr_code(UUID);

ALTER TABLE pickup_requests
    DROP CONSTRAINT IF EXISTS check_verification_code_format,
    DROP COLUMN IF EXISTS qr_code,
    DROP COLUMN IF EXISTS verification_code,
    DROP COLUMN IF EXISTS verified_by_user_id,
    DROP COLUMN IF EXISTS approved_by_user_id,
    DROP COLUMN IF EXISTS approved_at;
*/
