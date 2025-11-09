import api from './api';

export const teacherService = {
  // Get teacher's assigned class
  async getMyClass() {
    const response = await api.get('/teachers/me/class');
    return response.data;
  },

  // Get students in teacher's class
  async getMyStudents() {
    const response = await api.get('/teachers/me/students');
    return response.data;
  },

  // Get teacher's dashboard statistics
  async getDashboardStats() {
    const response = await api.get('/teachers/me/stats');
    return response.data;
  },

  // Get today's pickup summary
  async getPickupSummary(date) {
    const params = date ? { date: date.toISOString() } : {};
    const response = await api.get('/teachers/me/pickup-summary', { params });
    return response.data;
  },
};

export default teacherService;
