import api from './api';

export const pickupService = {
  // Create pickup request
  async createRequest(data) {
    try {
      const response = await api.post('/pickup/request', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create request error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Хүсэлт илгээхэд алдаа гарлаа' 
      };
    }
  },

  // Get my pickup requests
  async getMyRequests(filters = {}) {
    try {
      const response = await api.get('/pickup/my-requests', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get requests error:', error);
      return { success: false, error: 'Хүсэлт татахад алдаа гарлаа' };
    }
  },

  // Get request by ID
  async getRequestById(id) {
    try {
      const response = await api.get(`/pickup/requests/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get request error:', error);
      return { success: false, error: 'Хүсэлтийн мэдээлэл татахад алдаа гарлаа' };
    }
  },

  // Cancel request
  async cancelRequest(id, reason) {
    try {
      const response = await api.patch(`/pickup/${id}/cancel`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Cancel request error:', error);
      return { success: false, error: 'Хүсэлт цуцлахад алдаа гарлаа' };
    }
  },

  // Get pickup history
  async getHistory(filters = {}) {
    try {
      const response = await api.get('/pickup/history', { params: filters });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get history error:', error);
      return { success: false, error: 'Түүх татахад алдаа гарлаа' };
    }
  },
};

export default pickupService;
