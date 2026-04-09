#!/usr/bin/env node

/**
 * Simple test script to verify Firebase Functions setup
 * Run with: node test-functions.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Firebase Functions Setup...\n');

// Check if functions directory exists
if (!fs.existsSync('./functions')) {
  console.error('❌ Functions directory not found!');
  process.exit(1);
}

console.log('✅ Functions directory exists');

// Check if package.json exists
if (!fs.existsSync('./functions/package.json')) {
  console.error('❌ Functions package.json not found!');
  process.exit(1);
}

console.log('✅ Functions package.json exists');

// Check if source files exist
if (!fs.existsSync('./functions/src/index.ts')) {
  console.error('❌ Functions source file not found!');
  process.exit(1);
}

console.log('✅ Functions source file exists');

// Check Firebase CLI
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.error('❌ Firebase CLI not found. Install with: npm install -g firebase-tools');
  process.exit(1);
}

// Check if logged in to Firebase
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is authenticated');
} catch (error) {
  console.error('❌ Not logged in to Firebase. Run: firebase login');
  process.exit(1);
}

// Check if functions dependencies are installed
if (!fs.existsSync('./functions/node_modules')) {
  console.log('⚠️  Functions dependencies not installed yet');
  console.log('   Run: cd functions && npm install');
} else {
  console.log('✅ Functions dependencies are installed');
}

// Check if functions are built
if (!fs.existsSync('./functions/lib')) {
  console.log('⚠️  Functions not built yet');
  console.log('   Run: cd functions && npm run build');
} else {
  console.log('✅ Functions are built');
}

console.log('\n🎉 Setup verification complete!');
console.log('\nNext steps:');
console.log('1. cd functions && npm install');
console.log('2. set GROQ_API_KEY in functions/.env or function secrets');
console.log('3. firebase deploy --only functions');
console.log('\nFor detailed instructions, see functions/DEPLOYMENT.md');