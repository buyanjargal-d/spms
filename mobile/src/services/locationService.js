import { Platform } from 'react-native';

// Check if we're on web
const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

// Only import expo-location on native
let Location = null;
if (!isWeb) {
  try {
    Location = require('expo-location');
  } catch (e) {
    console.warn('expo-location not available');
  }
}

export const locationService = {
  // Request location permissions
  async requestPermissions() {
    if (isWeb) {
      // On web, permissions are requested automatically by getCurrentPosition
      return true;
    }

    try {
      if (!Location) return false;
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  },

  // Get current location
  async getCurrentLocation() {
    if (isWeb) {
      // Use browser Geolocation API
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve({
            success: false,
            error: 'Таны browser байршил дэмжихгүй байна'
          });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              success: true,
              data: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              },
            });
          },
          (error) => {
            console.error('Web geolocation error:', error);
            resolve({
              success: false,
              error: 'Байршил авахад алдаа гарлаа. Зөвшөөрөл өгнө үү.'
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    }

    // Native location
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Байршлын зөвшөөрөл олгоогүй байна'
        };
      }

      if (!Location) {
        return {
          success: false,
          error: 'Location service unavailable'
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        success: true,
        data: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        },
      };
    } catch (error) {
      console.error('Location error:', error);
      return {
        success: false,
        error: 'Байршил авахад алдаа гарлаа'
      };
    }
  },

  // Calculate distance between two coordinates (in meters)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  // Check if user is within school radius
  isWithinSchoolRadius(userLat, userLon, schoolLat, schoolLon, radiusMeters = 150) {
    const distance = this.calculateDistance(userLat, userLon, schoolLat, schoolLon);
    return {
      isWithin: distance <= radiusMeters,
      distance: Math.round(distance),
    };
  },
};

export default locationService;
