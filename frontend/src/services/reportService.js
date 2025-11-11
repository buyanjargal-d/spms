import api from './api';

const reportService = {
  // ==================== REPORT TYPES ====================

  async getReportTypes() {
    try {
      const response = await api.get('/reports/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching report types:', error);
      throw error;
    }
  },

  // ==================== DAILY REPORT ====================

  async getDailyReport(date, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (filters.classId) params.append('classId', filters.classId);
      if (filters.gradeLevel) params.append('gradeLevel', filters.gradeLevel);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/reports/daily?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily report:', error);
      throw error;
    }
  },

  // ==================== MONTHLY REPORT ====================

  async getMonthlyReport(year, month, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('year', year);
      params.append('month', month);
      if (filters.classId) params.append('classId', filters.classId);

      const response = await api.get(`/reports/monthly?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      throw error;
    }
  },

  // ==================== STUDENT HISTORY REPORT ====================

  async getStudentHistory(studentId, startDate, endDate, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      if (filters.guardianId) params.append('guardianId', filters.guardianId);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/reports/student/${studentId}/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student history report:', error);
      throw error;
    }
  },

  // ==================== ANALYTICS ====================

  async getPickupTrends(startDate, endDate, groupBy = 'day') {
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      params.append('groupBy', groupBy);

      const response = await api.get(`/reports/analytics/trends?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pickup trends:', error);
      throw error;
    }
  },

  async getDashboardStats() {
    try {
      const response = await api.get('/reports/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};

export default reportService;
