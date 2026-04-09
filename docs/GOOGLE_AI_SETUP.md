# Google AI Integration Setup Guide

This guide will help you set up Google's Generative AI services for your Haven app.

## 🚀 Complete Setup Guide

### Phase 1: Gemini AI (Free Tier - Start Here!)

#### 1. Get Gemini API Key (Free)

1. **Visit Google AI Studio**: Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign in** with your Google account

3. **Create API Key**:
   - Click "Create API Key"
   - Select "Create API key in new project" (or use existing project)
   - Copy the generated API key

4. **Add to your app**:
   ```bash
   # Replace the demo key in .env file
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Test the integration**:
   ```bash
   npm run dev
   ```

#### 2. Verify Basic Integration

1. Open the app and go to AI Companion
2. Send a message like "मैं stressed feel कर रहा हूँ"
3. You should see culturally sensitive, personalized responses in Hinglish

### Phase 2: Firebase Setup (Required for Data Storage)

#### 1. Create Firebase Project

1. **Go to Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Create New Project**:
   - Click "Add project"
   - Name: "Haven Production" (or your choice)
   - Enable Google Analytics (recommended)
   - Choose analytics account

3. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Anonymous" authentication
   - This allows users to use the app without creating accounts

4. **Setup Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in "test mode" (for development)
   - Choose location: `asia-south1` (Mumbai) for Indian users

5. **Get Firebase Config**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click "Web" icon to add web app
   - Register app with nickname "Haven Web"
   - Copy the config object

6. **Update .env file**:
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### Phase 3: Google Cloud Platform Setup (Advanced Features)

#### 1. Create Google Cloud Project

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Create project (use same name as Firebase for consistency)
gcloud projects create Haven-production --name="Haven Production"
gcloud config set project Haven-production

# Link to Firebase project (if different)
gcloud firebase projects:addfirebase Haven-production
```

#### 2. Enable Required APIs

```bash
# Enable all Google AI services
gcloud services enable aiplatform.googleapis.com
gcloud services enable translate.googleapis.com
gcloud services enable speech.googleapis.com
gcloud services enable texttospeech.googleapis.com
gcloud services enable vision.googleapis.com
gcloud services enable firestore.googleapis.com
```

#### 3. Create Service Account & Credentials

```bash
# Create service account for AI services
gcloud iam service-accounts create Haven-ai \
    --description="Haven AI Services" \
    --display-name="Haven AI"

# Grant necessary permissions
gcloud projects add-iam-policy-binding Haven-production \
    --member="serviceAccount:Haven-ai@Haven-production.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding Haven-production \
    --member="serviceAccount:Haven-ai@Haven-production.iam.gserviceaccount.com" \
    --role="roles/cloudtranslate.user"

gcloud projects add-iam-policy-binding Haven-production \
    --member="serviceAccount:Haven-ai@Haven-production.iam.gserviceaccount.com" \
    --role="roles/speech.editor"

gcloud projects add-iam-policy-binding Haven-production \
    --member="serviceAccount:Haven-ai@Haven-production.iam.gserviceaccount.com" \
    --role="roles/vision.imageAnnotator"

# Create and download key
gcloud iam service-accounts keys create Haven-key.json \
    --iam-account=Haven-ai@Haven-production.iam.gserviceaccount.com
```

#### 4. Update Environment Variables

```bash
# Update .env file with Google Cloud credentials
VITE_GOOGLE_CLOUD_PROJECT_ID=Haven-production
VITE_GOOGLE_CLOUD_REGION=asia-south1
GOOGLE_APPLICATION_CREDENTIALS=./Haven-key.json
```

## 🔧 Advanced Setup (Google Cloud)

For production deployment with advanced features:

### 1. Create Google Cloud Project

```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and create project
gcloud init
gcloud projects create Haven-production --name="Haven Production"
gcloud config set project Haven-production
```

### 2. Enable Required APIs

```bash
# Enable necessary APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable translate.googleapis.com
gcloud services enable speech.googleapis.com
gcloud services enable texttospeech.googleapis.com
gcloud services enable vision.googleapis.com
```

### 3. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create Haven-ai \
    --description="Haven AI Services" \
    --display-name="Haven AI"

# Grant necessary permissions
gcloud projects add-iam-policy-binding Haven-production \
    --member="serviceAccount:Haven-ai@Haven-production.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding Haven-production \
    --member="serviceAccount:Haven-ai@Haven-production.iam.gserviceaccount.com" \
    --role="roles/cloudtranslate.user"

# Create and download key
gcloud iam service-accounts keys create Haven-key.json \
    --iam-account=Haven-ai@Haven-production.iam.gserviceaccount.com
```

### 4. Update Environment Variables

```bash
# Update .env file
VITE_GOOGLE_CLOUD_PROJECT_ID=Haven-production
VITE_GOOGLE_CLOUD_REGION=asia-south1
GOOGLE_APPLICATION_CREDENTIALS=./Haven-key.json
```

## 🎯 Feature-Specific Setup

### Voice Features (Speech-to-Text/Text-to-Speech)

```javascript
// Already integrated in speechServices.ts
// Uses Web Speech API for demo, Google Cloud Speech for production
```

### Vision Features (Mood Detection)

```javascript
// Already integrated in visionServices.ts
// Uses simulated detection for demo, Google Cloud Vision for production
```

### Translation Features

```javascript
// For multi-language support
import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({
  projectId: process.env.VITE_GOOGLE_CLOUD_PROJECT_ID,
});
```

## 💰 Cost Optimization

### Free Tier Limits (Gemini API)
- **Gemini Pro**: 60 requests per minute
- **Free quota**: Generous limits for development and testing

### Production Pricing
- **Gemini Pro**: $0.00025 per 1K characters (input), $0.0005 per 1K characters (output)
- **Speech-to-Text**: $0.006 per 15 seconds
- **Text-to-Speech**: $4.00 per 1M characters
- **Translation**: $20 per 1M characters
- **Vision API**: $1.50 per 1K images

### Cost-Saving Tips
1. **Cache responses** for common queries
2. **Implement rate limiting** to prevent abuse
3. **Use batch processing** for multiple requests
4. **Monitor usage** with Google Cloud Console
5. **Set billing alerts** to avoid surprises

## 🔒 Security Best Practices

### API Key Security
```bash
# Never commit API keys to version control
echo ".env" >> .gitignore
echo "*.json" >> .gitignore

# Use environment variables in production
export VITE_GEMINI_API_KEY="your-key-here"
```

### Production Deployment
```bash
# Use Google Cloud Secret Manager
gcloud secrets create gemini-api-key --data-file=-
echo "your-api-key" | gcloud secrets create gemini-api-key --data-file=-

# Access in your app
gcloud secrets versions access latest --secret="gemini-api-key"
```

## 🧪 Testing Your Integration

### 1. Basic Functionality Test
```bash
# Start the app
npm run dev

# Test scenarios:
# 1. Send "I'm feeling happy" - should get positive response
# 2. Send "मैं परेशान हूँ" - should get Hindi/mixed response
# 3. Send crisis keywords - should show helpline resources
```

### 2. Voice Features Test
```bash
# Enable microphone permissions
# Click voice button in AI Companion
# Speak in Hindi or English
# Verify transcription and response
```

### 3. Performance Test
```bash
# Send multiple messages quickly
# Verify response times < 3 seconds
# Check for proper error handling
```

## 🐛 Troubleshooting

### Common Issues

1. **"API key not valid"**
   ```bash
   # Verify API key is correct
   # Check if Gemini API is enabled
   # Ensure no extra spaces in .env file
   ```

2. **"Quota exceeded"**
   ```bash
   # Check usage in Google AI Studio
   # Implement rate limiting
   # Consider upgrading to paid tier
   ```

3. **"Network error"**
   ```bash
   # Check internet connection
   # Verify CORS settings
   # Check firewall/proxy settings
   ```

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG_AI=true npm run dev

# Check browser console for detailed logs
```

## 📊 Monitoring & Analytics

### Usage Tracking
```javascript
// Track AI interactions
const trackAIUsage = (userMessage, aiResponse, responseTime) => {
  // Send to analytics service
  console.log('AI Usage:', {
    messageLength: userMessage.length,
    responseLength: aiResponse.length,
    responseTime,
    timestamp: new Date()
  });
};
```

### Performance Monitoring
```javascript
// Monitor response times
const startTime = performance.now();
const response = await geminiAI.generateResponse(message);
const responseTime = performance.now() - startTime;
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with environment variables
vercel --env VITE_GEMINI_API_KEY=your-key-here
```

### Netlify Deployment
```bash
# Build for production
npm run build

# Deploy to Netlify
# Add environment variables in Netlify dashboard
```

## 📈 Scaling Considerations

### High Traffic Optimization
1. **Implement caching** for common responses
2. **Use CDN** for static assets
3. **Add rate limiting** per user
4. **Consider response streaming** for long responses
5. **Implement fallback responses** for API failures

### Multi-Region Deployment
```bash
# Deploy to multiple regions for better latency
# Asia-South1 (Mumbai) for Indian users
# Use Google Cloud Load Balancer for distribution
```

---

## 🎉 You're Ready!

Your Haven app now has:
- ✅ **Advanced AI conversations** with Gemini Pro
- ✅ **Cultural sensitivity** for Indian youth
- ✅ **Crisis detection** with local resources
- ✅ **Voice interaction** capabilities
- ✅ **Mood detection** through video
- ✅ **Multi-language support** (Hindi/English/Hinglish)

Start the app and experience the future of mental wellness support! 🌟