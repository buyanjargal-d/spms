-- SPMS Demo Data Seeding Script
-- Run this in Supabase SQL Editor or pgAdmin

-- Note: Password for all users is '123456'
-- Pre-hashed with bcrypt rounds=10

-- 1. Create Users
INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
VALUES
  ('admin001', 'Admin User', 'admin@spms.mn', '99001122', 'admin', '$2b$10$rKJ8e.B0YgV6eXfV9vQ4I.Y5nxZ0OyZ0G7JXb8PjKnX8YfQZXhTW2', true, NOW(), NOW()),
  ('teacher001', 'Teacher One', 'teacher1@spms.mn', '99112233', 'teacher', '$2b$10$rKJ8e.B0YgV6eXfV9vQ4I.Y5nxZ0OyZ0G7JXb8PjKnX8YfQZXhTW2', true, NOW(), NOW()),
  ('teacher002', 'Teacher Two', 'teacher2@spms.mn', '99223344', 'teacher', '$2b$10$rKJ8e.B0YgV6eXfV9vQ4I.Y5nxZ0OyZ0G7JXb8PjKnX8YfQZXhTW2', true, NOW(), NOW()),
  ('parent001', 'Parent One', 'parent1@gmail.com', '88111111', 'parent', '$2b$10$rKJ8e.B0YgV6eXfV9vQ4I.Y5nxZ0OyZ0G7JXb8PjKnX8YfQZXhTW2', true, NOW(), NOW()),
  ('parent002', 'Parent Two', 'parent2@gmail.com', '88222222', 'parent', '$2b$10$rKJ8e.B0YgV6eXfV9vQ4I.Y5nxZ0OyZ0G7JXb8PjKnX8YfQZXhTW2', true, NOW(), NOW()),
  ('guard001', 'Security Guard', 'guard@spms.mn', '99887766', 'guard', '$2b$10$rKJ8e.B0YgV6eXfV9vQ4I.Y5nxZ0OyZ0G7JXb8PjKnX8YfQZXhTW2', true, NOW(), NOW())
ON CONFLICT (dan_id) DO NOTHING;

-- 2. Create Classes
WITH teacher AS (SELECT id FROM users WHERE dan_id = 'teacher001')
INSERT INTO classes (class_name, grade_level, teacher_id, school_year, academic_year, room_number, capacity, is_active, created_at, updated_at)
SELECT '1-А', 1, id, '2024-2025', '2024-2025', '101', 30, true, NOW(), NOW()
FROM teacher
ON CONFLICT DO NOTHING;

WITH teacher AS (SELECT id FROM users WHERE dan_id = 'teacher002')
INSERT INTO classes (class_name, grade_level, teacher_id, school_year, academic_year, room_number, capacity, is_active, created_at, updated_at)
SELECT '2-Б', 2, id, '2024-2025', '2024-2025', '202', 30, true, NOW(), NOW()
FROM teacher
ON CONFLICT DO NOTHING;

-- 3. Create Students
WITH class AS (SELECT id FROM classes WHERE class_name = '1-А' LIMIT 1)
INSERT INTO students (student_id, dan_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_date, is_active, created_at, updated_at)
SELECT 'STU001', 'stu001', 'John', 'Doe', '2017-03-15', 'male', id, '2024-09-01', true, NOW(), NOW()
FROM class
ON CONFLICT (student_id) DO NOTHING;

WITH class AS (SELECT id FROM classes WHERE class_name = '1-А' LIMIT 1)
INSERT INTO students (student_id, dan_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_date, is_active, created_at, updated_at)
SELECT 'STU002', 'stu002', 'Jane', 'Smith', '2017-07-20', 'female', id, '2024-09-01', true, NOW(), NOW()
FROM class
ON CONFLICT (student_id) DO NOTHING;

WITH class AS (SELECT id FROM classes WHERE class_name = '2-Б' LIMIT 1)
INSERT INTO students (student_id, dan_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_date, is_active, created_at, updated_at)
SELECT 'STU003', 'stu003', 'Alice', 'Johnson', '2016-11-08', 'female', id, '2024-09-01', true, NOW(), NOW()
FROM class
ON CONFLICT (student_id) DO NOTHING;

-- 4. Link Students to Guardians
WITH student AS (SELECT id FROM students WHERE student_id = 'STU001'),
     guardian AS (SELECT id FROM users WHERE dan_id = 'parent001')
INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized_pickup, created_at, updated_at)
SELECT s.id, g.id, 'parent', true, true, NOW(), NOW()
FROM student s, guardian g
ON CONFLICT DO NOTHING;

WITH student AS (SELECT id FROM students WHERE student_id = 'STU002'),
     guardian AS (SELECT id FROM users WHERE dan_id = 'parent001')
INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized_pickup, created_at, updated_at)
SELECT s.id, g.id, 'parent', true, true, NOW(), NOW()
FROM student s, guardian g
ON CONFLICT DO NOTHING;

WITH student AS (SELECT id FROM students WHERE student_id = 'STU003'),
     guardian AS (SELECT id FROM users WHERE dan_id = 'parent002')
INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized_pickup, created_at, updated_at)
SELECT s.id, g.id, 'parent', true, true, NOW(), NOW()
FROM student s, guardian g
ON CONFLICT DO NOTHING;

-- 5. Create Pickup Requests
WITH student AS (SELECT id FROM students WHERE student_id = 'STU001'),
     guardian AS (SELECT id FROM users WHERE dan_id = 'parent001')
INSERT INTO pickup_requests (student_id, guardian_id, request_type, status, scheduled_time, notes, created_at, updated_at)
SELECT s.id, g.id, 'regular', 'pending', NOW() + INTERVAL '2 hours', 'Regular pickup', NOW(), NOW()
FROM student s, guardian g;

WITH student AS (SELECT id FROM students WHERE student_id = 'STU002'),
     guardian AS (SELECT id FROM users WHERE dan_id = 'parent001')
INSERT INTO pickup_requests (student_id, guardian_id, request_type, status, scheduled_time, notes, created_at, updated_at)
SELECT s.id, g.id, 'early', 'approved', NOW() + INTERVAL '1 hour', 'Doctor appointment', NOW(), NOW()
FROM student s, guardian g;

WITH student AS (SELECT id FROM students WHERE student_id = 'STU003'),
     guardian AS (SELECT id FROM users WHERE dan_id = 'parent002')
INSERT INTO pickup_requests (student_id, guardian_id, request_type, status, scheduled_time, notes, created_at, updated_at)
SELECT s.id, g.id, 'regular', 'pending', NOW() + INTERVAL '3 hours', 'Regular pickup', NOW(), NOW()
FROM student s, guardian g;

-- Verification queries
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Classes', COUNT(*) FROM classes
UNION ALL
SELECT 'Student Guardians', COUNT(*) FROM student_guardians
UNION ALL
SELECT 'Pickup Requests', COUNT(*) FROM pickup_requests;

-- Show created data
SELECT '\n=== CREATED USERS ===' as info;
SELECT dan_id, full_name, role, email FROM users ORDER BY role, dan_id;

SELECT '\n=== CREATED STUDENTS ===' as info;
SELECT s.student_id, s.first_name, s.last_name, c.class_name
FROM students s
LEFT JOIN classes c ON s.class_id = c.id;

SELECT '\n=== PICKUP REQUESTS ===' as info;
SELECT pr.*, s.first_name, s.last_name, u.full_name as guardian_name
FROM pickup_requests pr
JOIN students s ON pr.student_id = s.id
JOIN users u ON pr.guardian_id = u.id;

SELECT '\n✅ Demo data seeded successfully!' as result;
SELECT 'Login credentials: admin001 / 123456 (all users have same password)' as note;
