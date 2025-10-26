import api from './api';

export const studentService = {
  // Get my children
  async getMyChildren() {
    try {
      const response = await api.get('/students/my-children');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get children error:', error);
      return { success: false, error: 'Хүүхдийн мэдээлэл татахад алдаа гарлаа' };
    }
  },

  // Get child details
  async getChildDetails(id) {
    try {
      const response = await api.get(`/students/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get child details error:', error);
      return { success: false, error: 'Хүүхдийн дэлгэрэнгүй мэдээлэл татахад алдаа гарлаа' };
    }
  },

  // Get child pickup history
  async getChildPickupHistory(id) {
    try {
      const response = await api.get(`/students/${id}/pickup-history`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get pickup history error:', error);
      return { success: false, error: 'Түүх татахад алдаа гарлаа' };
    }
  },
};

export default studentService;
