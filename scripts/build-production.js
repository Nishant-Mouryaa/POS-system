#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build process...');

// Check if required files exist
const requiredFiles = [
  'app.json',
  'eas.json',
  'package.json',
  'google-services.json',
  'serviceAccountKey.json'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ Found: ${file}`);
});

// Update version if needed
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
console.log(`📱 Current version: ${appJson.expo.version} (${appJson.expo.android.versionCode})`);

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  execSync('npx expo install --fix', { stdio: 'inherit' });
  console.log('✅ Dependencies updated');
} catch (error) {
  console.warn('⚠️ Warning: Could not update dependencies');
}

// Build for Android
console.log('🤖 Building Android app bundle...');
try {
  execSync('eas build --platform android --profile production', { stdio: 'inherit' });
  console.log('✅ Android build completed');
} catch (error) {
  console.error('❌ Android build failed:', error.message);
  process.exit(1);
}

// Build for iOS (if needed)
console.log('🍎 Building iOS app...');
try {
  execSync('eas build --platform ios --profile production', { stdio: 'inherit' });
  console.log('✅ iOS build completed');
} catch (error) {
  console.error('❌ iOS build failed:', error.message);
  console.log('⚠️ Skipping iOS build due to error');
}

console.log('🎉 Production build process completed successfully!');
console.log('📤 Ready for Play Store submission'); 