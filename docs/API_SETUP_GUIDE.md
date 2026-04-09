# Haven Advanced API Setup Guide

This comprehensive guide will help you set up all the necessary API keys and services for the advanced Haven mental health platform with AI-powered features.

## 🔑 Required API Keys

### 1. Google Gemini AI API Key (REQUIRED)
**Purpose**: Core AI functionality for therapeutic conversations, cultural adaptation, and crisis detection

**Steps to get the key**:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)
5. Add to your `.env` file:
   ```
   VITE_GEMINI_API_KEY="your_api_key_here"
   VITE_GOOGLE_AI_API_KEY="your_api_key_here"  # Alternative name
   ```

**Cost**: Free tier available with generous limits (15 requests/minute, 1500 requests/day)

---

## 🚀 Enhanced Features API Keys

### 2. Google Cloud Vision API (Recommended)
**Purpose**: Advanced facial emotion detection with cultural sensitivity

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Vision API
4. Create credentials (API Key)
5. Add to `.env`:
   ```
   VITE_GOOGLE_CLOUD_VISION_API_KEY="your_vision_api_key"
   ```

**Cost**: 1,000 requests/month free, then $1.50 per 1,000 requests

### 3. Google Cloud Speech-to-Text API (Recommended)
**Purpose**: Advanced voice analysis for Hindi/English speech recognition

**Steps**:
1. In Google Cloud Console, enable Speech-to-Text API
2. Create API key with Speech permissions
3. Add to `.env`:
   ```
   VITE_GOOGLE_CLOUD_SPEECH_API_KEY="your_speech_api_key"
   ```

**Cost**: 60 minutes/month free, then $0.006 per 15 seconds

### 4. Google Cloud Translation API (Optional)
**Purpose**: Multi-language support and cultural context understanding

**Steps**:
1. Enable Translation API in Google Cloud Console
2. Create API key
3. Add to `.env`:
   ```
   VITE_GOOGLE_CLOUD_TRANSLATE_API_KEY="your_translate_api_key"
   ```

**Cost**: 500,000 characters/month free

### 5. Firebase (User Data & Authentication)
**Purpose**: User profiles, session storage, real-time analytics, authentication

**Steps**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Enable Firestore Database and Authentication
5. Copy the configuration and add to `.env`:
   ```
   VITE_FIREBASE_API_KEY="your_firebase_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
   VITE_FIREBASE_APP_ID="1:123456789:web:abcdef123456"
   VITE_FIREBASE_MEASUREMENT_ID="G-ABCDEF1234"
   ```

**Cost**: Free Spark plan for development, Blaze plan for production

---

## 🔧 Optional Third-Party Services

### 6. OpenAI API (Backup AI Service)
**Purpose**: Alternative AI service for redundancy and specialized tasks

**Steps**:
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account and add payment method
3. Generate API key
4. Add to `.env`:
   ```
   VITE_OPENAI_API_KEY="sk-your_openai_key_here"
   ```

**Cost**: Pay-per-use, GPT-3.5-turbo ~$0.002 per 1K tokens

### 7. Anthropic Claude API (Alternative AI)
**Purpose**: Advanced reasoning and safety-focused AI responses

**Steps**:
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account and API key
3. Add to `.env`:
   ```
   VITE_ANTHROPIC_API_KEY="sk-ant-your_key_here"
   ```

**Cost**: Pay-per-use, Claude-3-haiku ~$0.25 per million tokens

### 8. Azure Cognitive Services (Microsoft AI)
**Purpose**: Additional emotion detection and speech services

**Steps**:
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create Cognitive Services resource
3. Get key and endpoint
4. Add to `.env`:
   ```
   VITE_AZURE_COGNITIVE_SERVICES_KEY="your_azure_key"
   VITE_AZURE_COGNITIVE_SERVICES_ENDPOINT="https://your-resource.cognitiveservices.azure.com/"
   ```

**Cost**: Free tier available, then pay-per-use

---

## 📱 Communication & Notifications

### 9. Twilio (SMS/Voice Notifications)
**Purpose**: Crisis intervention SMS alerts and voice calls

**Steps**:
1. Visit [Twilio Console](https://console.twilio.com/)
2. Create account and get phone number
3. Get Account SID and Auth Token
4. Add to `.env`:
   ```
   VITE_TWILIO_ACCOUNT_SID="your_account_sid"
   VITE_TWILIO_AUTH_TOKEN="your_auth_token"
   ```

**Cost**: Pay-per-use, SMS ~$0.0075 per message

### 10. SendGrid (Email Notifications)
**Purpose**: Automated email reports and alerts

**Steps**:
1. Visit [SendGrid](https://sendgrid.com/)
2. Create account and verify domain
3. Generate API key
4. Add to `.env`:
   ```
   VITE_SENDGRID_API_KEY="SG.your_sendgrid_key"
   ```

**Cost**: 100 emails/day free, then paid plans

---

## 📊 Analytics & Monitoring

### 11. Google Analytics (User Analytics)
**Purpose**: User behavior tracking and app performance

**Steps**:
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create property for your app
3. Get Measurement ID
4. Add to `.env`:
   ```
   VITE_GOOGLE_ANALYTICS_ID="G-ABCDEF1234"
   ```

**Cost**: Free

### 12. Mixpanel (Advanced Analytics)
**Purpose**: Detailed user journey and mental health progress tracking

**Steps**:
1. Visit [Mixpanel](https://mixpanel.com/)
2. Create project
3. Get project token
4. Add to `.env`:
   ```
   VITE_MIXPANEL_TOKEN="your_mixpanel_token"
   ```

**Cost**: Free tier for up to 20M events/month

### 13. Sentry (Error Monitoring)
**Purpose**: Real-time error tracking and performance monitoring

**Steps**:
1. Visit [Sentry](https://sentry.io/)
2. Create project
3. Get DSN
4. Add to `.env`:
   ```
   VITE_SENTRY_DSN="https://your_sentry_dsn@sentry.io/project_id"
   ```

**Cost**: Free tier for 5K errors/month

---

## 🚀 Quick Setup

1. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your Gemini API key** (minimum requirement):
   ```bash
   # Edit .env file
   VITE_GEMINI_API_KEY="AIza_your_actual_key_here"
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing Your Setup

### Test Core AI Features
1. Open the app in your browser (https://localhost:3000)
2. Complete onboarding flow
3. Navigate to AI Companion
4. Send a test message: "I'm feeling stressed about exams"
5. Verify you receive a culturally sensitive AI response

### Test Voice Analysis
1. Grant microphone permissions when prompted
2. Click the microphone icon in AI Companion
3. Speak in Hindi/English: "मैं बहुत परेशान हूं / I am very worried"
4. Verify transcription and emotional analysis

### Test Emotion Detection
1. Grant camera permissions when prompted
2. Click the video icon in AI Companion
3. Show different facial expressions
4. Verify real-time emotion detection feedback

### Test Crisis Detection
1. Send a message indicating distress (in a safe testing environment)
2. Verify crisis intervention protocols activate
3. Check that appropriate resources are displayed

---

## 🔒 Security Best Practices

### API Key Security
- **Never commit API keys to version control**
- Keep your `.env` file in `.gitignore`
- Use different keys for development/staging/production
- Regularly rotate your API keys (monthly recommended)
- Monitor API usage for unusual activity

### Environment-Specific Configuration
```bash
# Development
VITE_APP_ENV=development
VITE_DEBUG=true

# Staging
VITE_APP_ENV=staging
VITE_DEBUG=false

# Production
VITE_APP_ENV=production
VITE_DEBUG=false
```

### Rate Limiting & Quotas
- Set up billing alerts in Google Cloud
- Monitor API usage dashboards
- Implement client-side rate limiting
- Use caching to reduce API calls

---

## 💰 Cost Optimization

### Free Tier Maximization
- **Google Gemini AI**: 15 requests/minute, 1500/day free
- **Firebase**: 50K reads, 20K writes/day free
- **Google Cloud Vision**: 1,000 requests/month free
- **Google Analytics**: Completely free
- **Sentry**: 5K errors/month free

### Production Cost Estimates (1000 daily active users)
- **Gemini AI**: ~$50-100/month
- **Firebase**: ~$25-50/month
- **Google Cloud Services**: ~$30-60/month
- **Total**: ~$105-210/month

### Cost Reduction Strategies
1. **Implement caching** for AI responses
2. **Use local processing** where possible
3. **Batch API requests** when feasible
4. **Monitor and optimize** high-usage endpoints
5. **Use free tiers** for development and testing

---

## 🆘 Troubleshooting

### Common Issues & Solutions

**"API key not found" error**:
```bash
# Verify key is in .env file
cat .env | grep GEMINI_API_KEY

# Restart development server
npm run dev
```

**"Permission denied" errors**:
1. Check if APIs are enabled in Google Cloud Console
2. Verify billing is set up (required even for free tier)
3. Ensure API key has proper permissions
4. Check quota limits haven't been exceeded

**Voice/Camera not working**:
1. Ensure you're using HTTPS (required for media access)
2. Grant browser permissions for microphone/camera
3. Check browser compatibility (Chrome recommended)
4. Verify API keys for speech services are configured

**Firebase connection issues**:
1. Verify all Firebase config variables are set
2. Check Firebase project settings
3. Ensure Firestore rules allow read/write access
4. Verify authentication is properly configured

**Build/deployment errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit

# Build with verbose output
npm run build -- --verbose
```

---

## 📞 Support Resources

### Documentation Links
- [Google AI Documentation](https://ai.google.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud APIs](https://cloud.google.com/apis/docs)
- [React + Vite Guide](https://vitejs.dev/guide/)

### Community Support
- [Google AI Community](https://developers.googleblog.com/2023/12/google-ai-gemini-api.html)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-gemini-ai)

### Emergency Contacts (for crisis features)
- National Suicide Prevention Helpline: 9152987821
- Vandrevala Foundation: 9999666555
- iCall Psychosocial Helpline: 9152987821

---

## 🔄 Complete Environment Variables Reference

```bash
# ===== REQUIRED =====
VITE_GEMINI_API_KEY="AIza_your_gemini_key_here"
VITE_GOOGLE_AI_API_KEY="AIza_your_gemini_key_here"

# ===== GOOGLE CLOUD SERVICES =====
VITE_GOOGLE_CLOUD_PROJECT_ID="your-project-id"
VITE_GOOGLE_CLOUD_REGION="us-central1"
VITE_GOOGLE_CLOUD_VISION_API_KEY="your_vision_api_key"
VITE_GOOGLE_CLOUD_SPEECH_API_KEY="your_speech_api_key"
VITE_GOOGLE_CLOUD_TRANSLATE_API_KEY="your_translate_api_key"
VITE_VERTEX_AI_API_KEY="your_vertex_ai_key"

# ===== FIREBASE =====
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef123456"
VITE_FIREBASE_MEASUREMENT_ID="G-ABCDEF1234"

# ===== ALTERNATIVE AI SERVICES =====
VITE_OPENAI_API_KEY="sk-your_openai_key_here"
VITE_ANTHROPIC_API_KEY="sk-ant-your_anthropic_key_here"
VITE_AZURE_COGNITIVE_SERVICES_KEY="your_azure_key"
VITE_AZURE_COGNITIVE_SERVICES_ENDPOINT="https://your-resource.cognitiveservices.azure.com/"

# ===== COMMUNICATION =====
VITE_TWILIO_ACCOUNT_SID="your_twilio_account_sid"
VITE_TWILIO_AUTH_TOKEN="your_twilio_auth_token"
VITE_SENDGRID_API_KEY="SG.your_sendgrid_key"

# ===== ANALYTICS & MONITORING =====
VITE_GOOGLE_ANALYTICS_ID="G-ABCDEF1234"
VITE_MIXPANEL_TOKEN="your_mixpanel_token"
VITE_SENTRY_DSN="https://your_sentry_dsn@sentry.io/project_id"

# ===== FEATURE FLAGS =====
VITE_ENABLE_VOICE_FEATURES=true
VITE_ENABLE_VIDEO_FEATURES=true
VITE_ENABLE_GEMINI_AI=true
VITE_ENABLE_FIREBASE=true
VITE_ENABLE_ADVANCED_ANALYTICS=true
VITE_ENABLE_CRISIS_DETECTION=true
VITE_ENABLE_MULTI_LANGUAGE=true

# ===== ENVIRONMENT =====
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG=true
```

---

**Note**: This setup enables the full advanced Haven platform with AI-powered mental health support, cultural sensitivity, crisis intervention, and comprehensive analytics. Start with just the Gemini API key for basic functionality, then add other services as needed.