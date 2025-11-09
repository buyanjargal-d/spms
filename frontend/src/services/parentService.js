import api from './api';

export const parentService = {
  // Get parent's children
  async getMyChildren() {
    const response = await api.get('/parents/me/children');
    return response.data;
  },

  // Get parent's pickup requests
  async getMyRequests(filters = {}) {
    const response = await api.get('/parents/me/requests', { params: filters });
    return response.data;
  },

  // Get authorized guardians for a student
  async getAuthorizedGuardians(studentId) {
    const response = await api.get(`/parents/me/guardians/${studentId}`);
    return response.data;
  },

  // Get parent's dashboard statistics
  async getDashboardStats() {
    const response = await api.get('/parents/me/stats');
    return response.data;
  },
};

export default parentService;
