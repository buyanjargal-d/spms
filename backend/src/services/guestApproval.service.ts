import { Repository } from 'typeorm';
import { GuestPickupApproval, ApprovalStatus } from '../models/GuestPickupApproval';
import { PickupRequest, RequestStatus } from '../models/PickupRequest';
import { StudentGuardian } from '../models/StudentGuardian';
import { AppDataSource } from '../config/database';

export class GuestApprovalService {
  private approvalRepository: Repository<GuestPickupApproval>;
  private pickupRepository: Repository<PickupRequest>;
  private guardianRepository: Repository<StudentGuardian>;

  constructor() {
    this.approvalRepository = AppDataSource.getRepository(GuestPickupApproval);
    this.pickupRepository = AppDataSource.getRepository(PickupRequest);
    this.guardianRepository = AppDataSource.getRepository(StudentGuardian);
  }

  /**
   * Create guest approval records for all authorized parents of a student
   * Called when a guardian creates a guest pickup request
   */
  async createGuestApprovals(pickupRequestId: string, studentId: string): Promise<GuestPickupApproval[]> {
    // Get all authorized parents/guardians for this student
    const guardians = await this.guardianRepository.find({
      where: {
        studentId,
        isAuthorized: true,
      },
      relations: ['guardian'],
    });

    // Create approval records for each guardian
    const approvals = guardians.map((guardian) => {
      return this.approvalRepository.create({
        pickupRequestId,
        parentId: guardian.guardianId,
        status: ApprovalStatus.PENDING,
      });
    });

    return this.approvalRepository.save(approvals);
  }

  /**
   * Get pending approvals for a parent
   */
  async getPendingApprovalsForParent(parentId: string): Promise<GuestPickupApproval[]> {
    return this.approvalRepository.find({
      where: {
        parentId,
        status: ApprovalStatus.PENDING,
      },
      relations: ['pickupRequest', 'pickupRequest.student', 'pickupRequest.requester'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Approve a guest pickup request (by parent)
   */
  async approveGuestPickup(
    approvalId: string,
    parentId: string,
    notes?: string
  ): Promise<{ approval: GuestPickupApproval; pickupRequest?: PickupRequest }> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId, parentId },
      relations: ['pickupRequest'],
    });

    if (!approval) {
      throw new Error('Approval record not found');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new Error('Approval already processed');
    }

    // Update approval status
    approval.status = ApprovalStatus.APPROVED;
    approval.notes = notes;
    approval.respondedAt = new Date();

    const savedApproval = await this.approvalRepository.save(approval);

    // Check if at least one parent approved - if so, move to teacher approval
    const hasApproval = await this.hasParentApproval(approval.pickupRequestId);

    if (hasApproval) {
      const pickupRequest = await this.pickupRepository.findOne({
        where: { id: approval.pickupRequestId },
      });

      if (pickupRequest && pickupRequest.status === RequestStatus.PENDING_PARENT_APPROVAL) {
        pickupRequest.status = RequestStatus.PENDING;
        pickupRequest.updatedAt = new Date();
        const updatedRequest = await this.pickupRepository.save(pickupRequest);

        return { approval: savedApproval, pickupRequest: updatedRequest };
      }
    }

    return { approval: savedApproval };
  }

  /**
   * Reject a guest pickup request (by parent)
   */
  async rejectGuestPickup(
    approvalId: string,
    parentId: string,
    notes: string
  ): Promise<{ approval: GuestPickupApproval; pickupRequest?: PickupRequest }> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId, parentId },
      relations: ['pickupRequest'],
    });

    if (!approval) {
      throw new Error('Approval record not found');
    }

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new Error('Approval already processed');
    }

    // Update approval status
    approval.status = ApprovalStatus.REJECTED;
    approval.notes = notes;
    approval.respondedAt = new Date();

    const savedApproval = await this.approvalRepository.save(approval);

    // If any parent rejects, reject the entire pickup request
    const pickupRequest = await this.pickupRepository.findOne({
      where: { id: approval.pickupRequestId },
    });

    if (pickupRequest) {
      pickupRequest.status = RequestStatus.REJECTED;
      pickupRequest.rejectionReason = `Parent rejected: ${notes}`;
      pickupRequest.updatedAt = new Date();
      const updatedRequest = await this.pickupRepository.save(pickupRequest);

      return { approval: savedApproval, pickupRequest: updatedRequest };
    }

    return { approval: savedApproval };
  }

  /**
   * Check if at least one parent approved the guest pickup
   */
  async hasParentApproval(pickupRequestId: string): Promise<boolean> {
    const approvedCount = await this.approvalRepository.count({
      where: {
        pickupRequestId,
        status: ApprovalStatus.APPROVED,
      },
    });

    return approvedCount > 0;
  }

  /**
   * Get all approvals for a pickup request
   */
  async getApprovalsForRequest(pickupRequestId: string): Promise<GuestPickupApproval[]> {
    return this.approvalRepository.find({
      where: { pickupRequestId },
      relations: ['parent'],
      order: { createdAt: 'ASC' },
    });
  }
}
