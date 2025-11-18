import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Student } from '../models/Student';
import { StudentGuardian } from '../models/StudentGuardian';
import { PickupRequest, RequestStatus } from '../models/PickupRequest';
import { User } from '../models/User';

interface ParentRequestFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

interface ParentStats {
  totalChildren: number;
  activeRequests: number;
  pendingRequests: number;
  completedToday: number;
}

export class ParentService {
  private guardianRepository: Repository<StudentGuardian>;
  private pickupRepository: Repository<PickupRequest>;

  constructor() {
    this.guardianRepository = AppDataSource.getRepository(StudentGuardian);
    this.pickupRepository = AppDataSource.getRepository(PickupRequest);
  }

  /**
   * Get all children for a parent
   */
  async getParentChildren(parentId: string): Promise<Student[]> {
    // Get all student-guardian relationships for this parent
    const guardianships = await this.guardianRepository.find({
      where: { guardianId: parentId },
      relations: ['student', 'student.class'],
    });

    return guardianships.map(g => g.student);
  }

  /**
   * Get parent's pickup requests with optional filters
   */
  async getParentRequests(
    parentId: string,
    filters: ParentRequestFilters
  ): Promise<PickupRequest[]> {
    const where: any = { requesterId: parentId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      where.requestedTime = Between(filters.startDate, filters.endDate);
    }

    return this.pickupRepository.find({
      where,
      relations: ['student', 'student.class', 'pickupPerson'],
      order: { requestedTime: 'DESC' },
    });
  }

  /**
   * Check if parent can access a student
   */
  async canAccessStudent(parentId: string, studentId: string): Promise<boolean> {
    const guardianship = await this.guardianRepository.findOne({
      where: {
        guardianId: parentId,
        studentId: studentId,
      },
    });

    return !!guardianship;
  }

  /**
   * Get all authorized guardians for a student
   */
  async getStudentGuardians(studentId: string): Promise<User[]> {
    const guardianships = await this.guardianRepository.find({
      where: { studentId },
      relations: ['guardian'],
    });

    return guardianships.map(g => g.guardian);
  }

  /**
   * Get dashboard statistics for parent
   */
  async getParentStats(parentId: string): Promise<ParentStats> {
    // Get total children count
    const children = await this.getParentChildren(parentId);
    const totalChildren = children.length;

    // Get all requests for this parent
    const allRequests = await this.pickupRepository.find({
      where: { requesterId: parentId },
    });

    // Count active requests (pending or approved)
    const activeRequests = allRequests.filter(
      r => r.status === RequestStatus.PENDING || r.status === RequestStatus.CONFIRMED
    ).length;

    // Count pending requests
    const pendingRequests = allRequests.filter(
      r => r.status === RequestStatus.PENDING
    ).length;

    // Count completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = allRequests.filter(r => {
      if (!r.actualPickupTime) return false;
      const pickupDate = new Date(r.actualPickupTime);
      return pickupDate >= today && pickupDate < tomorrow;
    }).length;

    return {
      totalChildren,
      activeRequests,
      pendingRequests,
      completedToday,
    };
  }

  /**
   * Get student IDs that parent can access
   */
  async getParentStudentIds(parentId: string): Promise<string[]> {
    const guardianships = await this.guardianRepository.find({
      where: { guardianId: parentId },
    });

    return guardianships.map(g => g.studentId);
  }
}
