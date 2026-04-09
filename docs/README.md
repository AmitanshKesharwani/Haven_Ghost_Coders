# 🧠 Haven - AI-Powered Mental Health Companion

A culturally-aware mental health support platform designed specifically for Indian users, providing personalized therapeutic conversations in Hindi and English.

## 🌟 Features

### 🤖 AI-Powered Conversations
- **Groq AI Integration**: Advanced conversational AI with cultural context
- **Bilingual Support**: Seamless Hindi-English conversations
- **Emotion Detection**: Real-time emotional state analysis
- **Crisis Detection**: Automatic risk assessment and intervention

### 🔐 Secure & Private
- **Firebase Authentication**: Secure user management
- **End-to-End Privacy**: GDPR compliant data handling
- **Anonymous Mode**: Option for completely private sessions

### 📊 Mental Health Tools
- **PHQ-9 Assessment**: Depression screening
- **GAD-7 Assessment**: Anxiety evaluation
- **Mood Tracking**: Daily emotional state monitoring
- **Progress Analytics**: Personalized insights and trends

### 🎯 Culturally Aware
- **Indian Context**: Understanding of cultural nuances
- **Family Dynamics**: Consideration of joint family structures
- **Regional Adaptation**: Localized mental health approaches

## 🚀 Live Demo

**Website**: [https://Haven-mental-health.web.app](https://Haven-mental-health.web.app)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **AI Services**: Groq + HuggingFace (emotion pre-analysis)
- **Analytics**: Firebase Analytics
- **Deployment**: Firebase Hosting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xenith311-stack/Maan-Mitra-FINAL.git
   cd Maan-Mitra-FINAL
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and Groq/HuggingFace credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Hosting
3. Add your Firebase config to `.env`

### AI Setup
1. Get Groq API key from [Groq Console](https://console.groq.com/keys)
2. Get HuggingFace token from [Hugging Face Tokens](https://huggingface.co/settings/tokens)
3. Add both to `.env`

### Environment Variables
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI
VITE_GROQ_API_KEY=your_groq_api_key
VITE_HF_TOKEN=your_huggingface_token
```

## 🚀 Deployment

### Firebase Hosting
```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## 📊 Cost Estimates

### Monthly Operating Costs
- **Startup Phase (0-100 users)**: $15-50/month
- **Growth Phase (100-1000 users)**: $50-150/month
- **Scale Phase (1000+ users)**: $150-500/month

### Service Breakdown
- **Firebase**: $0-25/month (Free tier available)
- **AI Services**: Usage-based (Groq/HuggingFace)
- **Infrastructure**: $5-25/month

## 🏗️ Project Structure

```
Mann-Mitra/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── services/           # Firebase and AI services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── firebase.json           # Firebase configuration
└── package.json           # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@Haven.com
- 🐛 Issues: [GitHub Issues](https://github.com/xenith311-stack/Maan-Mitra-FINAL/issues)

## 🙏 Acknowledgments

- **Groq**: For LLM inference
- **HuggingFace**: For emotion inference
- **Firebase**: For backend infrastructure
- **Radix UI**: For accessible UI components
- **Tailwind CSS**: For styling framework

---

**Made with ❤️ for mental health awareness in India**