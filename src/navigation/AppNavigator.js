import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import BottomTabNavigator from './BottomTabNavigator';
import AdminStack from './AdminStack';
import ManagerDashboard from '../screens/manager/ManagerDashboard'; // You'll need to create this

import AboutUsScreen from '../screens/sidebar/AboutUsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MenuCategoryScreen from '../screens/Menu/MenuCategoryScreen';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import MenuItemsScreen from '../screens/Menu/MenuItemsScreen';
import CartScreen from '../screens/Menu/CartScreen';
import ItemDetail from '../screens/Menu/ItemDetail';
import OrderConfirmation from '../screens/Menu/OrderConfirmation';
import OrderDetailScreen from '../screens/Order/OrderDetailScreen';

const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    {/* Staff/Regular User Screens */}
    <AppStack.Screen name="Main" component={BottomTabNavigator} />
    
    {/* Admin Screens */}
    <AppStack.Screen name="AdminDashboard" component={AdminStack} />
    
    {/* Manager Screens */}
    <AppStack.Screen name="ManagerDashboard" component={ManagerDashboard} />
    
    {/* Shared Screens */}
    <AppStack.Screen name="AboutUs" component={AboutUsScreen} />
    <AppStack.Screen name="Settings" component={SettingsScreen} />
    <AppStack.Screen name="Profile" component={ProfileScreen} />
    <AppStack.Screen name="MenuCategoryScreen" component={MenuCategoryScreen} />
    <AppStack.Screen name="MenuItems" component={MenuItemsScreen} />
    <AppStack.Screen name="Cart" component={CartScreen} />
    <AppStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <AppStack.Screen name="OrderConfirmation" component={OrderConfirmation} />
    <AppStack.Screen 
      name="ItemDetail" 
      component={ItemDetail} 
      initialParams={{ onAddToCart: (item) => console.log(item) }}
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