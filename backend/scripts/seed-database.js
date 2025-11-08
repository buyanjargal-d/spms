/**
 * SPMS Database Seeding Script
 *
 * Populates the database with comprehensive test data
 *
 * Run with: node scripts/seed-database.js
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Mongolian names for realistic data
const mongolianFirstNames = {
  male: ['Баяр', 'Болд', 'Дорж', 'Эрдэнэ', 'Ганбат', 'Очир', 'Төмөр', 'Батбаяр', 'Цэнд', 'Мөнх'],
  female: ['Алтан', 'Болормаа', 'Сарнай', 'Уянга', 'Номин', 'Энхтуяа', 'Одон', 'Цэцэг', 'Дэлгэр', 'Мөнхцэцэг']
};

const mongolianLastNames = ['Б.', 'Ч.', 'Д.', 'Э.', 'Г.', 'О.', 'Т.', 'М.', 'С.', 'Н.'];

const relationships = ['Эх', 'Эцэг', 'Эмээ', 'Өвөө', 'Нагац эгч', 'Нагац ах', 'Авга эгч', 'Авга ах'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomPhoneNumber() {
  // Return 8 digits to fit in varchar(20)
  const num = 80000000 + randomInt(0, 9999999);
  return String(num).substring(0, 8);
}

async function clearExistingData() {
  console.log('\n🗑️  Clearing existing test data...');

  try {
    // Delete in order respecting foreign keys
    await client.query('DELETE FROM audit_logs');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM guest_pickup_approvals');
    await client.query('DELETE FROM pickup_approvals WHERE 1=1'); // May not exist
    await client.query('DELETE FROM pickup_requests');
    await client.query('DELETE FROM student_guardians');
    await client.query('DELETE FROM students');
    await client.query('DELETE FROM classes');
    await client.query('DELETE FROM users WHERE dan_id LIKE \'TEST%\''); // Only delete test users

    console.log('✅ Existing test data cleared');
  } catch (error) {
    console.log('⚠️  Some tables may not exist:', error.message);
  }
}

async function seedUsers() {
  console.log('\n👥 Seeding users...');

  const users = [];

  // 1 Admin
  users.push({
    dan_id: 'TEST_ADMIN_001',
    full_name: 'Б. Админ',
    role: 'admin',
    email: 'admin@school.mn',
    phone: '99000001',
    is_active: true
  });

  // 6 Teachers
  for (let i = 1; i <= 6; i++) {
    const gender = i % 2 === 0 ? 'female' : 'male';
    users.push({
      dan_id: `TEST_TEACHER_${String(i).padStart(3, '0')}`,
      full_name: `${randomElement(mongolianLastNames)} ${randomElement(mongolianFirstNames[gender])}`,
      role: 'teacher',
      email: `teacher${i}@school.mn`,
      phone: randomPhoneNumber(),
      is_active: true
    });
  }

  // 15 Parents
  for (let i = 1; i <= 15; i++) {
    const gender = i % 2 === 0 ? 'female' : 'male';
    users.push({
      dan_id: `TEST_PARENT_${String(i).padStart(3, '0')}`,
      full_name: `${randomElement(mongolianLastNames)} ${randomElement(mongolianFirstNames[gender])}`,
      role: 'parent',
      email: i <= 10 ? `parent${i}@gmail.com` : null,
      phone: randomPhoneNumber(),
      is_active: true
    });
  }

  // 3 Guards
  for (let i = 1; i <= 3; i++) {
    users.push({
      dan_id: `TEST_GUARD_${String(i).padStart(3, '0')}`,
      full_name: `${randomElement(mongolianLastNames)} Хамгаалагч ${i}`,
      role: 'guard',
      email: `guard${i}@school.mn`,
      phone: randomPhoneNumber(),
      is_active: true
    });
  }

  const insertedUsers = [];
  for (const user of users) {
    const result = await client.query(
      `INSERT INTO users (dan_id, full_name, role, email, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.dan_id, user.full_name, user.role, user.email, user.phone, user.is_active]
    );
    insertedUsers.push(result.rows[0]);
  }

  console.log(`✅ Created ${insertedUsers.length} users`);
  console.log(`   - 1 Admin`);
  console.log(`   - 6 Teachers`);
  console.log(`   - 15 Parents`);
  console.log(`   - 3 Guards`);

  return insertedUsers;
}

async function seedClasses(users) {
  console.log('\n📚 Seeding classes...');

  const teachers = users.filter(u => u.role === 'teacher');
  const classes = [];

  const classData = [
    { name: '1А', grade: 1, teacher: teachers[0] },
    { name: '1Б', grade: 1, teacher: teachers[1] },
    { name: '2А', grade: 2, teacher: teachers[2] },
    { name: '2Б', grade: 2, teacher: teachers[3] },
    { name: '3А', grade: 3, teacher: teachers[4] },
    { name: '3Б', grade: 3, teacher: teachers[5] }
  ];

  for (const cls of classData) {
    const result = await client.query(
      `INSERT INTO classes (class_name, grade_level, teacher_id, school_year)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cls.name, cls.grade, cls.teacher.id, '2024-2025']
    );
    classes.push(result.rows[0]);
  }

  console.log(`✅ Created ${classes.length} classes`);
  return classes;
}

async function seedStudents(classes) {
  console.log('\n👨‍🎓 Seeding students...');

  const students = [];
  let studentCounter = 1;

  for (const cls of classes) {
    const numStudents = randomInt(4, 6); // 4-6 students per class

    for (let i = 0; i < numStudents; i++) {
      const gender = Math.random() > 0.5 ? 'female' : 'male';
      const firstName = randomElement(mongolianFirstNames[gender]);
      const lastName = randomElement(mongolianLastNames);
      const birthDate = randomDate(new Date(2015, 0, 1), new Date(2019, 11, 31));

      const result = await client.query(
        `INSERT INTO students (student_code, first_name, last_name, date_of_birth, grade_level, class_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          `STU${String(studentCounter).padStart(4, '0')}`,
          firstName,
          lastName,
          birthDate,
          cls.grade_level,
          cls.id,
          true
        ]
      );

      students.push(result.rows[0]);
      studentCounter++;
    }
  }

  console.log(`✅ Created ${students.length} students across ${classes.length} classes`);
  return students;
}

async function seedGuardianRelationships(students, users) {
  console.log('\n👨‍👩‍👧 Seeding guardian relationships...');

  const parents = users.filter(u => u.role === 'parent');
  const guardianships = [];
  let parentIndex = 0;

  for (const student of students) {
    // Each student gets 1-3 guardians
    const numGuardians = randomInt(1, 3);

    for (let i = 0; i < numGuardians; i++) {
      const parent = parents[parentIndex % parents.length];
      const isPrimary = i === 0; // First guardian is primary
      const relationship = randomElement(relationships);

      try {
        const result = await client.query(
          `INSERT INTO student_guardians (student_id, guardian_id, relationship, is_primary, is_authorized)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING
           RETURNING *`,
          [student.id, parent.id, relationship, isPrimary, true]
        );

        if (result.rows.length > 0) {
          guardianships.push(result.rows[0]);
        }
      } catch (error) {
        // Skip duplicates
      }

      parentIndex++;
    }
  }

  console.log(`✅ Created ${guardianships.length} guardian relationships`);
  return guardianships;
}

async function seedPickupRequests(students, users) {
  console.log('\n🚗 Seeding pickup requests...');

  const parents = users.filter(u => u.role === 'parent');
  const guards = users.filter(u => u.role === 'guard');
  const requests = [];

  const statuses = [
    { status: 'pending', count: 8 },
    // Skipping pending_parent_approval - too long for varchar(20)
    { status: 'approved', count: 10 },
    { status: 'rejected', count: 3 },
    { status: 'completed', count: 7 },
    { status: 'cancelled', count: 2 }
  ];

  const types = ['standard', 'advance', 'guest'];

  for (const { status, count } of statuses) {
    for (let i = 0; i < count; i++) {
      const student = randomElement(students);
      const requester = randomElement(parents);
      const requestType = randomElement(types);

      const now = new Date();
      const requestedTime = status === 'completed'
        ? randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now)
        : randomDate(now, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

      const scheduledTime = ['approved', 'completed'].includes(status)
        ? new Date(requestedTime.getTime() + 60 * 60 * 1000)
        : null;

      const actualTime = status === 'completed'
        ? new Date(scheduledTime.getTime() + randomInt(-10, 30) * 60 * 1000)
        : null;

      // Guest pickup fields
      const guestData = requestType === 'guest' ? {
        guest_name: `${randomElement(mongolianLastNames)} ${randomElement([...mongolianFirstNames.male, ...mongolianFirstNames.female])}`,
        guest_phone: `9${String(randomInt(1000000, 9999999))}`,
        guest_id_number: `${randomElement(['У', 'Ө', 'Х'])}${String(randomInt(1000000, 9999999))}`
      } : {};


      const result = await client.query(
        `INSERT INTO pickup_requests (
          student_id, requester_id, pickup_person_id, request_type, status,
          requested_time, scheduled_pickup_time, actual_pickup_time,
          request_location_lat, request_location_lng,
          pickup_location_lat, pickup_location_lng,
          notes, rejection_reason, special_instructions,
          guest_name, guest_phone, guest_id_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          student.id,
          requester.id,
          status === 'completed' ? randomElement([...parents, ...guards]).id : null,
          requestType,
          status,
          requestedTime,
          scheduledTime,
          actualTime,
          47.9186 + (Math.random() - 0.5) * 0.01, // Near school
          106.9178 + (Math.random() - 0.5) * 0.01,
          status === 'completed' ? 47.9186 + (Math.random() - 0.5) * 0.002 : null,
          status === 'completed' ? 106.9178 + (Math.random() - 0.5) * 0.002 : null,
          randomInt(1, 3) === 1 ? 'Сургуулийн хаалганы дэргэд хүлээнэ үү' : null,
          status === 'rejected' ? 'Эцэг эх ажилдаа байна' : null,
          requestType === 'advance' ? 'Өвчтэй тул эрт явах шаардлагатай' : null,
          guestData.guest_name || null,
          guestData.guest_phone || null,
          guestData.guest_id_number || null
        ]
      );

      requests.push(result.rows[0]);
    }
  }

  console.log(`✅ Created ${requests.length} pickup requests`);
  console.log(`   - 5 Pending`);
  console.log(`   - 3 Pending parent approval`);
  console.log(`   - 10 Approved`);
  console.log(`   - 3 Rejected`);
  console.log(`   - 7 Completed`);
  console.log(`   - 2 Cancelled`);

  return requests;
}

async function seedGuestApprovals(requests, users) {
  console.log('\n✋ Seeding guest pickup approvals...');

  const parents = users.filter(u => u.role === 'parent');
  const guestRequests = requests.filter(r => r.request_type === 'guest');
  const approvals = [];

  for (const request of guestRequests) {
    // Get guardians for this student
    const guardianResult = await client.query(
      `SELECT guardian_id FROM student_guardians WHERE student_id = $1`,
      [request.student_id]
    );

    const guardianIds = guardianResult.rows.map(r => r.guardian_id);

    // Create approval records for each guardian
    for (const guardianId of guardianIds) {
      let approvalStatus = 'pending';
      let respondedAt = null;
      let notes = null;

      if (request.status === 'approved' || request.status === 'completed') {
        approvalStatus = 'approved';
        respondedAt = new Date(new Date(request.requested_time).getTime() + 30 * 60 * 1000);
        notes = 'Зөвшөөрч байна';
      } else if (request.status === 'rejected') {
        approvalStatus = Math.random() > 0.5 ? 'rejected' : 'approved';
        respondedAt = new Date(new Date(request.requested_time).getTime() + 30 * 60 * 1000);
        notes = approvalStatus === 'rejected' ? 'Энэ хүнийг танихгүй байна' : 'Зөвшөөрч байна';
      }

      const result = await client.query(
        `INSERT INTO guest_pickup_approvals (pickup_request_id, parent_id, status, notes, responded_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [request.id, guardianId, approvalStatus, notes, respondedAt]
      );

      approvals.push(result.rows[0]);
    }
  }

  console.log(`✅ Created ${approvals.length} guest pickup approvals`);
  return approvals;
}

async function seedNotifications(users, requests) {
  console.log('\n🔔 Seeding notifications...');

  const notificationTypes = {
    'pickup_request_created': 'Хүүхэд авах хүсэлт үүсгэгдлээ',
    'pickup_request_approved': 'Хүүхэд авах хүсэлт зөвшөөрөгдлөө',
    'pickup_request_rejected': 'Хүүхэд авах хүсэлт татгалзагдлаа',
    'pickup_request_completed': 'Хүүхдийг амжилттай хүлээлгэн өглөө',
    'guest_approval_requested': 'Зочин хүсэлт зөвшөөрөл шаардлагатай',
    'system_alert': 'Системийн мэдэгдэл'
  };

  const notifications = [];

  for (const request of requests) {
    // Get student info for better messages
    const studentResult = await client.query(
      'SELECT first_name, last_name FROM students WHERE id = $1',
      [request.student_id]
    );
    const student = studentResult.rows[0];
    const studentName = `${student.last_name} ${student.first_name}`;

    // Create notification for requester when status changes
    if (['approved', 'rejected', 'completed'].includes(request.status)) {
      let notifType, message;

      if (request.status === 'approved') {
        notifType = 'pickup_request_approved';
        message = `${studentName}-ийг авах хүсэлт зөвшөөрөгдлөө`;
      } else if (request.status === 'rejected') {
        notifType = 'pickup_request_rejected';
        message = `${studentName}-ийг авах хүсэлт татгалзагдлаа. Шалтгаан: ${request.rejection_reason || 'Тодорхойгүй'}`;
      } else {
        notifType = 'pickup_request_completed';
        message = `${studentName}-ийг амжилттай хүлээлгэн өглөө`;
      }

      const result = await client.query(
        `INSERT INTO notifications (
          user_id, notification_type, title, message, related_request_id,
          is_read, is_sent, sent_at, read_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          request.requester_id,
          notifType,
          notificationTypes[notifType],
          message,
          request.id,
          Math.random() > 0.3, // 70% read
          true,
          new Date(new Date(request.requested_time).getTime() + 60 * 60 * 1000),
          Math.random() > 0.3 ? new Date(new Date(request.requested_time).getTime() + 90 * 60 * 1000) : null
        ]
      );

      notifications.push(result.rows[0]);
    }

    // For guest pickups, notify parents
    if (request.request_type === 'guest' && request.status === 'pending_parent_approval') {
      const guardianResult = await client.query(
        `SELECT guardian_id FROM student_guardians WHERE student_id = $1`,
        [request.student_id]
      );

      for (const guardian of guardianResult.rows) {
        const result = await client.query(
          `INSERT INTO notifications (
            user_id, notification_type, title, message, related_request_id,
            is_read, is_sent, sent_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            guardian.guardian_id,
            'guest_approval_requested',
            'Зочин хүсэлт зөвшөөрөл шаардлагатай',
            `${studentName}-ийг ${request.guest_name} авах гэж байна. Зөвшөөрнө үү?`,
            request.id,
            false,
            true,
            request.requested_time
          ]
        );

        notifications.push(result.rows[0]);
      }
    }
  }

  // Add some system notifications
  const teachers = users.filter(u => u.role === 'teacher');
  for (let i = 0; i < 5; i++) {
    const result = await client.query(
      `INSERT INTO notifications (
        user_id, notification_type, title, message,
        is_read, is_sent, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        randomElement(teachers).id,
        'system_alert',
        'Системийн мэдэгдэл',
        'Өнөөдөр 15:00-18:00 цагийн хооронд хүүхдүүдийг хүлээлгэн өгнө',
        Math.random() > 0.5,
        true,
        randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
      ]
    );

    notifications.push(result.rows[0]);
  }

  console.log(`✅ Created ${notifications.length} notifications`);
  return notifications;
}

async function seedAuditLogs(users, students, requests) {
  console.log('\n📋 Seeding audit logs...');

  const auditLogs = [];

  // User creation logs
  for (const user of users.slice(0, 10)) {
    const result = await client.query(
      `INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id,
        new_values, description, ip_address, user_agent,
        request_method, request_path, status_code, is_error
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        user.id,
        'CREATE',
        'User',
        user.id,
        { full_name: user.full_name, role: user.role },
        `User ${user.full_name} created`,
        '192.168.1.' + randomInt(1, 255),
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'POST',
        '/api/v1/users',
        201,
        false
      ]
    );
    auditLogs.push(result.rows[0]);
  }

  // Login logs
  for (let i = 0; i < 20; i++) {
    const user = randomElement(users);
    const result = await client.query(
      `INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id,
        description, ip_address, user_agent,
        request_method, request_path, status_code, is_error
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        user.id,
        'LOGIN',
        'User',
        user.id,
        `User ${user.full_name} logged in`,
        '192.168.1.' + randomInt(1, 255),
        randomElement([
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        ]),
        'POST',
        '/api/v1/auth/login',
        200,
        false
      ]
    );
    auditLogs.push(result.rows[0]);
  }

  // Pickup request status changes
  for (const request of requests.filter(r => ['approved', 'rejected', 'completed'].includes(r.status))) {
    const oldStatus = request.status === 'completed' ? 'approved' : 'pending';

    const result = await client.query(
      `INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id,
        old_values, new_values, description, ip_address, user_agent,
        request_method, request_path, status_code, is_error
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        request.requester_id,
        request.status === 'approved' ? 'APPROVE' : request.status === 'completed' ? 'COMPLETE' : 'REJECT',
        'PickupRequest',
        request.id,
        { status: oldStatus },
        { status: request.status },
        `Pickup request ${request.status}`,
        '192.168.1.' + randomInt(1, 255),
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'PUT',
        `/api/v1/pickup-requests/${request.id}`,
        200,
        false
      ]
    );
    auditLogs.push(result.rows[0]);
  }

  // Some error logs
  for (let i = 0; i < 5; i++) {
    const user = randomElement(users);
    const result = await client.query(
      `INSERT INTO audit_logs (
        user_id, action, entity_type,
        description, ip_address, user_agent,
        request_method, request_path, status_code, is_error, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        user.id,
        'UPDATE',
        'PickupRequest',
        'Failed to update pickup request',
        '192.168.1.' + randomInt(1, 255),
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'PUT',
        '/api/v1/pickup-requests/invalid-id',
        404,
        true,
        'Pickup request not found'
      ]
    );
    auditLogs.push(result.rows[0]);
  }

  console.log(`✅ Created ${auditLogs.length} audit log entries`);
  return auditLogs;
}

async function seedSchoolSettings() {
  console.log('\n⚙️  Seeding school settings...');

  const settings = [
    { key: 'school_name', value: 'Монгол Улсын Дунд Сургууль', description: 'Сургуулийн нэр' },
    { key: 'school_latitude', value: '47.9186', description: 'Сургуулийн байршил (өргөрөг)' },
    { key: 'school_longitude', value: '106.9178', description: 'Сургуулийн байршил (уртраг)' },
    { key: 'school_radius_meters', value: '150', description: 'Зөвшөөрөгдөх радиус (метр)' },
    { key: 'pickup_start_time', value: '15:00', description: 'Хүүхэд авах эхлэх цаг' },
    { key: 'pickup_end_time', value: '18:00', description: 'Хүүхэд авах дуусах цаг' },
    { key: 'require_gps_verification', value: 'true', description: 'GPS баталгаажуулалт шаардах эсэх' },
    { key: 'require_parent_approval_for_guest', value: 'true', description: 'Зочин хүсэлтэд эцэг эхийн зөвшөөрөл шаардах' },
    { key: 'max_advance_request_days', value: '7', description: 'Урьдчилсан хүсэлтийн хамгийн их өдөр' }
  ];

  for (const setting of settings) {
    await client.query(
      `INSERT INTO school_settings (setting_key, setting_value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (setting_key) DO UPDATE
       SET setting_value = EXCLUDED.setting_value,
           description = EXCLUDED.description`,
      [setting.key, setting.value, setting.description]
    );
  }

  console.log(`✅ Created/updated ${settings.length} school settings`);
}

async function main() {
  console.log('🚀 SPMS Database Seeding Script');
  console.log('================================\n');

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Clear existing test data
    await clearExistingData();

    // Seed data in order
    const users = await seedUsers();
    const classes = await seedClasses(users);
    const students = await seedStudents(classes);
    const guardianships = await seedGuardianRelationships(students, users);
    const requests = await seedPickupRequests(students, users);
    const approvals = await seedGuestApprovals(requests, users);
    const notifications = await seedNotifications(users, requests);
    const auditLogs = await seedAuditLogs(users, students, requests);
    await seedSchoolSettings();

    console.log('\n================================');
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Classes: ${classes.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Guardian relationships: ${guardianships.length}`);
    console.log(`   - Pickup requests: ${requests.length}`);
    console.log(`   - Guest approvals: ${approvals.length}`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log(`   - Audit logs: ${auditLogs.length}`);
    console.log(`   - School settings: 9`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
