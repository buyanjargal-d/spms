# SPMS Database Seed Data Guide

## Quick Start

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `seed-supabase-complete.sql`
4. Paste into the SQL Editor
5. Click **Run** button

## What This Script Creates

### Users (8 total)

#### Admin (1)
- **DAN ID**: `admin001`
- **Name**: Захирал Бат
- **Email**: admin@school.mn
- **Phone**: 99001001

#### Teachers (2)
1. **DAN ID**: `teacher_001`
   - **Name**: Багш Дорж
   - **Email**: dorj@school.mn
   - **Phone**: 99002001

2. **DAN ID**: `teacher_002`
   - **Name**: Багш Сүрэн
   - **Email**: suren@school.mn
   - **Phone**: 99002002

#### Guard (1)
- **DAN ID**: `guard_001`
- **Name**: Хамгаалагч Бямба
- **Email**: byamba@school.mn
- **Phone**: 99003001

#### Parents (4)
1. **DAN ID**: `parent_001`
   - **Name**: Эцэг Батсайхан
   - **Children**: 3 students (STU2024001, STU2024002, STU2024003)
   - **Phone**: 99111001

2. **DAN ID**: `parent_002`
   - **Name**: Эх Цэцэгмаа
   - **Children**: 2 students (STU2024005, STU2024009)
   - **Phone**: 99111002

3. **DAN ID**: `parent_003`
   - **Name**: Эцэг Ганбат
   - **Children**: 2 students (STU2024013, STU2024017)
   - **Phone**: 99111003

4. **DAN ID**: `parent_004`
   - **Name**: Эх Наранцэцэг
   - **Children**: 13 students (remaining students)
   - **Phone**: 99111004

### Classes (5 total)

| Class | Grade | Teacher | Room | Students |
|-------|-------|---------|------|----------|
| 1А анги | 1 | Багш Болд | 101 | 4 |
| 2Б анги | 2 | Багш Дорж | 102 | 4 |
| 3В анги | 3 | Багш Алтан | 201 | 4 |
| 4Г анги | 4 | Багш Сүрэн | 202 | 4 |
| 5Д анги | 5 | Багш Нарантуяа | 301 | 4 |

### Students (20 total)

**Class 1А** (4 students):
- STU2024001: Болд Эрдэнэ (male, O+)
- STU2024002: Сүрэн Алтан (male, A+)
- STU2024003: Цэцэг Ууганбаяр (female, B+)
- STU2024004: Номин Од (female, AB+) - Has allergy note

**Class 2Б** (4 students):
- STU2024005: Бат Өлзий (male, O+)
- STU2024006: Энх Амгалан (male, A+)
- STU2024007: Сарнай Туяа (female, B+)
- STU2024008: Мөнх Эрдэнэ (male, O-)

**Class 3В** (4 students):
- STU2024009: Ганбат Чулуун (male, A+)
- STU2024010: Өнөр Билэг (male, B+)
- STU2024011: Ууганбаяр Долгор (female, O+)
- STU2024012: Нарантуяа Золбоо (female, AB+)

**Class 4Г** (4 students):
- STU2024013: Баттулга Эрдэнэбат (male, O+)
- STU2024014: Тэмүүлэн Алтантуяа (male, A+)
- STU2024015: Одгэрэл Сарангэрэл (female, B+)
- STU2024016: Хулан Эрдэнэцэцэг (female, O-) - Has asthma note

**Class 5Д** (4 students):
- STU2024017: Төмөр Очир (male, A+)
- STU2024018: Эрдэнэ Мөнх (male, B+)
- STU2024019: Тэмүүлэн Сайнбаяр (female, O+)
- STU2024020: Амартүвшин Баясгалан (female, AB+)

### Pickup Requests (~15 requests)

#### Today's Requests:

**PENDING** (2 requests):
- STU2024001 (Болд Эрдэнэ) - Requested by parent_001 - "Өнөөдөр эрт явна"
- STU2024005 (Бат Өлзий) - Requested by parent_002 - "Эмнэлэгт үзүүлэхээр явна"

**APPROVED** (2 requests with QR codes):
- STU2024002 (Сүрэн Алтан) - Approved by teacher_001 - Ready for pickup
- STU2024009 (Ганбат Чулуун) - EMERGENCY - Approved by teacher_001

**COMPLETED** (2 requests picked up today):
- STU2024013 (Баттулга Эрдэнэбат) - Picked up by guard_001
- STU2024017 (Төмөр Очир) - Picked up by guard_001

**REJECTED** (1 request):
- STU2024003 (Цэцэг Ууганбаяр) - "Өнөөдөр шалгалт өгөх тул авах боломжгүй"

**CANCELLED** (1 request):
- STU2024006 (Энх Амгалан) - "Эцэг эх өөрөө ирж авна гэсэн"

#### Historical Requests:

**Yesterday** (2 completed):
- STU2024004, STU2024007

**Last Week** (2 completed):
- STU2024010, STU2024011

**Older** (2 completed for history testing):
- STU2024001 (2-3 days ago) - Multiple requests for same student

**Future Scheduled** (2 requests):
- STU2024014 - Approved for tomorrow
- STU2024015 - Pending for 2 days from now

## Testing Scenarios

### 1. Multiple Children Per Parent
- **Parent 1** (parent_001): Has 3 children
- **Parent 2** (parent_002): Has 2 children
- **Parent 3** (parent_003): Has 2 children
- **Parent 4** (parent_004): Has 13 children

**Test**: Login as parent_001 and verify you see all 3 children

### 2. Multiple Guardians Per Student
- Some students have 2 guardians (primary + secondary)
- Example: STU2024001 has parent_001 (father) + parent_002 (other)

**Test**: Check student guardian list shows multiple contacts

### 3. Different Request Statuses
Test the workflow:
1. View **PENDING** requests (teacher dashboard)
2. Approve a pending request → generates QR code
3. View **APPROVED** requests (guard dashboard)
4. Scan QR and complete pickup
5. View **COMPLETED** requests (history)

### 4. Emergency Requests
- STU2024009 has an emergency request
- Should be highlighted differently in UI

**Test**: Check if emergency requests have special styling

### 5. Rejected/Cancelled Requests
- Test viewing reasons for rejection
- Test cancellation by parent

### 6. Historical Data
- Multiple requests for same student (STU2024001)
- Requests from different dates

**Test**: Student pickup history shows all past requests

### 7. Student Medical Notes
- STU2024004: Allergies
- STU2024016: Asthma

**Test**: Medical notes display in student profile

### 8. Future Scheduled Requests
- Test scheduling pickup for future dates
- Verify QR codes expire appropriately

## Login Credentials

All users can login using their DAN ID (no password in mock mode):

```javascript
// Admin
{ danId: "admin001", role: "admin" }

// Teachers
{ danId: "teacher_001", role: "teacher" }
{ danId: "teacher_002", role: "teacher" }

// Guard
{ danId: "guard_001", role: "guard" }

// Parents (try parent_001 for 3 children, parent_004 for many children)
{ danId: "parent_001", role: "parent" }
{ danId: "parent_002", role: "parent" }
{ danId: "parent_003", role: "parent" }
{ danId: "parent_004", role: "parent" }
```

## Verification Queries

After running the seed script, the output will show:

```sql
-- Users by role
admin: 1
guard: 1
parent: 4
teacher: 2

-- Students per class
1А анги: 4 students
2Б анги: 4 students
3В анги: 4 students
4Г анги: 4 students
5Д анги: 4 students

-- Parents with multiple children
Эцэг Батсайхан: 3 children
Эх Цэцэгмаа: 2 children
Эцэг Ганбат: 2 children
Эх Наранцэцэг: 13 children

-- Requests by status
approved: 4
cancelled: 1
completed: 6
pending: 3
rejected: 1
```

## Component Testing Checklist

- [ ] **Parent Dashboard**: Shows all children, can create pickup requests
- [ ] **Teacher Dashboard**: Can approve/reject pending requests
- [ ] **Guard Dashboard**: Can scan QR codes and complete pickups
- [ ] **Admin Dashboard**: Can view all data and statistics
- [ ] **Student List**: Shows all 20 students across 5 classes
- [ ] **Class Management**: 5 classes with 4 students each
- [ ] **Pickup History**: Shows completed requests by date
- [ ] **QR Code Generation**: Approved requests have QR codes
- [ ] **Emergency Requests**: Highlighted differently
- [ ] **Multiple Children**: Parent with 3+ children sees all
- [ ] **Medical Notes**: Display for students with health info
- [ ] **Request Filters**: Filter by status, date, student
- [ ] **Reports**: Generate pickup statistics

## Troubleshooting

**Issue**: Script fails with foreign key error
**Solution**: Make sure you run the entire script including `BEGIN;` and `COMMIT;`

**Issue**: No data appears after running
**Solution**: Check if tables were truncated successfully. Verify with count queries.

**Issue**: Login fails
**Solution**: Ensure `USE_MOCK_DAN=true` in backend .env file

**Issue**: Authorization errors
**Solution**: Check JWT_SECRET is set correctly and tokens haven't expired
