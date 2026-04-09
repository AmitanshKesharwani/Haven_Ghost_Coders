# Haven Deployment Guide

This guide covers deploying Haven to production with Firebase integration.

## 🚀 Production Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides excellent React/Vite support with automatic deployments.

#### Setup Steps:

1. **Prepare for deployment:**
   ```bash
   npm run build
   ```

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel
   ```

4. **Configure environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all environment variables from your `.env` file
   - Ensure all `VITE_` prefixed variables are included

#### Vercel Configuration (`vercel.json`):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "VITE_FIREBASE_API_KEY": "@firebase_api_key",
    "VITE_FIREBASE_AUTH_DOMAIN": "@firebase_auth_domain",
    "VITE_FIREBASE_PROJECT_ID": "@firebase_project_id",
    "VITE_GEMINI_API_KEY": "@gemini_api_key"
  }
}
```

### Option 2: Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Option 3: Firebase Hosting

Since you're already using Firebase, you can host on Firebase too.

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting:**
   ```bash
   firebase init hosting
   ```

4. **Configure `firebase.json`:**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

5. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔧 Production Configuration

### Environment Variables for Production

Create a production `.env.production` file:

```bash
# Production Firebase Configuration
VITE_FIREBASE_API_KEY=your_production_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_production_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_production_measurement_id

# Production AI Configuration
VITE_GEMINI_API_KEY=your_production_gemini_api_key

# Production Feature Flags
VITE_ENABLE_FIREBASE=true
VITE_ENABLE_GEMINI_AI=true
VITE_ENABLE_VOICE_FEATURES=true
VITE_ENABLE_VIDEO_FEATURES=true
VITE_ENABLE_ADVANCED_ANALYTICS=true
VITE_ENABLE_CRISIS_DETECTION=true

# Production Environment
VITE_APP_ENV=production
VITE_DEBUG=false
```

### Firebase Production Setup

1. **Update Firestore Security Rules for Production:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Strict production rules
       match /users/{userId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == userId &&
           request.auth.token.email_verified == true;
       }
       
       match /sessions/{sessionId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId &&
           request.auth.token.email_verified == true;
         allow create: if request.auth != null && 
           request.auth.uid == request.resource.data.userId &&
           request.auth.token.email_verified == true;
       }
       
       // Similar rules for assessments and crisisEvents
     }
   }
   ```

2. **Configure Firebase Authentication for Production:**
   - Add your production domain to authorized domains
   - Set up proper OAuth redirect URLs
   - Configure email verification requirements

3. **Enable Firebase App Check (Recommended):**
   ```bash
   # In Firebase Console, enable App Check for additional security
   ```

## 🔒 Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage for unusual activity

### Firebase Security
- Enable App Check for production
- Use strict Firestore security rules
- Enable audit logging
- Set up monitoring and alerts

### HTTPS and SSL
- Ensure all deployments use HTTPS
- Configure proper SSL certificates
- Set up security headers

### Content Security Policy
Add to your `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://firestore.googleapis.com https://generativelanguage.googleapis.com;
">
```

## 📊 Monitoring and Analytics

### Firebase Analytics
- Enable Google Analytics in Firebase
- Set up custom events for mental health metrics
- Monitor user engagement and retention

### Error Monitoring
Add Sentry for error tracking:
```bash
npm install @sentry/react @sentry/tracing
```

### Performance Monitoring
- Enable Firebase Performance Monitoring
- Monitor Core Web Vitals
- Track API response times

## 🚨 Crisis Management in Production

### Automated Alerts
Set up Firebase Functions for crisis detection:
```javascript
// functions/index.js
exports.crisisAlert = functions.firestore
  .document('crisisEvents/{eventId}')
  .onCreate(async (snap, context) => {
    const crisisEvent = snap.data();
    
    if (crisisEvent.severity === 'severe') {
      // Send immediate alert to mental health professionals
      await sendCrisisAlert(crisisEvent);
    }
  });
```

### Professional Integration
- Set up webhooks for crisis events
- Integrate with professional mental health services
- Maintain updated crisis helpline information

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📱 Mobile App Considerations

### Progressive Web App (PWA)
The app is already configured as a PWA with:
- Service worker for offline functionality
- App manifest for installation
- Responsive design for mobile devices

### Native Mobile Apps
For native apps, consider:
- React Native version
- Capacitor for hybrid apps
- Native Firebase SDKs

## 🌍 Internationalization

### Multi-language Support
The app supports:
- Hindi (हिंदी)
- English
- Hinglish (Mixed)

### Regional Deployment
Consider regional deployments for:
- Better performance in India
- Compliance with local data regulations
- Regional crisis helpline integration

## 📞 Support and Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update crisis helpline information
- Review and update AI model responses

### Backup and Recovery
- Regular Firestore backups
- User data export capabilities
- Disaster recovery procedures

### Compliance
- HIPAA compliance for health data
- GDPR compliance for international users
- Indian data protection regulations

---

## 🎉 Production Checklist

Before going live:

- [ ] Firebase project configured for production
- [ ] All environment variables set correctly
- [ ] Firestore security rules updated
- [ ] Domain configured in Firebase Auth
- [ ] SSL certificate configured
- [ ] Error monitoring set up
- [ ] Analytics configured
- [ ] Crisis management protocols tested
- [ ] Performance optimization completed
- [ ] Security audit completed
- [ ] Backup procedures in place
- [ ] Support documentation ready

**Your Haven app is now ready for production deployment!** 🚀

The app will provide professional-grade mental health support to users with full data security, crisis management, and therapeutic progress tracking.