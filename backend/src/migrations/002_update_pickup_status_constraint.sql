-- Migration: Update Pickup Request Status Constraint
-- Description: Adds 'pending_parent_approval' to allowed status values
-- Author: System
-- Date: 2025-10-30

-- ============================================
-- 1. Drop existing status constraint if it exists
-- ============================================

ALTER TABLE pickup_requests
DROP CONSTRAINT IF EXISTS pickup_requests_status_check;

-- ============================================
-- 2. Add new constraint with all valid statuses
-- ============================================

ALTER TABLE pickup_requests
ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN (
    'pending',
    'pending_parent_approval',
    'approved',
    'rejected',
    'completed',
    'cancelled',
    'in_progress'
));

-- ============================================
-- 3. Add comment for documentation
-- ============================================

COMMENT ON COLUMN pickup_requests.status IS
'Request status: pending, pending_parent_approval, approved, rejected, completed, cancelled, in_progress';
