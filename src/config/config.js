import Constants from 'expo-constants';

const isProduction = Constants.expoConfig?.extra?.eas?.projectId === '1d7013c4-37bc-40e7-b605-94e76a7f879e';

export const BASE_URL = isProduction 
  ? 'https://mcqapp-backend-1.onrender.com/api'
  : 'https://mcqapp-backend-1.onrender.com/api'; // Update with your dev URL if different

export const POLLING_INTERVAL = isProduction ? 30000 : 10000; // 30s in prod, 10s in dev
export const PDF_PROXY_URL = `${BASE_URL}/protected`; // For protected PDF routes

// Production settings
export const PRODUCTION_CONFIG = {
  enableDebugLogs: false,
  enableAnalytics: true,
  enableCrashReporting: true,
  enablePerformanceMonitoring: true,
  maxRetryAttempts: 3,
  requestTimeout: 30000,
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
};

// Development settings
export const DEV_CONFIG = {
  enableDebugLogs: true,
  enableAnalytics: false,
  enableCrashReporting: false,
  enablePerformanceMonitoring: false,
  maxRetryAttempts: 5,
  requestTimeout: 60000,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

export const CONFIG = isProduction ? PRODUCTION_CONFIG : DEV_CONFIG;