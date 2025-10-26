import { Repository } from 'typeorm';
import { Student } from '../models/Student';
import { StudentGuardian } from '../models/StudentGuardian';
import { AppDataSource } from '../config/database';

export class StudentService {
  private studentRepository: Repository<Student>;
  private studentGuardianRepository: Repository<StudentGuardian>;

  constructor() {
    this.studentRepository = AppDataSource.getRepository(Student);
    this.studentGuardianRepository = AppDataSource.getRepository(StudentGuardian);
  }

  /**
   * Get all students with optional filters
   */
  async getAllStudents(filters?: {
    classId?: string;
    gradeLevel?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<Student[]> {
    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.class', 'class')
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('student.firstName', 'ASC');

    if (filters?.classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId: filters.classId });
    }

    if (filters?.gradeLevel !== undefined) {
      queryBuilder.andWhere('student.gradeLevel = :gradeLevel', { gradeLevel: filters.gradeLevel });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('student.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.studentCode ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder.getMany();
  }

  /**
   * Get student by ID
   */
  async getStudentById(studentId: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class'],
    });
  }

  /**
   * Get student by code
   */
  async getStudentByCode(studentCode: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { studentCode },
      relations: ['class'],
    });
  }

  /**
   * Get guardians for a student
   */
  async getStudentGuardians(studentId: string) {
    const guardians = await this.studentGuardianRepository.find({
      where: { studentId },
      relations: ['guardian'],
      order: { isPrimary: 'DESC' },
    });

    return guardians.map(sg => ({
      ...sg.guardian,
      relationship: sg.relationship,
      isPrimary: sg.isPrimary,
      isAuthorized: sg.isAuthorized,
    }));
  }

  /**
   * Verify if a user can pick up a student
   */
  async canUserPickupStudent(userId: string, studentId: string): Promise<boolean> {
    const guardianRelation = await this.studentGuardianRepository.findOne({
      where: {
        studentId,
        guardianId: userId,
        isAuthorized: true,
      },
    });

    return !!guardianRelation;
  }
}
