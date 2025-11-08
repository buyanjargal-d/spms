-- ============================================
-- Migration: Create Attendance Table
-- Description: Track daily student attendance to prevent pickup of absent students
-- Author: D.Buyanjargal
-- Date: 2025-11-08
-- Phase: 1 (Critical)
-- ============================================

-- ============================================
-- 1. Create attendance table
-- ============================================

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    check_in_time TIME WITH TIME ZONE,
    notes TEXT,
    marked_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. Create indexes for performance
-- ============================================

-- Most common query: get student's attendance for a specific date
CREATE INDEX IF NOT EXISTS idx_attendance_student_date
    ON attendance(student_id, attendance_date DESC);

-- Query attendance by date (e.g., today's attendance for all students)
CREATE INDEX IF NOT EXISTS idx_attendance_date
    ON attendance(attendance_date DESC);

-- Filter by status (e.g., find all absent students today)
CREATE INDEX IF NOT EXISTS idx_attendance_status_date
    ON attendance(status, attendance_date DESC);

-- ============================================
-- 3. Add unique constraint (one record per student per day)
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique_student_date
    ON attendance(student_id, attendance_date);

-- ============================================
-- 4. Add check constraint for status values
-- ============================================

ALTER TABLE attendance ADD CONSTRAINT check_attendance_status CHECK (
    status IN ('present', 'absent', 'late', 'left_early')
);

-- ============================================
-- 5. Create trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_attendance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_attendance_timestamp ON attendance;

CREATE TRIGGER trigger_update_attendance_timestamp
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_timestamp();

-- ============================================
-- 6. Add comments for documentation
-- ============================================

COMMENT ON TABLE attendance IS 'Daily student attendance records';
COMMENT ON COLUMN attendance.student_id IS 'Student this attendance record is for';
COMMENT ON COLUMN attendance.attendance_date IS 'Date of this attendance record';
COMMENT ON COLUMN attendance.status IS 'Attendance status: present, absent, late, left_early';
COMMENT ON COLUMN attendance.check_in_time IS 'Time student arrived at school';
COMMENT ON COLUMN attendance.notes IS 'Additional notes about attendance';
COMMENT ON COLUMN attendance.marked_by_user_id IS 'Teacher/admin who marked attendance';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 009 completed successfully';
    RAISE NOTICE '📊 Created attendance table with unique constraint and indexes';
    RAISE NOTICE 'ℹ️  Default behavior: If no record exists, assume student is present';
    RAISE NOTICE 'ℹ️  Teachers should mark students as absent to prevent pickup';
END $$;

-- ============================================
-- ROLLBACK (Run this if you need to undo migration)
-- ============================================

/*
DROP TRIGGER IF EXISTS trigger_update_attendance_timestamp ON attendance;
DROP FUNCTION IF EXISTS update_attendance_timestamp();
DROP TABLE IF EXISTS attendance CASCADE;
*/
