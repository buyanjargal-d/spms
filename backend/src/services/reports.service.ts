import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { PickupRequest, RequestStatus } from '../models/PickupRequest';
import { Student } from '../models/Student';
import { User } from '../models/User';

interface DailyReportFilters {
  classId?: string;
  gradeLevel?: number;
  status?: RequestStatus;
}

export class ReportsService {
  private pickupRepository: Repository<PickupRequest>;
  private studentRepository: Repository<Student>;
  private userRepository: Repository<User>;

  constructor() {
    this.pickupRepository = AppDataSource.getRepository(PickupRequest);
    this.studentRepository = AppDataSource.getRepository(Student);
    this.userRepository = AppDataSource.getRepository(User);
  }

  // ==================== DAILY PICKUP REPORT ====================

  async generateDailyReport(date: Date, filters?: DailyReportFilters) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Build query with filters
    const query = this.pickupRepository.createQueryBuilder('pickup')
      .leftJoinAndSelect('pickup.student', 'student')
      .leftJoinAndSelect('student.class', 'class')
      .leftJoinAndSelect('pickup.requester', 'requester')
      .leftJoinAndSelect('pickup.guard', 'completedBy')
      .where('pickup.scheduledPickupTime BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay
      });

    if (filters?.classId) {
      query.andWhere('student.classId = :classId', { classId: filters.classId });
    }

    if (filters?.gradeLevel) {
      query.andWhere('student.gradeLevel = :gradeLevel', { gradeLevel: filters.gradeLevel });
    }

    if (filters?.status) {
      query.andWhere('pickup.status = :status', { status: filters.status });
    }

    query.orderBy('pickup.scheduledPickupTime', 'ASC');

    const pickups = await query.getMany();

    // Calculate statistics
    const stats = this.calculateDailyStats(pickups);
    const hourlyDistribution = this.groupByHour(pickups);
    const typeBreakdown = this.groupByType(pickups);
    const guardianTypeBreakdown = this.groupByGuardianType(pickups);

    return {
      date,
      summary: stats,
      pickups,
      hourlyDistribution,
      typeBreakdown,
      guardianTypeBreakdown,
    };
  }

  private calculateDailyStats(pickups: PickupRequest[]) {
    const total = pickups.length;
    const completed = pickups.filter(p => p.actualPickupTime !== null && p.actualPickupTime !== undefined).length;
    const pending = pickups.filter(p => p.status === RequestStatus.PENDING || p.status === RequestStatus.CONFIRMED).length;
    const cancelled = pickups.filter(p => p.status === RequestStatus.CANCELLED).length;

    // Calculate on-time performance
    let onTime = 0;
    let late = 0;
    let early = 0;

    pickups.forEach(pickup => {
      if (pickup.actualPickupTime && pickup.scheduledPickupTime) {
        const scheduledTime = new Date(pickup.scheduledPickupTime).getTime();
        const actualTime = new Date(pickup.actualPickupTime || pickup.scheduledPickupTime).getTime();
        const diffMinutes = (actualTime - scheduledTime) / (1000 * 60);

        if (diffMinutes >= -15 && diffMinutes <= 15) {
          onTime++;
        } else if (diffMinutes > 15) {
          late++;
        } else {
          early++;
        }
      }
    });

    return {
      total,
      completed,
      pending,
      cancelled,
      onTime,
      late,
      early,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      onTimeRate: (onTime + late + early) > 0 ? Math.round((onTime / (onTime + late + early)) * 100) : 0,
    };
  }

  private groupByHour(pickups: PickupRequest[]) {
    const hourly: { [hour: string]: number } = {};

    pickups.forEach(pickup => {
      if (!pickup.scheduledPickupTime) return;
      const hour = new Date(pickup.scheduledPickupTime).getHours();
      const hourKey = `${hour}:00`;
      hourly[hourKey] = (hourly[hourKey] || 0) + 1;
    });

    return Object.entries(hourly).map(([hour, count]) => ({ hour, count }));
  }

  private groupByType(pickups: PickupRequest[]) {
    const types: { [type: string]: number } = {};

    pickups.forEach(pickup => {
      const type = pickup.requestType || 'standard';
      types[type] = (types[type] || 0) + 1;
    });

    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
      percentage: pickups.length > 0 ? Math.round((count / pickups.length) * 100) : 0
    }));
  }

  private groupByGuardianType(pickups: PickupRequest[]) {
    const types = {
      parent: 0,
      guardian: 0,
      guest: 0,
    };

    pickups.forEach(pickup => {
      if (pickup.requestType === 'guest') {
        types.guest++;
      } else if (pickup.requester) {
        types.parent++;
      } else {
        types.guardian++;
      }
    });

    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
      percentage: pickups.length > 0 ? Math.round((count / pickups.length) * 100) : 0
    }));
  }

  // ==================== MONTHLY SUMMARY REPORT ====================

  async generateMonthlyReport(year: number, month: number, _filters?: any) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const pickups = await this.pickupRepository.find({
      where: {
        scheduledPickupTime: Between(startDate, endDate),
      },
      relations: ['student', 'student.class', 'requester', 'guard'],
      order: { scheduledPickupTime: 'ASC' },
    });

    // Calculate statistics
    const summary = this.calculateMonthlySummary(pickups, startDate, endDate);
    const weeklyBreakdown = this.groupByWeek(pickups, startDate);
    const topGuardians = await this.getTopGuardians(pickups, 10);
    const classAnalysis = this.analyzeByClass(pickups);

    return {
      month: { year, month },
      dateRange: { startDate, endDate },
      summary,
      weeklyBreakdown,
      topGuardians,
      classAnalysis,
    };
  }

  private calculateMonthlySummary(pickups: PickupRequest[], startDate: Date, endDate: Date) {
    const totalPickups = pickups.length;
    const completed = pickups.filter(p => p.actualPickupTime !== null && p.actualPickupTime !== undefined).length;
    const cancelled = pickups.filter(p => p.status === RequestStatus.CANCELLED).length;

    // Calculate school days (excluding weekends)
    let schoolDays = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        schoolDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const avgPerDay = schoolDays > 0 ? Math.round(totalPickups / schoolDays * 10) / 10 : 0;

    // Get unique students and guardians
    const uniqueStudents = new Set(pickups.map(p => p.studentId)).size;
    const uniqueGuardians = new Set(pickups.map(p => p.requesterId)).size;

    return {
      totalPickups,
      completed,
      cancelled,
      schoolDays,
      avgPerDay,
      uniqueStudents,
      uniqueGuardians,
      completionRate: totalPickups > 0 ? Math.round((completed / totalPickups) * 100) : 0,
    };
  }

  private groupByWeek(pickups: PickupRequest[], startDate: Date) {
    const weeks: { [week: string]: PickupRequest[] } = {};

    pickups.forEach(pickup => {
      if (!pickup.scheduledPickupTime) return;
      const date = new Date(pickup.scheduledPickupTime);
      const weekNum = Math.ceil((date.getDate() - startDate.getDate() + 1) / 7);
      const weekKey = `Week ${weekNum}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(pickup);
    });

    return Object.entries(weeks).map(([week, weekPickups]) => {
      const completed = weekPickups.filter(p => p.actualPickupTime !== null && p.actualPickupTime !== undefined).length;
      const cancelled = weekPickups.filter(p => p.status === RequestStatus.CANCELLED).length;

      return {
        week,
        total: weekPickups.length,
        completed,
        cancelled,
        completionRate: weekPickups.length > 0 ? Math.round((completed / weekPickups.length) * 100) : 0,
      };
    });
  }

  private async getTopGuardians(pickups: PickupRequest[], limit: number) {
    const guardianPickups: { [guardianId: string]: { count: number; onTime: number; late: number } } = {};

    pickups.forEach(pickup => {
      if (pickup.requesterId) {
        if (!guardianPickups[pickup.requesterId]) {
          guardianPickups[pickup.requesterId] = { count: 0, onTime: 0, late: 0 };
        }
        guardianPickups[pickup.requesterId].count++;

        if (pickup.actualPickupTime && pickup.scheduledPickupTime) {
          const scheduledTime = new Date(pickup.scheduledPickupTime).getTime();
          const actualTime = new Date(pickup.actualPickupTime || pickup.scheduledPickupTime).getTime();
          const diffMinutes = (actualTime - scheduledTime) / (1000 * 60);

          if (diffMinutes >= -15 && diffMinutes <= 15) {
            guardianPickups[pickup.requesterId].onTime++;
          } else if (diffMinutes > 15) {
            guardianPickups[pickup.requesterId].late++;
          }
        }
      }
    });

    // Get guardian details and sort
    const guardianData = await Promise.all(
      Object.entries(guardianPickups).map(async ([guardianId, data]) => {
        const guardian = await this.userRepository.findOne({ where: { id: guardianId } });
        return {
          guardian,
          pickups: data.count,
          onTime: data.onTime,
          late: data.late,
          onTimeRate: data.count > 0 ? Math.round((data.onTime / data.count) * 100) : 0,
        };
      })
    );

    return guardianData
      .sort((a, b) => b.pickups - a.pickups)
      .slice(0, limit);
  }

  private analyzeByClass(pickups: PickupRequest[]) {
    const classCounts: { [classId: string]: {
      className: string;
      pickups: number;
      students: Set<string>;
    } } = {};

    pickups.forEach(pickup => {
      if (pickup.student?.classId) {
        const classId = pickup.student.classId;
        if (!classCounts[classId]) {
          classCounts[classId] = {
            className: pickup.student.class?.className || 'Unknown',
            pickups: 0,
            students: new Set(),
          };
        }
        classCounts[classId].pickups++;
        classCounts[classId].students.add(pickup.studentId);
      }
    });

    return Object.entries(classCounts).map(([classId, data]) => ({
      classId,
      className: data.className,
      totalPickups: data.pickups,
      uniqueStudents: data.students.size,
      avgPerStudent: data.students.size > 0 ? Math.round(data.pickups / data.students.size * 10) / 10 : 0,
    }));
  }

  // ==================== STUDENT HISTORY REPORT ====================

  async generateStudentHistoryReport(
    studentId: string,
    startDate: Date,
    endDate: Date,
    filters?: any
  ) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class', 'guardians', 'guardians.guardian'],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const query = this.pickupRepository.createQueryBuilder('pickup')
      .leftJoinAndSelect('pickup.requester', 'requester')
      .leftJoinAndSelect('pickup.guard', 'completedBy')
      .leftJoinAndSelect('pickup.approver', 'approver')
      .where('pickup.studentId = :studentId', { studentId })
      .andWhere('pickup.scheduledPickupTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });

    if (filters?.guardianId) {
      query.andWhere('pickup.requesterId = :guardianId', { guardianId: filters.guardianId });
    }

    if (filters?.type) {
      query.andWhere('pickup.requestType = :type', { type: filters.type });
    }

    if (filters?.status) {
      query.andWhere('pickup.status = :status', { status: filters.status });
    }

    query.orderBy('pickup.scheduledPickupTime', 'DESC');

    const pickups = await query.getMany();

    // Calculate statistics
    const stats = this.calculateStudentStats(pickups);
    const guardianActivity = this.analyzeGuardianActivity(pickups);

    return {
      student,
      dateRange: { startDate, endDate },
      authorizedGuardians: student.guardians,
      pickups,
      statistics: stats,
      guardianActivity,
    };
  }

  private calculateStudentStats(pickups: PickupRequest[]) {
    const total = pickups.length;
    const completed = pickups.filter(p => p.actualPickupTime !== null && p.actualPickupTime !== undefined).length;
    const cancelled = pickups.filter(p => p.status === RequestStatus.CANCELLED).length;

    // Calculate average pickup time
    const completedPickups = pickups.filter(p => p.actualPickupTime && p.scheduledPickupTime);
    const avgTime = this.calculateAverageTime(completedPickups.map(p => p.scheduledPickupTime ? new Date(p.scheduledPickupTime) : new Date()));

    // Find most frequent guardian
    const guardianCounts: { [id: string]: number } = {};
    pickups.forEach(p => {
      if (p.requesterId) {
        guardianCounts[p.requesterId] = (guardianCounts[p.requesterId] || 0) + 1;
      }
    });
    const mostFrequentGuardianId = Object.entries(guardianCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      total,
      completed,
      cancelled,
      avgPickupTime: avgTime,
      mostFrequentGuardianId,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  private analyzeGuardianActivity(pickups: PickupRequest[]) {
    const guardianData: { [id: string]: { count: number; guardian?: User } } = {};

    pickups.forEach(pickup => {
      if (pickup.requesterId) {
        if (!guardianData[pickup.requesterId]) {
          guardianData[pickup.requesterId] = {
            count: 0,
            guardian: pickup.requester
          };
        }
        guardianData[pickup.requesterId].count++;
      }
    });

    return Object.entries(guardianData).map(([guardianId, data]) => ({
      guardianId,
      guardian: data.guardian,
      pickups: data.count,
      percentage: pickups.length > 0 ? Math.round((data.count / pickups.length) * 100) : 0,
    }));
  }

  private calculateAverageTime(dates: Date[]): string {
    if (dates.length === 0) return '--:--';

    const totalMinutes = dates.reduce((sum, date) => {
      return sum + date.getHours() * 60 + date.getMinutes();
    }, 0);

    const avgMinutes = Math.round(totalMinutes / dates.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // ==================== ANALYTICS ====================

  async getPickupTrends(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
    const pickups = await this.pickupRepository.find({
      where: {
        scheduledPickupTime: Between(startDate, endDate),
      },
      order: { scheduledPickupTime: 'ASC' },
    });

    return this.groupPickupsByPeriod(pickups, groupBy);
  }

  private groupPickupsByPeriod(pickups: PickupRequest[], groupBy: 'day' | 'week' | 'month') {
    const grouped: { [key: string]: number } = {};

    pickups.forEach(pickup => {
      if (!pickup.scheduledPickupTime) return;
      const date = new Date(pickup.scheduledPickupTime);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekNum = this.getWeekNumber(date);
        key = `${date.getFullYear()}-W${weekNum}`;
      } else {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped).map(([period, count]) => ({ period, count }));
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPickups = await this.pickupRepository.count({
      where: {
        scheduledPickupTime: Between(today, tomorrow),
      },
    });

    const totalPickups = await this.pickupRepository.count();
    const completedPickups = await this.pickupRepository.count({
      where: { status: RequestStatus.CONFIRMED },
    });

    return {
      todayPickups,
      totalPickups,
      completedPickups,
      completionRate: totalPickups > 0 ? Math.round((completedPickups / totalPickups) * 100) : 0,
    };
  }
}
