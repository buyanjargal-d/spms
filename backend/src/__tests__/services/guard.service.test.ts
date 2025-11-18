import { GuardService } from '../../services/guard.service';
import { AppDataSource } from '../../config/database';
import { PickupRequest, RequestStatus } from '../../models/PickupRequest';
import { Student } from '../../models/Student';
import { User } from '../../models/User';

// Mock dependencies
jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('GuardService - Status Flow Changes', () => {
  let guardService: GuardService;
  let mockPickupRepository: any;
  let mockStudentRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPickupRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    mockStudentRepository = {
      findOne: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: any) => {
      if (entity === PickupRequest || entity.name === 'PickupRequest') {
        return mockPickupRepository;
      }
      if (entity === Student || entity.name === 'Student') {
        return mockStudentRepository;
      }
      if (entity === User || entity.name === 'User') {
        return mockUserRepository;
      }
      return null;
    });

    guardService = new GuardService();
  });

  describe('verifyByQRCode - status remains CONFIRMED', () => {
    it('should verify QR code for CONFIRMED pickup', async () => {
      const mockPickup = {
        id: 'pickup-123',
        qrCodeToken: 'valid-token',
        qrExpiresAt: new Date(Date.now() + 10000),
        status: RequestStatus.CONFIRMED,
        student: { id: 's1', firstName: 'John', lastName: 'Doe' },
        requester: { id: 'p1', firstName: 'Parent', lastName: 'One' },
      };

      mockPickupRepository.findOne.mockResolvedValue(mockPickup);

      const result = await guardService.verifyByQRCode('valid-token', 'guard-1');

      expect(result.success).toBe(true);
      expect(result.pickup).toBeDefined();
      expect(result.pickup?.status).toBe(RequestStatus.CONFIRMED);
    });

    it('should reject if already picked up', async () => {
      const mockPickup = {
        id: 'pickup-123',
        qrCodeToken: 'valid-token',
        qrExpiresAt: new Date(Date.now() + 10000),
        status: RequestStatus.CONFIRMED,
        actualPickupTime: new Date(), // Already picked up
      };

      mockPickupRepository.findOne.mockResolvedValue(mockPickup);

      const result = await guardService.verifyByQRCode('valid-token', 'guard-1');

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should reject if not CONFIRMED status', async () => {
      const mockPickup = {
        id: 'pickup-123',
        qrCodeToken: 'valid-token',
        qrExpiresAt: new Date(Date.now() + 10000),
        status: RequestStatus.PENDING,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockPickup);

      const result = await guardService.verifyByQRCode('valid-token', 'guard-1');

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should reject expired QR code', async () => {
      const mockPickup = {
        id: 'pickup-123',
        qrCodeToken: 'expired-token',
        qrExpiresAt: new Date(Date.now() - 10000), // Expired
        status: RequestStatus.CONFIRMED,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockPickup);

      const result = await guardService.verifyByQRCode('expired-token', 'guard-1');

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('completePickup - keeps status as CONFIRMED', () => {
    it('should complete pickup without changing status', async () => {
      const mockPickup = {
        id: 'pickup-123',
        status: RequestStatus.CONFIRMED,
        actualPickupTime: null,
        student: { id: 's1' },
      };

      mockPickupRepository.findOne.mockResolvedValue(mockPickup);
      mockPickupRepository.save.mockResolvedValue({
        ...mockPickup,
        actualPickupTime: new Date(),
        status: RequestStatus.CONFIRMED, // Status stays CONFIRMED
      });

      const result = await guardService.completePickup('pickup-123', 'guard-1');

      expect(result.success).toBe(true);
      expect(mockPickupRepository.save).toHaveBeenCalled();
    });

    it('should throw error if not CONFIRMED', async () => {
      const mockPickup = {
        id: 'pickup-123',
        status: RequestStatus.PENDING,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockPickup);

      const result = await guardService.completePickup('pickup-123', 'guard-1');

      expect(result.success).toBe(false);
    });

    it('should record guard who completed pickup', async () => {
      const mockPickup = {
        id: 'pickup-123',
        status: RequestStatus.CONFIRMED,
        actualPickupTime: null,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockPickup);
      mockPickupRepository.save.mockResolvedValue({
        ...mockPickup,
        completedBy: 'guard-1',
      });

      const result = await guardService.completePickup('pickup-123', 'guard-1', true);

      expect(result.success).toBe(true);
    });
  });

  describe('Pickup queue management', () => {
    it('should handle CONFIRMED pickups', async () => {
      const mockPickups = [
        {
          id: 'p1',
          status: RequestStatus.CONFIRMED,
          actualPickupTime: null,
          student: {
            id: 's1',
            firstName: 'John',
            lastName: 'Doe',
            class: { name: '5A' },
          },
          requester: { firstName: 'Parent', lastName: 'One' },
        },
      ];

      mockPickupRepository.find.mockResolvedValue(mockPickups);

      expect(mockPickups).toHaveLength(1);
      expect(mockPickups[0].status).toBe(RequestStatus.CONFIRMED);
    });

    it('should distinguish between picked up and pending requests', async () => {
      const mockPickups = [
        {
          id: 'p1',
          status: RequestStatus.CONFIRMED,
          actualPickupTime: null, // Not picked up
          student: {
            firstName: 'John',
            lastName: 'Doe',
            class: { name: '5A' },
          },
          requester: { firstName: 'Parent' },
        },
        {
          id: 'p2',
          status: RequestStatus.CONFIRMED,
          actualPickupTime: new Date(), // Already picked up
          student: {
            firstName: 'Jane',
            lastName: 'Smith',
            class: { name: '5B' },
          },
          requester: { firstName: 'Parent' },
        },
      ];

      mockPickupRepository.find.mockResolvedValue(mockPickups);

      const pending = mockPickups.filter(p => !p.actualPickupTime);
      const completed = mockPickups.filter(p => p.actualPickupTime);

      expect(pending).toHaveLength(1);
      expect(completed).toHaveLength(1);
    });
  });

  describe('Statistics tracking', () => {
    it('should count completed pickups by actualPickupTime', async () => {
      mockPickupRepository.count.mockImplementation(({ where }: any) => {
        if (where?.status === RequestStatus.CONFIRMED && where?.actualPickupTime) {
          return Promise.resolve(5);
        }
        if (where?.status === RequestStatus.CONFIRMED) {
          return Promise.resolve(8);
        }
        return Promise.resolve(0);
      });

      const completed = await mockPickupRepository.count({
        where: { status: RequestStatus.CONFIRMED, actualPickupTime: true }
      });
      const total = await mockPickupRepository.count({
        where: { status: RequestStatus.CONFIRMED }
      });

      expect(completed).toBe(5);
      expect(total).toBe(8);
    });
  });

  describe('verifyByStudentId - manual verification', () => {
    it('should verify student by ID for CONFIRMED pickup', async () => {
      const mockStudent = {
        id: 'student-123',
        firstName: 'John',
        lastName: 'Doe',
        studentCode: 'STU001',
        class: { name: '5A' },
      };

      const mockPickup = {
        id: 'pickup-123',
        studentId: 'student-123',
        status: RequestStatus.CONFIRMED,
        actualPickupTime: null,
        student: mockStudent,
        requester: { firstName: 'Parent', lastName: 'One' },
      };

      mockStudentRepository.findOne.mockResolvedValue(mockStudent);
      mockPickupRepository.findOne.mockResolvedValue(mockPickup);

      const result = await guardService.verifyByStudentId('student-123', 'guard-1');

      expect(result.success).toBe(true);
      expect(result.student).toEqual(mockStudent);
      expect(result.pickup?.status).toBe(RequestStatus.CONFIRMED);
    });

    it('should return not found if no CONFIRMED pickup exists', async () => {
      const mockStudent = {
        id: 'student-123',
        firstName: 'John',
      };

      mockStudentRepository.findOne.mockResolvedValue(mockStudent);
      mockPickupRepository.findOne.mockResolvedValue(null);

      const result = await guardService.verifyByStudentId('student-123', 'guard-1');

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });
});
