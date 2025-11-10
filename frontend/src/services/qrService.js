import api from './api';

export const qrService = {
  // Get QR code for a pickup request
  async getQRCode(requestId) {
    const response = await api.get(`/pickup/${requestId}/qrcode`);
    return response.data;
  },

  // Verify QR code data
  async verifyQRCode(qrData) {
    const response = await api.post('/pickup/verify-qr', { qrData });
    return response.data;
  },
};

export default qrService;
