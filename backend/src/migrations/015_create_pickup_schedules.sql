-- ============================================
-- Migration: Create Pickup Schedules Table
-- Description: Enable parents to set recurring pickup schedules (e.g., "Every Monday at 3:30 PM")
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 2 (Enhanced Features)
-- ============================================

-- ============================================
-- 1. Create pickup_schedules table
-- ============================================

CREATE TABLE IF NOT EXISTS pickup_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    pickup_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Add check constraint for day_of_week
-- ============================================

ALTER TABLE pickup_schedules
    DROP CONSTRAINT IF EXISTS check_day_of_week;

ALTER TABLE pickup_schedules
    ADD CONSTRAINT check_day_of_week
    CHECK (day_of_week >= 0 AND day_of_week <= 6);

-- ============================================
-- 3. Create indexes for performance
-- ============================================

-- Index for getting student's active schedules
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_student_active
    ON pickup_schedules(student_id, is_active, day_of_week)
    WHERE is_active = TRUE;

-- Index for getting guardian's schedules
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_guardian
    ON pickup_schedules(guardian_id, is_active)
    WHERE is_active = TRUE;

-- Index for finding schedules by day
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_day
    ON pickup_schedules(day_of_week, is_active)
    WHERE is_active = TRUE;

-- ============================================
-- 4. Create unique constraint (one schedule per student per day per time)
-- ============================================

-- Drop old constraint if exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_student_day_time_schedule'
    ) THEN
        ALTER TABLE pickup_schedules DROP CONSTRAINT unique_student_day_time_schedule;
    END IF;
END $$;

-- Create unique index instead (allows WHERE clause)
DROP INDEX IF EXISTS idx_unique_student_day_time_schedule;

CREATE UNIQUE INDEX idx_unique_student_day_time_schedule
    ON pickup_schedules(student_id, day_of_week, pickup_time)
    WHERE is_active = TRUE;

-- ============================================
-- 5. Create trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_pickup_schedules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pickup_schedules_timestamp ON pickup_schedules;

CREATE TRIGGER trigger_update_pickup_schedules_timestamp
    BEFORE UPDATE ON pickup_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_pickup_schedules_timestamp();

-- ============================================
-- 6. Create helper function to get day name
-- ============================================

CREATE OR REPLACE FUNCTION get_day_name(day_num INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN CASE day_num
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
        ELSE 'Unknown'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 7. Create function to get today's schedules
-- ============================================

CREATE OR REPLACE FUNCTION get_todays_schedules()
RETURNS TABLE (
    schedule_id UUID,
    student_id UUID,
    student_name TEXT,
    guardian_id UUID,
    guardian_name TEXT,
    pickup_time TIME,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.id,
        ps.student_id,
        s.first_name || ' ' || s.last_name AS student_name,
        ps.guardian_id,
        u.full_name AS guardian_name,
        ps.pickup_time,
        ps.notes
    FROM pickup_schedules ps
    JOIN students s ON ps.student_id = s.id
    JOIN users u ON ps.guardian_id = u.id
    WHERE ps.is_active = TRUE
    AND ps.day_of_week = EXTRACT(DOW FROM CURRENT_DATE)::INTEGER
    ORDER BY ps.pickup_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. Add comments for documentation
-- ============================================

COMMENT ON TABLE pickup_schedules IS 'Recurring pickup schedules for students (e.g., Every Monday at 3:30 PM)';
COMMENT ON COLUMN pickup_schedules.student_id IS 'Student this schedule is for';
COMMENT ON COLUMN pickup_schedules.guardian_id IS 'Guardian who will pickup (must be authorized)';
COMMENT ON COLUMN pickup_schedules.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
COMMENT ON COLUMN pickup_schedules.pickup_time IS 'Time of day for pickup (e.g., 15:30:00)';
COMMENT ON COLUMN pickup_schedules.is_active IS 'Whether this schedule is currently active';
COMMENT ON COLUMN pickup_schedules.notes IS 'Additional notes for this recurring schedule';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 015 completed successfully';
    RAISE NOTICE 'Created pickup_schedules table';
    RAISE NOTICE 'Created helper functions: get_day_name(), get_todays_schedules()';
    RAISE NOTICE 'INFO: Parents can now set recurring pickup schedules';
    RAISE NOTICE 'INFO: Example: "Pick up my child every Monday and Friday at 3:30 PM"';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_update_pickup_schedules_timestamp ON pickup_schedules;
DROP FUNCTION IF EXISTS update_pickup_schedules_timestamp();
DROP FUNCTION IF EXISTS get_todays_schedules();
DROP FUNCTION IF EXISTS get_day_name(INTEGER);
DROP TABLE IF EXISTS pickup_schedules CASCADE;
*/
