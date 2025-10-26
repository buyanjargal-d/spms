import api from './api';

export const pickupService = {
  // Get all pickup requests
  async getAllRequests(filters = {}) {
    const response = await api.get('/pickup/requests', { params: filters });
    return response.data;
  },

  // Get pending requests
  async getPendingRequests() {
    const response = await api.get('/pickup/pending');
    return response.data;
  },

  // Get request by ID
  async getRequestById(id) {
    const response = await api.get(`/pickup/requests/${id}`);
    return response.data;
  },

  // Create pickup request
  async createRequest(data) {
    const response = await api.post('/pickup/request', data);
    return response.data;
  },

  // Approve request
  async approveRequest(id, data) {
    const response = await api.patch(`/pickup/${id}/approve`, data);
    return response.data;
  },

  // Reject request
  async rejectRequest(id, data) {
    const response = await api.patch(`/pickup/${id}/reject`, data);
    return response.data;
  },

  // Complete pickup
  async completePickup(id, data) {
    const response = await api.patch(`/pickup/${id}/complete`, data);
    return response.data;
  },

  // Get pickup history
  async getHistory(filters = {}) {
    const response = await api.get('/pickup/history', { params: filters });
    return response.data;
  },
};

export default pickupService;
