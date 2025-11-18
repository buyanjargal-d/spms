import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { Student } from '../models/Student';
import { Class } from '../models/Class';
import { StudentGuardian } from '../models/StudentGuardian';
import { PickupRequest } from '../models/PickupRequest';
import { SchoolSettings } from '../models/SchoolSettings';
import bcrypt from 'bcrypt';

interface CreateUserData {
  danId: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  password: string;
  profilePhotoUrl?: string;
}

interface UpdateUserData {
  fullName?: string;
  email?: string;
  phone?: string;
  profilePhotoUrl?: string;
  notificationPreferences?: any;
}

interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

interface CreateStudentData {
  studentCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gradeLevel?: number;
  classId?: string;
  profilePhotoUrl?: string;
  medicalConditions?: string;
  allergies?: string;
  medications?: string;
  emergencyNotes?: string;
  pickupInstructions?: string;
  guardians?: {
    guardianId: string;
    relationship: string;
    isPrimary: boolean;
  }[];
}

interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gradeLevel?: number;
  classId?: string;
  profilePhotoUrl?: string;
  medicalConditions?: string;
  allergies?: string;
  medications?: string;
  emergencyNotes?: string;
  pickupInstructions?: string;
}

export class AdminService {
  private userRepository: Repository<User>;
  private studentRepository: Repository<Student>;
  private classRepository: Repository<Class>;
  private guardianRepository: Repository<StudentGuardian>;
  private pickupRequestRepository: Repository<PickupRequest>;
  private settingsRepository: Repository<SchoolSettings>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.studentRepository = AppDataSource.getRepository(Student);
    this.classRepository = AppDataSource.getRepository(Class);
    this.guardianRepository = AppDataSource.getRepository(StudentGuardian);
    this.pickupRequestRepository = AppDataSource.getRepository(PickupRequest);
    this.settingsRepository = AppDataSource.getRepository(SchoolSettings);
  }

  // ==================== USER MANAGEMENT ====================

  async getAllUsers(filters?: UserFilters) {
    const query = this.userRepository.createQueryBuilder('user');

    if (filters?.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.search) {
      query.andWhere(
        '(user.fullName ILIKE :search OR user.danId ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    query.orderBy('user.createdAt', 'DESC');

    const users = await query.getMany();

    // Remove password from response
    return users.map(({ password, ...user }) => user);
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'danId',
        'fullName',
        'email',
        'phone',
        'role',
        'profilePhotoUrl',
        'isActive',
        'lastLoginAt',
        'failedLoginAttempts',
        'accountLockedUntil',
        'notificationPreferences',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // If parent, get their children
    if (user.role === UserRole.PARENT) {
      const guardianships = await this.guardianRepository.find({
        where: { guardianId: userId, isAuthorized: true },
        relations: ['student', 'student.class'],
      });

      return {
        ...user,
        children: guardianships.map((g) => g.student),
      };
    }

    // If teacher, get their classes
    if (user.role === UserRole.TEACHER) {
      const classes = await this.classRepository.find({
        where: { teacherId: userId, isActive: true },
        relations: ['students'],
      });

      return {
        ...user,
        classes,
      };
    }

    return user;
  }

  async createUser(data: CreateUserData, _createdBy: string) {
    // Check if user with danId already exists
    const existing = await this.userRepository.findOne({
      where: { danId: data.danId },
    });

    if (existing) {
      throw new Error('User with this DAN ID already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
      isActive: true,
      failedLoginAttempts: 0,
    });

    await this.userRepository.save(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(userId: string, data: UpdateUserData, _updatedBy: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, data);
    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(userId: string, _deletedBy: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await this.userRepository.save(user);

    return { success: true, message: 'User deactivated successfully' };
  }

  async toggleUserStatus(userId: string, isActive: boolean, _updatedBy: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = isActive;
    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async resetUserPassword(userId: string, newPassword: string, _resetBy: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;

    await this.userRepository.save(user);

    return { success: true, message: 'Password reset successfully' };
  }

  async unlockUserAccount(userId: string, _unlockedBy: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;

    await this.userRepository.save(user);

    return { success: true, message: 'Account unlocked successfully' };
  }

  // ==================== STUDENT MANAGEMENT ====================

  async getAllStudents(filters?: { classId?: string; isActive?: boolean; search?: string }) {
    const query = this.studentRepository.createQueryBuilder('student').leftJoinAndSelect('student.class', 'class');

    if (filters?.classId) {
      query.andWhere('student.classId = :classId', { classId: filters.classId });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('student.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.search) {
      query.andWhere(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.studentCode ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    query.orderBy('student.lastName', 'ASC').addOrderBy('student.firstName', 'ASC');

    return await query.getMany();
  }

  async getStudentById(studentId: string) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class', 'guardians', 'guardians.guardian'],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get pickup history
    const pickupHistory = await this.pickupRequestRepository.find({
      where: { studentId },
      relations: ['requester', 'approver', 'guard'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      ...student,
      pickupHistory,
    };
  }

  async createStudent(data: CreateStudentData, createdBy: string) {
    // Check if student code already exists
    const existing = await this.studentRepository.findOne({
      where: { studentCode: data.studentCode },
    });

    if (existing) {
      throw new Error('Student with this code already exists');
    }

    const { guardians, ...studentData } = data;

    const student = this.studentRepository.create({
      ...studentData,
      isActive: true,
      enrollmentDate: new Date(),
    });

    await this.studentRepository.save(student);

    // Add guardians if provided
    if (guardians && guardians.length > 0) {
      for (const guardianData of guardians) {
        const guardian = this.guardianRepository.create({
          studentId: student.id,
          guardianId: guardianData.guardianId,
          relationship: guardianData.relationship,
          isPrimary: guardianData.isPrimary,
          isAuthorized: true,
          authorizedBy: createdBy,
          authorizedAt: new Date(),
        });
        await this.guardianRepository.save(guardian);
      }
    }

    return await this.getStudentById(student.id);
  }

  async updateStudent(studentId: string, data: UpdateStudentData, _updatedBy: string) {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });

    if (!student) {
      throw new Error('Student not found');
    }

    Object.assign(student, data);
    await this.studentRepository.save(student);

    return await this.getStudentById(studentId);
  }

  async deleteStudent(studentId: string, _deletedBy: string) {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });

    if (!student) {
      throw new Error('Student not found');
    }

    // Soft delete
    student.isActive = false;
    await this.studentRepository.save(student);

    return { success: true, message: 'Student deactivated successfully' };
  }

  // ==================== GUARDIAN MANAGEMENT ====================

  async addGuardianToStudent(
    studentId: string,
    guardianId: string,
    relationship: string,
    isPrimary: boolean,
    authorizedBy: string
  ) {
    // Check if relationship already exists
    const existing = await this.guardianRepository.findOne({
      where: { studentId, guardianId },
    });

    if (existing) {
      throw new Error('Guardian already associated with this student');
    }

    // If setting as primary, unset other primary guardians
    if (isPrimary) {
      await this.guardianRepository.update({ studentId, isPrimary: true }, { isPrimary: false });
    }

    const guardian = this.guardianRepository.create({
      studentId,
      guardianId,
      relationship,
      isPrimary,
      isAuthorized: true,
      authorizedBy,
      authorizedAt: new Date(),
    });

    return await this.guardianRepository.save(guardian);
  }

  async removeGuardianFromStudent(studentId: string, guardianId: string, _removedBy: string) {
    const guardian = await this.guardianRepository.findOne({
      where: { studentId, guardianId },
    });

    if (!guardian) {
      throw new Error('Guardian relationship not found');
    }

    await this.guardianRepository.remove(guardian);

    return { success: true, message: 'Guardian removed successfully' };
  }

  async updateGuardianAuthorization(
    studentId: string,
    guardianId: string,
    isAuthorized: boolean,
    notes: string,
    updatedBy: string
  ) {
    const guardian = await this.guardianRepository.findOne({
      where: { studentId, guardianId },
    });

    if (!guardian) {
      throw new Error('Guardian relationship not found');
    }

    guardian.isAuthorized = isAuthorized;
    guardian.authorizationNotes = notes;
    guardian.authorizedBy = updatedBy;
    guardian.authorizedAt = new Date();

    return await this.guardianRepository.save(guardian);
  }

  // ==================== CLASS MANAGEMENT ====================

  async getAllClasses(filters?: { isActive?: boolean; gradeLevel?: number }) {
    const query = this.classRepository.createQueryBuilder('class').leftJoinAndSelect('class.teacher', 'teacher').leftJoinAndSelect('class.students', 'students', 'students.isActive = :isActive', { isActive: true });

    if (filters?.isActive !== undefined) {
      query.andWhere('class.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.gradeLevel) {
      query.andWhere('class.gradeLevel = :gradeLevel', { gradeLevel: filters.gradeLevel });
    }

    query.orderBy('class.gradeLevel', 'ASC').addOrderBy('class.className', 'ASC');

    return await query.getMany();
  }

  async getClassById(classId: string) {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['teacher', 'students'],
    });

    if (!classEntity) {
      throw new Error('Class not found');
    }

    return classEntity;
  }

  async assignStudentToClass(studentId: string, classId: string, _assignedBy: string) {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    const classEntity = await this.classRepository.findOne({ where: { id: classId } });

    if (!student) {
      throw new Error('Student not found');
    }

    if (!classEntity) {
      throw new Error('Class not found');
    }

    student.classId = classId;
    student.gradeLevel = classEntity.gradeLevel;

    await this.studentRepository.save(student);

    return { success: true, message: 'Student assigned to class successfully' };
  }

  // ==================== SYSTEM SETTINGS ====================

  async getSettings(category?: string) {
    const query = this.settingsRepository.createQueryBuilder('setting');

    if (category) {
      query.where('setting.category = :category', { category });
    }

    query.orderBy('setting.category', 'ASC').addOrderBy('setting.settingKey', 'ASC');

    return await query.getMany();
  }

  async getSetting(key: string) {
    const setting = await this.settingsRepository.findOne({
      where: { settingKey: key },
    });

    if (!setting) {
      return null;
    }

    return setting;
  }

  async updateSetting(key: string, value: string, updatedBy: string) {
    let setting = await this.settingsRepository.findOne({
      where: { settingKey: key },
    });

    if (!setting) {
      throw new Error('Setting not found');
    }

    setting.settingValue = value;
    setting.updatedBy = updatedBy;

    return await this.settingsRepository.save(setting);
  }

  // ==================== STATISTICS ====================

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    const totalStudents = await this.studentRepository.count();
    const activeStudents = await this.studentRepository.count({ where: { isActive: true } });
    const totalClasses = await this.classRepository.count({ where: { isActive: true } });

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('user.isActive = :isActive', { isActive: true })
      .groupBy('user.role')
      .getRawMany();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count pickups scheduled for today
    const todayPickups = await this.pickupRequestRepository
      .createQueryBuilder('pickup')
      .where('pickup.scheduledPickupTime >= :today', { today })
      .andWhere('pickup.scheduledPickupTime < :tomorrow', { tomorrow })
      .getCount();

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: usersByRole,
      },
      students: {
        total: totalStudents,
        active: activeStudents,
      },
      classes: {
        total: totalClasses,
      },
      pickups: {
        today: todayPickups,
      },
    };
  }
}
