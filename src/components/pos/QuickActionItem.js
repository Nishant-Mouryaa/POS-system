import React, { useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const QuickActionItem = ({ icon, title, onPress, index, featureAnimations, pulseAnim, styles }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <Animated.View
      style={[
        styles.featureItemContainer,
        {
          opacity: featureAnimations[index],
          transform: [
            {
              translateY: featureAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
            { scale: scaleValue },
            { rotate: spin },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.featureItem}
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View 
          style={[
            styles.featureIcon, 
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <MaterialCommunityIcons name={icon} size={26} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.featureItemTitle}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default QuickActionItem;