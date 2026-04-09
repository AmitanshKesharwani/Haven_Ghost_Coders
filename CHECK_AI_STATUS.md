# AI Status Diagnostic Check

## Step 1: Check Browser Console

Open browser console (F12) and look for these messages:

### What to Look For:

**Good Signs (AI is working):**
```
🎯 Using FULL PROMPT from aiOrchestrator
📝 Prompt length: 3500
✅ Successfully parsed JSON response
```

**Bad Signs (AI is failing):**
```
⚠️ Using demo mode - AI responses will be fallback responses only
❌ Error generating empathic response
🔄 Using fallback response due to error
GEMINI_API_KEY not configured
```

## Step 2: Check API Key

1. Open `.env` file
2. Look for: `VITE_GEMINI_API_KEY`
3. Make sure it's NOT "demo-key"
4. Make sure it's a valid Google AI API key

## Step 3: Restart Dev Server

**IMPORTANT**: You MUST restart the dev server for changes to take effect!

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Step 4: Clear Browser Cache

After restarting server:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or: F12 → Application → Clear Storage → Clear site data

## Step 5: Test Again

Send a message and check console for:
- Any error messages
- Which response path is being used
- If Gemini API is being called

## Common Issues:

### Issue 1: API Key Not Set
**Symptom**: Console shows "Using demo mode"
**Fix**: Set valid GEMINI_API_KEY in .env file

### Issue 2: Server Not Restarted
**Symptom**: Old code still running
**Fix**: Stop server (Ctrl+C) and restart (npm run dev)

### Issue 3: Cache Not Cleared
**Symptom**: Old responses cached
**Fix**: Hard refresh (Ctrl+Shift+R)

### Issue 4: Gemini API Quota Exceeded
**Symptom**: "quota exceeded" or "429" error
**Fix**: Wait or use different API key

### Issue 5: Network/Firewall Blocking
**Symptom**: "network error" or timeout
**Fix**: Check internet connection, disable VPN

## What to Report:

If still not working, please share:
1. Console error messages (screenshot or copy)
2. Network tab showing API calls
3. Any red errors in console

This will help identify the exact issue!
