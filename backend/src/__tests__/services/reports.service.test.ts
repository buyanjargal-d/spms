import { ReportsService } from '../../services/reports.service';
import { AppDataSource } from '../../config/database';
import { PickupRequest, RequestStatus } from '../../models/PickupRequest';
import { Student } from '../../models/Student';

// Mock dependencies
jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('ReportsService - Entity Relationship Fixes', () => {
  let reportsService: ReportsService;
  let mockPickupRepository: any;
  let mockStudentRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPickupRepository = {
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    mockStudentRepository = {
      findOne: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: any) => {
      if (entity === PickupRequest || entity.name === 'PickupRequest') {
        return mockPickupRepository;
      }
      if (entity === Student || entity.name === 'Student') {
        return mockStudentRepository;
      }
      return null;
    });

    reportsService = new ReportsService();
  });

  describe('generateDailyReport - uses guard instead of completedByUser', () => {
    it('should join with guard entity correctly', async () => {
      const mockQueryBuilder = mockPickupRepository.createQueryBuilder();
      const mockPickups = [
        {
          id: 'pickup-1',
          status: RequestStatus.CONFIRMED,
          actualPickupTime: new Date(),
          student: { id: 's1', firstName: 'John' },
          requester: { id: 'p1', firstName: 'Parent' },
          guard: { id: 'g1', firstName: 'Guard' }, // CORRECT: uses 'guard', not 'completedByUser'
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockPickups);

      const result = await reportsService.generateDailyReport(new Date());

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'pickup.guard',
        'completedBy'
      );
      expect(result.pickups).toBeDefined();
    });

    it('should calculate stats based on actualPickupTime', async () => {
      const mockQueryBuilder = mockPickupRepository.createQueryBuilder();
      const now = new Date();
      const mockPickups = [
        {
          id: 'p1',
          status: RequestStatus.CONFIRMED,
          actualPickupTime: now,
          scheduledPickupTime: now,
        },
        {
          id: 'p2',
          status: RequestStatus.PENDING,
          actualPickupTime: null,
          scheduledPickupTime: now,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockPickups);

      const result = await reportsService.generateDailyReport(new Date());

      expect(result.summary.total).toBe(2);
      expect(result.summary.completed).toBe(1); // Only one has actualPickupTime
      expect(result.summary.pending).toBe(2); // Both are pending/confirmed
    });
  });

  describe('generateMonthlyReport - uses guard instead of completedByUser', () => {
    it('should use guard relation in find options', async () => {
      const mockPickups = [
        {
          id: 'pickup-1',
          student: {},
          requester: {},
          guard: {}, // CORRECT: uses 'guard'
        },
      ];

      mockPickupRepository.find.mockResolvedValue(mockPickups);

      await reportsService.generateMonthlyReport(2025, 1);

      expect(mockPickupRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: expect.arrayContaining(['guard']),
        })
      );
    });

    it('should count completed pickups by actualPickupTime', async () => {
      const mockPickups = [
        { id: 'p1', actualPickupTime: new Date(), scheduledPickupTime: new Date() },
        { id: 'p2', actualPickupTime: new Date(), scheduledPickupTime: new Date() },
        { id: 'p3', actualPickupTime: null, scheduledPickupTime: new Date() },
      ];

      mockPickupRepository.find.mockResolvedValue(mockPickups);

      const result = await reportsService.generateMonthlyReport(2025, 1);

      expect(result.summary.total).toBe(3);
      expect(result.summary.completed).toBe(2); // Only 2 have actualPickupTime
    });
  });

  describe('generateStudentHistoryReport - uses guard instead of completedByUser', () => {
    it('should join with guard entity in query builder', async () => {
      const mockStudent = {
        id: 'student-123',
        firstName: 'John',
        class: {},
        guardians: [],
      };

      mockStudentRepository.findOne.mockResolvedValue(mockStudent);

      const mockQueryBuilder = mockPickupRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await reportsService.generateStudentHistoryReport(
        'student-123',
        new Date('2025-01-01'),
        new Date('2025-12-31')
      );

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'pickup.guard',
        'completedBy'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'pickup.requester',
        'requester'
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'pickup.approver',
        'approver'
      );
    });

    it('should throw error if student not found', async () => {
      mockStudentRepository.findOne.mockResolvedValue(null);

      await expect(
        reportsService.generateStudentHistoryReport(
          'nonexistent',
          new Date(),
          new Date()
        )
      ).rejects.toThrow('Student not found');
    });

    it('should calculate completion stats correctly', async () => {
      const mockStudent = { id: 's1', firstName: 'John' };
      mockStudentRepository.findOne.mockResolvedValue(mockStudent);

      const mockQueryBuilder = mockPickupRepository.createQueryBuilder();
      const mockPickups = [
        {
          id: 'p1',
          actualPickupTime: new Date(),
          scheduledPickupTime: new Date(),
        },
        {
          id: 'p2',
          actualPickupTime: null,
          scheduledPickupTime: new Date(),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockPickups);

      const result = await reportsService.generateStudentHistoryReport(
        's1',
        new Date('2025-01-01'),
        new Date('2025-12-31')
      );

      expect(result.summary.total).toBe(2);
      expect(result.summary.completed).toBe(1);
    });
  });

  describe('getPickupAnalytics - uses CONFIRMED status', () => {
    it('should count CONFIRMED status instead of COMPLETED', async () => {
      mockPickupRepository.count.mockImplementation(({ where }: any) => {
        if (where?.status === RequestStatus.CONFIRMED) {
          return Promise.resolve(10);
        }
        return Promise.resolve(0);
      });

      const result = await reportsService.getPickupAnalytics();

      expect(mockPickupRepository.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: RequestStatus.CONFIRMED,
          }),
        })
      );
      expect(result.completedPickups).toBe(10);
    });
  });

  describe('Weekly breakdown - uses actualPickupTime', () => {
    it('should group by week based on scheduledPickupTime', async () => {
      const mockPickups = [
        {
          id: 'p1',
          scheduledPickupTime: new Date('2025-01-06'), // Week 1
          actualPickupTime: new Date(),
        },
        {
          id: 'p2',
          scheduledPickupTime: new Date('2025-01-13'), // Week 2
          actualPickupTime: new Date(),
        },
        {
          id: 'p3',
          scheduledPickupTime: new Date('2025-01-13'), // Week 2
          actualPickupTime: null,
        },
      ];

      mockPickupRepository.find.mockResolvedValue(mockPickups);

      const result = await reportsService.generateMonthlyReport(2025, 1);

      expect(result.weeklyBreakdown).toBeDefined();
      expect(result.weeklyBreakdown.length).toBeGreaterThan(0);
    });
  });
});
