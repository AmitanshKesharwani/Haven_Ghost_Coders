#!/bin/bash

echo "Setting up Firebase Functions for Haven..."

# Navigate to functions directory
cd functions

# Install dependencies
echo "Installing function dependencies..."
npm install

# Build the functions
echo "Building functions..."
npm run build

echo "Functions setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your Groq API key:"
echo "   firebase functions:secrets:set GROQ_API_KEY"
echo "   (Enter your API key when prompted)"
echo ""
echo "2. For local development, create functions/.env:"
echo "   cp functions/.env.example functions/.env"
echo "   (Then edit functions/.env with your API key)"
echo ""
echo "3. Deploy functions:"
echo "   firebase deploy --only functions"
echo ""
echo "4. Or test locally with emulator:"
echo "   firebase emulators:start --only functions,firestore"