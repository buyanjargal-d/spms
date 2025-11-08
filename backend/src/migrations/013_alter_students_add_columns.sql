-- ============================================
-- Migration: Add Emergency Contact and Pickup Notes to Students
-- Description: Add essential emergency phone and pickup instructions
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 1 (Critical)
-- ============================================

-- ============================================
-- 1. Add new columns to students table
-- ============================================

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS pickup_notes TEXT;

-- ============================================
-- 2. Add check constraint for phone number format (optional but recommended)
-- ============================================

ALTER TABLE students
    ADD CONSTRAINT IF NOT EXISTS check_emergency_phone_format
    CHECK (
        emergency_phone IS NULL OR
        emergency_phone ~ '^\+?[0-9\s\-\(\)]+$'
    );

-- ============================================
-- 3. Create index for emergency phone lookups (if needed)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_emergency_phone
    ON students(emergency_phone)
    WHERE emergency_phone IS NOT NULL;

-- ============================================
-- 4. Add comments for documentation
-- ============================================

COMMENT ON COLUMN students.emergency_phone IS 'Quick emergency contact phone number';
COMMENT ON COLUMN students.pickup_notes IS 'Special instructions or notes for pickup (e.g., "Must show ID", "Only mother can pickup")';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
DECLARE
    student_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO student_count FROM students;
    RAISE NOTICE '✅ Migration 013 completed successfully';
    RAISE NOTICE '📊 Added emergency phone and pickup notes columns to % students', student_count;
    RAISE NOTICE 'ℹ️  These fields are optional but recommended for safety';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
ALTER TABLE students
    DROP CONSTRAINT IF EXISTS check_emergency_phone_format,
    DROP COLUMN IF EXISTS emergency_phone,
    DROP COLUMN IF EXISTS pickup_notes;
*/
