import api from './api';
import storage from '../utils/storage';

export const authService = {
  // Login
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;

      // Store token and user data securely
      await storage.setItem('userToken', token);
      await storage.setItem('userData', JSON.stringify(user));

      return { success: true, user, token };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа'
      };
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear stored data
      await storage.deleteItem('userToken');
      await storage.deleteItem('userData');
      await storage.deleteItem('selectedStudent');
    }
  },

  // Get stored user data
  async getStoredUser() {
    try {
      const userData = await storage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },

  // Get stored token
  async getStoredToken() {
    try {
      return await storage.getItem('userToken');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getStoredToken();
    return !!token;
  },
};

export default authService;
