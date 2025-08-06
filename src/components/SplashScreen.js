import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const CustomSplashScreen = ({ onAnimationComplete }) => {
  const [appIsReady, setAppIsReady] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible
        await SplashScreen.preventAutoHideAsync();
        
        // Simulate loading (replace with your actual loading logic)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          onAnimationComplete();
        });
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image 
          source={require('../../assets/splash-icon.png')} 
          style={styles.logo} 
        />
        <Text style={styles.text}>Iyer's Classes</Text>
        <Text style={styles.subtext}>Preparing your learning environment...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 10,
  },
});

export default CustomSplashScreen;