-- ============================================
-- Migration: Add Capacity and Active Status to Classes
-- Description: Add class capacity management and active/inactive status
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 1 (Critical)
-- ============================================

-- ============================================
-- 1. Add new columns to classes table
-- ============================================

ALTER TABLE classes
    ADD COLUMN IF NOT EXISTS capacity INTEGER,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- 2. Update existing rows with default values
-- ============================================

UPDATE classes
SET
    is_active = TRUE
WHERE is_active IS NULL;

-- ============================================
-- 3. Make is_active NOT NULL after setting defaults
-- ============================================

ALTER TABLE classes
    ALTER COLUMN is_active SET DEFAULT TRUE,
    ALTER COLUMN is_active SET NOT NULL;

-- ============================================
-- 4. Add check constraint for capacity
-- ============================================

ALTER TABLE classes
    ADD CONSTRAINT IF NOT EXISTS check_class_capacity
    CHECK (capacity IS NULL OR capacity > 0);

-- ============================================
-- 5. Create indexes for performance
-- ============================================

-- Index for finding active classes
CREATE INDEX IF NOT EXISTS idx_classes_active
    ON classes(is_active)
    WHERE is_active = TRUE;

-- Index for active classes by grade
CREATE INDEX IF NOT EXISTS idx_classes_grade_active
    ON classes(grade_level, is_active)
    WHERE is_active = TRUE;

-- ============================================
-- 6. Create trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_classes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_classes_timestamp ON classes;

CREATE TRIGGER trigger_update_classes_timestamp
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_classes_timestamp();

-- ============================================
-- 7. Create function to check class capacity
-- ============================================

CREATE OR REPLACE FUNCTION is_class_full(class_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    class_capacity INTEGER;
    current_students INTEGER;
BEGIN
    -- Get class capacity
    SELECT capacity INTO class_capacity
    FROM classes
    WHERE id = class_id;

    -- If no capacity set, class is never full
    IF class_capacity IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Count current active students in class
    SELECT COUNT(*) INTO current_students
    FROM students
    WHERE class_id = is_class_full.class_id AND is_active = TRUE;

    -- Return TRUE if at or over capacity
    RETURN current_students >= class_capacity;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Add comments for documentation
-- ============================================

COMMENT ON COLUMN classes.capacity IS 'Maximum number of students allowed in this class (NULL = unlimited)';
COMMENT ON COLUMN classes.is_active IS 'Whether this class is currently active (inactive classes are archived)';
COMMENT ON COLUMN classes.updated_at IS 'Last time this class record was updated';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
DECLARE
    class_count INTEGER;
    active_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO class_count FROM classes;
    SELECT COUNT(*) INTO active_count FROM classes WHERE is_active = TRUE;

    RAISE NOTICE '✅ Migration 014 completed successfully';
    RAISE NOTICE '📊 Updated % classes (% active)', class_count, active_count;
    RAISE NOTICE '🔧 Use is_class_full(class_id) to check if class is at capacity';
    RAISE NOTICE 'ℹ️  All existing classes have been marked as active';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_update_classes_timestamp ON classes;
DROP FUNCTION IF EXISTS update_classes_timestamp();
DROP FUNCTION IF EXISTS is_class_full(UUID);

ALTER TABLE classes
    DROP CONSTRAINT IF EXISTS check_class_capacity,
    DROP COLUMN IF EXISTS capacity,
    DROP COLUMN IF EXISTS is_active,
    DROP COLUMN IF EXISTS updated_at;
*/
