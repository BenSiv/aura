const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project root (one level up from cnf/)
const projectRoot = path.resolve(__dirname, '..');

const config = getDefaultConfig(projectRoot);

// Ensure we can resolve modules from the cnf/node_modules directory
// even when files are being resolved from their real paths in ../src
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Add support for WASM and TFLite files
config.resolver.assetExts.push('wasm');
config.resolver.assetExts.push('tflite');

// Add COEP and COOP headers to support SharedArrayBuffer for expo-sqlite
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = config;
