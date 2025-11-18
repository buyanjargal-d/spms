import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { PickupRequest, RequestStatus, RequestType } from '../models/PickupRequest';
import { User } from '../models/User';
import { Student } from '../models/Student';

interface VerificationResult {
  success: boolean;
  message: string;
  pickup?: PickupRequest;
  student?: Student;
  authorizedPerson?: User;
}

interface QueueItem {
  id: string;
  studentName: string;
  studentPhoto?: string;
  className: string;
  authorizedPersonName: string;
  authorizedPersonPhoto?: string;
  requestedTime: Date;
  approvedAt?: Date;
  waitingTime: number; // in minutes
  requestType: string;
}

interface EmergencyPickupData {
  studentId: string;
  pickupPersonName: string;
  pickupPersonPhone: string;
  relationship: string;
  reason: string;
  guardNotes?: string;
}

export class GuardService {
  private pickupRequestRepository: Repository<PickupRequest>;
  private studentRepository: Repository<Student>;

  constructor() {
    this.pickupRequestRepository = AppDataSource.getRepository(PickupRequest);
    this.studentRepository = AppDataSource.getRepository(Student);
  }

  /**
   * Verify pickup request by QR code
   * @param qrToken - QR code token to verify
   */
  async verifyByQRCode(qrToken: string, _guardId: string): Promise<VerificationResult> {
    try {
      // Find pickup request by QR token
      const pickupRequest = await this.pickupRequestRepository.findOne({
        where: { qrCode: qrToken },
        relations: ['student', 'requester', 'approver'],
      });

      if (!pickupRequest) {
        return {
          success: false,
          message: 'QR код олдсонгүй эсвэл хүчингүй байна',
        };
      }

      // Check if already completed
      if (pickupRequest.actualPickupTime) {
        return {
          success: false,
          message: 'Энэ хүсэлт аль хэдийн биелүүлсэн байна',
        };
      }

      // Check if approved
      if (pickupRequest.status !== RequestStatus.CONFIRMED) {
        return {
          success: false,
          message: 'Энэ хүсэлт батлагдаагүй байна',
        };
      }

      // Check QR expiration (if qrExpiresAt exists)
      if (pickupRequest.qrExpiresAt && new Date(pickupRequest.qrExpiresAt) < new Date()) {
        return {
          success: false,
          message: 'QR кодны хүчинтэй хугацаа дууссан байна',
        };
      }

      return {
        success: true,
        message: 'Баталгаажлаа амжилттай',
        pickup: pickupRequest,
        student: pickupRequest.student,
        authorizedPerson: pickupRequest.requester,
      };
    } catch (error) {
      console.error('Error verifying QR code:', error);
      return {
        success: false,
        message: 'QR код баталгаажуулахад алдаа гарлаа',
      };
    }
  }

  /**
   * Verify pickup request manually by student ID
   * @param studentId - Student ID to search for
   */
  async verifyByStudentId(studentId: string, _guardId: string): Promise<VerificationResult> {
    try {
      // Find approved pickup request for this student
      const pickupRequest = await this.pickupRequestRepository.findOne({
        where: {
          studentId: studentId,
          status: RequestStatus.CONFIRMED,
        },
        relations: ['student', 'requester', 'approver'],
        order: { approvedAt: 'DESC' },
      });

      if (!pickupRequest) {
        return {
          success: false,
          message: 'Энэ сурагчийн батлагдсан хүсэлт олдсонгүй',
        };
      }

      return {
        success: true,
        message: 'Сурагч олдлоо',
        pickup: pickupRequest,
        student: pickupRequest.student,
        authorizedPerson: pickupRequest.requester,
      };
    } catch (error) {
      console.error('Error verifying student ID:', error);
      return {
        success: false,
        message: 'Сурагчийн мэдээлэл хайхад алдаа гарлаа',
      };
    }
  }

  /**
   * Complete pickup after verification
   * @param pickupRequestId - ID of the pickup request
   * @param guardId - ID of the guard completing the pickup
   * @param photoVerified - Whether photo verification was performed
   */
  async completePickup(
    pickupRequestId: string,
    guardId: string,
    photoVerified: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    try {
      const pickupRequest = await this.pickupRequestRepository.findOne({
        where: { id: pickupRequestId },
      });

      if (!pickupRequest) {
        return {
          success: false,
          message: 'Хүсэлт олдсонгүй',
        };
      }

      if (pickupRequest.status !== RequestStatus.CONFIRMED) {
        return {
          success: false,
          message: 'Зөвхөн батлагдсан хүсэлтийг биелүүлэх боломжтой',
        };
      }

      // Update pickup request
      // Status remains CONFIRMED (no separate "completed" status)
      pickupRequest.completedAt = new Date();
      pickupRequest.completedBy = guardId;
      pickupRequest.photoVerified = photoVerified;

      await this.pickupRequestRepository.save(pickupRequest);

      return {
        success: true,
        message: 'Авалт амжилттай биелүүллээ',
      };
    } catch (error) {
      console.error('Error completing pickup:', error);
      return {
        success: false,
        message: 'Авалтыг биелүүлэхэд алдаа гарлаа',
      };
    }
  }

  /**
   * Get real-time pickup queue (approved requests waiting for pickup)
   */
  async getPickupQueue(_guardId: string): Promise<QueueItem[]> {
    try {
      const approvedPickups = await this.pickupRequestRepository.find({
        where: { status: RequestStatus.APPROVED },
        relations: ['student', 'requester'],
        order: { approvedAt: 'ASC' },
      });

      const queueItems: QueueItem[] = approvedPickups.map((pickup) => {
        const approvedTime = pickup.approvedAt ? new Date(pickup.approvedAt).getTime() : Date.now();
        const waitingTime = Math.floor((Date.now() - approvedTime) / 60000); // minutes

        return {
          id: pickup.id,
          studentName: pickup.student
            ? `${pickup.student.firstName} ${pickup.student.lastName}`
            : 'Unknown',
          studentPhoto: pickup.student?.profilePhotoUrl,
          className: pickup.student?.classId || 'N/A',
          authorizedPersonName: pickup.requester?.fullName || 'Unknown',
          authorizedPersonPhoto: pickup.requester?.profilePhotoUrl,
          requestedTime: pickup.requestedTime,
          approvedAt: pickup.approvedAt,
          waitingTime,
          requestType: pickup.requestType || 'standard',
        };
      });

      return queueItems;
    } catch (error) {
      console.error('Error fetching pickup queue:', error);
      return [];
    }
  }

  /**
   * Create emergency pickup (admin review required)
   * @param data - Emergency pickup data
   * @param guardId - ID of the guard creating the emergency pickup
   */
  async createEmergencyPickup(
    data: EmergencyPickupData,
    guardId: string
  ): Promise<{ success: boolean; message: string; pickupId?: string }> {
    try {
      // Verify student exists
      const student = await this.studentRepository.findOne({
        where: { id: data.studentId },
      });

      if (!student) {
        return {
          success: false,
          message: 'Сурагч олдсонгүй',
        };
      }

      // Create emergency pickup request
      const emergencyPickup = this.pickupRequestRepository.create({
        studentId: data.studentId,
        requesterId: guardId, // Guard is creating this
        requestType: RequestType.STANDARD, // Use STANDARD type for emergency
        requestedTime: new Date(),
        status: RequestStatus.APPROVED, // Auto-approved for emergency
        approvedAt: new Date(),
        approverId: guardId,
        emergencyPickupPerson: data.pickupPersonName,
        emergencyPickupPhone: data.pickupPersonPhone,
        emergencyPickupRelationship: data.relationship,
        emergencyPickupReason: data.reason,
        notes: data.guardNotes,
        requiresAdminReview: true, // Flag for admin review
      });

      const savedPickup = await this.pickupRequestRepository.save(emergencyPickup);

      // TODO: Send notification to admins for review
      // TODO: Log security alert for emergency pickup

      return {
        success: true,
        message: 'Яаралтай авалт бүртгэгдлээ. Админ хянах шаардлагатай.',
        pickupId: savedPickup.id,
      };
    } catch (error) {
      console.error('Error creating emergency pickup:', error);
      return {
        success: false,
        message: 'Яаралтай авалт үүсгэхэд алдаа гарлаа',
      };
    }
  }

  /**
   * Get guard dashboard statistics
   */
  async getGuardStats(_guardId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Count today's completed pickups
      const completedToday = await this.pickupRequestRepository.count({
        where: {
          status: RequestStatus.CONFIRMED,
          completedAt: {
            $gte: today,
            $lt: tomorrow,
          } as any,
        },
      });

      // Count pending approvals (awaiting verification)
      const pendingQueue = await this.pickupRequestRepository.count({
        where: { status: RequestStatus.APPROVED },
      });

      // Count emergency pickups today (using requiresAdminReview as emergency flag)
      const emergencyToday = await this.pickupRequestRepository.count({
        where: {
          requiresAdminReview: true,
          requestedTime: {
            $gte: today,
            $lt: tomorrow,
          } as any,
        },
      });

      return {
        completedToday,
        pendingQueue,
        emergencyToday,
        totalProcessed: completedToday,
      };
    } catch (error) {
      console.error('Error fetching guard stats:', error);
      return {
        completedToday: 0,
        pendingQueue: 0,
        emergencyToday: 0,
        totalProcessed: 0,
      };
    }
  }
}

export default new GuardService();
