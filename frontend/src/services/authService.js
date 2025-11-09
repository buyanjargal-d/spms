import api from './api';

export const authService = {
  // Login with DAN
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Refresh token
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },
};

export default authService;
