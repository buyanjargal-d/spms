# Guest Pickup Approvals - Migration Complete ✓

**Date**: 2025-10-30
**Database**: Supabase PostgreSQL (ypeushpkdsgekmlvcfwm)

---

## ✓ Completed Tasks

### 1. Database Schema Changes ✓

#### New Table: `guest_pickup_approvals`
- **8 columns** created with proper data types
- **5 indexes** for optimal query performance
- **2 foreign keys** ensuring referential integrity
- **1 check constraint** for status validation
- **1 trigger** for automatic timestamp updates
- **1 unique constraint** preventing duplicate approvals

#### Updated Table: `pickup_requests`
- Added new status constraint supporting `pending_parent_approval`
- All 7 valid statuses now enforced at database level

### 2. Migration Files Created ✓

**Location**: `/home/buyaka/Desktop/spms/backend/src/migrations/`

1. `001_add_guest_pickup_approvals.sql` - Creates guest approval table
2. `002_update_pickup_status_constraint.sql` - Updates status constraint
3. `README.md` - Complete migration documentation

---

## Database Schema Details

### guest_pickup_approvals Table

```sql
Column              Type                     Constraints
------------------  -----------------------  ---------------------------
id                  UUID                     PRIMARY KEY, AUTO-GENERATED
pickup_request_id   UUID                     NOT NULL, FK → pickup_requests
parent_id           UUID                     NOT NULL, FK → users
status              VARCHAR(20)              NOT NULL, DEFAULT 'pending'
notes               TEXT                     NULL
responded_at        TIMESTAMP WITH TZ        NULL
created_at          TIMESTAMP WITH TZ        NOT NULL, DEFAULT NOW()
updated_at          TIMESTAMP WITH TZ        NOT NULL, DEFAULT NOW()
```

**Status Values**: `pending` | `approved` | `rejected`

**Indexes**:
- `idx_guest_approvals_pickup_request` - Lookup by pickup request
- `idx_guest_approvals_parent` - Lookup by parent and status
- `idx_guest_approvals_status` - Partial index for pending approvals
- `unique_parent_pickup_approval` - Prevents duplicate approvals

**Triggers**:
- `trigger_update_guest_approval_timestamp` - Auto-updates `updated_at`

### pickup_requests Updated Status Values

```
✓ pending                    - Initial status for standard pickups
✓ pending_parent_approval    - NEW: Waiting for parent approval
✓ approved                   - Approved by teacher
✓ rejected                   - Rejected by teacher/parent
✓ completed                  - Pickup completed by guard
✓ cancelled                  - Cancelled by requester
✓ in_progress               - Guard processing pickup
```

---

## Next Steps Required

### 2. Backend API Implementation

You already have the models created. Now you need to create **controllers and routes**:

#### Required Endpoints:

**Guest Approval Endpoints** (controllers/guestApproval.controller.ts):
```typescript
POST   /api/v1/guest-approvals/:id/approve    // Parent approves
POST   /api/v1/guest-approvals/:id/reject     // Parent rejects
GET    /api/v1/guest-approvals/pending        // Get pending for logged-in parent
GET    /api/v1/pickup/:id/approvals           // Get all approvals for pickup
```

#### Files to Create/Update:
- `backend/src/controllers/guestApproval.controller.ts` - NEW
- `backend/src/routes/guestApproval.routes.ts` - NEW
- `backend/src/middleware/auth.middleware.ts` - Update role checks
- `backend/src/app.ts` - Register new routes

### 3. Frontend Integration

#### Parent Dashboard:
- Show pending guest approval requests
- Add approve/reject buttons
- Display guest information (name, photo, ID)

#### Guardian (Requester) Dashboard:
- Show approval status for guest pickups
- Display which parents have approved/rejected

#### Teacher Dashboard:
- Guest pickups appear after parent approval
- Show guest information in pickup details

### 4. Mobile App Updates

#### Already Completed ✓:
- Guest pickup form with validation
- Photo upload for guest
- Request type selection (standard/guest)

#### Still Needed:
- Parent approval screen for guests
- Push notification handling
- Approval status display

### 5. Notification System

**Events requiring notifications**:

1. **Guest Pickup Created** → Notify all authorized parents
   ```
   Title: "Guest Pickup Approval Needed"
   Body: "Guardian requested guest pickup for [Student Name]"
   ```

2. **Parent Approves** → Notify teacher & guardian
   ```
   Title: "Guest Pickup Approved"
   Body: "[Parent Name] approved the guest pickup"
   ```

3. **Parent Rejects** → Notify guardian
   ```
   Title: "Guest Pickup Rejected"
   Body: "[Parent Name] rejected the guest pickup"
   ```

4. **Teacher Approves** → Notify guardian & guard
   ```
   Title: "Pickup Approved"
   Body: "Guest pickup has been approved by teacher"
   ```

---

## Testing Workflow

### Guest Pickup Flow:

```
1. Guardian creates guest pickup request
   ↓
   Status: PENDING_PARENT_APPROVAL
   ↓
2. All authorized parents receive notification
   ↓
3. At least one parent approves
   ↓
   Status: PENDING
   ↓
4. Teacher sees request and approves
   ↓
   Status: APPROVED
   ↓
5. Guard completes pickup
   ↓
   Status: COMPLETED
```

### Database Queries for Testing:

```sql
-- Check all pending approvals for a parent
SELECT * FROM guest_pickup_approvals
WHERE parent_id = 'parent-uuid' AND status = 'pending';

-- Check approval status for a pickup request
SELECT pr.id, pr.status, pr.guest_name,
       gpa.parent_id, gpa.status as approval_status, gpa.responded_at
FROM pickup_requests pr
LEFT JOIN guest_pickup_approvals gpa ON pr.id = gpa.pickup_request_id
WHERE pr.id = 'pickup-request-uuid';

-- Count approvals by status
SELECT status, COUNT(*)
FROM guest_pickup_approvals
GROUP BY status;
```

---

## Rollback Instructions

If you need to revert these changes:

```sql
-- Remove guest approvals table
DROP TABLE IF EXISTS guest_pickup_approvals CASCADE;

-- Restore original status constraint
ALTER TABLE pickup_requests
DROP CONSTRAINT IF EXISTS pickup_requests_status_check;

ALTER TABLE pickup_requests
ADD CONSTRAINT pickup_requests_status_check
CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled', 'in_progress'));
```

---

## Files Modified/Created

```
backend/src/migrations/
├── 001_add_guest_pickup_approvals.sql          ✓ Created
├── 002_update_pickup_status_constraint.sql     ✓ Created
└── README.md                                   ✓ Created

backend/src/models/
├── GuestPickupApproval.ts                      ✓ Exists
└── PickupRequest.ts                            ✓ Updated

backend/src/services/
├── guestApproval.service.ts                    ✓ Exists
└── pickup.service.ts                           ✓ Updated

Supabase Database:
├── guest_pickup_approvals table                ✓ Created
└── pickup_requests constraint                  ✓ Updated
```

---

## Summary

✓ **Database migrations successfully applied**
✓ **All tables and constraints created**
✓ **Indexes optimized for queries**
✓ **Foreign keys ensuring data integrity**
✓ **Documentation completed**

**Ready for**: Backend API implementation, Frontend integration, Notification system

---

## Support

For questions or issues:
1. Check migration logs in `backend/src/migrations/README.md`
2. Verify database state with verification queries above
3. Review backend models in `backend/src/models/`

**Last Updated**: 2025-10-30
