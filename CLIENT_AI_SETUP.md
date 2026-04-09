# Client-Side AI Analysis Setup

This guide shows how to set up AI journal analysis without requiring Firebase Cloud Functions (works with free Firebase plan).

## Prerequisites

- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Firebase project (free plan is sufficient)

## Setup Steps

### 1. Configure API Key

Add your Gemini API key to your `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Gemini API key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies

The required dependencies should already be installed, but if needed:

```bash
npm install @google/generative-ai
```

### 3. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Create a new journal entry
3. Wait 2-3 seconds after saving
4. The AI insights should appear automatically

## How It Works

### Automatic Analysis
- When you create a new journal entry, AI analysis starts automatically after 2 seconds
- Existing entries without insights are analyzed when you visit the journal page
- Analysis happens in your browser using the Gemini API directly

### Features
- **Sentiment Analysis**: Emotional tone from -1 (negative) to +1 (positive)
- **Key Themes**: Main topics mentioned in the entry
- **Positive/Negative Mentions**: Specific positive and negative aspects
- **Potential Triggers**: Things that might cause stress or negative feelings
- **Coping Mechanisms**: Any coping strategies mentioned
- **Risk Flags**: Important mental health indicators (used cautiously)
- **Summary**: Brief AI-generated summary

## Benefits of Client-Side Approach

### ✅ **Advantages**
- Works with Firebase free plan
- No server deployment needed
- Immediate analysis (no cold starts)
- Full control over API usage
- Easy to debug and modify

### ⚠️ **Considerations**
- API key is visible in client code (use environment variables)
- Analysis happens in user's browser
- Requires internet connection for AI analysis
- API costs are per-request from client

## Security Notes

### API Key Protection
- The API key is only visible to users of your app
- Gemini API keys can be restricted by HTTP referrer
- Consider setting up API key restrictions in Google AI Studio

### Recommended Restrictions
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click on your API key
3. Add HTTP referrer restrictions:
   - `localhost:*` (for development)
   - `your-domain.com/*` (for production)

## Cost Management

### Gemini API Pricing
- ~$0.00025 per 1K characters
- Free tier: 15 requests per minute
- Paid tier: 1000 requests per minute

### Cost Example
For 100 journal entries per day (500 words each):
- Characters: ~50,000 per day
- Cost: ~$0.0125 per day (~$0.38 per month)

## Troubleshooting

### AI Analysis Not Working
1. Check browser console for errors
2. Verify API key is set in `.env` file
3. Ensure API key has proper permissions
4. Check network connectivity
5. Model compatibility issues (see below)

### API Key Issues
```bash
# Verify environment variable is loaded
console.log(import.meta.env.VITE_GEMINI_API_KEY)
```

### Model Compatibility
If you see "model not found" errors:
```javascript
// Test available models in browser console
import { clientAIAnalysis } from './src/services/clientAIAnalysis';
await clientAIAnalysis.debugAvailableModels();
```

The service automatically tries these models in order:
1. `gemini-1.5-pro-latest`
2. `gemini-1.5-pro`
3. `gemini-pro`
4. `gemini-1.0-pro`

### Rate Limiting
- Free tier: 15 requests/minute
- If you hit limits, analysis will fail silently
- Consider upgrading to paid tier for higher limits

## Success!

Your AI journal analysis is now working client-side! Users will see insights appear automatically after creating journal entries, and the system works with Firebase's free plan.