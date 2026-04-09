#!/bin/bash

echo "🚀 Deploying Analytics Optimization..."

# Build the functions first
echo "🔨 Building functions..."
cd functions && npm run build && cd ..

# Deploy only the new scheduled function
echo "📦 Deploying aggregateUserChartData function..."
firebase deploy --only functions:aggregateUserChartData

echo "✅ Analytics optimization deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. The function will run automatically every 24 hours"
echo "2. You can manually trigger it in the Firebase Console if needed"
echo "3. Dashboard will now load much faster using pre-aggregated data"
echo "4. Monitor the function logs to ensure it's working correctly"
echo ""
echo "🔍 To manually trigger the function for testing:"
echo "   firebase functions:shell"
echo "   > aggregateUserChartData()"