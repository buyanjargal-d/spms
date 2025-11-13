-- ============================================
-- SPMS Simple Seed Script - SHORT UUIDs
-- ============================================

BEGIN;

-- Clean up
TRUNCATE TABLE audit_logs, pickup_requests, student_guardians, students, classes, user_sessions, users CASCADE;

-- CLASSES (5)
INSERT INTO classes (id, class_name, grade_level, school_year, room_number, academic_year, is_active) VALUES
('c1111111-1111-4111-8111-111111111111', '1А анги', 1, '2024-2025', '101', '2024', true),
('c2222222-2222-4222-8222-222222222222', '2Б анги', 2, '2024-2025', '102', '2024', true),
('c3333333-3333-4333-8333-333333333333', '3В анги', 3, '2024-2025', '201', '2024', true),
('c4444444-4444-4444-8444-444444444444', '4Г анги', 4, '2024-2025', '202', '2024', true),
('c5555555-5555-4555-8555-555555555555', '5Д анги', 5, '2024-2025', '301', '2024', true);

-- USERS
-- Admin
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin001', 'Захирал Бат', 'admin', 'admin@school.mn', '99001001', true);

-- Teachers
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('1111111a-1111-4111-8111-111111111111', 'teacher_001', 'Багш Дорж', 'teacher', 'dorj@school.mn', '99002001', true),
('2222222a-2222-4222-8222-222222222222', 'teacher_002', 'Багш Сүрэн', 'teacher', 'suren@school.mn', '99002002', true);

-- Guard
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('00000001-0000-4000-8000-000000000001', 'guard_001', 'Хамгаалагч Бямба', 'guard', 'byamba@school.mn', '99003001', true);

-- Parents
INSERT INTO users (id, dan_id, full_name, role, email, phone, is_active) VALUES
('1111111b-1111-4111-8111-111111111111', 'parent_001', 'Эцэг Батсайхан', 'parent', 'batsaikhan@gmail.com', '99111001', true),
('2222222b-2222-4222-8222-222222222222', 'parent_002', 'Эх Цэцэгмаа', 'parent', 'tsetsegmaa@gmail.com', '99111002', true),
('3333333b-3333-4333-8333-333333333333', 'parent_003', 'Эцэг Ганбат', 'parent', 'ganbat@gmail.com', '99111003', true),
('4444444b-4444-4444-8444-444444444444', 'parent_004', 'Эх Наранцэцэг', 'parent', 'narantsetseg@gmail.com', '99111004', true);

-- Assign teachers to classes
UPDATE classes SET teacher_id = '1111111a-1111-4111-8111-111111111111' WHERE id = 'c2222222-2222-4222-8222-222222222222';
UPDATE classes SET teacher_id = '2222222a-2222-4222-8222-222222222222' WHERE id = 'c4444444-4444-4444-8444-444444444444';

-- STUDENTS (20)
INSERT INTO students (id, first_name, last_name, student_code, class_id, date_of_birth, grade_level, medical_conditions, allergies, is_active) VALUES
-- Class 1 (4 students)
('11111111-1111-4111-8111-111111111111', 'Болд', 'Эрдэнэ', 'STU2024001', 'c1111111-1111-4111-8111-111111111111', '2017-03-15', 1, NULL, NULL, true),
('11111112-1111-4111-8111-111111111111', 'Сүрэн', 'Алтан', 'STU2024002', 'c1111111-1111-4111-8111-111111111111', '2017-05-20', 1, NULL, NULL, true),
('11111113-1111-4111-8111-111111111111', 'Цэцэг', 'Ууганбаяр', 'STU2024003', 'c1111111-1111-4111-8111-111111111111', '2017-07-10', 1, NULL, NULL, true),
('11111114-1111-4111-8111-111111111111', 'Номин', 'Од', 'STU2024004', 'c1111111-1111-4111-8111-111111111111', '2017-09-25', 1, NULL, 'Асфальт', true),
-- Class 2 (4 students)
('22222221-2222-4222-8222-222222222222', 'Бат', 'Өлзий', 'STU2024005', 'c2222222-2222-4222-8222-222222222222', '2016-02-14', 2, NULL, NULL, true),
('22222222-2222-4222-8222-222222222222', 'Энх', 'Амгалан', 'STU2024006', 'c2222222-2222-4222-8222-222222222222', '2016-04-18', 2, NULL, NULL, true),
('22222223-2222-4222-8222-222222222222', 'Сарнай', 'Туяа', 'STU2024007', 'c2222222-2222-4222-8222-222222222222', '2016-06-22', 2, NULL, NULL, true),
('22222224-2222-4222-8222-222222222222', 'Мөнх', 'Эрдэнэ', 'STU2024008', 'c2222222-2222-4222-8222-222222222222', '2016-08-30', 2, NULL, NULL, true),
-- Class 3 (4 students)
('33333331-3333-4333-8333-333333333333', 'Ганбат', 'Чулуун', 'STU2024009', 'c3333333-3333-4333-8333-333333333333', '2015-01-10', 3, NULL, NULL, true),
('33333332-3333-4333-8333-333333333333', 'Өнөр', 'Билэг', 'STU2024010', 'c3333333-3333-4333-8333-333333333333', '2015-03-15', 3, NULL, NULL, true),
('33333333-3333-4333-8333-333333333333', 'Ууганбаяр', 'Долгор', 'STU2024011', 'c3333333-3333-4333-8333-333333333333', '2015-05-20', 3, NULL, NULL, true),
('33333334-3333-4333-8333-333333333333', 'Нарантуяа', 'Золбоо', 'STU2024012', 'c3333333-3333-4333-8333-333333333333', '2015-07-25', 3, NULL, NULL, true),
-- Class 4 (4 students)
('44444441-4444-4444-8444-444444444444', 'Баттулга', 'Эрдэнэбат', 'STU2024013', 'c4444444-4444-4444-8444-444444444444', '2014-02-12', 4, NULL, NULL, true),
('44444442-4444-4444-8444-444444444444', 'Тэмүүлэн', 'Алтантуяа', 'STU2024014', 'c4444444-4444-4444-8444-444444444444', '2014-04-16', 4, NULL, NULL, true),
('44444443-4444-4444-8444-444444444444', 'Одгэрэл', 'Сарангэрэл', 'STU2024015', 'c4444444-4444-4444-8444-444444444444', '2014-06-20', 4, NULL, NULL, true),
('44444444-4444-4444-8444-444444444444', 'Хулан', 'Эрдэнэцэцэг', 'STU2024016', 'c4444444-4444-4444-8444-444444444444', '2014-08-24', 4, 'Астма', NULL, true),
-- Class 5 (4 students)
('55555551-5555-4555-8555-555555555555', 'Төмөр', 'Очир', 'STU2024017', 'c5555555-5555-4555-8555-555555555555', '2013-01-08', 5, NULL, NULL, true),
('55555552-5555-4555-8555-555555555555', 'Эрдэнэ', 'Мөнх', 'STU2024018', 'c5555555-5555-4555-8555-555555555555', '2013-03-12', 5, NULL, NULL, true),
('55555553-5555-4555-8555-555555555555', 'Тэмүүлэн', 'Сайнбаяр', 'STU2024019', 'c5555555-5555-4555-8555-555555555555', '2013-05-16', 5, NULL, NULL, true),
('55555554-5555-4555-8555-555555555555', 'Амартүвшин', 'Баясгалан', 'STU2024020', 'c5555555-5555-4555-8555-555555555555', '2013-07-20', 5, NULL, NULL, true);

-- STUDENT-GUARDIAN RELATIONSHIPS
-- Parent 1: 3 children
INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary, is_authorized) VALUES
(gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '1111111b-1111-4111-8111-111111111111', 'father', true, true),
(gen_random_uuid(), '11111112-1111-4111-8111-111111111111', '1111111b-1111-4111-8111-111111111111', 'father', true, true),
(gen_random_uuid(), '11111113-1111-4111-8111-111111111111', '1111111b-1111-4111-8111-111111111111', 'father', true, true);

-- Parent 2: 2 children
INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary, is_authorized) VALUES
(gen_random_uuid(), '22222221-2222-4222-8222-222222222222', '2222222b-2222-4222-8222-222222222222', 'mother', true, true),
(gen_random_uuid(), '33333331-3333-4333-8333-333333333333', '2222222b-2222-4222-8222-222222222222', 'mother', true, true);

-- Parent 3: 2 children
INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary, is_authorized) VALUES
(gen_random_uuid(), '44444441-4444-4444-8444-444444444444', '3333333b-3333-4333-8333-333333333333', 'father', true, true),
(gen_random_uuid(), '55555551-5555-4555-8555-555555555555', '3333333b-3333-4333-8333-333333333333', 'father', true, true);

-- Parent 4: 13 children
INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary, is_authorized) VALUES
(gen_random_uuid(), '11111114-1111-4111-8111-111111111111', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '22222222-2222-4222-8222-222222222222', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '22222223-2222-4222-8222-222222222222', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '22222224-2222-4222-8222-222222222222', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '33333332-3333-4333-8333-333333333333', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '33333333-3333-4333-8333-333333333333', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '33333334-3333-4333-8333-333333333333', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '44444442-4444-4444-8444-444444444444', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '44444443-4444-4444-8444-444444444444', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '44444444-4444-4444-8444-444444444444', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '55555552-5555-4555-8555-555555555555', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '55555553-5555-4555-8555-555555555555', '4444444b-4444-4444-8444-444444444444', 'mother', true, true),
(gen_random_uuid(), '55555554-5555-4555-8555-555555555555', '4444444b-4444-4444-8444-444444444444', 'mother', true, true);

-- Secondary guardians
INSERT INTO student_guardians (id, student_id, guardian_id, relationship, is_primary, is_authorized) VALUES
(gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '2222222b-2222-4222-8222-222222222222', 'other', false, true),
(gen_random_uuid(), '22222221-2222-4222-8222-222222222222', '3333333b-3333-4333-8333-333333333333', 'other', false, true);

-- PICKUP REQUESTS
-- PENDING (2)
INSERT INTO pickup_requests (id, student_id, requester_id, request_type, requested_time, scheduled_pickup_time, status, request_location_lat, request_location_lng, notes) VALUES
(gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '1111111b-1111-4111-8111-111111111111', 'standard', NOW(), NOW() + INTERVAL '2 hours', 'pending', 47.9186, 106.9178, 'Өнөөдөр эрт явна'),
(gen_random_uuid(), '22222221-2222-4222-8222-222222222222', '2222222b-2222-4222-8222-222222222222', 'standard', NOW(), NOW() + INTERVAL '3 hours', 'pending', 47.9186, 106.9178, 'Эмнэлэгт үзүүлэх');

-- APPROVED (2)
INSERT INTO pickup_requests (id, student_id, requester_id, request_type, requested_time, scheduled_pickup_time, status, request_location_lat, request_location_lng, notes) VALUES
(gen_random_uuid(), '11111112-1111-4111-8111-111111111111', '1111111b-1111-4111-8111-111111111111', 'standard', NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '1 hour', 'approved', 47.9186, 106.9178, 'Зөвшөөрөгдсөн'),
(gen_random_uuid(), '33333331-3333-4333-8333-333333333333', '2222222b-2222-4222-8222-222222222222', 'standard', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '30 minutes', 'approved', 47.9186, 106.9178, 'Яаралтай');

-- COMPLETED (4)
INSERT INTO pickup_requests (id, student_id, requester_id, request_type, requested_time, scheduled_pickup_time, actual_pickup_time, status, pickup_person_id, request_location_lat, request_location_lng, notes) VALUES
(gen_random_uuid(), '44444441-4444-4444-8444-444444444444', '3333333b-3333-4333-8333-333333333333', 'standard', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 'completed', '00000001-0000-4000-8000-000000000001', 47.9186, 106.9178, 'Амжилттай'),
(gen_random_uuid(), '55555551-5555-4555-8555-555555555555', '3333333b-3333-4333-8333-333333333333', 'standard', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'completed', '00000001-0000-4000-8000-000000000001', 47.9186, 106.9178, 'Амжилттай'),
(gen_random_uuid(), '11111114-1111-4111-8111-111111111111', '4444444b-4444-4444-8444-444444444444', 'standard', NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day 30 minutes', 'completed', '00000001-0000-4000-8000-000000000001', 47.9186, 106.9178, 'Өчигдөр'),
(gen_random_uuid(), '22222223-2222-4222-8222-222222222222', '4444444b-4444-4444-8444-444444444444', 'standard', NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day 1 hour', 'completed', '00000001-0000-4000-8000-000000000001', 47.9186, 106.9178, 'Өчигдөр');

-- REJECTED (1)
INSERT INTO pickup_requests (id, student_id, requester_id, request_type, requested_time, scheduled_pickup_time, status, rejection_reason, request_location_lat, request_location_lng, notes) VALUES
(gen_random_uuid(), '11111113-1111-4111-8111-111111111111', '1111111b-1111-4111-8111-111111111111', 'standard', NOW() - INTERVAL '20 minutes', NOW() + INTERVAL '4 hours', 'rejected', 'Шалгалт өгөх', 47.9186, 106.9178, 'Татгалзсан');

-- CANCELLED (1)
INSERT INTO pickup_requests (id, student_id, requester_id, request_type, requested_time, scheduled_pickup_time, status, request_location_lat, request_location_lng, notes) VALUES
(gen_random_uuid(), '22222222-2222-4222-8222-222222222222', '4444444b-4444-4444-8444-444444444444', 'standard', NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '5 hours', 'cancelled', 47.9186, 106.9178, 'Цуцалсан');

COMMIT;

-- VERIFICATION
SELECT 'Users:' as info, role, COUNT(*) FROM users GROUP BY role
UNION ALL
SELECT 'Classes:', class_name, COUNT(*) FROM classes GROUP BY class_name
UNION ALL
SELECT 'Requests:', status::text, COUNT(*) FROM pickup_requests GROUP BY status;

SELECT '=== SUMMARY ===' as summary;
SELECT 'Parent 1 (parent_001): 3 kids' as parent_summary
UNION ALL SELECT 'Parent 2 (parent_002): 2 kids'
UNION ALL SELECT 'Parent 3 (parent_003): 2 kids'
UNION ALL SELECT 'Parent 4 (parent_004): 13 kids';
