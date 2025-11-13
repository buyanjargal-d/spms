-- ============================================
-- SPMS Complete Database Seed Script (FIXED)
-- For Supabase SQL Editor
-- ============================================
-- FIXED ISSUES:
-- - classes.name → classes.class_name
-- - students.student_id → students.student_code
-- - students: removed gender, blood_type columns
-- - pickup_requests: fixed column names (requested_time, request_location_*)
-- - pickup_requests: request_type 'normal' → 'standard'
-- ============================================

BEGIN;

-- ============================================
-- 1. CLEAN UP EXISTING DATA
-- ============================================
TRUNCATE TABLE
    audit_logs,
    pickup_requests,
    student_guardians,
    students,
    classes,
    user_sessions,
    users
CASCADE;

-- ============================================
-- 2. CREATE CLASSES (5 classes)
-- ============================================
INSERT INTO classes (id, class_name, grade_level, school_year, room_number, academic_year, is_active) VALUES
('c1000001-0000-4000-8000-000000000001', '1А анги', 1, '2024-2025', '101', '2024', true),
('c1000001-0000-4000-8000-000000000002', '2Б анги', 2, '2024-2025', '102', '2024', true),
('c1000001-0000-4000-8000-000000000003', '3В анги', 3, '2024-2025', '201', '2024', true),
('c1000001-0000-4000-8000-000000000004', '4Г анги', 4, '2024-2025', '202', '2024', true),
('c1000001-0000-4000-8000-000000000005', '5Д анги', 5, '2024-2025', '301', '2024', true);

-- ============================================
-- 3. CREATE USERS
-- ============================================

-- 3.1 Admin User
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('a0000001-0000-4000-8000-000000000001', 'admin001', 'Захирал Бат', 'admin', 'admin@school.mn', '99001001', true);

-- 3.2 Teachers (2 teachers)
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('t0000001-0000-4000-8000-000000000001', 'teacher_001', 'Багш Дорж', 'teacher', 'dorj@school.mn', '99002001', true),
('t0000001-0000-4000-8000-000000000002', 'teacher_002', 'Багш Сүрэн', 'teacher', 'suren@school.mn', '99002002', true);

-- 3.3 Guard (1 guard)
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('g0000001-0000-4000-8000-000000000001', 'guard_001', 'Хамгаалагч Бямба', 'guard', 'byamba@school.mn', '99003001', true);

-- 3.4 Parents (4 parents - some will have multiple children)
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('p0000001-0000-4000-8000-000000000001', 'parent_001', 'Эцэг Батсайхан', 'parent', 'batsaikhan@gmail.com', '99111001', true),
('p0000001-0000-4000-8000-000000000002', 'parent_002', 'Эх Цэцэгмаа', 'parent', 'tsetsegmaa@gmail.com', '99111002', true),
('p0000001-0000-4000-8000-000000000003', 'parent_003', 'Эцэг Ганбат', 'parent', 'ganbat@gmail.com', '99111003', true),
('p0000001-0000-4000-8000-000000000004', 'parent_004', 'Эх Наранцэцэг', 'parent', 'narantsetseg@gmail.com', '99111004', true);

-- 3.5 Update classes to assign teachers
UPDATE classes SET teacher_id = 't0000001-0000-4000-8000-000000000001' WHERE id = 'c1000001-0000-4000-8000-000000000002';
UPDATE classes SET teacher_id = 't0000001-0000-4000-8000-000000000002' WHERE id = 'c1000001-0000-4000-8000-000000000004';

-- ============================================
-- 4. CREATE STUDENTS (20 students)
-- ============================================

-- All students in one batch (4 per class)
INSERT INTO students (id, first_name, last_name, student_code, class_id, date_of_birth, grade_level, medical_conditions, allergies, is_active) VALUES
-- Class 1А
('10000001-0000-4000-8000-000000000001', 'Болд', 'Эрдэнэ', 'STU2024001', 'c1000001-0000-4000-8000-000000000001', '2017-03-15', 1, NULL, NULL, true),
('10000001-0000-4000-8000-000000000002', 'Сүрэн', 'Алтан', 'STU2024002', 'c1000001-0000-4000-8000-000000000001', '2017-05-20', 1, NULL, NULL, true),
('10000001-0000-4000-8000-000000000003', 'Цэцэг', 'Ууганбаяр', 'STU2024003', 'c1000001-0000-4000-8000-000000000001', '2017-07-10', 1, NULL, NULL, true),
('10000001-0000-4000-8000-000000000004', 'Номин', 'Од', 'STU2024004', 'c1000001-0000-4000-8000-000000000001', '2017-09-25', 1, NULL, 'Асфальт', true),
-- Class 2Б
('10000001-0000-4000-8000-000000000005', 'Бат', 'Өлзий', 'STU2024005', 'c1000001-0000-4000-8000-000000000002', '2016-02-14', 2, NULL, NULL, true),
('10000001-0000-4000-8000-000000000006', 'Энх', 'Амгалан', 'STU2024006', 'c1000001-0000-4000-8000-000000000002', '2016-04-18', 2, NULL, NULL, true),
('10000001-0000-4000-8000-000000000007', 'Сарнай', 'Туяа', 'STU2024007', 'c1000001-0000-4000-8000-000000000002', '2016-06-22', 2, NULL, NULL, true),
('10000001-0000-4000-8000-000000000008', 'Мөнх', 'Эрдэнэ', 'STU2024008', 'c1000001-0000-4000-8000-000000000002', '2016-08-30', 2, NULL, NULL, true),
-- Class 3В
('10000001-0000-4000-8000-000000000009', 'Ганбат', 'Чулуун', 'STU2024009', 'c1000001-0000-4000-8000-000000000003', '2015-01-10', 3, NULL, NULL, true),
('10000001-0000-4000-8000-000000000010', 'Өнөр', 'Билэг', 'STU2024010', 'c1000001-0000-4000-8000-000000000003', '2015-03-15', 3, NULL, NULL, true),
('10000001-0000-4000-8000-000000000011', 'Ууганбаяр', 'Долгор', 'STU2024011', 'c1000001-0000-4000-8000-000000000003', '2015-05-20', 3, NULL, NULL, true),
('10000001-0000-4000-8000-000000000012', 'Нарантуяа', 'Золбоо', 'STU2024012', 'c1000001-0000-4000-8000-000000000003', '2015-07-25', 3, NULL, NULL, true),
-- Class 4Г
('10000001-0000-4000-8000-000000000013', 'Баттулга', 'Эрдэнэбат', 'STU2024013', 'c1000001-0000-4000-8000-000000000004', '2014-02-12', 4, NULL, NULL, true),
('10000001-0000-4000-8000-000000000014', 'Тэмүүлэн', 'Алтантуяа', 'STU2024014', 'c1000001-0000-4000-8000-000000000004', '2014-04-16', 4, NULL, NULL, true),
('10000001-0000-4000-8000-000000000015', 'Одгэрэл', 'Сарангэрэл', 'STU2024015', 'c1000001-0000-4000-8000-000000000004', '2014-06-20', 4, NULL, NULL, true),
('10000001-0000-4000-8000-000000000016', 'Хулан', 'Эрдэнэцэцэг', 'STU2024016', 'c1000001-0000-4000-8000-000000000004', '2014-08-24', 4, 'Астма', NULL, true),
-- Class 5Д
('10000001-0000-4000-8000-000000000017', 'Төмөр', 'Очир', 'STU2024017', 'c1000001-0000-4000-8000-000000000005', '2013-01-08', 5, NULL, NULL, true),
('10000001-0000-4000-8000-000000000018', 'Эрдэнэ', 'Мөнх', 'STU2024018', 'c1000001-0000-4000-8000-000000000005', '2013-03-12', 5, NULL, NULL, true),
('10000001-0000-4000-8000-000000000019', 'Тэмүүлэн', 'Сайнбаяр', 'STU2024019', 'c1000001-0000-4000-8000-000000000005', '2013-05-16', 5, NULL, NULL, true),
('10000001-0000-4000-8000-000000000020', 'Амартүвшин', 'Баясгалан', 'STU2024020', 'c1000001-0000-4000-8000-000000000005', '2013-07-20', 5, NULL, NULL, true);

-- ============================================
-- 5. CREATE STUDENT-GUARDIAN RELATIONSHIPS
-- ============================================
-- Parent 1 has 3 children (testing multiple children per parent)
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), '10000001-0000-4000-8000-000000000001', 'p0000001-0000-4000-8000-000000000001', 'father', true, true, 1),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000002', 'p0000001-0000-4000-8000-000000000001', 'father', true, true, 1),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000003', 'p0000001-0000-4000-8000-000000000001', 'father', true, true, 1);

-- Parent 2 has 2 children
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), '10000001-0000-4000-8000-000000000005', 'p0000001-0000-4000-8000-000000000002', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000009', 'p0000001-0000-4000-8000-000000000002', 'mother', true, true, 1);

-- Parent 3 has 2 children
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), '10000001-0000-0000-0000-000000000013', 'p0000001-0000-4000-8000-000000000003', 'father', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000017', 'p0000001-0000-4000-8000-000000000003', 'father', true, true, 1);

-- Parent 4 has the remaining 13 students
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), '10000001-0000-4000-8000-000000000004', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000006', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000007', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000008', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000010', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000011', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000012', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000014', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000015', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000016', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000018', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000019', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000020', 'p0000001-0000-4000-8000-000000000004', 'mother', true, true, 1);

-- Add secondary guardians for some students
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), '10000001-0000-4000-8000-000000000001', 'p0000001-0000-4000-8000-000000000002', 'other', false, true, 2),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000005', 'p0000001-0000-4000-8000-000000000003', 'other', false, true, 2);

-- ============================================
-- 6. CREATE PICKUP REQUESTS
-- ============================================

-- PENDING requests (2)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_time, scheduled_pickup_time, status,
    request_location_lat, request_location_lng, notes
) VALUES
(gen_random_uuid(), '10000001-0000-4000-8000-000000000001', 'p0000001-0000-4000-8000-000000000001', 'standard',
 NOW(), NOW() + INTERVAL '2 hours', 'pending', 47.9186, 106.9178, 'Өнөөдөр эрт явна'),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000005', 'p0000001-0000-4000-8000-000000000002', 'standard',
 NOW(), NOW() + INTERVAL '3 hours', 'pending', 47.9186, 106.9178, 'Эмнэлэгт үзүүлэхээр явна');

-- APPROVED requests (2)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_time, scheduled_pickup_time, status,
    request_location_lat, request_location_lng, notes
) VALUES
(gen_random_uuid(), '10000001-0000-4000-8000-000000000002', 'p0000001-0000-4000-8000-000000000001', 'standard',
 NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '1 hour', 'approved',
 47.9186, 106.9178, 'Багшаар зөвшөөрөгдсөн'),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000009', 'p0000001-0000-4000-8000-000000000002', 'standard',
 NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '30 minutes', 'approved',
 47.9186, 106.9178, 'Яаралтай авах');

-- COMPLETED requests (4)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_time, scheduled_pickup_time, actual_pickup_time, status,
    pickup_person_id, request_location_lat, request_location_lng, notes
) VALUES
-- Today's completed
(gen_random_uuid(), '10000001-0000-0000-0000-000000000013', 'p0000001-0000-4000-8000-000000000003', 'standard',
 NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 'completed',
 'g0000001-0000-4000-8000-000000000001', 47.9186, 106.9178, 'Амжилттай авсан'),
(gen_random_uuid(), '10000001-0000-0000-0000-000000000017', 'p0000001-0000-4000-8000-000000000003', 'standard',
 NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'completed',
 'g0000001-0000-4000-8000-000000000001', 47.9186, 106.9178, 'Амжилттай авсан'),
-- Yesterday's completed
(gen_random_uuid(), '10000001-0000-4000-8000-000000000004', 'p0000001-0000-4000-8000-000000000004', 'standard',
 NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day 30 minutes', 'completed',
 'g0000001-0000-4000-8000-000000000001', 47.9186, 106.9178, 'Өчигдөр авсан'),
(gen_random_uuid(), '10000001-0000-4000-8000-000000000007', 'p0000001-0000-4000-8000-000000000004', 'standard',
 NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day 1 hour', 'completed',
 'g0000001-0000-4000-8000-000000000001', 47.9186, 106.9178, 'Өчигдөр авсан');

-- REJECTED requests (1)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_time, scheduled_pickup_time, status, rejection_reason,
    request_location_lat, request_location_lng, notes
) VALUES
(gen_random_uuid(), '10000001-0000-4000-8000-000000000003', 'p0000001-0000-4000-8000-000000000001', 'standard',
 NOW() - INTERVAL '20 minutes', NOW() + INTERVAL '4 hours', 'rejected', 'Өнөөдөр шалгалт өгөх тул авах боломжгүй',
 47.9186, 106.9178, 'Шалгалт өгөх');

-- CANCELLED requests (1)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_time, scheduled_pickup_time, status,
    request_location_lat, request_location_lng, notes
) VALUES
(gen_random_uuid(), '10000001-0000-4000-8000-000000000006', 'p0000001-0000-4000-8000-000000000004', 'standard',
 NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '5 hours', 'cancelled',
 47.9186, 106.9178, 'Эцэг эх өөрөө ирнэ');

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;
SELECT c.class_name, COUNT(s.id) as student_count
FROM classes c
LEFT JOIN students s ON s.class_id = c.id
GROUP BY c.id, c.class_name
ORDER BY c.class_name;
SELECT u.full_name as parent_name, COUNT(DISTINCT sg.student_id) as student_count
FROM users u
LEFT JOIN student_guardians sg ON sg.guardian_id = u.id
WHERE u.role = 'parent'
GROUP BY u.id, u.full_name
ORDER BY student_count DESC;
SELECT status, COUNT(*) as count FROM pickup_requests GROUP BY status ORDER BY status;
