import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { hashPassword } from '../utils/password.util';

/**
 * Seed script to create test users with passwords
 * For local development and testing without DAN
 *
 * Usage: npx ts-node src/scripts/seed-test-users.ts
 */

const testUsers = [
  {
    danId: 'admin001',
    fullName: 'Админ Админов',
    role: UserRole.ADMIN,
    password: 'admin123',
    email: 'admin@spms.local',
    phone: '99111111',
  },
  {
    danId: 'teacher001',
    fullName: 'Багш Багшийн',
    role: UserRole.TEACHER,
    password: 'teacher123',
    email: 'teacher001@spms.local',
    phone: '99222222',
  },
  {
    danId: 'teacher002',
    fullName: 'Багш Хоёрдугаар',
    role: UserRole.TEACHER,
    password: 'teacher123',
    email: 'teacher002@spms.local',
    phone: '99222223',
  },
  {
    danId: 'parent001',
    fullName: 'Эцэг Эхийн',
    role: UserRole.PARENT,
    password: 'parent123',
    email: 'parent001@spms.local',
    phone: '99333333',
  },
  {
    danId: 'parent002',
    fullName: 'Эцэг Хоёрдугаар',
    role: UserRole.PARENT,
    password: 'parent123',
    email: 'parent002@spms.local',
    phone: '99333334',
  },
  {
    danId: 'guard001',
    fullName: 'Хамгаалагч Харуул',
    role: UserRole.GUARD,
    password: 'guard123',
    email: 'guard001@spms.local',
    phone: '99444444',
  },
];

async function seedTestUsers() {
  try {
    console.log('Starting test user seeding...');

    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepository = AppDataSource.getRepository(User);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const testUser of testUsers) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({
        where: { danId: testUser.danId },
        select: ['id', 'danId', 'password'],
      });

      // Hash the password
      const hashedPassword = await hashPassword(testUser.password);

      if (existingUser) {
        // Update existing user with password
        await userRepository.update(existingUser.id, {
          password: hashedPassword,
          fullName: testUser.fullName,
          email: testUser.email,
          phone: testUser.phone,
        });
        console.log(`🔄 Updated user: ${testUser.danId} (${testUser.role})`);
        updated++;
      } else {
        // Create new user
        await userRepository.save({
          danId: testUser.danId,
          fullName: testUser.fullName,
          role: testUser.role,
          password: hashedPassword,
          email: testUser.email,
          phone: testUser.phone,
          isActive: true,
          failedLoginAttempts: 0,
        });
        console.log(`Created user: ${testUser.danId} (${testUser.role})`);
        created++;
      }
    }

    console.log('\nSeeding Summary:');
    console.log(`   Created: ${created} users`);
    console.log(`   🔄 Updated: ${updated} users`);
    console.log(`   Skipped: ${skipped} users`);
    console.log(`   📝 Total: ${testUsers.length} users\n`);

    console.log('🔐 Test User Credentials:');
    console.log('════════════════════════════════════════');
    testUsers.forEach((user) => {
      console.log(`   ${user.role.toUpperCase().padEnd(10)} - DAN ID: ${user.danId.padEnd(15)} Password: ${user.password}`);
    });
    console.log('════════════════════════════════════════\n');

    console.log('Seeding completed successfully!');

    // Close database connection
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('ERROR: Error seeding test users:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

// Run the seeding
seedTestUsers();
