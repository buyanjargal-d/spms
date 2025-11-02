# Database Migrations

This directory contains SQL migration files for the SPMS (Student Pickup Management System) database.

## Applied Migrations

### 001_add_guest_pickup_approvals.sql
**Status**: ✓ Applied
**Date**: 2025-10-30

Creates the guest pickup approvals feature:
- Creates `guest_pickup_approvals` table for tracking parent approvals
- Adds indexes for performance optimization
- Adds trigger for automatic `updated_at` timestamp updates
- Includes documentation comments

**Table Structure**:
```sql
guest_pickup_approvals (
  id UUID PRIMARY KEY,
  pickup_request_id UUID REFERENCES pickup_requests(id),
  parent_id UUID REFERENCES users(id),
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
```

**Indexes**:
- `idx_guest_approvals_pickup_request` - For finding approvals by pickup request
- `idx_guest_approvals_parent` - For finding pending approvals for a parent
- `idx_guest_approvals_status` - Partial index for pending approvals

### 002_update_pickup_status_constraint.sql
**Status**: ✓ Applied
**Date**: 2025-10-30

Updates the pickup_requests table status constraint to include the new `pending_parent_approval` status.

**Valid Status Values**:
- `pending` - Initial status for standard pickups
- `pending_parent_approval` - Waiting for parent approval (guest pickups)
- `approved` - Approved by teacher
- `rejected` - Rejected by teacher or parent
- `completed` - Pickup completed by guard
- `cancelled` - Cancelled by requester
- `in_progress` - Guard is currently processing the pickup

## Running Migrations

### Using psql (Recommended)
```bash
PGPASSWORD=your_password psql \
  -h your-host.pooler.supabase.com \
  -p 6543 \
  -U postgres.your_project \
  -d postgres \
  -f src/migrations/001_add_guest_pickup_approvals.sql
```

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration file content
4. Execute the SQL

## Verification

Run this query to verify migrations:
```sql
-- Check guest_pickup_approvals table
SELECT * FROM information_schema.tables
WHERE table_name = 'guest_pickup_approvals';

-- Check indexes
SELECT * FROM pg_indexes
WHERE tablename = 'guest_pickup_approvals';

-- Check constraints
SELECT * FROM information_schema.check_constraints
WHERE constraint_name = 'pickup_requests_status_check';
```

## Rollback (If Needed)

To rollback the guest pickup approvals feature:
```sql
-- Drop the table (CASCADE will remove foreign key references)
DROP TABLE IF EXISTS guest_pickup_approvals CASCADE;

-- Restore original status constraint
ALTER TABLE pickup_requests DROP CONSTRAINT IF EXISTS pickup_requests_status_check;
ALTER TABLE pickup_requests ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled', 'in_progress'));
```

## Next Steps

After applying these migrations, you need to:

1. **Update Backend Models** - Ensure TypeScript models match database schema
2. **Create API Endpoints** - Implement guest approval endpoints
3. **Add Business Logic** - Implement approval workflow in services
4. **Update Frontend** - Add UI for guest pickup creation and approval
5. **Implement Notifications** - Send FCM notifications for approval events
6. **Add Tests** - Create integration tests for guest pickup flow

## Migration History

| ID | Name | Date | Status |
|----|------|------|--------|
| 001 | add_guest_pickup_approvals | 2025-10-30 | ✓ Applied |
| 002 | update_pickup_status_constraint | 2025-10-30 | ✓ Applied |
