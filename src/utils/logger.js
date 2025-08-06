import { CONFIG } from '../config/config';

class Logger {
  static log(message, data = null) {
    if (CONFIG.enableDebugLogs) {
      if (data) {
        console.log(`[${new Date().toISOString()}] ${message}`, data);
      } else {
        console.log(`[${new Date().toISOString()}] ${message}`);
      }
    }
  }

  static error(message, error = null) {
    // Always log errors in production for debugging
    if (error) {
      console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
    } else {
      console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
    }
  }

  static warn(message, data = null) {
    if (CONFIG.enableDebugLogs) {
      if (data) {
        console.warn(`[${new Date().toISOString()}] WARN: ${message}`, data);
      } else {
        console.warn(`[${new Date().toISOString()}] WARN: ${message}`);
      }
    }
  }

  static info(message, data = null) {
    if (CONFIG.enableDebugLogs) {
      if (data) {
        console.info(`[${new Date().toISOString()}] INFO: ${message}`, data);
      } else {
        console.info(`[${new Date().toISOString()}] INFO: ${message}`);
      }
    }
  }
}

export default Logger; 