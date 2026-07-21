const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

// Add headers to allow SharedArrayBuffer on the web for synchronous SQLite
config.server = config.server || {};
const originalMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    
    if (originalMiddleware) {
      return originalMiddleware(middleware)(req, res, next);
    }
    return middleware(req, res, next);
  };
};

module.exports = withNativeWind(config, { input: "./global.css" });
