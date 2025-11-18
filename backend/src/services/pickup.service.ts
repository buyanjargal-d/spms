import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { PickupRequest, RequestStatus, RequestType } from '../models/PickupRequest';
import { AppDataSource } from '../config/database';
import { CreatePickupRequestDTO, PickupRequestFilters } from '../types/pickup.types';
import { GuestApprovalService } from './guestApproval.service';
import { logger } from '../utils/logger';

export class PickupService {
  private pickupRepository: Repository<PickupRequest>;
  private guestApprovalService: GuestApprovalService;

  constructor() {
    this.pickupRepository = AppDataSource.getRepository(PickupRequest);
    this.guestApprovalService = new GuestApprovalService();
  }

  /**
   * Create a new pickup request
   * For guest pickups: creates approval records for parents and sets status to PENDING_PARENT_APPROVAL
   * For standard pickups: sets status to PENDING (teacher approval)
   */
  async createPickupRequest(
    requesterId: string,
    data: CreatePickupRequestDTO
  ): Promise<PickupRequest> {
    // Determine initial status based on request type
    const initialStatus = data.requestType === RequestType.GUEST
      ? RequestStatus.PENDING_PARENT_APPROVAL
      : RequestStatus.PENDING;

    const pickupRequest = this.pickupRepository.create({
      ...data,
      requesterId,
      requestedTime: new Date(),
      status: initialStatus,
    });

    const savedRequest = await this.pickupRepository.save(pickupRequest);

    // Log location check notification (simulated - doesn't actually verify location)
    logger.info(`📍 Location check notification: Pickup request created`, {
      pickupRequestId: savedRequest.id,
      requesterId,
      studentId: data.studentId,
      requestType: data.requestType,
      message: 'Parent location has been logged for security purposes',
      timestamp: new Date().toISOString(),
    });

    // If guest pickup, create approval records for all authorized parents
    if (data.requestType === RequestType.GUEST) {
      await this.guestApprovalService.createGuestApprovals(
        savedRequest.id,
        data.studentId
      );
    }

    return savedRequest;
  }

  /**
   * Get pickup requests with filters
   */
  async getPickupRequests(filters: PickupRequestFilters): Promise<PickupRequest[]> {
    const where: FindOptionsWhere<PickupRequest> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters.requesterId) {
      where.requesterId = filters.requesterId;
    }

    if (filters.requestType) {
      where.requestType = filters.requestType;
    }

    // Date range filtering
    if (filters.startDate && filters.endDate) {
      where.requestedTime = Between(filters.startDate, filters.endDate);
    }

    return this.pickupRepository.find({
      where,
      relations: ['student', 'requester', 'pickupPerson'],
      order: { requestedTime: 'DESC' },
    });
  }

  /**
   * Get pickup request by ID
   */
  async getPickupRequestById(id: string): Promise<PickupRequest | null> {
    return this.pickupRepository.findOne({
      where: { id },
      relations: ['student', 'student.class', 'requester', 'pickupPerson'],
    });
  }

  /**
   * Get pending pickup requests
   */
  async getPendingRequests(): Promise<PickupRequest[]> {
    return this.pickupRepository.find({
      where: { status: RequestStatus.PENDING },
      relations: ['student', 'student.class', 'requester'],
      order: { requestedTime: 'ASC' },
    });
  }

  /**
   * Approve pickup request
   */
  async approvePickupRequest(id: string, _approvedBy: string): Promise<PickupRequest> {
    const pickupRequest = await this.getPickupRequestById(id);

    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }

    if (pickupRequest.status !== RequestStatus.PENDING) {
      throw new Error('Only pending requests can be approved');
    }

    pickupRequest.status = RequestStatus.CONFIRMED;
    pickupRequest.updatedAt = new Date();

    return this.pickupRepository.save(pickupRequest);
  }

  /**
   * Reject pickup request
   */
  async rejectPickupRequest(id: string, rejectionReason: string): Promise<PickupRequest> {
    const pickupRequest = await this.getPickupRequestById(id);

    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }

    if (pickupRequest.status !== RequestStatus.PENDING) {
      throw new Error('Only pending requests can be rejected');
    }

    pickupRequest.status = RequestStatus.REJECTED;
    pickupRequest.rejectionReason = rejectionReason;
    pickupRequest.updatedAt = new Date();

    return this.pickupRepository.save(pickupRequest);
  }

  /**
   * Complete pickup request
   */
  async completePickupRequest(
    id: string,
    data: {
      pickupPersonId?: string;
      actualPickupTime?: Date;
      pickupLocationLat?: number;
      pickupLocationLng?: number;
    }
  ): Promise<PickupRequest> {
    const pickupRequest = await this.getPickupRequestById(id);

    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }

    if (pickupRequest.status !== RequestStatus.CONFIRMED) {
      throw new Error('Only confirmed requests can be picked up');
    }

    // Keep status as CONFIRMED (no separate "completed" status)
    pickupRequest.actualPickupTime = data.actualPickupTime || new Date();

    if (data.pickupPersonId) {
      pickupRequest.pickupPersonId = data.pickupPersonId;
    }

    if (data.pickupLocationLat !== undefined) {
      pickupRequest.pickupLocationLat = data.pickupLocationLat;
    }

    if (data.pickupLocationLng !== undefined) {
      pickupRequest.pickupLocationLng = data.pickupLocationLng;
    }

    pickupRequest.updatedAt = new Date();

    return this.pickupRepository.save(pickupRequest);
  }

  /**
   * Cancel pickup request
   */
  async cancelPickupRequest(id: string, requesterId: string): Promise<PickupRequest> {
    const pickupRequest = await this.getPickupRequestById(id);

    if (!pickupRequest) {
      throw new Error('Pickup request not found');
    }

    if (pickupRequest.requesterId !== requesterId) {
      throw new Error('You can only cancel your own requests');
    }

    if (pickupRequest.actualPickupTime) {
      throw new Error('Cannot cancel requests that have been picked up');
    }

    pickupRequest.status = RequestStatus.CANCELLED;
    pickupRequest.updatedAt = new Date();

    return this.pickupRepository.save(pickupRequest);
  }

  /**
   * Get pickup history for a student
   */
  async getStudentPickupHistory(studentId: string): Promise<PickupRequest[]> {
    return this.pickupRepository.find({
      where: { studentId },
      relations: ['requester', 'pickupPerson'],
      order: { requestedTime: 'DESC' },
    });
  }
}
