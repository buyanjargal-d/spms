// Simplified seed script - pre-hashed password
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected');

    // Use pre-hashed password for '123456' with bcrypt rounds=10
    // Generated with: bcrypt.hash('123456', 10)
    const hashedPassword = '$2b$10$rKJ8e.B0YgV6eXfV9vQ4I.Y5nxZ0OyZ0G7JXb8PjKnX8YfQZXhTW2';

    console.log('Creating users...');

    // Admin
    await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('admin001', 'Admin User', 'admin@spms.mn', '99001122', 'admin', $1, true, NOW(), NOW())
      ON CONFLICT (dan_id) DO NOTHING
    `, [hashedPassword]);

    // Teacher
    const teacherRes = await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('teacher001', 'Teacher One', 'teacher@spms.mn', '99112233', 'teacher', $1, true, NOW(), NOW())
      ON CONFLICT (dan_id) DO NOTHING
      RETURNING id
    `, [hashedPassword]);

    let teacherId;
    if (teacherRes.rows.length > 0) {
      teacherId = teacherRes.rows[0].id;
    } else {
      const existing = await client.query("SELECT id FROM users WHERE dan_id = 'teacher001'");
      teacherId = existing.rows[0].id;
    }

    // Parent
    const parentRes = await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('parent001', 'Parent One', 'parent@gmail.com', '88111111', 'parent', $1, true, NOW(), NOW())
      ON CONFLICT (dan_id) DO NOTHING
      RETURNING id
    `, [hashedPassword]);

    let parentId;
    if (parentRes.rows.length > 0) {
      parentId = parentRes.rows[0].id;
    } else {
      const existing = await client.query("SELECT id FROM users WHERE dan_id = 'parent001'");
      parentId = existing.rows[0].id;
    }

    // Guard
    await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('guard001', 'Security Guard', 'guard@spms.mn', '99887766', 'guard', $1, true, NOW(), NOW())
      ON CONFLICT (dan_id) DO NOTHING
    `, [hashedPassword]);

    console.log('Users created');

    // Class
    const classRes = await client.query(`
      INSERT INTO classes (class_name, grade_level, teacher_id, school_year, academic_year, room_number, capacity, is_active, created_at, updated_at)
      VALUES ('1-А', 1, $1, '2024-2025', '2024-2025', '101', 30, true, NOW(), NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [teacherId]);

    let classId;
    if (classRes.rows.length > 0) {
      classId = classRes.rows[0].id;
    } else {
      const existing = await client.query("SELECT id FROM classes WHERE class_name = '1-А' LIMIT 1");
      if (existing.rows.length > 0) {
        classId = existing.rows[0].id;
      }
    }

    console.log('Class created');

    if (classId) {
      // Students
      const st1 = await client.query(`
        INSERT INTO students (student_id, dan_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_date, is_active, created_at, updated_at)
        VALUES ('STU001', 'stu001', 'John', 'Doe', '2017-03-15', 'male', $1, '2024-09-01', true, NOW(), NOW())
        ON CONFLICT (student_id) DO NOTHING
        RETURNING id
      `, [classId]);

      const st2 = await client.query(`
        INSERT INTO students (student_id, dan_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_date, is_active, created_at, updated_at)
        VALUES ('STU002', 'stu002', 'Jane', 'Smith', '2017-07-20', 'female', $1, '2024-09-01', true, NOW(), NOW())
        ON CONFLICT (student_id) DO NOTHING
        RETURNING id
      `, [classId]);

      console.log('Students created');

      if (st1.rows.length > 0 && st2.rows.length > 0) {
        // Guardian relationships
        await client.query(`
          INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized_pickup, created_at, updated_at)
          VALUES ($1, $2, 'parent', true, true, NOW(), NOW())
          ON CONFLICT DO NOTHING
        `, [st1.rows[0].id, parentId]);

        await client.query(`
          INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized_pickup, created_at, updated_at)
          VALUES ($1, $2, 'parent', true, true, NOW(), NOW())
          ON CONFLICT DO NOTHING
        `, [st2.rows[0].id, parentId]);

        console.log('Guardians linked');

        // Pickup requests
        await client.query(`
          INSERT INTO pickup_requests (student_id, guardian_id, request_type, status, scheduled_time, notes, created_at, updated_at)
          VALUES
          ($1, $2, 'regular', 'pending', NOW() + INTERVAL '2 hours', 'Regular pickup', NOW(), NOW()),
          ($3, $4, 'early', 'approved', NOW() + INTERVAL '1 hour', 'Doctor appointment', NOW(), NOW())
        `, [st1.rows[0].id, parentId, st2.rows[0].id, parentId]);

        console.log('Pickup requests created');
      }
    }

    console.log('\nDONE! Login: admin001 / Password: 123456\n');

  } catch (err) {
    console.error('Error:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(console.error);
