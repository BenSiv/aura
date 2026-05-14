// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for WASM and TFLite files
config.resolver.sourceExts.push('wasm');
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
