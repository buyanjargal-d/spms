import { Repository, Between, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Class } from '../models/Class';
import { Student } from '../models/Student';
import { PickupRequest, RequestStatus } from '../models/PickupRequest';

interface TeacherStats {
  pendingApprovals: number;
  todayPickups: number;
  completedToday: number;
  myClassStudents: number;
}

interface PickupSummary {
  totalScheduled: number;
  completed: number;
  pending: number;
  approved: number;
  byType: {
    standard: number;
    advance: number;
    guest: number;
  };
  pickups: PickupRequest[];
}

export class TeacherService {
  private classRepository: Repository<Class>;
  private studentRepository: Repository<Student>;
  private pickupRepository: Repository<PickupRequest>;

  constructor() {
    this.classRepository = AppDataSource.getRepository(Class);
    this.studentRepository = AppDataSource.getRepository(Student);
    this.pickupRepository = AppDataSource.getRepository(PickupRequest);
  }

  /**
   * Get teacher's assigned class
   */
  async getTeacherClass(teacherId: string): Promise<Class | null> {
    const teacherClass = await this.classRepository.findOne({
      where: { teacherId },
      relations: ['students'],
    });

    return teacherClass;
  }

  /**
   * Get all students in teacher's class
   */
  async getTeacherStudents(teacherId: string): Promise<Student[]> {
    const teacherClass = await this.getTeacherClass(teacherId);

    if (!teacherClass) {
      return [];
    }

    const students = await this.studentRepository.find({
      where: { classId: teacherClass.id },
      relations: ['class', 'guardians', 'guardians.guardian'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    return students;
  }

  /**
   * Get dashboard statistics for teacher
   */
  async getTeacherStats(teacherId: string): Promise<TeacherStats> {
    const teacherClass = await this.getTeacherClass(teacherId);

    // Get student count in teacher's class
    const myClassStudents = teacherClass?.students?.length || 0;

    // Get all pickup requests for students in teacher's class
    let pendingApprovals = 0;
    let todayPickups = 0;
    let completedToday = 0;

    if (teacherClass) {
      const studentIds = await this.studentRepository.find({
        where: { classId: teacherClass.id },
        select: ['id'],
      });

      const ids = studentIds.map(s => s.id);

      if (ids.length > 0) {
        // Count pending approvals
        pendingApprovals = await this.pickupRepository.count({
          where: {
            studentId: In(ids),
            status: RequestStatus.PENDING,
          },
        });

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Count today's pickups (all status)
        todayPickups = await this.pickupRepository.count({
          where: {
            studentId: In(ids),
            requestedTime: Between(today, tomorrow),
          },
        });

        // Count completed today
        completedToday = await this.pickupRepository.count({
          where: {
            studentId: In(ids),
            status: RequestStatus.CONFIRMED,
            actualPickupTime: Between(today, tomorrow),
          },
        });
      }
    }

    return {
      pendingApprovals,
      todayPickups,
      completedToday,
      myClassStudents,
    };
  }

  /**
   * Get today's pickup summary
   */
  async getPickupSummary(teacherId: string, date?: Date): Promise<PickupSummary> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const teacherClass = await this.getTeacherClass(teacherId);

    const summary: PickupSummary = {
      totalScheduled: 0,
      completed: 0,
      pending: 0,
      approved: 0,
      byType: {
        standard: 0,
        advance: 0,
        guest: 0,
      },
      pickups: [],
    };

    if (!teacherClass) {
      return summary;
    }

    const studentIds = await this.studentRepository.find({
      where: { classId: teacherClass.id },
      select: ['id'],
    });

    const ids = studentIds.map(s => s.id);

    if (ids.length === 0) {
      return summary;
    }

    // Get all pickups for today
    const pickups = await this.pickupRepository.find({
      where: {
        studentId: In(ids),
        requestedTime: Between(targetDate, nextDay),
      },
      relations: ['student', 'student.class', 'requester', 'pickupPerson'],
      order: { requestedTime: 'ASC' },
    });

    summary.pickups = pickups;
    summary.totalScheduled = pickups.length;

    // Calculate statistics
    pickups.forEach(pickup => {
      // By status
      if (pickup.actualPickupTime) {
        summary.completed++;
      } else if (pickup.status === RequestStatus.PENDING) {
        summary.pending++;
      } else if (pickup.status === RequestStatus.CONFIRMED) {
        summary.approved++;
      }

      // By type
      if (pickup.requestType === 'standard') {
        summary.byType.standard++;
      } else if (pickup.requestType === 'advance') {
        summary.byType.advance++;
      } else if (pickup.requestType === 'guest') {
        summary.byType.guest++;
      }
    });

    return summary;
  }

  /**
   * Check if teacher can access a student (student is in teacher's class)
   */
  async canAccessStudent(teacherId: string, studentId: string): Promise<boolean> {
    const teacherClass = await this.getTeacherClass(teacherId);

    if (!teacherClass) {
      return false;
    }

    const student = await this.studentRepository.findOne({
      where: {
        id: studentId,
        classId: teacherClass.id,
      },
    });

    return !!student;
  }

  /**
   * Get student IDs in teacher's class
   */
  async getTeacherStudentIds(teacherId: string): Promise<string[]> {
    const teacherClass = await this.getTeacherClass(teacherId);

    if (!teacherClass) {
      return [];
    }

    const students = await this.studentRepository.find({
      where: { classId: teacherClass.id },
      select: ['id'],
    });

    return students.map(s => s.id);
  }
}
