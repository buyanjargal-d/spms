-- Migration: Add Guest Pickup Approvals Feature
-- Description: Creates guest_pickup_approvals table and adds pending_parent_approval status
-- Author: System
-- Date: 2025-10-30

-- ============================================
-- 1. Add new status to request_status enum
-- ============================================

-- Check if the status already exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'request_status'
        AND e.enumlabel = 'pending_parent_approval'
    ) THEN
        ALTER TYPE request_status ADD VALUE 'pending_parent_approval';
    END IF;
END $$;

-- ============================================
-- 2. Create guest_pickup_approvals table
-- ============================================

CREATE TABLE IF NOT EXISTS guest_pickup_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_request_id UUID NOT NULL REFERENCES pickup_requests(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT guest_approval_status_check CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT unique_parent_pickup_approval UNIQUE (pickup_request_id, parent_id)
);

-- ============================================
-- 3. Add indexes for performance
-- ============================================

-- Index for finding approvals by pickup request
CREATE INDEX IF NOT EXISTS idx_guest_approvals_pickup_request
ON guest_pickup_approvals(pickup_request_id);

-- Index for finding pending approvals for a specific parent
CREATE INDEX IF NOT EXISTS idx_guest_approvals_parent
ON guest_pickup_approvals(parent_id, status);

-- Index for finding approvals by status
CREATE INDEX IF NOT EXISTS idx_guest_approvals_status
ON guest_pickup_approvals(status)
WHERE status = 'pending';

-- ============================================
-- 4. Add trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_guest_approval_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_guest_approval_timestamp ON guest_pickup_approvals;

CREATE TRIGGER trigger_update_guest_approval_timestamp
    BEFORE UPDATE ON guest_pickup_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_guest_approval_timestamp();

-- ============================================
-- 5. Add comments for documentation
-- ============================================

COMMENT ON TABLE guest_pickup_approvals IS 'Stores parent approval records for guest pickup requests';
COMMENT ON COLUMN guest_pickup_approvals.pickup_request_id IS 'Reference to the pickup request requiring approval';
COMMENT ON COLUMN guest_pickup_approvals.parent_id IS 'Reference to the parent who needs to approve';
COMMENT ON COLUMN guest_pickup_approvals.status IS 'Approval status: pending, approved, or rejected';
COMMENT ON COLUMN guest_pickup_approvals.notes IS 'Optional notes from parent when approving/rejecting';
COMMENT ON COLUMN guest_pickup_approvals.responded_at IS 'Timestamp when parent approved or rejected';
