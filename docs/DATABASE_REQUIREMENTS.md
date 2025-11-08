# SPMS Database Requirements & Analysis

## Executive Summary

This document provides a comprehensive analysis of the SPMS database schema, identifies issues, and defines requirements for a complete implementation.

**Analysis Date:** 2025-11-08
**Database:** Supabase PostgreSQL
**Current Status:** Partially implemented with schema issues

---

## 1. Current Database State

### 1.1 Existing Tables

| Table Name | Row Count | Status | Issues |
|------------|-----------|--------|--------|
| users | 7 | ⚠️ Issues | Duplicate columns, Supabase auth conflicts |
| students | 3 | ✅ OK | Needs more test data |
| classes | 2 | ✅ OK | Needs more test data |
| pickup_requests | 1 | ⚠️ Issues | Missing enum types, needs test data |
| student_guardians | 3 | ✅ OK | Needs more test data |
| guest_pickup_approvals | 0 | ⚠️ Empty | No test data |
| notifications | 0 | ⚠️ Empty | No test data |
| audit_logs | 0 | ⚠️ Issues | Wrong enum types, no test data |
| pickup_approvals | ? | ⚠️ Unexpected | Not in TypeORM models |
| school_settings | ? | ⚠️ Unexpected | Not in TypeORM models |

### 1.2 Enum Types Status

| Enum Type | Status | Values | Issue |
|-----------|--------|--------|-------|
| audit_action | ✅ OK | CREATE, UPDATE, DELETE, LOGIN, LOGOUT, APPROVE, REJECT, COMPLETE, CANCEL | - |
| audit_entity | ✅ OK | User, Student, PickupRequest, GuestApproval, Notification | - |
| request_status (DB) | ❌ Missing | - | Using VARCHAR instead |
| request_type (DB) | ❌ Missing | - | Using VARCHAR instead |
| user_role (DB) | ❌ Missing | - | Using VARCHAR instead |

---

## 2. Critical Issues Identified

### Issue #1: Users Table Conflicts ⚠️ HIGH PRIORITY

**Problem:**
- Supabase creates a `auth.users` table automatically
- Application has custom `public.users` table
- Duplicate column definitions detected
- Potential confusion between authentication and application users

**Evidence:**
```sql
-- Found two users tables:
auth.users (Supabase managed)
public.users (Application managed)

-- public.users has duplicate columns:
- id (appears twice)
- email (appears twice)
- phone (appears twice)
- role (appears twice)
- created_at (appears twice)
- updated_at (appears twice)
```

**Impact:**
- Authentication confusion
- Data inconsistency
- Potential foreign key reference issues

**Recommended Solution:**
1. Use Supabase `auth.users` for authentication only
2. Keep `public.users` for application-specific data
3. Link via user_id foreign key
4. Clean up duplicate columns in `public.users`

### Issue #2: Missing Enum Types ⚠️ MEDIUM PRIORITY

**Problem:**
TypeORM models define enums, but database uses VARCHAR fields instead of native PostgreSQL ENUM types.

**Affected Fields:**
- `pickup_requests.status` - should be `request_status` enum
- `pickup_requests.request_type` - should be `request_type` enum
- `users.role` - should be `user_role` enum

**Impact:**
- No database-level validation
- Potential invalid data
- Poor query performance

**Solution:**
Create proper enum types and migrate columns.

### Issue #3: Missing Tables

**Problem:**
Models exist in TypeORM but actual tables may have different structures.

**Extra Tables Not in Models:**
- `pickup_approvals` - Similar to `guest_pickup_approvals` but broader
- `school_settings` - Configuration storage

**Solution:**
Either create TypeORM models for these tables or remove if not needed.

### Issue #4: No Test Data ⚠️ HIGH PRIORITY

**Problem:**
Most tables have zero or minimal data, making testing impossible.

**Tables Needing Data:**
- guest_pickup_approvals (0 rows)
- notifications (0 rows)
- audit_logs (0 rows)
- pickup_approvals (unknown)
- school_settings (unknown)

**Additional Data Needed:**
- More users (at least 20: parents, teachers, guards, admin)
- More students (at least 30 across different grades)
- More classes (at least 6 for different grades)
- More pickup requests (at least 20 in various statuses)
- Complete guardian relationships
- Notification history
- Audit log entries

---

## 3. Complete Schema Requirements

### 3.1 Users Table (Corrected)

**Purpose:** Store application-specific user data (linked to Supabase auth.users)

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to Supabase auth
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- DAN Integration
  dan_id VARCHAR(50) UNIQUE NOT NULL,

  -- User Information
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  profile_photo_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent', 'guard');
```

**Required Indexes:**
- `idx_users_dan_id` on (dan_id)
- `idx_users_auth_user_id` on (auth_user_id)
- `idx_users_role` on (role)
- `idx_users_active` on (is_active) WHERE is_active = true

### 3.2 Students Table

**Status:** ✅ Structure OK, needs more data

```sql
-- Current structure is correct
-- Needs: updated_at trigger, better indexes
```

**Required Indexes:**
- `idx_students_code` on (student_code) - Already unique
- `idx_students_class` on (class_id)
- `idx_students_grade` on (grade_level)
- `idx_students_active` on (is_active) WHERE is_active = true
- `idx_students_name` on (first_name, last_name)

### 3.3 Classes Table

**Status:** ✅ Structure OK, needs updated_at

```sql
ALTER TABLE classes
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### 3.4 Pickup Requests Table

**Status:** ⚠️ Needs enum types

```sql
-- Create enum types
CREATE TYPE request_type AS ENUM ('standard', 'advance', 'guest');
CREATE TYPE request_status AS ENUM (
  'pending',
  'pending_parent_approval',
  'approved',
  'rejected',
  'completed',
  'cancelled',
  'in_progress'
);

-- Migrate columns to use enums
ALTER TABLE pickup_requests
  ALTER COLUMN request_type TYPE request_type USING request_type::request_type,
  ALTER COLUMN status TYPE request_status USING status::request_status;
```

**Required Indexes:**
- `idx_pickup_requests_student` on (student_id)
- `idx_pickup_requests_requester` on (requester_id)
- `idx_pickup_requests_status` on (status)
- `idx_pickup_requests_type` on (request_type)
- `idx_pickup_requests_date` on (requested_time DESC)
- `idx_pickup_requests_active` on (status, requested_time) WHERE status IN ('pending', 'pending_parent_approval', 'approved')

### 3.5 Student Guardians Table

**Status:** ✅ Structure OK

**Required Indexes:**
- `idx_student_guardians_student` on (student_id)
- `idx_student_guardians_guardian` on (guardian_id)
- `idx_student_guardians_primary` on (student_id, is_primary) WHERE is_primary = true
- `idx_student_guardians_authorized` on (is_authorized) WHERE is_authorized = true

### 3.6 Guest Pickup Approvals Table

**Status:** ✅ Structure OK, needs data

**Note:** Uses VARCHAR for status instead of enum - consider creating `approval_status` enum

### 3.7 Notifications Table

**Status:** ⚠️ Needs notification_type enum

```sql
CREATE TYPE notification_type AS ENUM (
  'pickup_request_created',
  'pickup_request_approved',
  'pickup_request_rejected',
  'pickup_request_completed',
  'guest_approval_requested',
  'guest_approval_approved',
  'guest_approval_rejected',
  'student_arrived',
  'reminder',
  'system_alert'
);

ALTER TABLE notifications
  ALTER COLUMN notification_type TYPE notification_type
  USING notification_type::notification_type;
```

**Required Indexes:**
- `idx_notifications_user` on (user_id, created_at DESC)
- `idx_notifications_unread` on (user_id, is_read) WHERE is_read = false
- `idx_notifications_request` on (related_request_id)

### 3.8 Audit Logs Table

**Status:** ⚠️ Has wrong column types

**Issues:**
- `action` is VARCHAR(100) instead of enum
- `entity_type` is VARCHAR(50) instead of enum

```sql
-- Fix enum columns
ALTER TABLE audit_logs
  ALTER COLUMN action TYPE audit_action USING action::audit_action,
  ALTER COLUMN entity_type TYPE audit_entity USING entity_type::audit_entity;
```

### 3.9 School Settings Table (Optional)

**Purpose:** Store school configuration

```sql
CREATE TABLE IF NOT EXISTS school_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pre-populate with defaults
INSERT INTO school_settings (setting_key, setting_value, description) VALUES
  ('school_name', 'Sample School', 'Name of the school'),
  ('school_latitude', '47.9186', 'School location latitude'),
  ('school_longitude', '106.9178', 'School location longitude'),
  ('school_radius_meters', '150', 'Allowed pickup radius in meters'),
  ('pickup_start_time', '15:00', 'Daily pickup start time'),
  ('pickup_end_time', '18:00', 'Daily pickup end time'),
  ('require_gps_verification', 'true', 'Whether to require GPS verification'),
  ('require_parent_approval_for_guest', 'true', 'Whether guest pickups need parent approval'),
  ('max_advance_request_days', '7', 'Maximum days in advance for pickup requests')
ON CONFLICT (setting_key) DO NOTHING;
```

---

## 4. Test Data Requirements

### 4.1 Users (Target: 25 users)

**Distribution:**
- 1 Admin
- 5 Teachers (one per class)
- 15 Parents (guardians for students)
- 4 Guards (security personnel)

**Sample Data Structure:**
```json
{
  "admin": {
    "dan_id": "AA00000001",
    "full_name": "Б. Админ",
    "role": "admin",
    "email": "admin@school.mn",
    "phone": "99000001"
  }
}
```

### 4.2 Students (Target: 30 students)

**Distribution:**
- Grade 1: 10 students
- Grade 2: 10 students
- Grade 3: 10 students

**Requirements:**
- Each student should have 1-3 guardians
- Mix of active and inactive students
- Various enrollment dates

### 4.3 Classes (Target: 6 classes)

**Distribution:**
- 2 classes for Grade 1 (1A, 1B)
- 2 classes for Grade 2 (2A, 2B)
- 2 classes for Grade 3 (3A, 3B)

**Requirements:**
- Each class assigned to a teacher
- 10-15 students per class
- School years: 2024-2025

### 4.4 Pickup Requests (Target: 30 requests)

**Distribution by Type:**
- 15 Standard pickups
- 8 Advance pickups
- 7 Guest pickups

**Distribution by Status:**
- 5 Pending (awaiting teacher approval)
- 3 Pending Parent Approval (guest pickups)
- 10 Approved
- 3 Rejected
- 7 Completed
- 2 Cancelled

**Requirements:**
- Various dates (past week to next week)
- Different times
- Mix with/without GPS coordinates
- Some with notes and special instructions

### 4.5 Guardian Relationships (Target: 45 relationships)

**Requirements:**
- Each student has 1-3 guardians
- At least 1 primary guardian per student
- All relationships are authorized
- Common relationships: Mother, Father, Grandmother, Grandfather, Aunt, Uncle

### 4.6 Guest Pickup Approvals (Target: 15 approvals)

**Requirements:**
- For each guest pickup request (7), create 1-3 approval records
- Mix of pending, approved, rejected statuses
- Include approval notes

### 4.7 Notifications (Target: 50 notifications)

**Distribution by Type:**
- 15 Pickup request created
- 10 Pickup request approved
- 5 Pickup request rejected
- 10 Pickup completed
- 5 Guest approval requested
- 5 System alerts

**Requirements:**
- Mix of read and unread
- Various timestamps
- Linked to actual pickup requests

### 4.8 Audit Logs (Target: 100 entries)

**Distribution by Action:**
- 25 CREATE (users, students, requests)
- 30 UPDATE (status changes, profile updates)
- 5 DELETE (cancelled requests)
- 15 LOGIN
- 10 APPROVE
- 5 REJECT
- 10 COMPLETE

**Requirements:**
- Cover all entity types
- Include IP addresses and user agents
- Some with old/new values for tracking changes
- Mix of successful and error entries

---

## 5. Database Migrations Required

### Migration 1: Fix Users Table
```sql
-- Remove duplicate columns
-- Add auth_user_id
-- Create user_role enum
-- Update constraints
```

### Migration 2: Add Enum Types
```sql
-- Create request_type enum
-- Create request_status enum
-- Create notification_type enum
-- Create approval_status enum
-- Migrate existing VARCHAR columns to enums
```

### Migration 3: Fix Audit Logs
```sql
-- Convert action to enum type
-- Convert entity_type to enum type
```

### Migration 4: Add Missing Indexes
```sql
-- Add all performance indexes listed in section 3
```

### Migration 5: Add Updated At Triggers
```sql
-- Add updated_at triggers for all tables that need them
```

---

## 6. Implementation Priority

### Phase 1: Critical Fixes (HIGH PRIORITY)
1. ✅ Fix users table structure
2. ✅ Add enum types for type safety
3. ✅ Fix audit_logs column types
4. ✅ Add all required indexes

### Phase 2: Data Population (HIGH PRIORITY)
1. ✅ Create 25 users (admin, teachers, parents, guards)
2. ✅ Create 30 students across 6 classes
3. ✅ Create 45 guardian relationships
4. ✅ Create 30 pickup requests with various statuses
5. ✅ Create 15 guest pickup approvals
6. ✅ Create 50 notifications
7. ✅ Create 100 audit log entries

### Phase 3: Validation & Testing (MEDIUM PRIORITY)
1. ✅ Verify all foreign key constraints
2. ✅ Test all CRUD operations
3. ✅ Verify TypeORM models match database
4. ✅ Test pickup request workflows
5. ✅ Test notification delivery
6. ✅ Verify audit logging works

### Phase 4: Optimization (LOW PRIORITY)
1. ⏳ Analyze query performance
2. ⏳ Add additional indexes if needed
3. ⏳ Set up database backups
4. ⏳ Configure replication (if needed)

---

## 7. Success Criteria

The database will be considered complete and ready when:

- [ ] All enum types are properly defined
- [ ] Users table conflicts resolved
- [ ] All tables have proper indexes
- [ ] All tables have updated_at triggers
- [ ] At least 25 users exist
- [ ] At least 30 students exist
- [ ] At least 30 pickup requests exist in various states
- [ ] At least 50 notifications exist
- [ ] At least 100 audit log entries exist
- [ ] All foreign key relationships are valid
- [ ] TypeORM models match database schema exactly
- [ ] All pickup request workflows can be tested end-to-end
- [ ] Guest pickup approval workflow can be tested
- [ ] Notification system can be tested

---

## 8. Next Steps

1. Review this requirements document
2. Execute database migrations to fix schema issues
3. Create comprehensive test data generation script
4. Populate database with test data
5. Verify all application features work with test data
6. Document any additional findings

---

## Appendix A: TypeORM Model vs Database Comparison

| Model | Database Table | Status | Notes |
|-------|---------------|--------|-------|
| User | users | ⚠️ Mismatch | Duplicate columns, missing auth_user_id |
| Student | students | ✅ Match | OK |
| Class | classes | ⚠️ Minor | Missing updated_at |
| StudentGuardian | student_guardians | ✅ Match | OK |
| PickupRequest | pickup_requests | ⚠️ Mismatch | Using VARCHAR instead of enums |
| GuestPickupApproval | guest_pickup_approvals | ✅ Match | OK |
| AuditLog | audit_logs | ⚠️ Mismatch | Using VARCHAR instead of enums |
| - | pickup_approvals | ❌ No Model | Extra table |
| - | school_settings | ❌ No Model | Extra table |
| - | notifications | ⚠️ Model Missing | Table exists but no TypeORM model found |

---

## Appendix B: Use Cases to Test

Once data is populated, verify these workflows work:

1. **UC-001:** Standard Pickup Request (Parent requests, Teacher approves, Guard completes)
2. **UC-002:** GPS Verified Pickup (Check location validation)
3. **UC-003:** Teacher Approval Flow (Pending → Approved/Rejected)
4. **UC-004:** Guest Pickup Request (Parent approves → Teacher approves → Complete)
5. **UC-005:** Manual Pickup Registration (Walk-in guardian)
6. **UC-006:** Advance Pickup Request (Schedule for future date)
7. **UC-007:** Request Cancellation (Parent cancels request)
8. **UC-008:** Multiple Guardians (Student has 2-3 guardians)
9. **UC-009:** Notification Delivery (All notification types)
10. **UC-010:** Audit Trail (Track all changes)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-08
**Status:** Ready for Implementation
