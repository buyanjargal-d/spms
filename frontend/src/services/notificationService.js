/**
 * Static Notification Service
 *
 * This service provides static (mock) implementations for:
 * - SMS notifications
 * - FCM (Firebase Cloud Messaging) push notifications
 * - In-app notifications
 *
 * Note: These are static implementations as external integrations
 * (Twilio, Firebase) are not available in the current environment.
 */

// Static notification storage (simulates backend)
const notificationStorage = {
  notifications: [],
  preferences: {
    smsEnabled: true,
    pushEnabled: true,
    emailEnabled: false,
  },
  smsLog: [],
  fcmLog: [],
};

/**
 * Generate a unique notification ID
 */
const generateNotificationId = () => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get current timestamp in ISO format
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Static SMS notification service
 */
export const smsService = {
  /**
   * Send SMS notification (static implementation)
   */
  async sendSMS(phoneNumber, message) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const smsRecord = {
      id: generateNotificationId(),
      phoneNumber,
      message,
      status: 'sent',
      sentAt: getTimestamp(),
      provider: 'static-sms',
    };

    notificationStorage.smsLog.push(smsRecord);

    console.log('📱 SMS Sent (Static):', {
      to: phoneNumber,
      message: message,
      timestamp: smsRecord.sentAt,
    });

    return {
      success: true,
      data: smsRecord,
    };
  },

  /**
   * Get SMS log
   */
  async getSMSLog() {
    return {
      success: true,
      data: notificationStorage.smsLog,
    };
  },

  /**
   * Send pickup request notification via SMS
   */
  async sendPickupRequestNotification(phoneNumber, studentName, requestTime) {
    const message = `SPMS: ${studentName} сурагчийг ${new Date(requestTime).toLocaleString('mn-MN')} цагт авах хүсэлт илгээгдлээ.`;
    return this.sendSMS(phoneNumber, message);
  },

  /**
   * Send pickup approval notification via SMS
   */
  async sendPickupApprovalNotification(phoneNumber, studentName) {
    const message = `SPMS: ${studentName} сурагчийг авах хүсэлт баталгаажлаа. Та сургуулиас авч болно.`;
    return this.sendSMS(phoneNumber, message);
  },

  /**
   * Send pickup completion notification via SMS
   */
  async sendPickupCompletionNotification(phoneNumber, studentName, pickupTime) {
    const message = `SPMS: ${studentName} сурагчийг ${new Date(pickupTime).toLocaleTimeString('mn-MN')} цагт амжилттай авлаа.`;
    return this.sendSMS(phoneNumber, message);
  },
};

/**
 * Static FCM (Firebase Cloud Messaging) notification service
 */
export const fcmService = {
  /**
   * Send push notification (static implementation)
   */
  async sendPushNotification(userId, title, body, data = {}) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const fcmRecord = {
      id: generateNotificationId(),
      userId,
      title,
      body,
      data,
      status: 'delivered',
      sentAt: getTimestamp(),
      provider: 'static-fcm',
    };

    notificationStorage.fcmLog.push(fcmRecord);

    // Add to in-app notifications
    const inAppNotification = {
      id: fcmRecord.id,
      userId,
      title,
      message: body,
      type: data.type || 'info',
      read: false,
      createdAt: fcmRecord.sentAt,
      data,
    };

    notificationStorage.notifications.push(inAppNotification);

    console.log('🔔 Push Notification Sent (Static):', {
      userId,
      title,
      body,
      timestamp: fcmRecord.sentAt,
    });

    return {
      success: true,
      data: fcmRecord,
    };
  },

  /**
   * Get FCM log
   */
  async getFCMLog() {
    return {
      success: true,
      data: notificationStorage.fcmLog,
    };
  },

  /**
   * Send pickup request notification via FCM
   */
  async sendPickupRequestNotification(userId, studentName, requestTime) {
    return this.sendPushNotification(
      userId,
      'Шинэ авах хүсэлт',
      `${studentName} сурагчийг ${new Date(requestTime).toLocaleString('mn-MN')} цагт авах хүсэлт илгээгдлээ.`,
      { type: 'pickup_request', studentName, requestTime }
    );
  },

  /**
   * Send pickup approval notification via FCM
   */
  async sendPickupApprovalNotification(userId, studentName) {
    return this.sendPushNotification(
      userId,
      'Хүсэлт баталгаажлаа',
      `${studentName} сурагчийг авах хүсэлт баталгаажлаа.`,
      { type: 'pickup_approved', studentName }
    );
  },

  /**
   * Send pickup completion notification via FCM
   */
  async sendPickupCompletionNotification(userId, studentName, pickupTime) {
    return this.sendPushNotification(
      userId,
      'Авалт дууслаа',
      `${studentName} сурагчийг ${new Date(pickupTime).toLocaleTimeString('mn-MN')} цагт амжилттай авлаа.`,
      { type: 'pickup_completed', studentName, pickupTime }
    );
  },
};

/**
 * In-app notification service
 */
export const notificationService = {
  /**
   * Get all notifications for user
   */
  async getNotifications(userId) {
    const userNotifications = notificationStorage.notifications.filter(
      n => n.userId === userId
    );

    return {
      success: true,
      data: userNotifications.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      ),
    };
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const count = notificationStorage.notifications.filter(
      n => n.userId === userId && !n.read
    ).length;

    return {
      success: true,
      data: { count },
    };
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    const notification = notificationStorage.notifications.find(
      n => n.id === notificationId
    );

    if (notification) {
      notification.read = true;
    }

    return {
      success: true,
      data: notification,
    };
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    notificationStorage.notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });

    return {
      success: true,
    };
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    const index = notificationStorage.notifications.findIndex(
      n => n.id === notificationId
    );

    if (index !== -1) {
      notificationStorage.notifications.splice(index, 1);
    }

    return {
      success: true,
    };
  },

  /**
   * Create a new in-app notification
   */
  async createNotification(userId, title, message, type = 'info', data = {}) {
    const notification = {
      id: generateNotificationId(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: getTimestamp(),
      data,
    };

    notificationStorage.notifications.push(notification);

    return {
      success: true,
      data: notification,
    };
  },
};

/**
 * Notification preferences service
 */
export const notificationPreferencesService = {
  /**
   * Get user notification preferences
   */
  async getPreferences() {
    return {
      success: true,
      data: notificationStorage.preferences,
    };
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences) {
    notificationStorage.preferences = {
      ...notificationStorage.preferences,
      ...preferences,
    };

    return {
      success: true,
      data: notificationStorage.preferences,
    };
  },
};

/**
 * Combined notification sender
 * Sends notifications via all enabled channels
 */
export const sendNotification = async (userId, phoneNumber, title, message, type = 'info', data = {}) => {
  const preferences = notificationStorage.preferences;
  const results = {
    sms: null,
    push: null,
    inApp: null,
  };

  // Send SMS if enabled
  if (preferences.smsEnabled && phoneNumber) {
    try {
      results.sms = await smsService.sendSMS(phoneNumber, `${title}: ${message}`);
    } catch (error) {
      console.error('SMS notification failed:', error);
    }
  }

  // Send push notification if enabled
  if (preferences.pushEnabled && userId) {
    try {
      results.push = await fcmService.sendPushNotification(userId, title, message, { type, ...data });
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }

  // Always create in-app notification
  if (userId) {
    try {
      results.inApp = await notificationService.createNotification(userId, title, message, type, data);
    } catch (error) {
      console.error('In-app notification failed:', error);
    }
  }

  return {
    success: true,
    data: results,
  };
};

export default {
  sms: smsService,
  fcm: fcmService,
  notifications: notificationService,
  preferences: notificationPreferencesService,
  send: sendNotification,
};
