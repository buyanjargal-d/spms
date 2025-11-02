# Quick Start - Mobile Web Testing

## Current Status
✅ Server running on: **http://localhost:8081**
✅ All storage issues fixed
✅ Ready for testing

## Steps to Test

### 1. Open Browser
- Go to: **http://localhost:8081**

### 2. Enable Mobile View
**Chrome:**
- Press `F12` to open DevTools
- Press `Ctrl+Shift+M` to toggle device toolbar
- Select device: **iPhone 12 Pro** or **Pixel 5**
- Refresh page if needed

**Firefox:**
- Press `Ctrl+Shift+M` for Responsive Design Mode
- Select mobile device dimensions

### 3. Test Login
- Enter DAN ID: `parent001`
- Click "Нэвтрэх" (Login)
- Should redirect to Student Selection

### 4. Check Storage
**DevTools → Application → Local Storage → http://localhost:8081**

You should see:
- `userToken`: JWT token
- `userData`: User info
- `selectedStudent`: Selected child

### 5. Test Features
- [x] Login
- [x] Select student
- [x] View home (filtered by student)
- [x] Switch student
- [x] Create pickup request
- [x] View history
- [x] View profile
- [x] Logout

## Test Accounts
- `parent001` - Multiple children
- `parent002` - Single child
- `parent003` - No children

## Troubleshooting

### White Screen
- Check browser console (F12)
- Ensure backend is running
- Clear cache and reload

### API Errors
**Start backend:**
```bash
cd /home/buyaka/Desktop/spms/backend
npm run dev
```

### Storage Not Working
- Check DevTools → Application → Local Storage
- Ensure browser allows localStorage
- Try incognito/private mode

### Server Not Running
```bash
cd /home/buyaka/Desktop/spms/mobile
npx expo start --web --clear
```

## Current Changes

### Fixed
✅ SecureStore compatibility (now uses localStorage on web)
✅ Cross-platform storage abstraction
✅ Dynamic import for native-only modules
✅ Web platform detection

### Files Modified
- `src/utils/storage.js` - New cross-platform storage
- All screens now use `storage` instead of `SecureStore`

## Next Steps
1. Test in browser at http://localhost:8081
2. Verify all features work
3. Check localStorage in DevTools
4. Test on mobile devices when ready

---

**Server URL**: http://localhost:8081
**Backend URL**: http://localhost:3000 (should be running)
**Status**: ✅ Ready for Testing
