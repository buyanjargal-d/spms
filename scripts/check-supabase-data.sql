-- Run these queries in Supabase SQL Editor to check your data
-- Copy and paste each query one at a time

-- 1. Check all users (both TEST and real)
SELECT
    dan_id,
    full_name,
    role,
    email,
    created_at,
    CASE
        WHEN dan_id LIKE 'TEST%' THEN 'TEST DATA'
        ELSE 'REAL DATA'
    END as data_type
FROM users
ORDER BY created_at DESC
LIMIT 20;

-- 2. Count users by type
SELECT
    CASE
        WHEN dan_id LIKE 'TEST%' THEN 'TEST DATA'
        ELSE 'REAL DATA'
    END as data_type,
    role,
    COUNT(*) as count
FROM users
GROUP BY data_type, role
ORDER BY data_type, role;

-- 3. Check students
SELECT
    student_code,
    first_name,
    last_name,
    grade_level,
    created_at,
    CASE
        WHEN student_code LIKE 'STU%' THEN 'TEST DATA'
        ELSE 'REAL DATA'
    END as data_type
FROM students
ORDER BY created_at DESC
LIMIT 20;

-- 4. Check pickup requests
SELECT
    id,
    request_type,
    status,
    requested_time,
    created_at
FROM pickup_requests
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check what the backend API would return for /users
-- (This simulates what your backend sees)
SELECT
    id,
    dan_id,
    full_name,
    role,
    email,
    is_active
FROM users
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
