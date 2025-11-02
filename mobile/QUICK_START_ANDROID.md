# Quick Start - Android Testing

**Time**: 15 minutes to first test
**System**: Ubuntu 22.04 + 4GB RAM

---

## ⚡ Fast Track (3 Commands)

```bash
# 1. Navigate to mobile directory
cd /home/buyaka/Desktop/spms/mobile

# 2. Use the helper script (RECOMMENDED)
./build-android.sh

# 3. Or build directly
eas build --profile preview --platform android
```

**That's it!** Wait 10-15 minutes for the build, then download and install the APK.

---

## 🎯 Using the Helper Script (Easiest Method)

```bash
cd /home/buyaka/Desktop/spms/mobile
./build-android.sh
```

**Interactive Menu**:
```
1) Preview Build          → Quick testing (recommended)
2) Development Build      → Hot reload + debugging
3) List Recent Builds     → See your builds
4) Download Latest Build  → Get APK
5) Check Configuration    → Verify setup
6) Install APK via USB    → Push to phone
7) Start Dev Server       → For development builds
8) Get Computer IP        → For API config
9) Test Backend           → Check API connection
```

**Recommended Flow**:
1. Choose option **1** (Preview Build)
2. Wait ~10-15 minutes
3. Choose option **4** (Download Latest Build)
4. Transfer APK to phone and install

---

## 📱 Manual Build Steps

### Step 1: Build APK

```bash
cd /home/buyaka/Desktop/spms/mobile

# For quick testing (recommended)
eas build --profile preview --platform android
```

### Step 2: Monitor Build

Visit: https://expo.dev/accounts/bbka/projects/spms-mobile/builds

Or check in terminal - EAS will show progress.

### Step 3: Download APK

When build completes, EAS shows download link:

```bash
# Option A: Click the link in terminal

# Option B: Download via CLI
eas build:download --platform android --latest

# Option C: Visit builds page
xdg-open "https://expo.dev/accounts/bbka/projects/spms-mobile/builds"
```

### Step 4: Install on Android Phone

**Transfer APK**:
- USB cable: `adb install spms-mobile-*.apk`
- Email/Drive: Download on phone
- HTTP server: `python3 -m http.server 8080`

**Install**:
1. Enable "Install from unknown sources"
2. Tap APK file
3. Tap "Install"
4. Grant permissions (Location, Notifications)

### Step 5: Configure & Test

**Current API URL**: `http://192.168.1.3:3000/api/v1`

**If your IP changed**:
```bash
# Get new IP
hostname -I | awk '{print $1}'

# Update mobile/app.json
"extra": {
  "apiUrl": "http://YOUR_NEW_IP:3000/api/v1"
}

# Rebuild
eas build --profile preview --platform android
```

**Test backend**:
```bash
# On phone browser, visit:
http://192.168.1.3:3000/api/v1/health

# Should show: {"status":"ok"}
```

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Clear cache and retry
eas build --profile preview --platform android --clear-cache
```

### Can't Install APK

1. Settings → Security → Install unknown apps
2. Enable for your file manager/browser

### Backend Not Accessible

```bash
# 1. Check backend is running
cd /home/buyaka/Desktop/spms/backend
npm run dev

# 2. Check firewall
sudo ufw allow 3000

# 3. Test connection
curl http://192.168.1.3:3000/api/v1/health
```

### Wrong IP Address

```bash
# Get current IP
hostname -I | awk '{print $1}'

# Update app.json
# Search for "apiUrl" and update IP

# Rebuild app
```

---

## 🎬 Development Build (For Active Development)

**One-time setup**:
```bash
# 1. Build development APK
eas build --profile development --platform android

# 2. Download and install on phone
eas build:download --platform android --latest

# 3. Install via USB
adb install spms-mobile-*.apk
```

**Daily workflow**:
```bash
# Terminal 1: Backend
cd /home/buyaka/Desktop/spms/backend
npm run dev

# Terminal 2: Dev Server
cd /home/buyaka/Desktop/spms/mobile
npx expo start --dev-client

# Phone: Open SPMS app, scan QR code
# Now: Edit code → Auto reload on phone!
```

---

## ✅ Testing Checklist

Before building:
- [ ] Backend running: `curl http://localhost:3000/api/v1/health`
- [ ] Correct IP in `app.json`
- [ ] EAS CLI logged in: `eas whoami`

After installing:
- [ ] App launches
- [ ] Login screen appears
- [ ] Location permission granted
- [ ] Can reach backend (check network tab)

Feature tests:
- [ ] Login works
- [ ] Can see children list
- [ ] Can create standard pickup
- [ ] Can create guest pickup
- [ ] Location validation works

---

## 📚 Full Documentation

- **Complete Guide**: `ANDROID_TESTING_GUIDE.md`
- **Implementation Status**: `../IMPLEMENTATION_COMPLETE.md`
- **Backend Setup**: `../backend/README.md`

---

## 🚀 Ready to Build?

**Simplest method** (uses helper script):
```bash
cd /home/buyaka/Desktop/spms/mobile
./build-android.sh
```

**Direct method** (manual):
```bash
cd /home/buyaka/Desktop/spms/mobile
eas build --profile preview --platform android
```

**Time**: ~10-15 minutes for build
**Result**: Installable APK for your Android device

---

## 💡 Pro Tips

1. **Use preview builds** for quick testing
2. **Use development build once**, reuse for many dev sessions
3. **Keep phone and computer** on same WiFi
4. **Always use network IP**, never `localhost` or `127.0.0.1`
5. **Test backend first** before blaming the app
6. **Grant all permissions** when app first launches
7. **Check EAS dashboard** for build logs if issues occur

---

## 🆘 Need Help?

1. Run the helper script: `./build-android.sh`
2. Choose option 5 (Check Configuration)
3. Choose option 9 (Test Backend)
4. Check full guide: `ANDROID_TESTING_GUIDE.md`

---

**Your current setup**:
- ✅ EAS CLI installed
- ✅ Project configured
- ✅ API URL: `http://192.168.1.3:3000/api/v1`
- ✅ Ready to build!

Run: `./build-android.sh` or `eas build --profile preview --platform android`
