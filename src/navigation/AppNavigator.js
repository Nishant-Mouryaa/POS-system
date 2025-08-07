import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import BottomTabNavigator from './BottomTabNavigator';
import AdminStack from './AdminStack'; // Import the new AdminStack
import PdfViewerScreen from '../screens/PdfViewerScreen';
import BoardSelectionScreen from '../screens/Test/BoardSelectionScreen';
import StandardSelectionScreen from '../screens/Test/StandardSelectionScreen';
import SubjectSelectionScreen from '../screens/Test/SubjectSelectionScreen';
import ChapterSelectionScreen from '../screens/Test/ChapterSelectionScreen';
import TestListScreen from '../screens/Test/TestListScreen';
import TestScreen from '../screens/Test/TestScreen';
import TestHistoryScreen from '../screens/Test/TestHistoryScreen';
import AboutUsScreen from '../screens/sidebar/AboutUsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnlineTestScreen from '../screens/Test/OnlineTestScreen';
import IntroScreen from '../screens/auth/IntroScreen';
import MenuCategoryScreen from '../screens/Textbooks/MenuCategoryScreen';
import TextbookClass from '../screens/Textbooks/TextbookClass';
import TextbookSubject from '../screens/Textbooks/TextbookSubject';
import TextbooksList from '../screens/Textbooks/TextbooksListScreen';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import MenuItemsScreen from '../screens/Textbooks/MenuItemsScreen';


const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
    
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="Main" component={BottomTabNavigator} />

    <AppStack.Screen name="BoardSelection" component={BoardSelectionScreen} />
    <AppStack.Screen name="StandardSelection" component={StandardSelectionScreen} />
    <AppStack.Screen name="SubjectSelection" component={SubjectSelectionScreen} />
    <AppStack.Screen name="ChapterSelection" component={ChapterSelectionScreen} />
    <AppStack.Screen name="TestList" component={TestListScreen} />
    <AppStack.Screen name="TestScreen" component={TestScreen} />
    <AppStack.Screen name="OnlineTest" component={OnlineTestScreen} />
    <AppStack.Screen name="TestHistory" component={TestHistoryScreen} />
    <AppStack.Screen name="AboutUs" component={AboutUsScreen} />
    <AppStack.Screen name="Settings" component={SettingsScreen} />
    <AppStack.Screen name="Profile" component={ProfileScreen} />
    <AppStack.Screen name="MenuCategoryScreen" component={MenuCategoryScreen} />
    <AppStack.Screen name="MenuItems" component={MenuItemsScreen} />
    <AppStack.Screen name="TextbookClass" component={TextbookClass} />
    <AppStack.Screen name="TextbookSubject" component={TextbookSubject} />
    <AppStack.Screen name="TextbooksList" component={TextbooksList} />

    <AppStack.Screen name="Admin" component={AdminStack} />

    <AppStack.Screen 
      name="PdfViewer" 
      component={PdfViewerScreen}
      options={({ route }) => ({ title: route.params?.title || 'PDF' })}
    />
  </AppStack.Navigator>

  
);

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return unsubscribe; // Clean up on unmount
  }, []);

  if (isLoading) {
    // Return a loading screen here if needed
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;