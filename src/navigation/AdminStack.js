import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import StaffManagementScreen from '../screens/Admin/StaffManagementScreen';
import InventoryManagementScreen from '../screens/Admin/InventoryManagementScreen';
import ReportsScreen from '../screens/Admin/ReportsScreen';
import AdminSettingsScreen from '../screens/Admin/AdminSettingsScreen';
import MenuManagementScreen from '../screens/Admin/MenuManagementScreen';
import { Palette } from '../theme/colors';

const Stack = createStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: Palette.background },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboard}
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Stack.Screen 
        name="StaffManagement" 
        component={StaffManagementScreen}
        options={{
          title: 'Staff Management',
          headerShown: true,
          headerStyle: {
            backgroundColor: Palette.surface,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTitleStyle: {
            color: Palette.text,
            fontSize: 18,
            fontWeight: '600',
          },
          headerTintColor: Palette.primary,
        }}
      />
      <Stack.Screen 
        name="InventoryManagement" 
        component={InventoryManagementScreen}
        options={{
          title: 'Inventory Management',
          headerShown: true,
          headerStyle: {
            backgroundColor: Palette.surface,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTitleStyle: {
            color: Palette.text,
            fontSize: 18,
            fontWeight: '600',
          },
          headerTintColor: Palette.primary,
        }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          title: 'Reports & Analytics',
          headerShown: true,
          headerStyle: {
            backgroundColor: Palette.surface,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTitleStyle: {
            color: Palette.text,
            fontSize: 18,
            fontWeight: '600',
          },
          headerTintColor: Palette.primary,
        }}
      />
      <Stack.Screen 
        name="AdminSettings" 
        component={AdminSettingsScreen}
        options={{
          title: 'Admin Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: Palette.surface,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTitleStyle: {
            color: Palette.text,
            fontSize: 18,
            fontWeight: '600',
          },
          headerTintColor: Palette.primary,
        }}
      />
      <Stack.Screen 
        name="MenuManagement" 
        component={MenuManagementScreen}
        options={{
          title: 'Menu Management',
          headerShown: true,
          headerStyle: {
            backgroundColor: Palette.surface,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTitleStyle: {
            color: Palette.text,
            fontSize: 18,
            fontWeight: '600',
          },
          headerTintColor: Palette.primary,
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminStack;