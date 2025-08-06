import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeMenuButton = ({ onPress, menuButtonScale, colors, styles }) => (
  <Animated.View style={{ transform: [{ scale: menuButtonScale }] }}>
    <TouchableOpacity 
      style={styles.menuButton}
      onPress={onPress}
    >
      <View style={styles.menuButtonInner}>
        <MaterialCommunityIcons name="menu" size={28} color={colors.surface} />
      </View>
    </TouchableOpacity>
  </Animated.View>
);

export default HomeMenuButton; 