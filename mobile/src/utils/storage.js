import { Platform } from 'react-native';

// Check if we're on web by checking for localStorage
const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Only import SecureStore for native platforms
let SecureStore = null;
if (!isWeb) {
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {
    console.warn('SecureStore not available');
  }
}

// Storage abstraction that works on both web and native
const storage = {
  async setItem(key, value) {
    if (isWeb) {
      // Use localStorage for web
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    } else {
      // Use SecureStore for native
      try {
        if (SecureStore) {
          await SecureStore.setItemAsync(key, value);
        }
      } catch (error) {
        console.error('Error saving to SecureStore:', error);
      }
    }
  },

  async getItem(key) {
    if (isWeb) {
      // Use localStorage for web
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
      }
    } else {
      // Use SecureStore for native
      try {
        if (SecureStore) {
          return await SecureStore.getItemAsync(key);
        }
        return null;
      } catch (error) {
        console.error('Error reading from SecureStore:', error);
        return null;
      }
    }
  },

  async deleteItem(key) {
    if (isWeb) {
      // Use localStorage for web
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error('Error deleting from localStorage:', error);
      }
    } else {
      // Use SecureStore for native
      try {
        if (SecureStore) {
          await SecureStore.deleteItemAsync(key);
        }
      } catch (error) {
        console.error('Error deleting from SecureStore:', error);
      }
    }
  },
};

export default storage;
