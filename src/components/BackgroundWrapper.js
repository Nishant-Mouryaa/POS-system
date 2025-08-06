import React from 'react';
import { ImageBackground, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

const BackgroundWrapper = ({ children }) => {
  return (
    <ImageBackground
      source={require('../../assets/backGround-wrapper (2).png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* BlurView to blur the background image */}
      <BlurView
        intensity={80} // Adjust blur intensity (0-100)
        tint="dark" // "light", "dark", or "default"
        style={styles.blur}
      />

      {/* Semi-transparent overlay with your theme color */}
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 64, 125, 0.45)', // Secondary color with adjusted opacity
    zIndex: 2, // Ensure content is above blur
  },
});

export default BackgroundWrapper;