import api from './api';

const adminService = {
  // ==================== USER MANAGEMENT ====================

  async getAllUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async toggleUserStatus(userId, isActive) {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  async resetUserPassword(userId, newPassword) {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  async unlockUserAccount(userId) {
    try {
      const response = await api.post(`/admin/users/${userId}/unlock`);
      return response.data;
    } catch (error) {
      console.error('Error unlocking account:', error);
      throw error;
    }
  },

  // ==================== STUDENT MANAGEMENT ====================

  async getAllStudents(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.classId) params.append('classId', filters.classId);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/admin/students?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  async getStudentById(studentId) {
    try {
      const response = await api.get(`/admin/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  async createStudent(studentData) {
    try {
      const response = await api.post('/admin/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  async updateStudent(studentId, studentData) {
    try {
      const response = await api.put(`/admin/students/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  async deleteStudent(studentId) {
    try {
      const response = await api.delete(`/admin/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  async assignStudentToClass(studentId, classId) {
    try {
      const response = await api.post(`/admin/students/${studentId}/assign-class`, { classId });
      return response.data;
    } catch (error) {
      console.error('Error assigning student to class:', error);
      throw error;
    }
  },

  // ==================== GUARDIAN MANAGEMENT ====================

  async addGuardianToStudent(studentId, guardianData) {
    try {
      const response = await api.post(`/admin/students/${studentId}/guardians`, guardianData);
      return response.data;
    } catch (error) {
      console.error('Error adding guardian:', error);
      throw error;
    }
  },

  async removeGuardianFromStudent(studentId, guardianId) {
    try {
      const response = await api.delete(`/admin/students/${studentId}/guardians/${guardianId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing guardian:', error);
      throw error;
    }
  },

  async updateGuardianAuthorization(studentId, guardianId, isAuthorized, notes) {
    try {
      const response = await api.patch(
        `/admin/students/${studentId}/guardians/${guardianId}/authorization`,
        { isAuthorized, notes }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating guardian authorization:', error);
      throw error;
    }
  },

  // ==================== CLASS MANAGEMENT ====================

  async getAllClasses(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      if (filters.gradeLevel) params.append('gradeLevel', filters.gradeLevel);

      const response = await api.get(`/admin/classes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  async getClassById(classId) {
    try {
      const response = await api.get(`/admin/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  },

  // ==================== SYSTEM SETTINGS ====================

  async getSettings(category = null) {
    try {
      const url = category ? `/admin/settings?category=${category}` : '/admin/settings';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  async getSetting(key) {
    try {
      const response = await api.get(`/admin/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  },

  async updateSetting(key, value) {
    try {
      const response = await api.put(`/admin/settings/${key}`, { value });
      return response.data;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  },

  // ==================== STATISTICS ====================

  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};

export default adminService;
