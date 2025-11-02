# Mobile App Testing Guide - Parent Features

**Date**: 2025-11-01
**Version**: 2.0 - Parent Edition

---

## Quick Start

### Option 1: Mobile Web View (Recommended for Testing)

1. **Start the backend server** (in another terminal):
   ```bash
   cd /home/buyaka/Desktop/spms/backend
   npm run dev
   ```

2. **Start the mobile web server**:
   ```bash
   cd /home/buyaka/Desktop/spms/mobile
   npm run web
   ```

3. **Open in browser**:
   - URL: `http://localhost:19006` (or as shown in terminal)
   - Press F12 to open DevTools
   - Click device toggle icon (📱) or press Ctrl+Shift+M
   - Select a mobile device (iPhone 12, Pixel 5, etc.)

### Option 2: Expo Go App on Physical Device

1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Start the server: `npm start`
3. Scan QR code with Expo Go app

---

## Test Accounts

Use these parent accounts for testing:

### Parent with Multiple Children
- **DAN ID**: `parent001`
- **Children**: Multiple students

### Parent with Single Child
- **DAN ID**: `parent002`
- **Children**: One student

### Parent with No Children (Edge Case)
- **DAN ID**: `parent003`
- **Children**: None (to test empty state)

---

## Testing Checklist

### 1. Login Flow ✅

**Test**: Login with parent account
- [ ] Enter DAN ID: `parent001`
- [ ] Click "Нэвтрэх" (Login)
- [ ] Verify successful authentication
- [ ] Check role is set to "parent"

**Expected**:
- Login successful
- Redirects to Student Selection screen
- No errors in console

---

### 2. Student Selection Screen ✅

**Test**: Multiple children selection
- [ ] Verify all children are displayed
- [ ] Check each child shows:
  - Avatar with first name initial
  - Full name
  - Class name
  - Teacher name (if available)
- [ ] Tap on a child to select
- [ ] Verify selection is stored
- [ ] Confirm navigation to Home

**Test**: Single child auto-select
- [ ] Login with `parent002`
- [ ] Verify immediate redirect to Home (no selection needed)
- [ ] Check correct child is pre-selected

**Test**: No children edge case
- [ ] Login with `parent003`
- [ ] Verify empty state message
- [ ] Check help text displayed

**Expected**:
- Clean, card-based UI
- Smooth animations
- Touch-responsive
- Proper data display

---

### 3. Home Screen ✅

**Test**: Selected student display
- [ ] Verify selected student card at top
- [ ] Check avatar, name, class displayed
- [ ] For multi-child parents: Verify "Солих" (Switch) button visible
- [ ] For single-child parents: No switch button

**Test**: Statistics cards
- [ ] Verify 3 stat cards displayed:
  - Total recent requests
  - Completed requests
  - Pending requests
- [ ] Check numbers match data

**Test**: Quick pickup button
- [ ] Tap "Хүүхэд авах" button
- [ ] Verify navigation to CreatePickup
- [ ] Check selected student pre-filled

**Test**: Recent requests list
- [ ] Verify only selected student's requests shown
- [ ] Check status colors:
  - Pending: Orange
  - Approved: Green
  - Completed: Purple
  - Rejected: Red
  - Cancelled: Gray
- [ ] Verify dates formatted correctly

**Test**: Pull-to-refresh
- [ ] Pull down on screen
- [ ] Verify loading indicator
- [ ] Check data refreshes

**Test**: Switch student
- [ ] Tap "Солих" button (if visible)
- [ ] Verify navigation to StudentSelection
- [ ] Select different child
- [ ] Verify Home updates with new child's data

---

### 4. Create Pickup Screen ✅

**Test**: Pre-selected student
- [ ] Navigate to CreatePickup
- [ ] Verify selected student is pre-selected
- [ ] Check other children also available for selection

**Test**: Location check
- [ ] Verify location permission request
- [ ] Check location status displayed
- [ ] Test "Байршил шалгах" button

**Test**: Standard pickup
- [ ] Select "Энгийн" request type
- [ ] Select child
- [ ] Add notes (optional)
- [ ] Tap "Хүсэлт илгээх"
- [ ] Verify success message

**Test**: Guest pickup
- [ ] Select "Зочин хүн" request type
- [ ] Fill guest information:
  - Name
  - Phone
  - ID number
- [ ] Add notes
- [ ] Submit request
- [ ] Verify different success message

**Test**: Validation
- [ ] Try submitting without child: Error
- [ ] Try submitting without location: Error
- [ ] Guest pickup without name: Error
- [ ] Guest pickup without phone: Error
- [ ] Guest pickup without ID: Error

---

### 5. History Screen ✅

**Test**: Filtered history
- [ ] Navigate to History tab
- [ ] Verify selected student name in header
- [ ] Check only selected student's requests shown
- [ ] Verify chronological order (newest first)

**Test**: Request cards
- [ ] Check each request shows:
  - Date (formatted in Mongolian)
  - Time
  - Status badge (colored)
  - Request type (Standard/Guest)
  - Guest name (if applicable)
  - Notes (if applicable)

**Test**: Empty state
- [ ] Switch to child with no history
- [ ] Verify empty state message
- [ ] Check icon displayed

**Test**: Pull-to-refresh
- [ ] Pull down to refresh
- [ ] Verify data updates

---

### 6. Profile Screen ✅

**Test**: Personal information
- [ ] Verify user avatar with initial
- [ ] Check full name displayed
- [ ] Verify "Эцэг эх" (Parent) role shown
- [ ] Check personal info section:
  - DAN ID
  - Phone
  - Email

**Test**: Selected student section
- [ ] Verify current student displayed
- [ ] Check avatar, name, class
- [ ] For multi-child: Verify "Хүүхэд солих" button

**Test**: All children list
- [ ] For multi-child parents: Verify section visible
- [ ] Check all children listed
- [ ] Verify "Идэвхтэй" (Active) badge on current student
- [ ] Check count in header: "Бүх хүүхдүүд (N)"

**Test**: Switch student
- [ ] Tap "Хүүхэд солих" button
- [ ] Verify navigation to StudentSelection
- [ ] Select different child
- [ ] Return to Profile
- [ ] Verify active badge updated

**Test**: Logout
- [ ] Tap "Гарах" button
- [ ] Verify confirmation dialog
- [ ] Tap "Тийм" to confirm
- [ ] Verify logout successful
- [ ] Check redirect to Login

---

### 7. Navigation ✅

**Test**: Bottom tabs
- [ ] Tap each tab:
  - 🏠 Нүүр (Home)
  - 🕐 Түүх (History)
  - 👤 Профайл (Profile)
- [ ] Verify active tab highlighted
- [ ] Check screens load correctly

**Test**: Back navigation
- [ ] From CreatePickup: Back to Home
- [ ] From StudentSelection: Cannot go back (disabled)
- [ ] From Home: Cannot go back to selection

**Test**: Deep linking
- [ ] Navigate to CreatePickup from Home
- [ ] Navigate to History
- [ ] Navigate back
- [ ] Verify stack navigation works

---

### 8. Data Persistence ✅

**Test**: Selected student persists
- [ ] Select a student
- [ ] Close the app (or refresh browser)
- [ ] Reopen the app
- [ ] Verify same student still selected

**Test**: Session persistence
- [ ] Login
- [ ] Close app
- [ ] Reopen
- [ ] Verify still logged in
- [ ] Check selected student maintained

---

### 9. Mobile Responsiveness 🌐

**Test**: Different screen sizes
- [ ] Test on iPhone SE (375x667)
- [ ] Test on iPhone 12 (390x844)
- [ ] Test on Pixel 5 (393x851)
- [ ] Test on iPad (768x1024)

**Test**: Orientation
- [ ] Test portrait mode
- [ ] Test landscape mode (if applicable)

**Test**: Touch interactions
- [ ] All buttons tappable
- [ ] Pull-to-refresh works
- [ ] Scroll works smoothly
- [ ] No double-tap zoom issues

---

### 10. Error Handling 🔴

**Test**: Network errors
- [ ] Stop backend server
- [ ] Try to load data
- [ ] Verify error handling
- [ ] Check error messages displayed

**Test**: Invalid data
- [ ] No children: Empty state shown
- [ ] No requests: Empty state shown
- [ ] Invalid student selection: Redirect to selection

**Test**: Authentication errors
- [ ] Invalid DAN ID: Error message
- [ ] Expired token: Logout and redirect
- [ ] Unauthorized access: Error handling

---

### 11. Performance ⚡

**Test**: Load times
- [ ] Login response time: < 2s
- [ ] Student list load: < 1s
- [ ] Home screen load: < 1s
- [ ] History load: < 2s

**Test**: Smooth scrolling
- [ ] Scroll through long lists
- [ ] No lag or jank
- [ ] Pull-to-refresh smooth

---

## Browser DevTools Setup

### Chrome DevTools

1. **Open DevTools**: F12 or Ctrl+Shift+I
2. **Toggle Device Mode**: Ctrl+Shift+M
3. **Select Device**:
   - iPhone 12 Pro (recommended)
   - iPhone SE
   - Pixel 5
4. **Useful panels**:
   - **Console**: Check for errors
   - **Network**: Monitor API calls
   - **Application**: Check SecureStore (LocalStorage)

### Firefox Responsive Design Mode

1. **Open RDM**: Ctrl+Shift+M
2. **Select Device**: iPhone 12
3. **Touch simulation**: Enable touch events

---

## Expected API Calls

### On Login
```
POST /api/v1/auth/login
Body: { danId: 'parent001', role: 'parent' }
Response: { token: '...', user: {...} }
```

### On Student Selection Screen
```
GET /api/v1/students/my-children
Response: [{ id, firstName, lastName, class: {...} }]
```

### On Home Screen
```
GET /api/v1/students/my-children
GET /api/v1/pickup-requests/my-requests?studentId={id}&limit=5
```

### On Create Pickup
```
POST /api/v1/pickup-requests
Body: {
  studentId: '...',
  requestType: 'standard' | 'guest',
  scheduledPickupTime: '...',
  requestLocationLat: ...,
  requestLocationLng: ...,
  notes: '...',
  // If guest:
  guestName: '...',
  guestPhone: '...',
  guestIdNumber: '...'
}
```

### On History Screen
```
GET /api/v1/pickup-requests/my-requests?studentId={id}&limit=50
```

---

## Common Issues & Solutions

### Issue: White screen after login
**Solution**: Check if backend is running, check console for errors

### Issue: Student selection not showing
**Solution**: Verify `/api/v1/students/my-children` returns data

### Issue: Location not working
**Solution**: Allow location permissions in browser

### Issue: Data not updating after switch
**Solution**: Check if `useEffect` with navigation listener is working

### Issue: Can't click buttons
**Solution**: Check z-index, ensure no overlays, verify touch events

---

## Testing Summary

### Core Flows
1. ✅ Login → StudentSelection → Home
2. ✅ Home → CreatePickup → Submit → Home
3. ✅ Home → Switch Student → Select → Home (updated)
4. ✅ Profile → Switch Student → Select → Profile (updated)
5. ✅ History → View filtered requests

### Key Features
- ✅ Student selection and persistence
- ✅ Data filtering by selected student
- ✅ Easy student switching
- ✅ Pickup request creation
- ✅ History viewing
- ✅ Profile management

### Quality Checks
- ✅ No admin features visible
- ✅ Only parent's children accessible
- ✅ Proper error handling
- ✅ Responsive design
- ✅ Smooth performance

---

## Next Steps After Testing

### If Issues Found
1. Document the issue
2. Check console errors
3. Verify backend API response
4. Check network calls
5. Report to developer

### If All Tests Pass
1. ✅ Mark as ready for production
2. Deploy backend
3. Build mobile app
4. Distribute to parents
5. Monitor usage

---

## Support

### For Bugs
- Check console errors
- Verify API responses
- Check SecureStore data
- Review network calls

### For Feature Requests
- Document desired behavior
- Provide mockups if possible
- Explain use case

---

**Testing Status**: Ready for QA
**Last Updated**: 2025-11-01
**Tested By**: [Your Name]
**Sign-off**: [ ] Approved for Production
