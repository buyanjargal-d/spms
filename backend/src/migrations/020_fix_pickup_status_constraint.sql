-- ============================================
-- Migration: Fix Pickup Request Status Constraint
-- Description: Replace 'approved' with 'confirmed' to match TypeScript enum
-- Author: System
-- Date: 2025-11-19
-- ============================================

-- ============================================
-- 1. Update any existing invalid status values FIRST
-- ============================================

-- Update 'approved' to 'confirmed'
UPDATE pickup_requests
SET status = 'confirmed'
WHERE status = 'approved';

-- Update 'completed' to 'confirmed' (completed pickups should be confirmed with actualPickupTime set)
UPDATE pickup_requests
SET status = 'confirmed'
WHERE status = 'completed';

-- Update any 'in_progress' to 'confirmed'
UPDATE pickup_requests
SET status = 'confirmed'
WHERE status = 'in_progress';

-- ============================================
-- 2. Drop existing status constraint
-- ============================================

ALTER TABLE pickup_requests
DROP CONSTRAINT IF EXISTS pickup_requests_status_check;

-- ============================================
-- 3. Add updated constraint with 'confirmed' instead of 'approved'
-- ============================================

ALTER TABLE pickup_requests
ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN (
    'pending',
    'pending_parent_approval',
    'confirmed',
    'rejected',
    'cancelled'
));

-- ============================================
-- 4. Update comment for documentation
-- ============================================

COMMENT ON COLUMN pickup_requests.status IS
'Request status: pending, pending_parent_approval, confirmed, rejected, cancelled';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 020 completed successfully';
    RAISE NOTICE 'Updated pickup_requests status constraint';
    RAISE NOTICE 'INFO: Changed allowed values: approved → confirmed';
    RAISE NOTICE 'INFO: Removed obsolete statuses: completed, in_progress';
END $$;
