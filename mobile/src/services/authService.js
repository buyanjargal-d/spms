import api from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  // Login
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token and user data securely
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
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
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
    }
  },

  // Get stored user data
  async getStoredUser() {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },

  // Get stored token
  async getStoredToken() {
    try {
      return await SecureStore.getItemAsync('userToken');
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
