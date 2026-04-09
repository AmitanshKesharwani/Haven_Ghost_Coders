# Firebase Functions Deployment Guide

## Prerequisites

1. **Firebase CLI**: Install the Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. **Authentication**: Login to Firebase:
   ```bash
   firebase login
   ```

3. **Project Setup**: Ensure you're in the correct Firebase project:
   ```bash
   firebase use --add
   ```

## Environment Configuration

1. **Create Environment File**: Create `.env.Haven-mental-health` in the functions directory with:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

2. **Google Cloud Credentials**: Ensure your Firebase project has the following APIs enabled:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
   - Cloud Functions API

## Deployment Steps

1. **Navigate to Functions Directory**:
   ```bash
   cd functions
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build TypeScript**:
   ```bash
   npm run build
   ```

4. **Deploy Functions**:
   ```bash
   npm run deploy
   ```

   Or use Firebase CLI directly:
   ```bash
   firebase deploy --only functions
   ```

## Verify Deployment

After deployment, you should see the following functions in your Firebase Console:
- `transcribeAudio` - Speech-to-Text function
- `synthesizeSpeech` - Text-to-Speech function
- `analyzeJournalEntry` - Journal analysis function

## Troubleshooting

### Common Issues:

1. **"functions/not-found" Error**: Functions are not deployed
   - Solution: Run the deployment steps above

2. **"functions/unauthenticated" Error**: User not signed in
   - Solution: Ensure user authentication is working

3. **"internal" Error**: Check function logs
   - Solution: Run `firebase functions:log` to see detailed errors

4. **API Key Issues**: 
   - Ensure GROQ_API_KEY is set in the environment file
   - Verify Google Cloud APIs are enabled

### Testing Functions Locally:

1. **Start Emulator**:
   ```bash
   npm run serve
   ```

2. **Update Client Code**: Set `VITE_USE_FIREBASE_EMULATOR=true` in your `.env` file

## Production Considerations

1. **Security Rules**: Ensure proper authentication checks
2. **Rate Limiting**: Consider implementing rate limiting for API calls
3. **Monitoring**: Set up Cloud Monitoring for function performance
4. **Costs**: Monitor usage to avoid unexpected charges

## Support

If you encounter issues:
1. Check Firebase Console for function logs
2. Verify all APIs are enabled in Google Cloud Console
3. Ensure billing is enabled for your Firebase project