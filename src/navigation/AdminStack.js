import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AdminPanel from '../screens/Admin/AdminPanel';

import { AdminPalette } from '../theme/colors';
import { AdminDarkTheme } from '../theme'; // Optional custom theme if shaped for Paper

const Stack = createStackNavigator();

const AdminStack = () => {
  // Wrap the stack navigator in a PaperProvider to apply AdminPalette-based theme
  return (
    <PaperProvider theme={AdminPalette}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: AdminPalette.primary, // Admin primary color
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: AdminPalette.text, // Text color from Admin palette
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 20,
          },
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
          cardStyle: {
            backgroundColor: AdminPalette.bg, // Dark background for admin screens
          },
          
        }}
      >
        <Stack.Screen 
          name="AdminPanel" 
          component={AdminPanel} 
          options={{ headerShown: false }}
        />
      
     
        
        
      </Stack.Navigator>
    </PaperProvider>
  );
};

export default AdminStack;