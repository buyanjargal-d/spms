-- ============================================
-- SPMS Complete Database Seed Script
-- For Supabase SQL Editor
-- ============================================
-- This script will:
-- 1. Clear existing data
-- 2. Create 1 admin, 4 parents, 2 teachers, 1 guard
-- 3. Create 5 classes
-- 4. Create 20 students with proper relationships
-- 5. Create pickup requests with various statuses
-- 6. Set up parent-student relationships (including multiple students per parent)
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
-- Note: Columns are class_name (not name), teacher_id (not teacher_name), school_year (required)
INSERT INTO classes (id, class_name, grade_level, school_year, room_number, academic_year, teacher_id, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', '1А анги', 1, '2024-2025', '101', '2024', NULL, true),
('c1000000-0000-0000-0000-000000000002', '2Б анги', 2, '2024-2025', '102', '2024', NULL, true),
('c1000000-0000-0000-0000-000000000003', '3В анги', 3, '2024-2025', '201', '2024', NULL, true),
('c1000000-0000-0000-0000-000000000004', '4Г анги', 4, '2024-2025', '202', '2024', NULL, true),
('c1000000-0000-0000-0000-000000000005', '5Д анги', 5, '2024-2025', '301', '2024', NULL, true);

-- Update classes to assign teachers after teachers are created (see section 3.2)
-- Will update below after users are created

-- ============================================
-- 3. CREATE USERS
-- ============================================

-- 3.1 Admin User
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin001', 'Захирал Бат', 'admin', 'admin@school.mn', '99001001', true);

-- 3.2 Teachers (2 teachers)
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('t0000000-0000-0000-0000-000000000001', 'teacher_001', 'Багш Дорж', 'teacher', 'dorj@school.mn', '99002001', true),
('t0000000-0000-0000-0000-000000000002', 'teacher_002', 'Багш Сүрэн', 'teacher', 'suren@school.mn', '99002002', true);

-- 3.3 Guard (1 guard)
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('g0000000-0000-0000-0000-000000000001', 'guard_001', 'Хамгаалагч Бямба', 'guard', 'byamba@school.mn', '99003001', true);

-- 3.4 Parents (4 parents - some will have multiple children)
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('p0000000-0000-0000-0000-000000000001', 'parent_001', 'Эцэг Батсайхан', 'parent', 'batsaikhan@gmail.com', '99111001', true),
('p0000000-0000-0000-0000-000000000002', 'parent_002', 'Эх Цэцэгмаа', 'parent', 'tsetsegmaa@gmail.com', '99111002', true),
('p0000000-0000-0000-0000-000000000003', 'parent_003', 'Эцэг Ганбат', 'parent', 'ganbat@gmail.com', '99111003', true),
('p0000000-0000-0000-0000-000000000004', 'parent_004', 'Эх Наранцэцэг', 'parent', 'narantsetseg@gmail.com', '99111004', true);

-- 3.5 Update classes to assign teachers
UPDATE classes SET teacher_id = 't0000000-0000-0000-0000-000000000001' WHERE id = 'c1000000-0000-0000-0000-000000000002';
UPDATE classes SET teacher_id = 't0000000-0000-0000-0000-000000000002' WHERE id = 'c1000000-0000-0000-0000-000000000004';

-- ============================================
-- 4. CREATE STUDENTS (20 students)
-- ============================================

-- Class 1А (4 students)
-- Note: Columns are student_code (not student_id), no gender/blood_type columns, use medical_conditions/allergies instead
INSERT INTO students (id, first_name, last_name, student_code, class_id, date_of_birth, grade_level, medical_conditions, allergies, is_active) VALUES
('s0000000-0000-0000-0000-000000000001', 'Болд', 'Эрдэнэ', 'STU2024001', 'c1000000-0000-0000-0000-000000000001', '2017-03-15', 1, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000002', 'Сүрэн', 'Алтан', 'STU2024002', 'c1000000-0000-0000-0000-000000000001', '2017-05-20', 1, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000003', 'Цэцэг', 'Ууганбаяр', 'STU2024003', 'c1000000-0000-0000-0000-000000000001', '2017-07-10', 1, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000004', 'Номин', 'Од', 'STU2024004', 'c1000000-0000-0000-0000-000000000001', '2017-09-25', 1, NULL, 'Асфальт', true);

-- Class 2Б (4 students)
INSERT INTO students (id, first_name, last_name, student_code, class_id, date_of_birth, grade_level, medical_conditions, allergies, is_active) VALUES
('s0000000-0000-0000-0000-000000000005', 'Бат', 'Өлзий', 'STU2024005', 'c1000000-0000-0000-0000-000000000002', '2016-02-14', 2, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000006', 'Энх', 'Амгалан', 'STU2024006', 'c1000000-0000-0000-0000-000000000002', '2016-04-18', 2, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000007', 'Сарнай', 'Туяа', 'STU2024007', 'c1000000-0000-0000-0000-000000000002', '2016-06-22', 2, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000008', 'Мөнх', 'Эрдэнэ', 'STU2024008', 'c1000000-0000-0000-0000-000000000002', '2016-08-30', 2, NULL, NULL, true);

-- Class 3В (4 students)
INSERT INTO students (id, first_name, last_name, student_code, class_id, date_of_birth, grade_level, medical_conditions, allergies, is_active) VALUES
('s0000000-0000-0000-0000-000000000009', 'Ганбат', 'Чулуун', 'STU2024009', 'c1000000-0000-0000-0000-000000000003', '2015-01-10', 3, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000010', 'Өнөр', 'Билэг', 'STU2024010', 'c1000000-0000-0000-0000-000000000003', '2015-03-15', 3, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000011', 'Ууганбаяр', 'Долгор', 'STU2024011', 'c1000000-0000-0000-0000-000000000003', '2015-05-20', 3, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000012', 'Нарантуяа', 'Золбоо', 'STU2024012', 'c1000000-0000-0000-0000-000000000003', '2015-07-25', 3, NULL, NULL, true);

-- Class 4Г (4 students)
INSERT INTO students (id, first_name, last_name, student_code, class_id, date_of_birth, grade_level, medical_conditions, allergies, is_active) VALUES
('s0000000-0000-0000-0000-000000000013', 'Баттулга', 'Эрдэнэбат', 'STU2024013', 'c1000000-0000-0000-0000-000000000004', '2014-02-12', 4, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000014', 'Тэмүүлэн', 'Алтантуяа', 'STU2024014', 'c1000000-0000-0000-0000-000000000004', '2014-04-16', 4, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000015', 'Одгэрэл', 'Сарангэрэл', 'STU2024015', 'c1000000-0000-0000-0000-000000000004', '2014-06-20', 4, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000016', 'Хулан', 'Эрдэнэцэцэг', 'STU2024016', 'c1000000-0000-0000-0000-000000000004', '2014-08-24', 4, 'Астма', NULL, true);

-- Class 5Д (4 students)
INSERT INTO students (id, first_name, last_name, student_code, class_id, date_of_birth, grade_level, medical_conditions, allergies, is_active) VALUES
('s0000000-0000-0000-0000-000000000017', 'Төмөр', 'Очир', 'STU2024017', 'c1000000-0000-0000-0000-000000000005', '2013-01-08', 5, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000018', 'Эрдэнэ', 'Мөнх', 'STU2024018', 'c1000000-0000-0000-0000-000000000005', '2013-03-12', 5, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000019', 'Тэмүүлэн', 'Сайнбаяр', 'STU2024019', 'c1000000-0000-0000-0000-000000000005', '2013-05-16', 5, NULL, NULL, true),
('s0000000-0000-0000-0000-000000000020', 'Амартүвшин', 'Баясгалан', 'STU2024020', 'c1000000-0000-0000-0000-000000000005', '2013-07-20', 5, NULL, NULL, true);

-- ============================================
-- 5. CREATE STUDENT-GUARDIAN RELATIONSHIPS
-- ============================================
-- Parent 1 has 3 children (testing multiple children per parent)
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'father', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'father', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'father', true, true, 1);

-- Parent 2 has 2 children (testing multiple children per parent)
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000002', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000009', 'p0000000-0000-0000-0000-000000000002', 'mother', true, true, 1);

-- Parent 3 has 2 children (testing multiple children per parent)
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000013', 'p0000000-0000-0000-0000-000000000003', 'father', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000017', 'p0000000-0000-0000-0000-000000000003', 'father', true, true, 1);

-- Parent 4 has the remaining students (some with multiple guardians per student)
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000010', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000011', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000012', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000014', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000015', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000016', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000018', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000019', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000020', 'p0000000-0000-0000-0000-000000000004', 'mother', true, true, 1);

-- Add secondary guardians for some students (grandparents, etc.)
INSERT INTO student_guardians (id, student_id, guardian_id, relationship_type, is_primary, is_authorized_pickup, emergency_contact_order) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 'other', false, true, 2),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000003', 'other', false, true, 2);

-- ============================================
-- 6. CREATE PICKUP REQUESTS WITH VARIOUS STATUSES
-- ============================================

-- Today's requests
-- PENDING requests
-- Note: Columns are requested_time (not requested_pickup_time), request_location_lat/lng (not pickup_location_lat/lng)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_time, scheduled_pickup_time, status, request_location_lat, request_location_lng,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'standard',
 NOW(), NOW() + INTERVAL '2 hours', 'pending', 47.9186, 106.9178,
 'Өнөөдөр эрт явна', NOW()),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000002', 'standard',
 NOW(), NOW() + INTERVAL '3 hours', 'pending', 47.9186, 106.9178,
 'Эмнэлэгт үзүүлэхээр явна', NOW());

-- APPROVED requests (ready for pickup)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_pickup_time, status, approved_at, approved_by,
    pickup_location_lat, pickup_location_lng,
    qr_code_token, qr_code_expires_at,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'normal',
 NOW() + INTERVAL '1 hour', 'approved', NOW(), 't0000000-0000-0000-0000-000000000001',
 47.9186, 106.9178,
 encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '2 hours',
 'Багшаар зөвшөөрөгдсөн', NOW() - INTERVAL '10 minutes'),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000009', 'p0000000-0000-0000-0000-000000000002', 'emergency',
 NOW() + INTERVAL '30 minutes', 'approved', NOW(), 't0000000-0000-0000-0000-000000000001',
 47.9186, 106.9178,
 encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '1 hour',
 'Яаралтай тохиолдол', NOW() - INTERVAL '5 minutes');

-- COMPLETED requests (picked up today)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_pickup_time, status, approved_at, approved_by,
    completed_at, pickup_person_id, actual_pickup_time,
    pickup_location_lat, pickup_location_lng,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000013', 'p0000000-0000-0000-0000-000000000003', 'normal',
 NOW() - INTERVAL '1 hour', 'completed', NOW() - INTERVAL '2 hours', 't0000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '30 minutes', 'g0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 minutes',
 47.9186, 106.9178,
 'Амжилттай авсан', NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000017', 'p0000000-0000-0000-0000-000000000003', 'normal',
 NOW() - INTERVAL '2 hours', 'completed', NOW() - INTERVAL '3 hours', 't0000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '1 hour', 'g0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hour',
 47.9186, 106.9178,
 'Амжилттай авсан', NOW() - INTERVAL '4 hours');

-- REJECTED requests
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_pickup_time, status, rejected_at, rejection_reason,
    pickup_location_lat, pickup_location_lng,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'normal',
 NOW() + INTERVAL '4 hours', 'rejected', NOW(), 'Өнөөдөр шалгалт өгөх тул авах боломжгүй',
 47.9186, 106.9178,
 'Шалгалт өгөх', NOW() - INTERVAL '20 minutes');

-- CANCELLED requests
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_pickup_time, status, cancelled_at, cancellation_reason,
    pickup_location_lat, pickup_location_lng,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000004', 'normal',
 NOW() + INTERVAL '5 hours', 'cancelled', NOW(), 'Эцэг эх өөрөө ирж авна гэсэн',
 47.9186, 106.9178,
 'Эцэг эх өөрөө ирнэ', NOW() - INTERVAL '15 minutes');

-- Yesterday's COMPLETED requests (for history testing)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_pickup_time, status, approved_at, approved_by,
    completed_at, pickup_person_id, actual_pickup_time,
    pickup_location_lat, pickup_location_lng,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000004', 'normal',
 NOW() - INTERVAL '1 day', 'completed', NOW() - INTERVAL '1 day 2 hours', 't0000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '1 day 30 minutes', 'g0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day 30 minutes',
 47.9186, 106.9178,
 'Өчигдөр авсан', NOW() - INTERVAL '1 day 3 hours'),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000004', 'normal',
 NOW() - INTERVAL '1 day', 'completed', NOW() - INTERVAL '1 day 2 hours', 't0000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '1 day 1 hour', 'g0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day 1 hour',
 47.9186, 106.9178,
 'Өчигдөр авсан', NOW() - INTERVAL '1 day 3 hours');

-- Last week's requests (for historical data)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_pickup_time, status, approved_at, approved_by,
    completed_at, pickup_person_id, actual_pickup_time,
    pickup_location_lat, pickup_location_lng,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000010', 'p0000000-0000-0000-0000-000000000004', 'normal',
 NOW() - INTERVAL '7 days', 'completed', NOW() - INTERVAL '7 days 2 hours', 't0000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '7 days 1 hour', 'g0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days 1 hour',
 47.9186, 106.9178,
 'Долоо хоногийн өмнө авсан', NOW() - INTERVAL '7 days 3 hours'),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000011', 'p0000000-0000-0000-0000-000000000004', 'normal',
 NOW() - INTERVAL '6 days', 'completed', NOW() - INTERVAL '6 days 2 hours', 't0000000-0000-0000-0000-000000000002',
 NOW() - INTERVAL '6 days 1 hour', 'g0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 days 1 hour',
 47.9186, 106.9178,
 'Долоо хоногийн өмнө авсан', NOW() - INTERVAL '6 days 3 hours');

-- Multiple requests for the same student (testing history)
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_pickup_time, status, approved_at, approved_by,
    completed_at, pickup_person_id, actual_pickup_time,
    pickup_location_lat, pickup_location_lng,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'normal',
 NOW() - INTERVAL '2 days', 'completed', NOW() - INTERVAL '2 days 2 hours', 't0000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '2 days 1 hour', 'g0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days 1 hour',
 47.9186, 106.9178,
 'Өмнөх хүсэлт', NOW() - INTERVAL '2 days 3 hours'),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'normal',
 NOW() - INTERVAL '3 days', 'completed', NOW() - INTERVAL '3 days 2 hours', 't0000000-0000-0000-0000-000000000001',
 NOW() - INTERVAL '3 days 1 hour', 'g0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days 1 hour',
 47.9186, 106.9178,
 'Өмнөх хүсэлт', NOW() - INTERVAL '3 days 3 hours');

-- Future scheduled requests
INSERT INTO pickup_requests (
    id, student_id, requester_id, request_type,
    requested_pickup_time, status, approved_at, approved_by,
    pickup_location_lat, pickup_location_lng,
    qr_code_token, qr_code_expires_at,
    notes, created_at
) VALUES
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000014', 'p0000000-0000-0000-0000-000000000004', 'normal',
 NOW() + INTERVAL '1 day', 'approved', NOW(), 't0000000-0000-0000-0000-000000000002',
 47.9186, 106.9178,
 encode(gen_random_bytes(32), 'hex'), NOW() + INTERVAL '1 day 2 hours',
 'Маргааш авах', NOW()),
(gen_random_uuid(), 's0000000-0000-0000-0000-000000000015', 'p0000000-0000-0000-0000-000000000004', 'normal',
 NOW() + INTERVAL '2 days', 'pending', NULL, NULL,
 47.9186, 106.9178,
 NULL, NULL,
 'Нөгөөдөр авах', NOW());

COMMIT;

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was created correctly

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;

-- Count students per class
SELECT c.name, COUNT(s.id) as student_count
FROM classes c
LEFT JOIN students s ON s.class_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Count guardians per student
SELECT
    CONCAT(s.first_name, ' ', s.last_name) as student_name,
    COUNT(sg.guardian_id) as guardian_count
FROM students s
LEFT JOIN student_guardians sg ON sg.student_id = s.id
GROUP BY s.id, s.first_name, s.last_name
ORDER BY guardian_count DESC, student_name;

-- Count students per parent
SELECT
    u.full_name as parent_name,
    COUNT(DISTINCT sg.student_id) as student_count
FROM users u
LEFT JOIN student_guardians sg ON sg.guardian_id = u.id
WHERE u.role = 'parent'
GROUP BY u.id, u.full_name
ORDER BY student_count DESC, parent_name;

-- Count pickup requests by status
SELECT status, COUNT(*) as count
FROM pickup_requests
GROUP BY status
ORDER BY status;

-- Show today's pickup requests
SELECT
    CONCAT(s.first_name, ' ', s.last_name) as student_name,
    u.full_name as requester_name,
    pr.request_type,
    pr.requested_pickup_time,
    pr.status,
    pr.notes
FROM pickup_requests pr
JOIN students s ON s.id = pr.student_id
JOIN users u ON u.id = pr.requester_id
WHERE DATE(pr.created_at) = CURRENT_DATE
ORDER BY pr.requested_pickup_time;

-- ============================================
-- DATA SUMMARY
-- ============================================
-- Users: 1 admin, 2 teachers, 1 guard, 4 parents (Total: 8)
-- Classes: 5 classes (grades 1-5)
-- Students: 20 students (4 per class)
-- Relationships:
--   - Parent 1: 3 children (testing multiple children)
--   - Parent 2: 2 children
--   - Parent 3: 2 children
--   - Parent 4: 13 children (covering remaining students)
--   - Some students have 2 guardians
-- Pickup Requests: ~15 requests with various statuses:
--   - 2 PENDING (today)
--   - 2 APPROVED (today, with QR codes)
--   - 4 COMPLETED (various dates)
--   - 1 REJECTED (today)
--   - 1 CANCELLED (today)
--   - 2 SCHEDULED (future dates)
--   - Historical data for testing
-- ============================================
