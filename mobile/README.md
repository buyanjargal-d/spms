# SPMS Mobile App - React Native

Mobile application for parents and guardians to manage student pickup requests.

## 🚀 Quick Start

### Prerequisites
- Node.js v20.x or higher
- Expo CLI installed globally
- iOS Simulator (Mac) or Android Studio (Android)
- Physical device (optional, recommended for GPS testing)

### Installation

```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Install dependencies
cd mobile
npm install

# Start development server
npm start
```

### Running on Device

**iOS (Mac only):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Physical Device:**
1. Install "Expo Go" app from App Store/Play Store
2. Scan QR code from terminal

---

## 📱 Features

### ✅ Implemented

1. **Authentication**
   - Login with DAN ID
   - Secure token storage
   - Auto-login on app restart

2. **Home Screen**
   - Welcome message
   - Quick pickup action
   - List of children
   - Recent requests
   - Pull-to-refresh

3. **Create Pickup Request**
   - GPS location verification
   - Select child
   - Add notes
   - Real-time location check
   - Distance calculation

4. **Navigation**
   - Bottom tab navigation
   - Stack navigation
   - Protected routes

5. **Common Components**
   - Button (multiple variants)
   - Input (with validation)
   - Card
   - Loading states

### 🔄 To Be Implemented

- Push notifications (FCM)
- Pickup history with filters
- Request status tracking
- Profile management
- Notification settings
- Offline support

---

## 📁 Project Structure

```
mobile/
├── App.js                  # Main entry point
├── app.json                # Expo configuration
├── package.json
└── src/
    ├── components/
    │   └── common/         # Reusable components
    │       ├── Button.js
    │       ├── Input.js
    │       └── Card.js
    ├── contexts/
    │   └── AuthContext.js  # Auth state management
    ├── navigation/
    │   └── index.js        # Navigation setup
    ├── screens/
    │   ├── Auth/
    │   │   └── LoginScreen.js
    │   ├── Home/
    │   │   └── HomeScreen.js
    │   ├── Pickup/
    │   │   └── CreatePickupScreen.js
    │   ├── History/
    │   │   └── HistoryScreen.js
    │   └── Profile/
    │       └── ProfileScreen.js
    └── services/
        ├── api.js          # Axios config
        ├── authService.js  # Auth API calls
        ├── pickupService.js# Pickup API calls
        ├── studentService.js# Student API calls
        └── locationService.js# GPS utilities
```

---

## 🔐 Demo Login

```
DAN ID: parent001, parent002, or parent003
(Mock authentication for development)
```

---

## 🛠️ Tech Stack

- **React Native** 0.73
- **Expo** ~50.0
- **React Navigation** v6
- **Axios** - HTTP client
- **Expo Location** - GPS services
- **Expo Secure Store** - Secure storage
- **Expo Notifications** - Push notifications

---

## 🌍 Environment Configuration

Create `.env` file in mobile/ folder:

```env
API_URL=http://YOUR_IP:3000/api/v1
```

**Note:** Don't use `localhost` for physical devices. Use your computer's IP address.

**Find your IP:**
```bash
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

---

## 📱 Testing on Physical Device

### iOS (TestFlight - Production)
1. Build with `expo build:ios`
2. Upload to TestFlight
3. Invite testers

### Android (APK - Development)
```bash
expo build:android -t apk
```

### Using Expo Go (Development)
1. Install Expo Go app
2. Scan QR code
3. App runs on device

---

## 🔧 Common Issues

### Issue: "Network request failed"
**Solution:** Check API_URL in config
- Use computer's IP, not localhost
- Ensure backend is running
- Check firewall settings

### Issue: GPS not working
**Solution:** 
- Grant location permissions
- Enable location services
- Test on physical device (simulators may have issues)

### Issue: "Expo Go not connecting"
**Solution:**
- Ensure phone and computer on same WiFi
- Restart Expo server
- Check firewall

---

## 📊 Key Files

### App.js
Main entry point, wraps app with providers

### src/navigation/index.js
Navigation setup (Stack + Tab navigation)

### src/contexts/AuthContext.js
Authentication state management

### src/services/api.js
Axios configuration with interceptors

### src/services/locationService.js
GPS utilities and distance calculation

---

## 🎯 Development Tips

### 1. Hot Reload
- Shake device or press Cmd+D (iOS) / Cmd+M (Android)
- Enable "Fast Refresh"

### 2. Debugging
```bash
# React Native Debugger
npx react-devtools

# Console logs
expo start --dev-client
```

### 3. Testing GPS
- Use physical device for accurate GPS
- Simulator: Features > Location > Custom Location

### 4. API Testing
- Use Postman to test backend first
- Check network tab in React Native Debugger

---

## 📱 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Configuration needed:
1. Update `app.json` with:
   - Correct bundle identifiers
   - App name, icon, splash screen
   - Permissions

2. For stores:
   - iOS: Apple Developer account ($99/year)
   - Android: Google Play account ($25 one-time)

---

## 🔐 Security Features

- ✅ Secure token storage (Expo Secure Store)
- ✅ HTTPS API calls
- ✅ GPS verification
- ✅ Token auto-refresh
- ✅ Request/response interceptors

---

## 📝 Adding New Features

### Example: Add new screen

1. **Create screen file:**
```javascript
// src/screens/NewFeature/NewScreen.js
import React from 'react';
import { View, Text } from 'react-native';

const NewScreen = () => {
  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
};

export default NewScreen;
```

2. **Add to navigation:**
```javascript
// src/navigation/index.js
import NewScreen from '../screens/NewFeature/NewScreen';

// Add to stack or tab navigator
<Stack.Screen name="NewScreen" component={NewScreen} />
```

---

## 🎓 For Your Thesis

### Phase 1: Functionality
- Complete all CRUD operations
- Test GPS accuracy
- Implement notifications
- Handle offline scenarios

### Phase 2: Security
- Add biometric authentication
- Implement certificate pinning
- Add security scanning
- Test for vulnerabilities

---

## 🐛 Troubleshooting

### Clear cache
```bash
expo start -c
```

### Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

### Reset Expo
```bash
expo r -c
```

---

## 📞 Support

For issues:
1. Check Expo documentation: https://docs.expo.dev
2. React Navigation: https://reactnavigation.org
3. Check terminal console for errors
4. Use React Native Debugger

---

## ✅ Checklist

Before deploying:
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] GPS permission working
- [ ] Push notifications working
- [ ] API calls successful
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Offline handling
- [ ] App icons added
- [ ] Splash screen configured

---

**Created for:** SPMS Bachelor's Thesis  
**Author:** Д.Буянжаргал  
**University:** Монгол Улсын Их Сургууль
