# Deploy AI Journal Analysis - Quick Start

This guide will help you deploy the automatic AI journal analysis feature.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project configured
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Quick Deployment

### 1. Setup Functions

```bash
# Run the setup script
./setup-functions.sh

# Or manually:
cd functions
npm install
npm run build
```

### 2. Configure API Key

```bash
# Set your Gemini API key as a secret
firebase functions:secrets:set GEMINI_API_KEY
# Enter your API key when prompted
```

### 3. Deploy

```bash
# Deploy the function
firebase deploy --only functions
```

## How It Works

Once deployed, the system works automatically:

1. **User writes journal entry** → Entry saved to Firestore
2. **Firestore trigger fires** → `analyzeJournalEntry` function runs
3. **AI analysis happens** → Gemini processes the content
4. **Results saved** → AI insights added to the entry
5. **UI updates** → Insights appear in the journal interface

## Verification

After deployment:

1. Create a new journal entry in your app
2. Wait 10-30 seconds
3. Refresh or navigate back to see AI insights appear
4. Check Firebase Console → Functions → Logs for any errors

## Monitoring

Monitor the function in Firebase Console:
- **Functions** → View execution logs
- **Firestore** → Check `journal_entries` collection for `aiInsights` field
- **Usage** → Monitor API calls and costs

## Troubleshooting

### Function Not Triggering
- Check Firestore rules allow function access
- Verify function deployed successfully
- Check function logs for errors

### API Key Issues
```bash
# Verify secret is set
firebase functions:secrets:access GEMINI_API_KEY

# Re-set if needed
firebase functions:secrets:set GEMINI_API_KEY
```

### Analysis Not Appearing
- Wait up to 60 seconds for processing
- Check function logs for Gemini API errors
- Verify journal entry has content and mood set

## Cost Estimation

- **Gemini API**: ~$0.00025 per 1K characters
- **Firebase Functions**: Free tier covers most usage
- **Firestore**: Minimal additional reads/writes

For 100 journal entries per day (~500 words each):
- Gemini cost: ~$0.12/day
- Firebase costs: Negligible on free tier

## Success!

Your AI journal analysis is now running automatically. Users will see insights appear in their journal entries without any manual intervention.