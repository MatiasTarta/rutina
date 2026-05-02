const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm to asset extensions
config.resolver.assetExts.push('wasm');

// Ensure wasm files are not treated as source files
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => ext !== 'wasm'
);

// Configure asset paths for web workers
config.assetRegistryPath = 'expo-asset/build/AssetRegistry';

module.exports = config;
