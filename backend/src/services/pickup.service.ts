import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { PickupRequest, RequestStatus } from '../models/PickupRequest';
import { AppDataSource } from '../config/database';
import { CreatePickupRequestDTO, PickupRequestFilters } from '../types/pickup.types';

export class PickupService {
  private pickupRepository: Repository<PickupRequest>;

  constructor() {
    this.pickupRepository = AppDataSource.getRepository(PickupRequest);
  }

  /**
   * Create a new pickup request
   */
  async createPickupRequest(
    requesterId: string,
    data: CreatePickupRequestDTO
  ): Promise<PickupRequest> {
    const pickupRequest = this.pickupRepository.create({
      ...data,
      requesterId,
      requestedTime: new Date(),
      status: RequestStatus.PENDING,
    });

    return this.pickupRepository.save(pickupRequest);
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

    pickupRequest.status = RequestStatus.APPROVED;
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

    if (pickupRequest.status !== RequestStatus.APPROVED) {
      throw new Error('Only approved requests can be completed');
    }

    pickupRequest.status = RequestStatus.COMPLETED;
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

    if (pickupRequest.status === RequestStatus.COMPLETED) {
      throw new Error('Cannot cancel completed requests');
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
