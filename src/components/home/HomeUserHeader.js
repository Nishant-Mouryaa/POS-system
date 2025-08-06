import React from 'react';
import { View, Animated } from 'react-native';
import { Avatar, Text } from 'react-native-paper';

const HomeUserHeader = ({ userData, pulseAnim, colors, styles }) => (
  <View style={styles.headerContainer}>
    <View style={styles.userInfo}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Avatar.Text 
          size={64} 
          label={userData?.name ? userData.name.split(' ').map(n => n[0]).join('') : 'U'} 
          style={styles.avatar}
        />
      </Animated.View>
      <View style={styles.userText}>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <Text style={styles.userName}>{userData?.name || 'User'}</Text>
      </View>
    </View>
  </View>
);

export default HomeUserHeader; 