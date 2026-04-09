#!/bin/bash

echo "🌟 Starting Mann-Mitra Funding Demo..."
echo ""
echo "🚀 Features Ready to Demo:"
echo "✅ Conversational Assessment Engine (PHQ-9 transformed)"
echo "✅ Real-time AI Response Processing"
echo "✅ Emotional Tone Detection"
echo "✅ Cultural Context Integration"
echo "✅ Risk Level Assessment"
echo "✅ Personalized Recommendations"
echo ""
echo "🔧 Starting development server..."
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Opening Mann-Mitra Demo at http://localhost:3000"
echo ""

# Start the development server
npm run demo