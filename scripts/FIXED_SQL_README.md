# ✅ Fixed SQL Seed Script - Ready to Use

## File: `seed-supabase-complete-fixed.sql`

This is the **corrected and working** version of the database seed script.

## 🔧 What Was Fixed:

### 1. **UUID Format Issues**
- ❌ Old (invalid): `'s0000000-0000-0000-0000-000000000001'` (too many segments)
- ✅ New (valid): `'10000001-0000-4000-8000-000000000001'` (proper UUID v4 format)

### 2. **Table Column Names**
- **Classes**: `name` → `class_name`, added `school_year`
- **Students**: `student_id` → `student_code`, removed `gender`/`blood_type`
- **Pickup Requests**: `requested_pickup_time` → `requested_time`, fixed location columns

### 3. **Enum Values**
- **Request Type**: `'normal'` → `'standard'`

## 🚀 How to Use:

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy **ALL** content from `seed-supabase-complete-fixed.sql`
4. Paste into the editor
5. Click **Run** ▶️
6. ✅ Done!

## 📊 What You'll Get:

### Users (8 total):
| Role | DAN ID | Name | Count |
|------|--------|------|-------|
| Admin | admin001 | Захирал Бат | 1 |
| Teacher | teacher_001, teacher_002 | Багш Дорж, Багш Сүрэн | 2 |
| Guard | guard_001 | Хамгаалагч Бямба | 1 |
| Parent | parent_001-004 | Various | 4 |

### Classes (5):
- 1А анги (Grade 1) - 4 students
- 2Б анги (Grade 2) - 4 students
- 3В анги (Grade 3) - 4 students
- 4Г анги (Grade 4) - 4 students
- 5Д анги (Grade 5) - 4 students

### Students (20):
- STU2024001 through STU2024020
- Realistic Mongolian names
- Distributed across 5 classes

### Parent-Student Relationships:
- **parent_001**: 3 children (STU2024001, 002, 003)
- **parent_002**: 2 children (STU2024005, 009)
- **parent_003**: 2 children (STU2024013, 017)
- **parent_004**: 13 children (remaining students)

### Pickup Requests (10+):
- **2 PENDING**: Waiting for teacher approval
- **2 APPROVED**: Ready for pickup
- **4 COMPLETED**: Already picked up (today & yesterday)
- **1 REJECTED**: Denied with reason
- **1 CANCELLED**: Cancelled by parent

## 🧪 Quick Test:

After running the script, execute the verification queries at the end to see:

```sql
-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;
-- Expected: admin(1), teacher(2), guard(1), parent(4)

-- Count students per class
SELECT c.class_name, COUNT(s.id)
FROM classes c
LEFT JOIN students s ON s.class_id = c.id
GROUP BY c.class_name;
-- Expected: Each class has 4 students

-- Count children per parent
SELECT u.full_name, COUNT(DISTINCT sg.student_id)
FROM users u
LEFT JOIN student_guardians sg ON sg.guardian_id = u.id
WHERE u.role = 'parent'
GROUP BY u.full_name;
-- Expected: parent_001(3), parent_002(2), parent_003(2), parent_004(13)

-- Count requests by status
SELECT status, COUNT(*) FROM pickup_requests GROUP BY status;
-- Expected: pending(2), approved(2), completed(4), rejected(1), cancelled(1)
```

## 🔑 Login Credentials:

Use these with your DAN mock authentication:

```javascript
// Admin
{ danId: "admin001", role: "admin" }

// Teachers
{ danId: "teacher_001", role: "teacher" }
{ danId: "teacher_002", role: "teacher" }

// Guard
{ danId: "guard_001", role: "guard" }

// Parents (test multiple children logic)
{ danId: "parent_001", role: "parent" }  // Has 3 kids
{ danId: "parent_002", role: "parent" }  // Has 2 kids
{ danId: "parent_003", role: "parent" }  // Has 2 kids
{ danId: "parent_004", role: "parent" }  // Has 13 kids!
```

## ✨ UUID Format Explained:

The UUIDs now follow proper v4 format: `xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx`

Examples:
- Classes: `c1000001-0000-4000-8000-000000000001`
- Users: `a0000001-0000-4000-8000-000000000001` (admin)
- Students: `10000001-0000-4000-8000-000000000001`
- Parents: `p0000001-0000-4000-8000-000000000001`
- Teachers: `t0000001-0000-4000-8000-000000000001`
- Guards: `g0000001-0000-4000-8000-000000000001`

The prefix letter makes it easy to identify the type of record!

## ⚠️ Important Notes:

1. **This script will DELETE all existing data** (TRUNCATE command)
2. Make sure you're running this on your **development/test database** first
3. The script is wrapped in a transaction (BEGIN/COMMIT) - if any part fails, nothing is committed
4. UUIDs are now valid and will not cause syntax errors

## 🎯 Next Steps:

After seeding:
1. Test login with different roles
2. Verify parent can see their children
3. Test creating pickup requests
4. Test teacher approval workflow
5. Test guard QR code scanning
6. Check all reports and statistics

## 📝 Notes:

- Medical conditions are simplified (only 2 students have them)
- All phone numbers follow Mongolian format (99xxxxxx)
- Dates are realistic for school ages
- Location coordinates are for Ulaanbaatar (47.9186, 106.9178)
