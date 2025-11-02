# SPMS Mobile - Android Testing Guide

**System**: Ubuntu 22.04 with 4GB RAM
**Last Updated**: 2025-10-30

---

## Prerequisites ✓

Your system is already configured with:
- ✅ EAS CLI installed (`/home/buyaka/.nvm/versions/node/v22.21.0/bin/eas`)
- ✅ EAS project configured (Project ID: `9793ed1b-45a1-4096-a199-626797bfa8a7`)
- ✅ `eas.json` with Android build profiles
- ✅ `app.json` with Android permissions and package name

---

## Quick Start - Choose Your Testing Method

### Option 1: Preview Build (Recommended for Quick Testing) ⭐

**Best for**: Quick testing without debugging, showing to stakeholders

```bash
cd /home/buyaka/Desktop/spms/mobile

# Build preview APK
eas build --profile preview --platform android
```

**Time**: ~10-15 minutes (cloud build)
**Result**: Standalone APK you can install on any Android device
**Pro**: Simple, no dev server needed, works offline
**Con**: No hot reload, no debugging tools

---

### Option 2: Development Build (Best for Active Development) 🔧

**Best for**: Active development with hot reload and debugging

```bash
cd /home/buyaka/Desktop/spms/mobile

# Build development APK (first time only)
eas build --profile development --platform android
```

**Time**: ~10-15 minutes (cloud build, one-time)
**Result**: Development APK that connects to your dev server
**Pro**: Hot reload, debugging, console logs
**Con**: Requires dev server running, larger file size

---

## Step-by-Step: Preview Build (Simplest)

### Step 1: Start the Build

```bash
cd /home/buyaka/Desktop/spms/mobile
eas build --profile preview --platform android
```

**What happens**:
1. EAS CLI uploads your code to Expo servers
2. Cloud servers build your APK
3. You get a download link when complete

**Expected output**:
```
✔ Build in progress...
✔ Build finished!

Build URL: https://expo.dev/accounts/bbka/projects/spms-mobile/builds/...
Download APK: [direct link]
```

### Step 2: Download the APK

**Option A - Browser**:
```bash
# Open the build page in browser
xdg-open "https://expo.dev/accounts/bbka/projects/spms-mobile/builds"
```

**Option B - Direct download with wget**:
```bash
# EAS will show you the download URL
# Replace <BUILD_ID> with the actual build ID
wget -O spms-mobile-preview.apk "https://expo.dev/artifacts/eas/[...].apk"
```

**Option C - Using EAS CLI**:
```bash
# List recent builds
eas build:list --platform android --limit 5

# Download latest build
eas build:download --platform android --latest
```

### Step 3: Transfer APK to Android Device

**Method 1 - USB Cable**:
```bash
# Connect Android phone via USB
# Enable USB debugging on phone (Settings → Developer Options → USB Debugging)

# Check if device is connected
adb devices

# Install APK
adb install spms-mobile-preview.apk
```

**Method 2 - Cloud Storage**:
```bash
# Upload to Google Drive, Dropbox, or email
# Download on phone and install
```

**Method 3 - Local Network**:
```bash
# Start a simple HTTP server
python3 -m http.server 8080

# On phone, open browser and go to:
# http://YOUR_COMPUTER_IP:8080/spms-mobile-preview.apk
```

### Step 4: Install on Android Phone

1. **Enable Unknown Sources**:
   - Settings → Security → Install unknown apps
   - Select your browser/file manager
   - Enable "Allow from this source"

2. **Install APK**:
   - Tap the downloaded APK file
   - Tap "Install"
   - Wait for installation to complete
   - Tap "Open"

3. **Grant Permissions**:
   - Location permission (required for pickup verification)
   - Notification permission (for pickup alerts)

### Step 5: Configure API URL

**Important**: The app is configured to connect to:
```
http://192.168.1.3:3000/api/v1
```

**Update if needed**:

1. Edit `mobile/app.json`:
```json
"extra": {
  "apiUrl": "http://YOUR_COMPUTER_IP:3000/api/v1"
}
```

2. Get your computer's IP:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

3. Rebuild the app with new IP

---

## Step-by-Step: Development Build (With Hot Reload)

### Step 1: Build Development APK (One Time)

```bash
cd /home/buyaka/Desktop/spms/mobile
eas build --profile development --platform android
```

Wait ~10-15 minutes for build to complete.

### Step 2: Install Development APK on Phone

Follow same installation steps as Preview Build above.

### Step 3: Start Backend Server

```bash
cd /home/buyaka/Desktop/spms/backend
npm run dev
```

**Expected output**:
```
Server running on port 3000
Database connected
```

### Step 4: Start Expo Dev Server

```bash
cd /home/buyaka/Desktop/spms/mobile
npx expo start --dev-client
```

**Expected output**:
```
› Metro waiting on exp://192.168.1.3:8081
› Scan the QR code above with Expo Go (Android)
```

### Step 5: Connect Phone to Dev Server

**Option A - QR Code (Easiest)**:
1. Open installed development app on phone
2. Tap "Scan QR Code"
3. Scan QR code from terminal

**Option B - Manual URL**:
1. Note the URL: `exp://192.168.1.3:8081`
2. Open development app on phone
3. Tap "Enter URL manually"
4. Enter the URL

### Step 6: Development Workflow

Now you can:
- ✅ Edit code on computer
- ✅ See changes instantly on phone (hot reload)
- ✅ View console.log() in terminal
- ✅ Use React Native Debugger
- ✅ Shake phone to open dev menu

---

## Troubleshooting

### Build Fails

**Issue**: EAS build fails
**Solution**:
```bash
# Check build logs
eas build:list --platform android

# View specific build logs
eas build:view [BUILD_ID]

# Common fix: Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
eas build --profile preview --platform android --clear-cache
```

### Can't Connect to Dev Server

**Issue**: Development app can't reach dev server
**Solution**:
```bash
# 1. Check both devices on same WiFi network
# 2. Get correct IP address
ip addr show | grep "inet " | grep -v 127.0.0.1

# 3. Update app.json with correct IP
# 4. Rebuild and reinstall

# 5. Check firewall
sudo ufw allow 3000
sudo ufw allow 8081
```

### API Connection Fails

**Issue**: App shows "Network Error" or "Cannot connect"
**Solution**:

1. **Check backend is running**:
```bash
curl http://localhost:3000/api/v1/health
```

2. **Check IP is correct**:
```bash
# Get your IP
hostname -I | awk '{print $1}'

# Test from phone browser
# Open: http://YOUR_IP:3000/api/v1/health
```

3. **Update API URL** in `mobile/app.json` and rebuild

### APK Install Blocked

**Issue**: "For security, your phone is not allowed to install apps from this source"
**Solution**:
1. Settings → Security → Install unknown apps
2. Find your file manager or browser
3. Enable "Allow from this source"

### Location Permission Denied

**Issue**: App can't get location
**Solution**:
1. Settings → Apps → SPMS Mobile → Permissions
2. Enable "Location" → "Allow all the time" or "Allow only while using"
3. Restart app

---

## Testing Checklist

### Pre-Testing Setup

- [ ] Backend server running (`npm run dev` in `backend/`)
- [ ] Database connected (check backend logs)
- [ ] Correct API URL in `app.json`
- [ ] Phone and computer on same WiFi network

### Build Checklist

- [ ] EAS build successful
- [ ] APK downloaded
- [ ] APK installed on phone
- [ ] App launches without crash
- [ ] Permissions granted (location, notifications)

### Feature Testing

**Authentication**:
- [ ] Login screen appears
- [ ] Can enter DAN ID
- [ ] Login succeeds
- [ ] JWT token stored

**Location Services**:
- [ ] Location permission requested
- [ ] Current location obtained
- [ ] School radius validation works
- [ ] Shows distance from school

**Pickup Request (Standard)**:
- [ ] Can select child
- [ ] Location validated
- [ ] Request created successfully
- [ ] Shows confirmation message
- [ ] Request appears in backend

**Pickup Request (Guest)**:
- [ ] Can toggle to "Guest" type
- [ ] Guest info form appears
- [ ] Guest name field works
- [ ] Guest phone field works
- [ ] Guest ID field works
- [ ] Validation works
- [ ] Request created with guest data
- [ ] Shows parent approval message

**Navigation**:
- [ ] Bottom tabs work
- [ ] Can navigate between screens
- [ ] Back button works
- [ ] No crashes

**Error Handling**:
- [ ] Network errors show message
- [ ] Invalid input shows validation
- [ ] Graceful error recovery

---

## Build Profiles Explained

### Development Profile
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "android": {
    "buildType": "apk",
    "gradleCommand": ":app:assembleDebug"
  }
}
```
- **Use**: Active development
- **Size**: ~80-100 MB (includes debugging tools)
- **Requires**: Dev server running
- **Features**: Hot reload, debugging, console logs

### Preview Profile
```json
{
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- **Use**: Testing, demos, stakeholder reviews
- **Size**: ~40-50 MB
- **Requires**: Nothing (standalone)
- **Features**: Production-like, no debugging

### Production Profile
```json
{
  "android": {
    "buildType": "apk"
  }
}
```
- **Use**: Release to Play Store or users
- **Size**: ~30-40 MB (optimized)
- **Requires**: Nothing
- **Features**: Optimized, minified, signed

---

## Quick Commands Reference

```bash
# Build commands
eas build --profile preview --platform android          # Quick test build
eas build --profile development --platform android      # Dev build with debugging
eas build --profile production --platform android       # Production build

# Build management
eas build:list --platform android                       # List builds
eas build:download --platform android --latest          # Download latest
eas build:view [BUILD_ID]                              # View build details
eas build:cancel [BUILD_ID]                            # Cancel running build

# Dev server
npx expo start --dev-client                            # Start for development build
npx expo start                                         # Start regular
npx expo start --clear                                 # Clear cache

# Device management
adb devices                                            # List connected devices
adb install app.apk                                    # Install APK
adb uninstall com.spms.mobile                         # Uninstall app
adb logcat | grep "spms"                              # View app logs

# Get computer IP for API URL
hostname -I | awk '{print $1}'                         # Ubuntu
ip addr show | grep "inet " | grep -v 127.0.0.1      # Alternative

# Test backend
curl http://localhost:3000/api/v1/health              # Local test
curl http://YOUR_IP:3000/api/v1/health               # Network test
```

---

## Recommended Workflow

### For Quick Testing (New Features)
```bash
# 1. Make code changes
# 2. Build preview
eas build --profile preview --platform android

# 3. Wait for build (~10 min)
# 4. Download and install APK
# 5. Test on phone
```

### For Active Development (Multiple Changes)
```bash
# 1. Build development APK once
eas build --profile development --platform android

# 2. Install on phone (one time)
# 3. Start backend
cd backend && npm run dev

# 4. Start dev server
cd mobile && npx expo start --dev-client

# 5. Connect phone via QR code
# 6. Make changes, see instant updates
```

---

## Tips & Best Practices

1. **First Time**: Use preview build for simplicity
2. **API URL**: Always use your computer's network IP, not `localhost`
3. **WiFi**: Keep phone and computer on same network
4. **Permissions**: Grant all permissions when app first launches
5. **Dev Build**: Only build once, reuse for development
6. **Cache**: Add `--clear-cache` if build behaves strangely
7. **Logs**: Check both terminal and `adb logcat` for errors
8. **Backend**: Always start backend before testing API features

---

## Next Steps

1. **Build Your First APK**:
   ```bash
   cd /home/buyaka/Desktop/spms/mobile
   eas build --profile preview --platform android
   ```

2. **While Waiting** (~10 min):
   - Make sure backend is running
   - Check API is accessible: `curl http://YOUR_IP:3000/api/v1/health`
   - Prepare Android device (enable unknown sources)

3. **After Build**:
   - Download APK
   - Install on phone
   - Test login, location, pickup requests
   - Report any issues

4. **For Development**:
   - Build development APK
   - Start dev server
   - Enjoy hot reload

---

## Support & Resources

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Expo Dev Client**: https://docs.expo.dev/development/introduction/
- **Your Builds**: https://expo.dev/accounts/bbka/projects/spms-mobile/builds
- **Project Settings**: https://expo.dev/accounts/bbka/projects/spms-mobile/settings

---

**Ready to build? Run**:
```bash
cd /home/buyaka/Desktop/spms/mobile
eas build --profile preview --platform android
```
