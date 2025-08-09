import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Platform,
  View,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import POSScreen from '../screens/home/POSScreen';
import { ComponentColors, Palette } from '../theme/colors';
import MenuCategoryScreen from '../screens/Menu/MenuCategoryScreen';
import CustomerManagementScreen from '../screens/customer/CustomerManagementScreen';
import OrderManagementScreen from '../screens/Order/OrderManagementScreen';
const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();


const TabBarIcon = ({ route, focused, color, size }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.15 : 1,
      friction: 3,
      tension: 20,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const iconName = {
    Home: focused ? 'home' : 'home-outline',
    MenuCategoryScreen: focused ? 'food-fork-drink' : 'food-outline',
    OrderManagementScreen: focused ? 'clipboard-text' : 'clipboard-text-outline',
    MessageCenter: focused ? 'message-outline' : 'message-outline',
    CustomerManagementScreen: focused ? 'account-group' : 'account-group-outline',
  }[route.name];

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <MaterialCommunityIcons 
        name={iconName} 
        size={size} 
        color={color} 
      />
    </Animated.View>
  );
};

const QuickActionFAB = ({ icon, color, onPress, position = 'right' }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', position === 'right' ? '10deg' : '-10deg']
  });

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.fabContainer,
          { 
            [position]: 24,
            backgroundColor: Palette.surface,
            transform: [{ scale: scaleAnim }, { rotate: rotation }] 
          },
        ]}
      >
        <MaterialCommunityIcons 
          name={icon} 
          size={28} 
          color={color} 
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const BottomTabNavigator = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        setIsAdmin(docSnap.exists() && docSnap.data().isAdmin);
      }
    };
    checkAdminStatus();
  }, []);

  return (
    <>
   

      <Tab.Navigator
        initialRouteName="POSScreen"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon
              route={route}
              focused={focused}
              size={size}
              color={color}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Poppins-Medium',
            marginBottom: Platform.select({ ios: 5, android: 2 }),
          },
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 10,
            right: 10,
            backgroundColor: ComponentColors.navigation.background,
            borderTopWidth: 0,
            height: Platform.select({ ios: 80, android: 70 }),
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Palette.glassBorder,
            shadowColor: Palette.shadowDark,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
            paddingBottom: Platform.select({ ios: 10, android: 5 }),
            paddingTop: 5,
            marginBottom: Platform.select({ ios: 10, android: 5 }),
          },
          tabBarActiveTintColor: ComponentColors.navigation.activeTab,
          tabBarInactiveTintColor: ComponentColors.navigation.inactiveTab,
          tabBarShowLabel: true,
          tabBarHideOnKeyboard: true,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={POSScreen} 
          options={{ tabBarLabel: 'POS' }} 
        />
        <Tab.Screen 
          name="MenuCategoryScreen" 
          component={MenuCategoryScreen} 
          options={{ tabBarLabel: 'Menu' }} 
        />
        <Tab.Screen 
          name="OrderManagementScreen" 
          component={OrderManagementScreen} 
          options={{ tabBarLabel: 'Orders' }} 
        />
       
          <Tab.Screen 
            name="CustomerManagementScreen" 
            component={CustomerManagementScreen} 
            options={{ tabBarLabel: 'Customers' }} 
          />
      
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: Platform.select({ ios: 100, android: 85 }),
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomTabNavigator;