#!/bin/bash

# Haven Setup Script
# This script sets up the complete Haven mental health application with Firebase integration

echo "🧠 Haven - AI Mental Health Companion Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
            print_status "Node.js version is compatible (18+)"
        else
            print_warning "Node.js version should be 18 or higher. Current: $NODE_VERSION"
            echo "Please update Node.js: https://nodejs.org/"
        fi
    else
        print_error "Node.js is not installed"
        echo "Please install Node.js 18+ from: https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing project dependencies..."
    
    if npm install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment file
setup_environment() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_status "Created .env file from .env.example"
        else
            print_warning ".env.example not found, creating basic .env file"
            cat > .env << EOL
# Firebase Configuration (Required for Authentication & Database)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google AI API Keys (Required for AI Features)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Feature Flags
VITE_ENABLE_FIREBASE=true
VITE_ENABLE_GEMINI_AI=true
VITE_ENABLE_VOICE_FEATURES=true
VITE_ENABLE_VIDEO_FEATURES=true
VITE_ENABLE_ADVANCED_ANALYTICS=true
VITE_ENABLE_CRISIS_DETECTION=true

# Environment
VITE_APP_ENV=development
VITE_DEBUG=true
EOL
        fi
        print_status "Environment file created"
    else
        print_warning ".env file already exists"
    fi
}

# Check environment variables
check_environment() {
    print_info "Checking environment configuration..."
    
    # Check for required Firebase variables
    FIREBASE_VARS=("VITE_FIREBASE_API_KEY" "VITE_FIREBASE_AUTH_DOMAIN" "VITE_FIREBASE_PROJECT_ID")
    MISSING_FIREBASE=0
    
    for var in "${FIREBASE_VARS[@]}"; do
        if grep -q "^${var}=your_" .env 2>/dev/null; then
            MISSING_FIREBASE=1
        fi
    done
    
    # Check for Gemini API key
    MISSING_GEMINI=0
    if grep -q "^VITE_GEMINI_API_KEY=your_" .env 2>/dev/null; then
        MISSING_GEMINI=1
    fi
    
    if [ $MISSING_FIREBASE -eq 1 ]; then
        print_warning "Firebase configuration needs to be updated in .env file"
        echo "  Please follow FIREBASE_SETUP_GUIDE.md to get your Firebase config"
    else
        print_status "Firebase configuration appears to be set"
    fi
    
    if [ $MISSING_GEMINI -eq 1 ]; then
        print_warning "Gemini API key needs to be updated in .env file"
        echo "  Get your free API key from: https://makersuite.google.com/app/apikey"
    else
        print_status "Gemini API key appears to be set"
    fi
}

# Build the project
build_project() {
    print_info "Building the project..."
    
    if npm run build; then
        print_status "Project built successfully"
    else
        print_error "Build failed"
        echo "Please check for any TypeScript or build errors above"
        return 1
    fi
}

# Start development server
start_dev_server() {
    print_info "Starting development server..."
    echo ""
    echo "🚀 Haven will be available at: http://localhost:5173"
    echo ""
    echo "📚 Quick Start Guide:"
    echo "  1. Update .env file with your Firebase and Gemini API keys"
    echo "  2. Follow FIREBASE_SETUP_GUIDE.md for Firebase setup"
    echo "  3. Follow API_SETUP_GUIDE.md for AI API setup"
    echo ""
    echo "🔧 Available Commands:"
    echo "  npm run dev     - Start development server"
    echo "  npm run build   - Build for production"
    echo "  npm run preview - Preview production build"
    echo ""
    echo "📖 Documentation:"
    echo "  README.md              - Project overview and features"
    echo "  FIREBASE_SETUP_GUIDE.md - Firebase configuration"
    echo "  API_SETUP_GUIDE.md     - API keys and services"
    echo "  IMPLEMENTATION_GUIDE.md - Advanced features"
    echo ""
    
    # Ask if user wants to start dev server now
    read -p "Start development server now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run dev
    else
        echo "You can start the development server later with: npm run dev"
    fi
}

# Main setup function
main() {
    echo "Starting Haven setup..."
    echo ""
    
    # Check prerequisites
    check_nodejs
    check_npm
    
    echo ""
    
    # Setup project
    install_dependencies
    setup_environment
    check_environment
    
    echo ""
    
    # Build project to check for errors
    if build_project; then
        echo ""
        print_status "Setup completed successfully! 🎉"
        echo ""
        
        # Show next steps
        echo "🎯 Next Steps:"
        echo ""
        echo "1. 🔥 Firebase Setup (Required for full functionality):"
        echo "   - Open FIREBASE_SETUP_GUIDE.md"
        echo "   - Create Firebase project"
        echo "   - Update .env with Firebase config"
        echo ""
        echo "2. 🤖 AI Setup (Required for AI features):"
        echo "   - Get Gemini API key: https://makersuite.google.com/app/apikey"
        echo "   - Update VITE_GEMINI_API_KEY in .env"
        echo ""
        echo "3. 🚀 Start Development:"
        
        start_dev_server
    else
        echo ""
        print_error "Setup completed with build errors"
        echo "Please fix the build errors and run 'npm run build' again"
    fi
}

# Run main function
main

echo ""
echo "🧠 Thank you for setting up Haven!"
echo "   Your AI-powered mental health companion for Indian youth"
echo ""
echo "💝 Features available:"
echo "   ✓ AI Companion with cultural sensitivity"
echo "   ✓ Crisis detection and intervention"
echo "   ✓ Voice and video therapy sessions"
echo "   ✓ Mental health assessments (PHQ-9, GAD-7)"
echo "   ✓ Progress tracking and analytics"
echo "   ✓ Multi-language support (Hindi/English/Mixed)"
echo ""
echo "🆘 Crisis Support Integration:"
echo "   ✓ Vandrevala Foundation: 9999 666 555"
echo "   ✓ AASRA: 91-22-27546669"
echo "   ✓ iCall: 9152987821"
echo ""
echo "📞 Need help? Check the documentation files or create an issue on GitHub"
echo ""