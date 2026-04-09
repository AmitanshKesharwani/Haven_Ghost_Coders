# Firebase Functions Setup for AI Journal Analysis

This guide will help you set up Firebase Functions to automatically analyze journal entries using Google's Gemini AI.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project configured
- Google AI Studio API key (get from https://makersuite.google.com/app/apikey)

## Setup Steps

### 1. Install Dependencies

Run the setup script to install function dependencies:

```bash
./setup-functions.sh
```

Or manually:

```bash
cd functions
npm install
npm run build
```

### 2. Configure Environment Variables

Set your Gemini API key as an environment variable:

```bash
# For Firebase Functions v2, set environment variables
firebase functions:secrets:set GEMINI_API_KEY
# When prompted, enter your Gemini API key

# Alternative: Set via .env file for local development
echo "GEMINI_API_KEY=your_api_key_here" > functions/.env
```

### 3. Deploy Functions

Deploy the functions to Firebase:

```bash
firebase deploy --only functions
```

### 4. Test Locally (Optional)

To test functions locally with the Firebase emulator:

```bash
# Start emulators
firebase emulators:start --only functions,firestore

# In another terminal, test the function
firebase functions:shell
```

## How It Works

### Automatic Analysis

The `analyzeJournalEntry` function automatically triggers when:
- A new journal entry is created
- An existing entry's content or mood is significantly changed
- AI insights are missing or older than 24 hours

### Analysis Process

The analysis happens completely automatically in the background. When users create or edit journal entries, the AI analysis will appear within a few seconds without any user interaction required.

## AI Insights Generated

The AI analysis provides:

- **Sentiment Score**: -1.0 (very negative) to 1.0 (very positive)
- **Sentiment Magnitude**: 0.0 to 1.0 (strength of emotion)
- **Key Themes**: Main topics mentioned (work, family, anxiety, etc.)
- **Positive Mentions**: Specific positive topics/phrases
- **Negative Mentions**: Specific negative topics/phrases
- **Potential Triggers**: Things that might trigger negative feelings
- **Coping Mentioned**: Any coping strategies mentioned
- **Risk Flags**: Critical indicators (hopelessness, self-harm references, etc.)
- **Summary**: Brief AI-generated summary

## Security & Privacy

- All analysis happens server-side in Firebase Functions
- User data never leaves your Firebase project
- AI insights are stored securely in Firestore
- Functions include proper authentication checks

## Monitoring

Monitor function execution in the Firebase Console:
- Go to Functions section
- Check logs for any errors
- Monitor usage and performance

## Troubleshooting

### Common Issues

1. **API Key Not Set**
   ```
   Error: Gemini API Key not set in Firebase config
   ```
   Solution: Run `firebase functions:secrets:set GEMINI_API_KEY`

2. **Parsing Errors**
   - Check function logs in Firebase Console
   - AI responses are logged for debugging

3. **Permission Errors**
   - Ensure Firestore rules allow function access
   - Check user authentication in manual triggers

### Firestore Rules

Make sure your Firestore rules allow functions to read/write journal entries:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /journal_entries/{entryId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.firebase.sign_in_provider == 'custom');
    }
  }
}
```

## Cost Considerations

- Gemini API calls cost approximately $0.00025 per 1K characters
- Firebase Functions have a generous free tier
- Consider implementing rate limiting for high-volume usage

## Next Steps

1. Deploy the functions
2. Test with a few journal entries
3. Monitor the logs to ensure everything works
4. Optionally add more sophisticated analysis features

For support, check the Firebase Console logs or create an issue in the project repository.