# Firebase Authentication Error Fix

## Error
```
Access blocked: project-66825998276's request is invalid
Error 400: redirect_uri_mismatch
```

## Root Cause
The `.env` file was incorrectly updated with "Haven" in the Firebase configuration, but the actual Firebase project in Google Cloud is still named "mannmitra-mental-health".

## Fix Applied ✅

### 1. Restored Correct Firebase Configuration
Updated `.env` file with the correct Firebase project details:

```env
VITE_FIREBASE_AUTH_DOMAIN=mannmitra-mental-health.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mannmitra-mental-health
VITE_FIREBASE_STORAGE_BUCKET=mannmitra-mental-health.firebasestorage.app
```

### 2. Fixed TypeScript Errors
Fixed ThemeContext.tsx type definitions to include optional sidebar properties.

## Next Steps

### Option A: Keep Current Firebase Project (Recommended)
1. **Restart your dev server**: Stop and restart `npm run dev`
2. **Clear browser cache**: Clear cookies and local storage for localhost
3. **Test authentication**: Try signing in again

### Option B: Create New Firebase Project with "Haven" Name
If you want the Firebase project to also be named "Haven":

1. **Create New Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name it "haven-mental-health"
   - Enable Google Analytics (optional)

2. **Enable Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google Sign-in
   - Add authorized domains: `localhost`, your production domain

3. **Update Authorized Domains**:
   - In Firebase Console → Authentication → Settings → Authorized domains
   - Add: `localhost`, `127.0.0.1`, your production domain

4. **Get New Configuration**:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the config values

5. **Update `.env` File**:
   ```env
   VITE_FIREBASE_API_KEY=your_new_api_key
   VITE_FIREBASE_AUTH_DOMAIN=haven-mental-health.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=haven-mental-health
   VITE_FIREBASE_STORAGE_BUCKET=haven-mental-health.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_new_sender_id
   VITE_FIREBASE_APP_ID=your_new_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_new_measurement_id
   ```

6. **Migrate Data** (if needed):
   - Export data from old project
   - Import to new project
   - Or start fresh

## Verification

After applying the fix, verify:

1. ✅ Dev server restarts without errors
2. ✅ Sign-in page loads correctly
3. ✅ Google Sign-in button works
4. ✅ Email/Password authentication works
5. ✅ No console errors related to Firebase

## Important Notes

- **Firebase project names in Google Cloud cannot be changed** - you can only create a new project
- The comment in `.env` can say "Haven" but the actual Firebase config must match your real project
- Keep the current setup unless you specifically need a new Firebase project
- All your existing data is in the "mannmitra-mental-health" project

## Current Status

✅ **Fixed**: Firebase configuration restored to correct values
✅ **Fixed**: TypeScript errors in ThemeContext resolved
🔄 **Action Required**: Restart dev server and clear browser cache

The app should now work correctly with authentication!
