import api from './api';

export const guardService = {
  // Verify pickup by QR code
  async verifyByQRCode(qrToken) {
    const response = await api.post('/guards/verify-qr', { qrToken });
    return response.data;
  },

  // Verify pickup by student ID
  async verifyByStudentId(studentId) {
    const response = await api.post('/guards/verify-student', { studentId });
    return response.data;
  },

  // Complete pickup
  async completePickup(pickupId, data) {
    const response = await api.post(`/guards/complete/${pickupId}`, data);
    return response.data;
  },

  // Get pickup queue
  async getQueue() {
    const response = await api.get('/guards/queue');
    return response.data;
  },

  // Create emergency pickup
  async createEmergencyPickup(data) {
    const response = await api.post('/guards/emergency', data);
    return response.data;
  },

  // Get guard statistics
  async getStats() {
    const response = await api.get('/guards/stats');
    return response.data;
  },
};

export default guardService;
