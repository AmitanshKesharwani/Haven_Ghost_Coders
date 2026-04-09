# How to Get Your FREE Gemini API Key (2 Minutes)

## Step 1: Go to Google AI Studio
🔗 **https://aistudio.google.com/app/apikey**

## Step 2: Sign in with Google Account
- Use any Google account (Gmail)
- It's completely FREE

## Step 3: Create API Key
1. Click **"Create API Key"** button
2. Select a Google Cloud project (or create new one)
3. Click **"Create API Key in new project"** if you don't have one
4. Copy the API key (starts with `AIza...`)

## Step 4: Add to Your Project
1. Open `.env` file
2. Replace this line:
   ```
   VITE_GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
   ```
   With:
   ```
   VITE_GEMINI_API_KEY=AIza... (your actual key)
   ```

## Step 5: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

## ✅ Done!
Your AI companion will now use real Gemini AI instead of fallback responses!

---

## Free Tier Limits
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is MORE than enough for development and testing!

---

## Troubleshooting

### "API_KEY_INVALID"
- Make sure you copied the entire key
- No spaces before/after the key
- Restart dev server after changing .env

### "PERMISSION_DENIED"
- Enable Gemini API at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- Click "Enable"

### Still not working?
- Check browser console (F12) for detailed error messages
- The app will show helpful error messages in console

---

## Current Status
✅ **Intelligent Fallback System Active**
- Your app works NOW without API key
- Gives contextual responses based on user's message
- But real Gemini AI is MUCH better!

💡 **Get API key to unlock:**
- Natural conversation flow
- Better understanding of context
- More empathetic responses
- Multi-turn conversation memory
