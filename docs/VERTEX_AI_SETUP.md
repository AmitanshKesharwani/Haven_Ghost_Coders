# Vertex AI Setup Guide for Haven

This guide will help you set up Google Cloud Vertex AI for your Haven mental wellness app, giving you access to the most advanced AI capabilities.

## 🚀 Why Vertex AI?

Vertex AI gives you access to:
- **Latest Gemini models** (including Gemini 1.5 Pro)
- **Higher rate limits** than basic Gemini API
- **Advanced safety controls** for mental health applications
- **Enterprise-grade reliability** and monitoring
- **Multi-modal capabilities** (text, voice, vision)
- **Custom model fine-tuning** options

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Project with Vertex AI API** enabled
3. **Service Account** with proper permissions

## 🔧 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)

2. **Create New Project**:
   - Click "Select a project" → "New Project"
   - Project name: `Haven-production`
   - Note your Project ID (e.g., `Haven-production-123456`)

3. **Enable Billing**:
   - Go to Billing → Link a billing account
   - Required for Vertex AI API access

### Step 2: Enable Vertex AI API

1. **Navigate to APIs & Services**:
   - Go to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"

2. **Enable Additional APIs** (for full features):
   ```bash
   # You can also enable via gcloud CLI
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable translate.googleapis.com
   gcloud services enable speech.googleapis.com
   gcloud services enable texttospeech.googleapis.com
   gcloud services enable vision.googleapis.com
   ```

### Step 3: Create Service Account & API Key

#### Option A: Using Google Cloud Console (Recommended)

1. **Create Service Account**:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `Haven-ai-service`
   - Description: `Service account for Haven AI features`

2. **Grant Permissions**:
   - Role: `Vertex AI User`
   - Role: `AI Platform Developer` (if available)
   - Click "Done"

3. **Create API Key**:
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the key file

4. **Get Access Token** (for browser use):
   ```bash
   # Install gcloud CLI first
   gcloud auth activate-service-account --key-file=path/to/your/key.json
   gcloud auth print-access-token
   ```

#### Option B: Using gcloud CLI

```bash
# Set your project
gcloud config set project Haven-production-123456

# Create service account
gcloud iam service-accounts create Haven-ai \
    --description="Haven AI Service Account" \
    --display-name="Haven AI"

# Grant necessary roles
gcloud projects add-iam-policy-binding Haven-production-123456 \
    --member="serviceAccount:Haven-ai@Haven-production-123456.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create Haven-key.json \
    --iam-account=Haven-ai@Haven-production-123456.iam.gserviceaccount.com

# Get access token
gcloud auth activate-service-account --key-file=Haven-key.json
gcloud auth print-access-token
```

### Step 4: Configure Your App

1. **Update .env file**:
   ```bash
   # Your actual project details
   VITE_GOOGLE_CLOUD_PROJECT_ID=Haven-production-123456
   VITE_GOOGLE_CLOUD_REGION=us-central1
   VITE_VERTEX_AI_API_KEY=your_access_token_here
   ```

2. **Important Notes**:
   - **Access tokens expire** (usually 1 hour), so you'll need to refresh them
   - For production, use a **token refresh mechanism**
   - **Never commit** service account keys to version control

### Step 5: Test Your Integration

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Test AI Companion**:
   - Go to AI Companion
   - Send a message: "मैं stressed feel कर रहा हूँ"
   - You should get advanced, culturally sensitive responses

3. **Check Console**:
   - Open browser dev tools
   - Look for successful Vertex AI API calls
   - No errors about authentication

## 🔄 Token Management for Production

### Automatic Token Refresh

For production apps, implement automatic token refresh:

```typescript
// src/services/tokenManager.ts
export class TokenManager {
  private token: string | null = null;
  private expiryTime: number = 0;

  async getValidToken(): Promise<string> {
    if (this.token && Date.now() < this.expiryTime) {
      return this.token;
    }

    // Refresh token logic here
    // In production, you'd call your backend to get a fresh token
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    this.token = data.access_token;
    this.expiryTime = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer

    return this.token;
  }
}
```

### Backend Token Service (Node.js Example)

```javascript
// backend/routes/auth.js
const { GoogleAuth } = require('google-auth-library');

app.post('/api/refresh-token', async (req, res) => {
  try {
    const auth = new GoogleAuth({
      keyFile: 'path/to/service-account.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    res.json({
      access_token: token.token,
      expires_in: 3600 // 1 hour
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});
```

## 💰 Cost Management

### Vertex AI Pricing (as of 2024)

- **Gemini Pro**: $0.00025 per 1K input characters, $0.0005 per 1K output characters
- **Gemini Pro Vision**: $0.0025 per image + text pricing
- **Free tier**: $200 credit for new Google Cloud users

### Cost Optimization Tips

1. **Implement caching** for common responses
2. **Use shorter prompts** when possible
3. **Set up billing alerts** in Google Cloud Console
4. **Monitor usage** in Vertex AI console
5. **Implement rate limiting** to prevent abuse

### Example Monthly Costs

For a mental wellness app with moderate usage:
- **1000 conversations/month** × 10 messages each × 100 characters average
- **Input**: 1M characters = $0.25
- **Output**: 2M characters = $1.00
- **Total**: ~$1.25/month for AI responses

## 🛡️ Security Best Practices

### 1. Service Account Security
```bash
# Limit service account permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
    --role="roles/aiplatform.user"  # Only what's needed
```

### 2. API Key Protection
```typescript
// Never expose service account keys in frontend
// Use access tokens with short expiry
// Implement proper token refresh mechanism
```

### 3. Content Filtering
```typescript
// Use Vertex AI safety settings
safetySettings: [
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE'
  }
]
```

## 🚀 Advanced Features

### 1. Model Fine-tuning
```bash
# Fine-tune Gemini for mental health conversations
gcloud ai custom-jobs create \
    --region=us-central1 \
    --display-name=Haven-fine-tune \
    --config=fine-tune-config.yaml
```

### 2. Multi-modal Capabilities
```typescript
// Analyze text + image for mood detection
const request = {
  contents: [{
    role: 'user',
    parts: [
      { text: 'How am I feeling in this photo?' },
      { 
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64ImageData
        }
      }
    ]
  }]
};
```

### 3. Conversation Memory
```typescript
// Maintain conversation context across sessions
const conversationHistory = [
  { role: 'user', parts: [{ text: 'Previous message' }] },
  { role: 'model', parts: [{ text: 'Previous response' }] },
  { role: 'user', parts: [{ text: 'Current message' }] }
];
```

## 📊 Monitoring & Analytics

### 1. Vertex AI Monitoring
- Go to Vertex AI → Model Garden → Usage
- Monitor request volume, latency, errors
- Set up alerts for unusual patterns

### 2. Custom Metrics
```typescript
// Track conversation quality
const metrics = {
  responseTime: Date.now() - startTime,
  userSatisfaction: rating,
  crisisDetected: riskLevel > 'moderate',
  culturalRelevance: culturalScore
};
```

## 🔧 Troubleshooting

### Common Issues

1. **"Permission denied"**
   ```bash
   # Check service account permissions
   gcloud projects get-iam-policy PROJECT_ID
   ```

2. **"Quota exceeded"**
   ```bash
   # Check quotas in Google Cloud Console
   # Request quota increase if needed
   ```

3. **"Invalid token"**
   ```bash
   # Refresh access token
   gcloud auth print-access-token
   ```

### Debug Mode
```typescript
// Enable detailed logging
const vertexAI = new VertexAIService({
  projectId: 'your-project',
  location: 'us-central1',
  apiKey: 'your-token',
  debug: true  // Add this for detailed logs
});
```

## 🎉 You're Ready!

Your Haven app now has access to:
- ✅ **Advanced Gemini 1.5 Pro** for sophisticated conversations
- ✅ **Cultural sensitivity** with Indian context understanding
- ✅ **Crisis detection** with appropriate escalation
- ✅ **Multi-language support** (Hindi/English/Hinglish)
- ✅ **Enterprise-grade reliability** and monitoring
- ✅ **Scalable architecture** for production deployment

**Test your integration and experience the power of Vertex AI! 🚀**

---

## 📞 Support

- **Google Cloud Support**: [https://cloud.google.com/support](https://cloud.google.com/support)
- **Vertex AI Documentation**: [https://cloud.google.com/vertex-ai/docs](https://cloud.google.com/vertex-ai/docs)
- **Community Forums**: [https://stackoverflow.com/questions/tagged/google-vertex-ai](https://stackoverflow.com/questions/tagged/google-vertex-ai)