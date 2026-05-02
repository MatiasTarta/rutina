const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['expo-sqlite'],
      },
    },
    argv
  );

  // Configure webpack to handle WASM files
  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true,
  };

  // Add rule for WASM files - use asset/source to load as binary
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/source',
  });

  // Fix resolver for .wasm extensions
  config.resolve.extensionAlias = {
    ...config.resolve.extensionAlias,
    '.wasm': ['.wasm', '.js'],
  };

  return config;
};
