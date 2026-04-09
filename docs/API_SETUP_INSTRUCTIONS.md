# 🚀 Haven API Setup Instructions

## Quick Setup for AI Companion

The AI Companion is currently running in **Demo Mode** with hardcoded responses. To enable real AI-powered conversations, follow these steps:

### 1. Get Your Free Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (starts with `AIza...`)

### 2. Create Environment File

1. In your project root directory, create a file named `.env`
2. Add the following content:

```env
# Haven Environment Configuration
VITE_GEMINI_API_KEY=your_actual_api_key_here

# Application Configuration
VITE_APP_NAME=Haven
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_VOICE_ANALYSIS=true
VITE_ENABLE_EMOTION_DETECTION=true
VITE_ENABLE_FIREBASE=false
VITE_ENABLE_ANALYTICS=false

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info
```

3. Replace `your_actual_api_key_here` with your actual Gemini API key

### 3. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 4. Verify Setup

1. Open the AI Companion page
2. Look for the status indicator:
   - 🟢 **Green dot + "AI Powered"** = Real AI responses enabled
   - 🟡 **Yellow dot + "Demo Mode"** = Still using hardcoded responses

3. Check browser console for debug messages:
   - `🤖 Gemini AI Service Debug:` should show your API key
   - `🚀 Using real Gemini API` = Success!

## Troubleshooting

### Still seeing "Demo Mode"?

1. **Check .env file**: Make sure it's in the project root directory
2. **Verify API key**: Should start with `AIza` and be about 39 characters long
3. **Restart server**: Environment variables only load on server restart
4. **Check console**: Look for error messages in browser developer tools

### API Key Not Working?

1. **Verify key**: Make sure you copied the complete key from Google AI Studio
2. **Check quota**: Free tier has usage limits
3. **Try new key**: Generate a fresh API key if needed
4. **Check network**: Ensure you have internet connectivity

### Common Issues

- **File not found**: Make sure `.env` is in the same directory as `package.json`
- **Wrong format**: Use `VITE_GEMINI_API_KEY=` (not `GEMINI_API_KEY=`)
- **Spaces**: Don't add spaces around the `=` sign
- **Quotes**: Don't wrap the API key in quotes

## What You'll Get

With a real API key, the AI Companion will:

✅ **Generate personalized responses** based on your messages  
✅ **Understand context** from previous conversations  
✅ **Provide culturally sensitive** Hindi/English responses  
✅ **Detect crisis situations** and provide appropriate support  
✅ **Adapt to your language preference** (Hindi, English, or Mixed)  
✅ **Offer therapeutic interventions** based on your emotional state  

## Demo Mode Features

Even without an API key, you can still:

- 🎤 **Test voice input** (browser speech recognition)
- 📷 **Try emotion detection** (camera access)
- 📝 **Use journaling features**
- 📊 **View dashboard and analytics**
- 🎯 **Set and track goals**

## Need Help?

If you're still having issues:

1. Check the browser console for error messages
2. Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Make sure the `.env` file is properly formatted
4. Restart the development server after making changes

The AI Companion is designed to work seamlessly once properly configured!

