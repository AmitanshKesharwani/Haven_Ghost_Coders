# Backend Analysis Debugging Guide

## 🚨 **Current Issue**
The backend analysis may still be producing incorrect results for critical mental health content like "I feel like dying".

## 🔧 **Enhanced Debugging Steps**

### 1. **Deploy Enhanced Cloud Function**
```bash
# Deploy the function with extensive logging and validation
cd functions
npm run build
firebase deploy --only functions

# Check deployment status
firebase functions:log --only analyzeJournalEntry
```

### 2. **Force Re-analysis for Testing**

#### Option A: Modify Entry to Trigger Re-analysis
1. Go to your journal entry "I feel like dying"
2. Edit it slightly (add a space or period)
3. Save the entry
4. This will trigger the Cloud Function

#### Option B: Use Force Re-analysis Flag
1. In `functions/src/index.ts`, change:
   ```typescript
   const FORCE_REANALYSIS = true; // Set to true temporarily
   ```
2. Deploy: `firebase deploy --only functions`
3. Edit any journal entry to trigger re-analysis
4. **IMPORTANT**: Change back to `false` and redeploy after testing

### 3. **Monitor Cloud Function Logs**
```bash
# Watch logs in real-time
firebase functions:log --only analyzeJournalEntry

# Or check in Firebase Console
# Go to: Firebase Console > Functions > analyzeJournalEntry > Logs
```

### 4. **What to Look For in Logs**

#### **Prompt Verification**
Look for: `📝 PROMPT SENT TO GEMINI`
- Verify the safety guidelines are present
- Check that the content and mood are correct

#### **Gemini Response**
Look for: `🤖 RAW GEMINI RESPONSE`
- Check if Gemini actually returned positive sentiment
- Verify the raw JSON structure

#### **Validation Corrections**
Look for: `⚠️ CORRECTION:` messages
- See what corrections were applied
- Verify risk flags were added

#### **Final Results**
Look for: `🛡️ VALIDATED INSIGHTS`
- Check the final sentiment score
- Verify risk flags are present

### 5. **Expected Log Output for "I feel like dying"**
```
📊 ANALYSIS DECISION: shouldAnalyze: true
📝 PROMPT SENT TO GEMINI: [Enhanced safety prompt]
🤖 RAW GEMINI RESPONSE: {"sentimentScore": -0.9, "riskFlags": ["suicidal_ideation"], ...}
🔍 CONTENT ANALYSIS: hasSuicidalContent: true
🛡️ VALIDATED INSIGHTS: {"sentimentScore": -0.9, "riskFlags": ["suicidal_ideation"], ...}
✅ Successfully analyzed and updated entry
```

### 6. **If Analysis is Still Wrong**

#### **Check Gemini API Key**
```bash
# Verify API key is set
firebase functions:config:get

# If using secrets (v2 functions)
firebase functions:secrets:access GEMINI_API_KEY
```

#### **Verify Model Access**
- Ensure your Google Cloud project has access to `gemini-1.5-pro`
- Check API quotas and limits

#### **Manual Firestore Cleanup**
If you need to clear bad analysis:
1. Go to Firestore Console
2. Find the journal entry document
3. Delete the `aiInsights` field
4. Edit the entry to trigger re-analysis

### 7. **Testing Checklist**

- [ ] Deploy enhanced function with logging
- [ ] Create test entry: "I feel like dying" with mood "Sad"
- [ ] Wait 30 seconds for analysis
- [ ] Check Cloud Function logs
- [ ] Verify sentiment is negative (-0.8 or lower)
- [ ] Verify risk flags include "suicidal_ideation"
- [ ] Verify summary is appropriate
- [ ] Check UI shows correct analysis (no 🚨 warning)

### 8. **Production Cleanup**

After testing:
1. Set `FORCE_REANALYSIS = false`
2. Remove excessive logging if desired
3. Redeploy: `firebase deploy --only functions`

## 🛡️ **Safety Features Added**

1. **Enhanced Prompts**: Explicit "DO NOT MISS" instructions
2. **Validation Layer**: Automatic correction of dangerous misanalyses  
3. **Extensive Logging**: Track every step of the analysis process
4. **Force Re-analysis**: Ability to re-process problematic entries
5. **Multiple Safety Checks**: Sentiment, risk flags, and summary validation

The backend analysis should now be bulletproof for mental health content!