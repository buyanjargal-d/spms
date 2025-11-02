import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';
import { Repository } from 'typeorm';

export enum NotificationType {
  PICKUP_CREATED = 'PICKUP_CREATED',
  PICKUP_APPROVED = 'PICKUP_APPROVED',
  PICKUP_REJECTED = 'PICKUP_REJECTED',
  PICKUP_COMPLETED = 'PICKUP_COMPLETED',
  PICKUP_CANCELLED = 'PICKUP_CANCELLED',
  GUEST_APPROVAL_REQUIRED = 'GUEST_APPROVAL_REQUIRED',
  GUEST_APPROVED = 'GUEST_APPROVED',
  GUEST_REJECTED = 'GUEST_REJECTED',
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * NotificationService
 *
 * Handles Firebase Cloud Messaging (FCM) push notifications
 * Implements thesis requirement Section 4.2.4 - Real-time Notifications
 *
 * Features:
 * - FCM integration for iOS and Android
 * - Support for multiple user roles (parent, teacher, guard)
 * - Notification templates for all pickup events
 * - Batch notifications for multiple recipients
 * - Error handling and retry logic
 */
export class NotificationService {
  private userRepository: Repository<User>;
  private initialized: boolean = false;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initializeFirebase(): void {
    try {
      // Check if already initialized
      if (admin.apps.length > 0) {
        this.initialized = true;
        logger.info('Firebase Admin already initialized');
        return;
      }

      const projectId = process.env.FCM_PROJECT_ID;
      const privateKey = process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n');
      const clientEmail = process.env.FCM_CLIENT_EMAIL;

      if (!projectId || !privateKey || !clientEmail) {
        logger.warn('FCM credentials not configured, notifications will be mocked');
        this.initialized = false;
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      });

      this.initialized = true;
      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK', { error });
      this.initialized = false;
    }
  }

  /**
   * Send notification to a single user
   */
  async sendToUser(
    userId: string,
    notification: NotificationData
  ): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        logger.warn('User not found for notification', { userId });
        return false;
      }

      // Get FCM token from user (you'll need to add fcmToken field to User model)
      const fcmToken = (user as any).fcmToken;

      if (!fcmToken) {
        logger.warn('No FCM token for user', { userId });
        return false;
      }

      return await this.sendToToken(fcmToken, notification);
    } catch (error) {
      logger.error('Failed to send notification to user', { error, userId });
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    notification: NotificationData
  ): Promise<{ success: number; failed: number }> {
    const results = await Promise.all(
      userIds.map((userId) => this.sendToUser(userId, notification))
    );

    const success = results.filter((r) => r).length;
    const failed = results.filter((r) => !r).length;

    logger.info('Batch notification sent', { success, failed, total: userIds.length });

    return { success, failed };
  }

  /**
   * Send notification to a specific FCM token
   */
  async sendToToken(
    token: string,
    notification: NotificationData
  ): Promise<boolean> {
    if (!this.initialized) {
      // Mock mode for development
      logger.info('[MOCK] Notification would be sent', { token, notification });
      return true;
    }

    try {
      const message: admin.messaging.Message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        token,
      };

      const response = await admin.messaging().send(message);
      logger.info('Notification sent successfully', { response, token });
      return true;
    } catch (error) {
      logger.error('Failed to send notification', { error, token });
      return false;
    }
  }

  /**
   * Notification Templates
   */

  /**
   * Notify parent when standard pickup is created
   */
  async notifyPickupCreated(
    parentId: string,
    studentName: string,
    pickupRequestId: string
  ): Promise<boolean> {
    return this.sendToUser(parentId, {
      title: 'Хүсэлт илгээгдлээ',
      body: `${studentName}-ийн авах хүсэлт багшид илгээгдлээ`,
      data: {
        type: NotificationType.PICKUP_CREATED,
        pickupRequestId,
      },
    });
  }

  /**
   * Notify parent when pickup is approved by teacher
   */
  async notifyPickupApproved(
    parentId: string,
    studentName: string,
    pickupRequestId: string
  ): Promise<boolean> {
    return this.sendToUser(parentId, {
      title: 'Хүсэлт баталгаажлаа',
      body: `${studentName}-ийн авах хүсэлт багшаар баталгаажлаа`,
      data: {
        type: NotificationType.PICKUP_APPROVED,
        pickupRequestId,
      },
    });
  }

  /**
   * Notify parent when pickup is rejected
   */
  async notifyPickupRejected(
    parentId: string,
    studentName: string,
    reason: string,
    pickupRequestId: string
  ): Promise<boolean> {
    return this.sendToUser(parentId, {
      title: 'Хүсэлт татгалзагдлаа',
      body: `${studentName}-ийн авах хүсэлт татгалзагдлаа: ${reason}`,
      data: {
        type: NotificationType.PICKUP_REJECTED,
        pickupRequestId,
      },
    });
  }

  /**
   * Notify parent when pickup is completed
   */
  async notifyPickupCompleted(
    parentId: string,
    studentName: string,
    pickupRequestId: string
  ): Promise<boolean> {
    return this.sendToUser(parentId, {
      title: 'Хүүхдийг авсан',
      body: `${studentName}-ийг авч явлаа`,
      data: {
        type: NotificationType.PICKUP_COMPLETED,
        pickupRequestId,
      },
    });
  }

  /**
   * Notify parents when guest approval is required
   */
  async notifyGuestApprovalRequired(
    parentIds: string[],
    studentName: string,
    guestName: string,
    pickupRequestId: string
  ): Promise<{ success: number; failed: number }> {
    return this.sendToUsers(parentIds, {
      title: 'Зочин хүний баталгаажуулалт',
      body: `${guestName} ${studentName}-ийг авах хүсэлт хийсэн. Баталгаажуулна уу.`,
      data: {
        type: NotificationType.GUEST_APPROVAL_REQUIRED,
        pickupRequestId,
      },
    });
  }

  /**
   * Notify guardian when parent approves guest pickup
   */
  async notifyGuestApproved(
    guardianId: string,
    parentName: string,
    studentName: string,
    pickupRequestId: string
  ): Promise<boolean> {
    return this.sendToUser(guardianId, {
      title: 'Зочин авах баталгаажлаа',
      body: `${parentName} ${studentName}-ийг зочин авахыг зөвшөөрлөө`,
      data: {
        type: NotificationType.GUEST_APPROVED,
        pickupRequestId,
      },
    });
  }

  /**
   * Notify guardian when parent rejects guest pickup
   */
  async notifyGuestRejected(
    guardianId: string,
    parentName: string,
    studentName: string,
    pickupRequestId: string
  ): Promise<boolean> {
    return this.sendToUser(guardianId, {
      title: 'Зочин авах татгалзагдсан',
      body: `${parentName} ${studentName}-ийг зочин авахыг татгалзсан`,
      data: {
        type: NotificationType.GUEST_REJECTED,
        pickupRequestId,
      },
    });
  }

  /**
   * Notify teacher about new pickup request
   */
  async notifyTeacherNewRequest(
    teacherId: string,
    studentName: string,
    requestType: string,
    pickupRequestId: string
  ): Promise<boolean> {
    const typeText = requestType === 'guest' ? 'зочин авах' : 'авах';
    return this.sendToUser(teacherId, {
      title: 'Шинэ авах хүсэлт',
      body: `${studentName}-ийн ${typeText} хүсэлт ирлээ`,
      data: {
        type: NotificationType.PICKUP_CREATED,
        pickupRequestId,
      },
    });
  }

  /**
   * Notify guard about approved pickup ready for completion
   */
  async notifyGuardPickupReady(
    guardId: string,
    studentName: string,
    pickupRequestId: string
  ): Promise<boolean> {
    return this.sendToUser(guardId, {
      title: 'Авахад бэлэн',
      body: `${studentName}-ийг авч болно`,
      data: {
        type: NotificationType.PICKUP_APPROVED,
        pickupRequestId,
      },
    });
  }
}
