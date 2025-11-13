// Quick database seeding script for SPMS
// Run with: node seed-quick.js

const { Client } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL;

async function seedDatabase() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if data exists
    const checkAdmin = await client.query("SELECT * FROM users WHERE dan_id = 'admin001'");
    if (checkAdmin.rows.length > 0) {
      console.log('⚠️  Demo data already exists!');
      return;
    }

    console.log('🌱 Seeding demo data...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Create Admin
    console.log('Creating admin user...');
    const adminResult = await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('admin001', 'Админ Систем', 'admin@spms.mn', '99001122', 'admin', $1, true, NOW(), NOW())
      RETURNING id
    `, [hashedPassword]);
    console.log('✅ Admin created: admin001 / password: 123456');

    // 2. Create Teachers
    console.log('\nCreating teachers...');
    const teacher1 = await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('teacher001', 'Батбаяр Дорж', 'batbayar@spms.mn', '99112233', 'teacher', $1, true, NOW(), NOW())
      RETURNING id
    `, [hashedPassword]);

    const teacher2 = await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('teacher002', 'Сарангэрэл Ган', 'sarangerel@spms.mn', '99223344', 'teacher', $1, true, NOW(), NOW())
      RETURNING id
    `, [hashedPassword]);
    console.log('✅ Teachers created: teacher001, teacher002 / password: 123456');

    // 3. Create Classes
    console.log('\nCreating classes...');
    const class1 = await client.query(`
      INSERT INTO classes (class_name, grade_level, teacher_id, school_year, academic_year, room_number, capacity, is_active, created_at, updated_at)
      VALUES ('1-А анги', 1, $1, '2024-2025', '2024-2025', '101', 30, true, NOW(), NOW())
      RETURNING id
    `, [teacher1.rows[0].id]);

    const class2 = await client.query(`
      INSERT INTO classes (class_name, grade_level, teacher_id, school_year, academic_year, room_number, capacity, is_active, created_at, updated_at)
      VALUES ('2-Б анги', 2, $1, '2024-2025', '2024-2025', '202', 30, true, NOW(), NOW())
      RETURNING id
    `, [teacher2.rows[0].id]);
    console.log('✅ Classes created: 1-А анги, 2-Б анги');

    // 4. Create Parents
    console.log('\nCreating parents...');
    const parent1 = await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('parent001', 'Болд Ган', 'bold@gmail.com', '88111111', 'parent', $1, true, NOW(), NOW())
      RETURNING id
    `, [hashedPassword]);

    const parent2 = await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('parent002', 'Цэцэг Ган', 'tsetseg@gmail.com', '88222222', 'parent', $1, true, NOW(), NOW())
      RETURNING id
    `, [hashedPassword]);
    console.log('✅ Parents created: parent001, parent002 / password: 123456');

    // 5. Create Students
    console.log('\nCreating students...');
    const student1 = await client.query(`
      INSERT INTO students (student_id, dan_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_date, is_active, created_at, updated_at)
      VALUES ('STU001', 'stu001', 'Тэмүүлэн', 'Болд', '2017-03-15', 'male', $1, '2024-09-01', true, NOW(), NOW())
      RETURNING id
    `, [class1.rows[0].id]);

    const student2 = await client.query(`
      INSERT INTO students (student_id, dan_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_date, is_active, created_at, updated_at)
      VALUES ('STU002', 'stu002', 'Сарнай', 'Цэцэг', '2016-07-20', 'female', $1, '2024-09-01', true, NOW(), NOW())
      RETURNING id
    `, [class2.rows[0].id]);

    const student3 = await client.query(`
      INSERT INTO students (student_id, dan_id, first_name, last_name, date_of_birth, gender, class_id, enrollment_date, is_active, created_at, updated_at)
      VALUES ('STU003', 'stu003', 'Энхжин', 'Болд', '2017-11-08', 'male', $1, '2024-09-01', true, NOW(), NOW())
      RETURNING id
    `, [class1.rows[0].id]);
    console.log('✅ Students created: STU001, STU002, STU003');

    // 6. Create Student-Guardian relationships
    console.log('\nCreating student-guardian relationships...');
    await client.query(`
      INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized_pickup, created_at, updated_at)
      VALUES ($1, $2, 'parent', true, true, NOW(), NOW())
    `, [student1.rows[0].id, parent1.rows[0].id]);

    await client.query(`
      INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized_pickup, created_at, updated_at)
      VALUES ($1, $2, 'parent', true, true, NOW(), NOW())
    `, [student2.rows[0].id, parent2.rows[0].id]);

    await client.query(`
      INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized_pickup, created_at, updated_at)
      VALUES ($1, $2, 'parent', true, true, NOW(), NOW())
    `, [student3.rows[0].id, parent1.rows[0].id]);
    console.log('✅ Guardian relationships created');

    // 7. Create Guards
    console.log('\nCreating security guards...');
    await client.query(`
      INSERT INTO users (dan_id, full_name, email, phone, role, password, is_active, created_at, updated_at)
      VALUES ('guard001', 'Даваа Баяр', 'davaa@spms.mn', '99887766', 'guard', $1, true, NOW(), NOW())
    `, [hashedPassword]);
    console.log('✅ Guard created: guard001 / password: 123456');

    // 8. Create some pickup requests
    console.log('\nCreating pickup requests...');
    await client.query(`
      INSERT INTO pickup_requests (student_id, guardian_id, request_type, status, scheduled_time, notes, created_at, updated_at)
      VALUES ($1, $2, 'regular', 'pending', NOW() + INTERVAL '2 hours', 'Regular pickup', NOW(), NOW())
    `, [student1.rows[0].id, parent1.rows[0].id]);

    await client.query(`
      INSERT INTO pickup_requests (student_id, guardian_id, request_type, status, scheduled_time, notes, created_at, updated_at)
      VALUES ($1, $2, 'early', 'pending', NOW() + INTERVAL '1 hour', 'Doctor appointment', NOW(), NOW())
    `, [student2.rows[0].id, parent2.rows[0].id]);

    await client.query(`
      INSERT INTO pickup_requests (student_id, guardian_id, request_type, status, scheduled_time, notes, created_at, updated_at)
      VALUES ($1, $2, 'regular', 'approved', NOW() + INTERVAL '3 hours', 'Regular pickup', NOW(), NOW())
    `, [student3.rows[0].id, parent1.rows[0].id]);
    console.log('✅ Pickup requests created');

    console.log('\n' + '='.repeat(50));
    console.log('✅ Demo data seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\nDemo Credentials (all passwords: 123456):\n');
    console.log('Admin:    admin001 / 123456');
    console.log('Teachers: teacher001, teacher002 / 123456');
    console.log('Parents:  parent001, parent002 / 123456');
    console.log('Guard:    guard001 / 123456');
    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  });
