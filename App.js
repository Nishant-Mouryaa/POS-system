import React, { useEffect, useRef, useState } from 'react';
import { Platform, Alert, AppState } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/AppContext';
import theme from './src/theme';
import { Palette } from './src/theme/colors';
import { MD3LightTheme } from 'react-native-paper';
import { NotificationDebugger } from './src/utils/notificationDebug';
import { CartProvider } from './src/context/CartContext';
// Firestore imports
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './src/config/firebase'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Palette.primary,
    primaryContainer: Palette.primaryLight,
    background: Palette.bg,
    surface: Palette.bg,
    outline: Palette.textMuted,
    onSurface: Palette.text,
    onBackground: Palette.text,
  },
};

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
  });

  const notificationListener = useRef();
  const responseListener = useRef();
  const appStateRef = useRef(AppState.currentState);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const currentUser = useRef(null);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      // Log setup start
      await NotificationDebugger.log('setup_start', { 
        platform: Platform.OS,
        device: Device.isDevice 
      });

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: true,
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });
        
        await NotificationDebugger.log('channel_created', { channel: 'default' });
      }

      // Get existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      await NotificationDebugger.log('permissions_check', { status: existingStatus });

      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        await NotificationDebugger.log('permissions_request', { status });
      }

      if (finalStatus !== 'granted') {
        await NotificationDebugger.log('permissions_denied', { finalStatus });
        Alert.alert(
          'Permission Required',
          'Push notifications need to be enabled to receive messages.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return;
      }

      // Register for push notifications
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        await NotificationDebugger.log('token_received', { token });
      }

      // Set up listeners
      notificationListener.current = Notifications.addNotificationReceivedListener(
        async (notification) => {
          await NotificationDebugger.log('notification_received', {
            title: notification.request.content.title,
            body: notification.request.content.body,
            data: notification.request.content.data,
          });
          setNotification(notification);
        }
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          await NotificationDebugger.log('notification_tapped', {
            actionIdentifier: response.actionIdentifier,
            notification: response.notification.request.content,
          });
          
          // Handle navigation here
          const data = response.notification.request.content.data;
          if (data?.type === 'message') {
            // Navigate to messages screen
            // navigationRef.current?.navigate('Messages');
          }
        }
      );

      // Handle notifications that were received while app was closed
      const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastNotificationResponse) {
        await NotificationDebugger.log('last_notification_response', {
          notification: lastNotificationResponse.notification.request.content,
        });
        
        // Handle the notification
        const data = lastNotificationResponse.notification.request.content.data;
        if (data?.type === 'message') {
          // Navigate to messages screen
          // navigationRef.current?.navigate('Messages');
        }
      }

    } catch (error) {
      await NotificationDebugger.log('setup_error', { 
        error: error.message,
        stack: error.stack 
      });
      console.error('Notification setup error:', error);
    }
  };


  useEffect(() => {
    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });
    }

    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Got push token:', token);
        setExpoPushToken(token);
        // If user is already logged in, store token immediately
        if (currentUser.current) {
          storeTokenInFirestore(token, currentUser.current.uid);
        }
      }
    });

    // Listen for auth state changes
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      currentUser.current = user;
      if (user && expoPushToken) {
        console.log('User authenticated, storing token');
        storeTokenInFirestore(expoPushToken, user.uid);
      }
    });

    // App state subscription for handling background/foreground
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        // Re-register for notifications when app comes to foreground
        if (currentUser.current && expoPushToken) {
          storeTokenInFirestore(expoPushToken, currentUser.current.uid);
        }
      }
      appStateRef.current = nextAppState;
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Navigate to messages screen when notification is tapped
      // You'll need to pass navigation prop or use a navigation ref
      // navigation.navigate('Messages');
    });

    return () => {
      unsubscribeAuth();
      appStateSubscription.remove();
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [expoPushToken]);

  // Request notification permissions and get the Expo push token
  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Push notifications need to be enabled to receive messages when the app is closed.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      try {
        // Get the project ID from multiple possible locations
        const projectId = 
          Constants.expoConfig?.extra?.eas?.projectId ?? 
          Constants.easConfig?.projectId ??
          '1d7013c4-37bc-40e7-b605-94e76a7f879e'; // Your project ID as fallback
        
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        console.log('Expo push token obtained:', token);
      } catch (error) {
        console.error('Error getting push token:', error);
        Alert.alert('Error', `Failed to get push token: ${error.message}`);
      }
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Store the token in Firestore
  async function storeTokenInFirestore(token, userId) {
    if (!userId || !token || !token.startsWith('ExponentPushToken')) {
      console.log('Invalid token or userId:', { token, userId });
      return;
    }
    
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        { 
          expoPushToken: token,
          pushTokenUpdatedAt: serverTimestamp(),
          deviceInfo: {
            platform: Platform.OS,
            deviceName: Device.deviceName,
            osVersion: Device.osVersion,
            modelName: Device.modelName,
          }
        },
        { merge: true }
      );
      console.log('Push token stored successfully for user:', userId);
    } catch (error) {
      console.error('Error storing push token in Firestore:', error);
      Alert.alert('Error', 'Failed to register for notifications. Please try again.');
    }
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
        <CartProvider>
    <PaperProvider theme={LightTheme}>
      
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      
    </PaperProvider>
    </CartProvider>
  );
}