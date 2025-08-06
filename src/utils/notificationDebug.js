// src/utils/notificationDebug.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NotificationDebugger = {
  async log(event, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      data,
    };
    
    try {
      const logs = await AsyncStorage.getItem('notification_logs') || '[]';
      const parsedLogs = JSON.parse(logs);
      parsedLogs.push(logEntry);
      
      // Keep only last 50 logs
      if (parsedLogs.length > 50) {
        parsedLogs.shift();
      }
      
      await AsyncStorage.setItem('notification_logs', JSON.stringify(parsedLogs));
      console.log(`[NotificationDebug] ${event}:`, data);
    } catch (error) {
      console.error('Error logging notification event:', error);
    }
  },
  
  async getLogs() {
    try {
      const logs = await AsyncStorage.getItem('notification_logs') || '[]';
      return JSON.parse(logs);
    } catch (error) {
      console.error('Error getting notification logs:', error);
      return [];
    }
  },
  
  async clearLogs() {
    try {
      await AsyncStorage.removeItem('notification_logs');
    } catch (error) {
      console.error('Error clearing notification logs:', error);
    }
  }
};