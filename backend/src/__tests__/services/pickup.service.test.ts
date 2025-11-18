import { PickupService } from '../../services/pickup.service';
import { AppDataSource } from '../../config/database';
import { PickupRequest, RequestStatus, RequestType } from '../../models/PickupRequest';
import { GuestApprovalService } from '../../services/guestApproval.service';

// Mock dependencies
jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('../../services/guestApproval.service');
jest.mock('../../utils/logger');

describe('PickupService - New Changes', () => {
  let pickupService: PickupService;
  let mockPickupRepository: any;
  let mockGuestApprovalService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPickupRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    mockGuestApprovalService = {
      createGuestApprovals: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockPickupRepository);
    (GuestApprovalService as jest.Mock).mockImplementation(() => mockGuestApprovalService);

    pickupService = new PickupService();
  });

  describe('createPickupRequest - with location notification', () => {
    it('should create pickup request and log location notification', async () => {
      const requestData = {
        studentId: 'student-123',
        requestType: RequestType.STANDARD,
        scheduledPickupTime: new Date(),
      };

      const mockRequest = {
        id: 'pickup-123',
        ...requestData,
        requesterId: 'parent-123',
        status: RequestStatus.PENDING,
      };

      mockPickupRepository.create.mockReturnValue(mockRequest);
      mockPickupRepository.save.mockResolvedValue(mockRequest);

      const result = await pickupService.createPickupRequest('parent-123', requestData);

      expect(result).toEqual(mockRequest);
      expect(mockPickupRepository.create).toHaveBeenCalledWith({
        ...requestData,
        requesterId: 'parent-123',
        requestedTime: expect.any(Date),
        status: RequestStatus.PENDING,
      });
      expect(mockPickupRepository.save).toHaveBeenCalled();
    });

    it('should create guest pickup with PENDING_PARENT_APPROVAL status', async () => {
      const requestData = {
        studentId: 'student-123',
        requestType: RequestType.GUEST,
        scheduledPickupTime: new Date(),
      };

      const mockRequest = {
        id: 'pickup-123',
        ...requestData,
        status: RequestStatus.PENDING_PARENT_APPROVAL,
      };

      mockPickupRepository.create.mockReturnValue(mockRequest);
      mockPickupRepository.save.mockResolvedValue(mockRequest);

      await pickupService.createPickupRequest('parent-123', requestData);

      expect(mockPickupRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: RequestStatus.PENDING_PARENT_APPROVAL,
        })
      );
      expect(mockGuestApprovalService.createGuestApprovals).toHaveBeenCalledWith(
        'pickup-123',
        'student-123'
      );
    });
  });

  describe('approvePickupRequest - CONFIRMED status', () => {
    it('should change status to CONFIRMED instead of APPROVED', async () => {
      const mockRequest = {
        id: 'pickup-123',
        status: RequestStatus.PENDING,
        updatedAt: new Date(),
      };

      mockPickupRepository.findOne.mockResolvedValue(mockRequest);
      mockPickupRepository.save.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.CONFIRMED,
      });

      const result = await pickupService.approvePickupRequest('pickup-123');

      expect(result.status).toBe(RequestStatus.CONFIRMED);
      expect(mockPickupRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: RequestStatus.CONFIRMED,
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should throw error if request is not pending', async () => {
      const mockRequest = {
        id: 'pickup-123',
        status: RequestStatus.CONFIRMED,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        pickupService.approvePickupRequest('pickup-123')
      ).rejects.toThrow('Only pending requests can be approved');
    });
  });

  describe('completePickupRequest - no status change', () => {
    it('should update pickup details but keep status as CONFIRMED', async () => {
      const mockRequest = {
        id: 'pickup-123',
        status: RequestStatus.CONFIRMED,
        actualPickupTime: null,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockRequest);
      mockPickupRepository.save.mockResolvedValue({
        ...mockRequest,
        actualPickupTime: new Date(),
        status: RequestStatus.CONFIRMED, // Status stays CONFIRMED
      });

      const result = await pickupService.completePickupRequest('pickup-123', {
        actualPickupTime: new Date(),
      });

      expect(result.status).toBe(RequestStatus.CONFIRMED);
      expect(result.actualPickupTime).toBeDefined();
      expect(mockPickupRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: RequestStatus.CONFIRMED,
          actualPickupTime: expect.any(Date),
        })
      );
    });

    it('should throw error if status is not CONFIRMED', async () => {
      const mockRequest = {
        id: 'pickup-123',
        status: RequestStatus.PENDING,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        pickupService.completePickupRequest('pickup-123', {})
      ).rejects.toThrow('Only confirmed requests can be picked up');
    });

    it('should update location coordinates when provided', async () => {
      const mockRequest = {
        id: 'pickup-123',
        status: RequestStatus.CONFIRMED,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockRequest);
      mockPickupRepository.save.mockResolvedValue({
        ...mockRequest,
        pickupLocationLat: 47.9184,
        pickupLocationLng: 106.9177,
      });

      const result = await pickupService.completePickupRequest('pickup-123', {
        pickupLocationLat: 47.9184,
        pickupLocationLng: 106.9177,
      });

      expect(result.pickupLocationLat).toBe(47.9184);
      expect(result.pickupLocationLng).toBe(106.9177);
    });
  });

  describe('cancelPickupRequest - check actualPickupTime', () => {
    it('should cancel request if not picked up yet', async () => {
      const mockRequest = {
        id: 'pickup-123',
        requesterId: 'parent-123',
        status: RequestStatus.CONFIRMED,
        actualPickupTime: null,
      };

      mockPickupRepository.findOne.mockResolvedValue(mockRequest);
      mockPickupRepository.save.mockResolvedValue({
        ...mockRequest,
        status: RequestStatus.CANCELLED,
      });

      const result = await pickupService.cancelPickupRequest('pickup-123', 'parent-123');

      expect(result.status).toBe(RequestStatus.CANCELLED);
    });

    it('should throw error if already picked up', async () => {
      const mockRequest = {
        id: 'pickup-123',
        requesterId: 'parent-123',
        status: RequestStatus.CONFIRMED,
        actualPickupTime: new Date(),
      };

      mockPickupRepository.findOne.mockResolvedValue(mockRequest);

      await expect(
        pickupService.cancelPickupRequest('pickup-123', 'parent-123')
      ).rejects.toThrow('Cannot cancel requests that have been picked up');
    });
  });

  describe('getPickupRequests', () => {
    it('should retrieve requests with filters', async () => {
      const mockRequests = [
        { id: 'req1', status: RequestStatus.CONFIRMED },
        { id: 'req2', status: RequestStatus.PENDING },
      ];

      mockPickupRepository.find.mockResolvedValue(mockRequests);

      const result = await pickupService.getPickupRequests({
        status: RequestStatus.CONFIRMED,
      });

      expect(result).toEqual(mockRequests);
      expect(mockPickupRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: RequestStatus.CONFIRMED,
          }),
        })
      );
    });
  });
});
