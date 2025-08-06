import React from 'react';
import { View, Animated } from 'react-native';
import { Avatar, Text } from 'react-native-paper';

const POSUserHeader = ({ userData, pulseAnim, colors, styles }) => (
  <View style={styles.headerContainer}>
    <View style={styles.userInfo}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Avatar.Text 
          size={64} 
          label={userData?.name ? userData.name.split(' ').map(n => n[0]).join('') : 'S'} 
          style={styles.avatar}
        />
      </Animated.View>
      <View style={styles.userText}>
        <Text style={styles.welcomeText}>Currently on shift</Text>
        <Text style={styles.userName}>{userData?.name || 'Staff'}</Text>
        <Text style={styles.userRole}>{userData?.role || 'Cashier'}</Text>
      </View>
    </View>
  </View>
);

export default POSUserHeader;