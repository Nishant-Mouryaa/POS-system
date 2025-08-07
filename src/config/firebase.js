import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Firebase config from Expo constants
const firebaseConfig = Constants.expoConfig.extra.firebase;

console.log('Initializing Firebase with configuration:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('App ID:', firebaseConfig.appId);
console.log('API Key:', firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'Not available');
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Storage Bucket:', firebaseConfig.storageBucket);

// Initialize Firebase
let app;
if (getApps().length === 0) {
  console.log('No Firebase apps initialized - creating new app instance');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} else {
  app = getApps()[0];
  console.log('Using existing Firebase app instance:', app.name);
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
console.log('Firebase Auth initialized with AsyncStorage persistence');

export const db = getFirestore(app);
console.log('Firestore initialized');

export const storage = getStorage(app);
console.log('Firebase Storage initialized');

console.log('Firebase services initialized for project:', firebaseConfig.projectId);

export { auth, app };