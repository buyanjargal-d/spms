import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { Student } from '../models/Student';
import { Class } from '../models/Class';
import { PickupRequest, RequestStatus, RequestType } from '../models/PickupRequest';
import { StudentGuardian } from '../models/StudentGuardian';
import bcrypt from 'bcrypt';

const seedDemoData = async () => {
  try {
    console.log('🌱 Starting demo data seeding...');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }

    const userRepo = AppDataSource.getRepository(User);
    const studentRepo = AppDataSource.getRepository(Student);
    const classRepo = AppDataSource.getRepository(Class);
    const pickupRepo = AppDataSource.getRepository(PickupRequest);
    const guardianRepo = AppDataSource.getRepository(StudentGuardian);

    // Check if demo data already exists
    const existingAdmin = await userRepo.findOne({ where: { danId: 'admin001' } });
    if (existingAdmin) {
      console.log('\n⚠️  Demo data already exists!');
      console.log('Skipping - data is already seeded. To reseed, manually clear demo data from database.\n');
      process.exit(0);
    }

    // Hash password for all demo users
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Create Admin User
    console.log('\n📝 Creating admin user...');
    const admin = userRepo.create({
      danId: 'admin001',
      fullName: 'Админ Систем',
      email: 'admin@spms.mn',
      phone: '99001122',
      role: UserRole.ADMIN,
      password: hashedPassword,
      isActive: true,
    });
    await userRepo.save(admin);
    console.log('✅ Admin created: admin001');

    // 2. Create Teachers
    console.log('\n📝 Creating teachers...');
    const teachers = [];
    const teacherData = [
      { danId: 'teacher001', fullName: 'Батбаяр Дорж', email: 'batbayar@spms.mn', phone: '99112233' },
      { danId: 'teacher002', fullName: 'Сарангэрэл Ган', email: 'sarangerel@spms.mn', phone: '99223344' },
    ];

    for (const data of teacherData) {
      const teacher = userRepo.create({
        danId: data.danId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: UserRole.TEACHER,
        password: hashedPassword,
        isActive: true,
      });
      await userRepo.save(teacher);
      teachers.push(teacher);
      console.log(`✅ Teacher created: ${data.danId}`);
    }

    // 3. Create Classes
    console.log('\n📝 Creating classes...');
    const class1A = classRepo.create({
      className: '1-А анги',
      gradeLevel: 1,
      teacherId: teachers[0].id,
      schoolYear: '2024-2025',
      academicYear: '2024-2025',
      roomNumber: '101',
      capacity: 30,
      isActive: true,
    });
    await classRepo.save(class1A);

    const class2B = classRepo.create({
      className: '2-Б анги',
      gradeLevel: 2,
      teacherId: teachers[1].id,
      schoolYear: '2024-2025',
      academicYear: '2024-2025',
      roomNumber: '202',
      capacity: 30,
      isActive: true,
    });
    await classRepo.save(class2B);
    console.log('✅ Classes created: 1-А анги, 2-Б анги');

    // 4. Create Parents and Students
    console.log('\n📝 Creating parents and students...');
    const parents = [];
    const students = [];

    const studentData = [
      { studentName: 'Болд', parentName: 'Ган Батаа', class: class1A, gender: 'male' },
      { studentName: 'Сарнай', parentName: 'Цэцэг Төмөр', class: class1A, gender: 'female' },
      { studentName: 'Төмөр', parentName: 'Дорж Очир', class: class1A, gender: 'male' },
      { studentName: 'Туяа', parentName: 'Сайхан Ган', class: class1A, gender: 'female' },
      { studentName: 'Батбаяр', parentName: 'Энх Болд', class: class1A, gender: 'male' },
      { studentName: 'Наран', parentName: 'Цэцэг Дорж', class: class1A, gender: 'female' },
      { studentName: 'Эрдэнэ', parentName: 'Мөнх Бат', class: class2B, gender: 'male' },
      { studentName: 'Оюунаа', parentName: 'Сайхан Төмөр', class: class2B, gender: 'female' },
      { studentName: 'Амар', parentName: 'Болд Очир', class: class2B, gender: 'male' },
      { studentName: 'Ууганбаяр', parentName: 'Ган Дорж', class: class2B, gender: 'male' },
      { studentName: 'Золбаяр', parentName: 'Энх Төмөр', class: class2B, gender: 'male' },
      { studentName: 'Одгэрэл', parentName: 'Цэцэг Бат', class: class2B, gender: 'female' },
    ];

    for (let i = 0; i < studentData.length; i++) {
      const data = studentData[i];
      const parentDanId = `parent${(i + 1).toString().padStart(3, '0')}`;

      // Create parent
      const parent = userRepo.create({
        danId: parentDanId,
        fullName: data.parentName,
        email: `${parentDanId}@spms.mn`,
        phone: `9900${(i + 1).toString().padStart(4, '0')}`,
        role: UserRole.PARENT,
        password: hashedPassword,
        isActive: true,
      });
      await userRepo.save(parent);
      parents.push(parent);

      // Create student
      const studentCode = `STU${(i + 1).toString().padStart(3, '0')}`;
      const lastName = data.parentName.split(' ')[1] || data.parentName.split(' ')[0];
      const birthDate = new Date(2017 - data.class.gradeLevel, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

      const student = studentRepo.create({
        studentCode: studentCode,
        firstName: data.studentName,
        lastName: lastName,
        dateOfBirth: birthDate,
        gradeLevel: data.class.gradeLevel,
        classId: data.class.id,
        medicalConditions: i % 4 === 0 ? 'Астматай, анхааралтай хандах' : undefined,
        allergies: i % 5 === 0 ? 'Самрын харшил' : undefined,
        pickupInstructions: `${data.studentName} сурагчийг зөвхөн бүртгэлтэй асран хамгаалагчид өгнө үү.`,
        isActive: true,
        enrollmentDate: new Date('2024-09-01'),
      });
      await studentRepo.save(student);
      students.push(student);

      // Create guardian relationship
      const guardian = guardianRepo.create({
        studentId: student.id,
        guardianId: parent.id,
        relationship: 'parent',
        isPrimary: true,
        isAuthorized: true,
      });
      await guardianRepo.save(guardian);

      console.log(`✅ Created parent ${parentDanId} and student ${studentCode} (${data.studentName})`);
    }

    // 5. Create Guard User
    console.log('\n📝 Creating guard user...');
    const guard = userRepo.create({
      danId: 'guard001',
      fullName: 'Хаалгач Хариуцагч',
      email: 'guard@spms.mn',
      phone: '99556677',
      role: UserRole.GUARD,
      password: hashedPassword,
      isActive: true,
    });
    await userRepo.save(guard);
    console.log('✅ Guard created: guard001');

    // 6. Create Pickup Requests
    console.log('\n📝 Creating pickup requests...');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Completed pickups (yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (let i = 0; i < 3; i++) {
      const student = students[i];
      const parent = parents[i];
      const pickupTime = new Date(yesterday);
      pickupTime.setHours(15 + i, 30, 0, 0);
      const actualTime = new Date(pickupTime.getTime() + 10 * 60000);

      const pickup = pickupRepo.create({
        studentId: student.id,
        requesterId: parent.id,
        pickupPersonId: parent.id,
        requestType: i % 2 === 0 ? RequestType.STANDARD : RequestType.ADVANCE,
        requestedTime: new Date(pickupTime.getTime() - 3 * 60 * 60000),
        scheduledPickupTime: pickupTime,
        actualPickupTime: actualTime,
        status: RequestStatus.COMPLETED,
        notes: `${student.firstName} сурагчийг амжилттай авсан`,
        completedBy: guard.id,
        completedAt: actualTime,
        approverId: teachers[0].id,
        approvedAt: new Date(pickupTime.getTime() - 2 * 60 * 60000),
        verificationMethod: 'qr',
      });
      await pickupRepo.save(pickup);
      console.log(`✅ Completed pickup created for ${student.firstName}`);
    }

    // Approved pickups (today)
    for (let i = 3; i < 6; i++) {
      const student = students[i];
      const parent = parents[i];
      const pickupTime = new Date(today);
      pickupTime.setHours(14 + (i - 3), 0, 0, 0);
      const requestTime = new Date(pickupTime.getTime() - 3 * 60 * 60000);
      const approveTime = new Date(pickupTime.getTime() - 1 * 60 * 60000);

      const pickup = pickupRepo.create({
        studentId: student.id,
        requesterId: parent.id,
        pickupPersonId: parent.id,
        requestType: RequestType.ADVANCE,
        requestedTime: requestTime,
        scheduledPickupTime: pickupTime,
        status: RequestStatus.APPROVED,
        notes: `Багш ${teachers[i < 4 ? 0 : 1].fullName} зөвшөөрсөн`,
        approverId: teachers[i < 4 ? 0 : 1].id,
        approvedAt: approveTime,
        specialInstructions: i === 3 ? 'Эмчийн цаг, эрт авна' : undefined,
      });
      await pickupRepo.save(pickup);
      console.log(`✅ Approved pickup created for ${student.firstName} at ${pickupTime.toLocaleTimeString('mn-MN')}`);
    }

    // Pending pickups (today)
    for (let i = 6; i < 8; i++) {
      const student = students[i];
      const parent = parents[i];
      const pickupTime = new Date(today);
      pickupTime.setHours(16, 0, 0, 0);
      const requestTime = new Date();

      const pickup = pickupRepo.create({
        studentId: student.id,
        requesterId: parent.id,
        pickupPersonId: parent.id,
        requestType: RequestType.STANDARD,
        requestedTime: requestTime,
        scheduledPickupTime: pickupTime,
        status: RequestStatus.PENDING,
      });
      await pickupRepo.save(pickup);
      console.log(`✅ Pending pickup created for ${student.firstName}`);
    }

    console.log('\n🎉 Demo data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • 1 Admin (admin001)');
    console.log('   • 2 Teachers (teacher001, teacher002)');
    console.log('   • 12 Parents (parent001-parent012)');
    console.log('   • 1 Guard (guard001)');
    console.log('   • 12 Students across 2 classes');
    console.log('   • 8 Pickup requests (3 completed, 3 approved, 2 pending)');
    console.log('\n🔑 All users password: 123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
};

seedDemoData();
