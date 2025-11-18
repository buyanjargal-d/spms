import QRCode from 'qrcode';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { PickupRequest, RequestStatus } from '../models/PickupRequest';
import { ENV } from '../config/env';

interface QRCodePayload {
  requestId: string;
  token: string;
  exp: string;
}

export class QRCodeService {
  private pickupRequestRepository: Repository<PickupRequest>;
  private secretKey: string;

  constructor() {
    this.pickupRequestRepository = AppDataSource.getRepository(PickupRequest);
    // Use JWT secret as QR code signing key
    this.secretKey = ENV.JWT.SECRET || 'default-qr-secret-key-change-in-production';
  }

  /**
   * Generate secure token for QR code
   * @param requestId - Pickup request ID
   * @returns HMAC token
   */
  private generateToken(requestId: string): string {
    const hmac = crypto.createHmac('sha256', this.secretKey);
    const timestamp = Date.now().toString();
    hmac.update(`${requestId}:${timestamp}`);
    return hmac.digest('hex');
  }


  /**
   * Generate QR code for approved pickup request
   * @param requestId - Pickup request ID
   * @returns QR code data URL and expiration time
   */
  async generateQRCode(requestId: string): Promise<{
    success: boolean;
    message: string;
    qrCodeData?: string;
    qrCodeToken?: string;
    expiresAt?: Date;
  }> {
    try {
      const pickupRequest = await this.pickupRequestRepository.findOne({
        where: { id: requestId },
      });

      if (!pickupRequest) {
        return {
          success: false,
          message: 'Хүсэлт олдсонгүй',
        };
      }

      // Generate security token
      const token = this.generateToken(requestId);

      // Set expiration (pickup time + 1 hour buffer)
      const expirationTime = pickupRequest.scheduledPickupTime
        ? new Date(pickupRequest.scheduledPickupTime.getTime() + 60 * 60 * 1000) // 1 hour after scheduled time
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now if no scheduled time

      // Create QR code payload
      const payload: QRCodePayload = {
        requestId: pickupRequest.id,
        token,
        exp: expirationTime.toISOString(),
      };

      // Generate QR code as data URL
      const qrCodeData = await QRCode.toDataURL(JSON.stringify(payload), {
        errorCorrectionLevel: 'H', // High error correction
        type: 'image/png',
        margin: 2,
        width: 300,
      });

      // Update pickup request with QR code info
      pickupRequest.qrCode = token;
      pickupRequest.qrCodeData = qrCodeData;
      pickupRequest.qrCodeToken = token;
      pickupRequest.qrExpiresAt = expirationTime;

      await this.pickupRequestRepository.save(pickupRequest);

      return {
        success: true,
        message: 'QR код амжилттай үүсгэгдлээ',
        qrCodeData,
        qrCodeToken: token,
        expiresAt: expirationTime,
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return {
        success: false,
        message: 'QR код үүсгэхэд алдаа гарлаа',
      };
    }
  }

  /**
   * Verify QR code from scan
   * @param qrData - Scanned QR code data (JSON string)
   * @returns Pickup request details if valid
   */
  async verifyQRCode(qrData: string): Promise<{
    success: boolean;
    message: string;
    pickupRequest?: PickupRequest;
  }> {
    try {
      // Parse QR code payload
      const payload: QRCodePayload = JSON.parse(qrData);

      // Verify required fields
      if (!payload.requestId || !payload.token || !payload.exp) {
        return {
          success: false,
          message: 'QR код буруу форматтай байна',
        };
      }

      // Check expiration
      const expirationDate = new Date(payload.exp);
      if (expirationDate < new Date()) {
        return {
          success: false,
          message: 'QR кодны хүчинтэй хугацаа дууссан байна',
        };
      }

      // Find pickup request
      const pickupRequest = await this.pickupRequestRepository.findOne({
        where: { id: payload.requestId },
        relations: ['student', 'requester', 'pickupPerson', 'approver'],
      });

      if (!pickupRequest) {
        return {
          success: false,
          message: 'Хүсэлт олдсонгүй',
        };
      }

      // Verify token matches
      if (pickupRequest.qrCodeToken !== payload.token) {
        return {
          success: false,
          message: 'QR код буруу эсвэл хүчингүй байна',
        };
      }

      // Check if already completed (has actualPickupTime)
      if (pickupRequest.actualPickupTime) {
        return {
          success: false,
          message: 'Энэ хүсэлт аль хэдийн биелүүлсэн байна',
        };
      }

      // Check if confirmed (approved)
      if (pickupRequest.status !== RequestStatus.CONFIRMED) {
        return {
          success: false,
          message: 'Энэ хүсэлт батлагдаагүй байна',
        };
      }

      return {
        success: true,
        message: 'QR код амжилттай баталгаажлаа',
        pickupRequest,
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
   * Invalidate QR code after pickup completion
   * @param requestId - Pickup request ID
   */
  async invalidateQRCode(requestId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const pickupRequest = await this.pickupRequestRepository.findOne({
        where: { id: requestId },
      });

      if (!pickupRequest) {
        return {
          success: false,
          message: 'Хүсэлт олдсонгүй',
        };
      }

      // Set expiration to now to invalidate
      pickupRequest.qrExpiresAt = new Date();
      await this.pickupRequestRepository.save(pickupRequest);

      return {
        success: true,
        message: 'QR код хүчингүй болгогдлоо',
      };
    } catch (error) {
      console.error('Error invalidating QR code:', error);
      return {
        success: false,
        message: 'QR код хүчингүй болгоход алдаа гарлаа',
      };
    }
  }

  /**
   * Get QR code for a pickup request
   * @param requestId - Pickup request ID
   */
  async getQRCode(requestId: string): Promise<{
    success: boolean;
    message: string;
    qrCodeData?: string;
    expiresAt?: Date;
  }> {
    try {
      const pickupRequest = await this.pickupRequestRepository.findOne({
        where: { id: requestId },
      });

      if (!pickupRequest) {
        return {
          success: false,
          message: 'Хүсэлт олдсонгүй',
        };
      }

      // If QR code doesn't exist, generate it
      if (!pickupRequest.qrCodeData) {
        return await this.generateQRCode(requestId);
      }

      // Check if expired
      if (pickupRequest.qrExpiresAt && pickupRequest.qrExpiresAt < new Date()) {
        return {
          success: false,
          message: 'QR кодны хүчинтэй хугацаа дууссан байна',
        };
      }

      return {
        success: true,
        message: 'QR код олдлоо',
        qrCodeData: pickupRequest.qrCodeData,
        expiresAt: pickupRequest.qrExpiresAt,
      };
    } catch (error) {
      console.error('Error getting QR code:', error);
      return {
        success: false,
        message: 'QR код авахад алдаа гарлаа',
      };
    }
  }
}

export default new QRCodeService();
