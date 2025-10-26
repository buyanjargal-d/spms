# Quick Start Guide

## ✅ What Was Fixed

1. **Installed all dependencies** - All npm packages are now installed
2. **Fixed app configuration** - Removed references to missing asset files
3. **Created assets directory** - Ready for custom icons when needed
4. **Added configuration guide** - See .env.example for API setup

## 🚀 How to Run (3 Steps)

### Step 1: Start Backend (Required!)
```bash
cd /home/buyaka/Desktop/spms/backend
npm install  # if not done already
npm run dev
```

Backend must be running on http://localhost:3000

### Step 2: Start Mobile App
```bash
cd /home/buyaka/Desktop/spms/mobile
npm start
```

### Step 3: Choose Your Platform
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)
- Scan QR code with Expo Go app on physical device

## 🔑 Login Credentials
Use these demo accounts:
- `parent001`
- `parent002`
- `parent003`

## 📱 For Physical Devices

If testing on a real phone (not emulator):

1. Find your computer's IP:
   ```bash
   hostname -I
   ```

2. Edit `/home/buyaka/Desktop/spms/mobile/app.json`:
   ```json
   "extra": {
     "apiUrl": "http://YOUR_IP:3000/api/v1"
   }
   ```
   Replace `YOUR_IP` with the IP from step 1

3. Install Expo Go app from Play Store/App Store
4. Scan QR code from terminal

## ⚠️ Important Notes

- **Backend must be running first** - The mobile app needs the API
- **Use localhost for emulators** - Use IP address for physical devices
- **Grant location permissions** - Required for pickup requests

## 📚 More Information

- Full details: See `FIXES_APPLIED.md`
- Original README: See `README.md`
- Setup guide: See `MOBILE_SETUP_GUIDE.md`

## ❓ Common Issues

**"Network request failed"**
→ Backend not running. Start it first!

**"Location permission denied"**
→ Grant location permission in device settings

**App won't start**
→ Try: `expo start -c` (clears cache)

---

**Status: Ready to Run!** 🎉
