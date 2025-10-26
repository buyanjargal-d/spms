import api from './api';

export const studentService = {
  // Get all students
  async getAllStudents(filters = {}) {
    const response = await api.get('/students', { params: filters });
    return response.data;
  },

  // Get student by ID
  async getStudentById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Get student guardians
  async getStudentGuardians(id) {
    const response = await api.get(`/students/${id}/guardians`);
    return response.data;
  },

  // Get student pickup history
  async getStudentPickupHistory(id) {
    const response = await api.get(`/students/${id}/pickup-history`);
    return response.data;
  },

  // Create student
  async createStudent(data) {
    const response = await api.post('/students', data);
    return response.data;
  },

  // Update student
  async updateStudent(id, data) {
    const response = await api.patch(`/students/${id}`, data);
    return response.data;
  },

  // Delete student
  async deleteStudent(id) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

export default studentService;
