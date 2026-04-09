# Test Client-Side AI Analysis

## Quick Test Steps

### 1. Set Up Environment
```bash
# Make sure you have your API key in .env
echo "VITE_GEMINI_API_KEY=your_actual_api_key" >> .env
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test AI Analysis

1. **Navigate to Journal**: Go to the Journal section in your app
2. **Create Entry**: Write a journal entry with some emotional content, like:
   ```
   Today was really challenging at work. I felt overwhelmed with all the deadlines, 
   but I managed to take some deep breaths and talk to my colleague about it. 
   That helped me feel a bit better. I'm grateful for having supportive people around me.
   ```
3. **Select Mood**: Choose an appropriate mood (e.g., "Stressed")
4. **Save Entry**: Click "Save Entry"
5. **Wait**: Wait 2-3 seconds
6. **Check Results**: You should see AI insights appear with:
   - Sentiment score
   - Key themes (work, stress, support)
   - Positive mentions (deep breaths, supportive people)
   - Negative mentions (overwhelmed, challenging)
   - Coping mentioned (breathing, talking to colleague)

### 4. Verify in Browser Console

Open browser developer tools and check for:
- ✅ No errors related to AI analysis
- ✅ Console log: "AI insights added to entry: [entry-id]"
- ❌ Any API key or network errors

## Expected Results

### Successful Analysis
```json
{
  "sentimentScore": -0.2,
  "sentimentMagnitude": 0.7,
  "keyThemes": ["work", "stress", "support", "coping"],
  "positiveMentions": ["supportive people", "deep breaths"],
  "negativeMentions": ["overwhelming", "challenging"],
  "potentialTriggers": ["work deadlines"],
  "copingMentioned": ["deep breathing", "talking to colleague"],
  "riskFlags": [],
  "summary": "User experienced work stress but used coping strategies and found support."
}
```

### Common Issues

#### API Key Not Set
- **Error**: "AI analysis not available - missing API key"
- **Solution**: Check your `.env` file has `VITE_GEMINI_API_KEY=your_key`

#### Network/API Errors
- **Error**: Network request failed
- **Solution**: Check internet connection and API key validity

#### Rate Limiting
- **Error**: 429 Too Many Requests
- **Solution**: Wait a minute and try again (free tier limit)

## Success Indicators

- ✅ AI insights appear automatically after saving entries
- ✅ Existing entries get analyzed when visiting the journal
- ✅ No console errors
- ✅ Insights display properly in the UI
- ✅ Analysis completes within 5-10 seconds

## Next Steps

Once testing is successful:
1. Create more journal entries to see different analysis results
2. Try entries with different emotional tones
3. Check that the analysis adapts to different content types
4. Verify the system works consistently

Your client-side AI analysis is now ready for use!