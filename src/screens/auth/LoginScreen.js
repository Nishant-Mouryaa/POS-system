import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Animated,
  Image
} from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  Text,
  useTheme,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  // Firebase auth reference
  const auth = getAuth();

  // References
  const passwordInputRef = useRef(null);

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shiftId, setShiftId] = useState(null);

  // Animation references
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Fade in animation on component mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, [fadeAnim]);

  // Scale animation when pressing sign-in button
  const handlePressIn = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      speed: 12,
      useNativeDriver: true
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [buttonScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 12,
      useNativeDriver: true
    }).start();
  }, [buttonScale]);

  // Shake animation for error states
  const runShakeAnimation = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  }, [shakeAnim]);

  // Helper function to map Firebase error codes
  const getErrorMessage = useCallback((code) => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No staff account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Account temporarily disabled due to many failed attempts';
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'Login failed. Please try again.';
    }
  }, []);

  // Check if user has staff permissions
// Update the checkStaffPermissions function to check custom claims
const checkStaffPermissions = async (userId) => {
  try {
    // Get the user's ID token to access custom claims
    const user = auth.currentUser;
    if (!user) return { isStaff: false, role: null, permissions: {} };
    
    // Force token refresh to get latest claims
    const idTokenResult = await user.getIdTokenResult(true);
    
    // Check custom claims first (these are set via Admin SDK)
    if (idTokenResult.claims.admin || idTokenResult.claims.manager || idTokenResult.claims.staff) {
      return {
        isStaff: true,
        role: idTokenResult.claims.role || 'staff',
        permissions: {
          admin: idTokenResult.claims.admin || false,
          manager: idTokenResult.claims.manager || false,
          staff: idTokenResult.claims.staff || false,
          ...idTokenResult.claims.permissions
        }
      };
    }

    // Fallback to Firestore check if no custom claims exist
    const userRef = doc(db, 'staff', userId); // Changed from 'users' to 'staff'
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        isStaff: userData.active || false,
        role: userData.role || null,
        permissions: userData.permissions || {}
      };
    }
    
    return { isStaff: false, role: null, permissions: {} };
  } catch (error) {
    console.error("Error checking staff permissions:", error);
    return { isStaff: false, role: null, permissions: {} };
  }
};

// Modify the handleSignIn function to handle admin redirection
const handleSignIn = useCallback(async () => {
  Keyboard.dismiss();
  setError('');

  if (!email || !password) {
    setError('Email and password are required');
    runShakeAnimation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }

  setLoading(true);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user is staff and get their role
    const { isStaff, role, permissions } = await checkStaffPermissions(user.uid);
    
    if (!isStaff) {
      setError('This account is not authorized for staff access');
      runShakeAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setLoading(false);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Navigate to appropriate screen based on role
    if (role === 'admin') {
      navigation.navigate('AdminDashboard');
    } else if (role === 'manager') {
      navigation.navigate('ManagerDashboard');
    } else {
      // For regular staff, create a shift and go to POS
      const newShiftId = await createNewShift(user.uid);
      setShiftId(newShiftId);
      navigation.navigate('POS', { shiftId: newShiftId });
    }
  } catch (err) {
    setError(getErrorMessage(err.code));
    runShakeAnimation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } finally {
    setLoading(false);
  }
}, [auth, email, password, runShakeAnimation, getErrorMessage, navigation]);

  // Create a new shift when staff logs in
  const createNewShift = async (userId, cafeId) => {
    try {
      const shiftRef = doc(db.collection('shifts'));
      const newShift = {
        id: shiftRef.id,
        cafeId: cafeId,
        staff: {
          userId: userId,
          role: 'cashier' // This would be updated with actual role
        },
        timing: {
          scheduledStart: admin.firestore.FieldValue.serverTimestamp(),
          scheduledEnd: null,
          actualStart: admin.firestore.FieldValue.serverTimestamp(),
          actualEnd: null
        },
        sales: {
          totalOrders: 0,
          totalSales: 0,
          cashSales: 0,
          cardSales: 0,
          refunds: 0,
          discountsGiven: 0
        },
        cashDrawer: {
          openingAmount: 0,
          closingAmount: null,
          expectedAmount: null,
          variance: null,
          notes: ""
        },
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await shiftRef.set(newShift);
      return shiftRef.id;
    } catch (error) {
      console.error("Error creating new shift:", error);
      return null;
    }
  };


  // Toggle secure text entry
  const toggleSecureText = useCallback(() => {
    setSecureTextEntry((prev) => !prev);
    Haptics.selectionAsync();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        enabled
      >
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateX: shakeAnim }]
              }
            ]}
          >
            {/* Cafe Branding Header */}
            <View style={styles.brandingContainer}>
          
              <Text style={styles.cafeName}>Brew & Bytes</Text>
              <Text style={styles.tagline}>Staff Portal</Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Email Field */}
              <TextInput
                label="Staff Email"
                mode="flat"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                left={<TextInput.Icon icon="account-outline" color={Palette.primary} />}
                theme={{
                  colors: {
                    primary: Palette.primary,
                    background: Palette.surface,
                    placeholder: Palette.iconlight,
                    text: Palette.text,
                    surface: 'transparent'
                  },
                  roundness: 10
                }}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />

              {/* Password Field */}
              <TextInput
                label="Password"
                mode="flat"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                style={styles.input}
                left={<TextInput.Icon icon="lock-outline" color={colors.primary} />}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry ? 'eye-off' : 'eye'}
                    color={colors.primary}
                    onPress={toggleSecureText}
                  />
                }
                theme={{
                  colors: {
                    primary: colors.primary,
                    background: colors.surface,
                    placeholder: colors.textMuted,
                    text: colors.text,
                    surface: 'transparent'
                  },
                  roundness: 10
                }}
                ref={passwordInputRef}
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />

              {/* Error message */}
              {!!error && (
                <HelperText
                  type="error"
                  style={styles.errorText}
                  visible={!!error}
                >
                  {error}
                </HelperText>
              )}

              {/* Sign In Button */}
              <TouchableWithoutFeedback
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleSignIn}
                disabled={loading}
              >
                <Animated.View
                  style={[
                    styles.buttonContainer,
                    {
                      transform: [{ scale: buttonScale }],
                      backgroundColor: loading
                        ? Palette.primaryLight
                        : Palette.primary
                    }
                  ]}
                >
                  <View style={styles.buttonContent}>
                    {loading && (
                      <ActivityIndicator
                        color={Palette.iconlight}
                        size="small"
                        style={styles.loadingIndicator}
                      />
                    )}
                    <Text style={styles.buttonText}>
                      {loading ? 'Starting Shift...' : 'Start Shift'}
                    </Text>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Having trouble?</Text>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Help')}
                  labelStyle={styles.helpLink}
                  compact
                >
                  Get Help
                </Button>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Palette.background
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center'
    },
    brandingContainer: {
      alignItems: 'center',
      marginBottom: 40
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 16
    },
    cafeName: {
      fontSize: 28,
      fontWeight: '700',
      color: Palette.text,
      marginBottom: 4,
      textAlign: 'center',
      fontFamily: 'sans-serif-medium'
    },
    tagline: {
      fontSize: 16,
      color: Palette.textSecondary,
      textAlign: 'center',
      fontFamily: 'sans-serif',
      letterSpacing: 1
    },
    formContainer: {
      marginTop: 20,
      backgroundColor: Palette.surfaceVariant,
      borderRadius: 16,
      padding: 24,
      shadowColor: Palette.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 3
    },
    input: {
      marginBottom: 20,
      backgroundColor: Palette.surface,
      fontSize: 16,
      height: 56
    },
    buttonContainer: {
      borderRadius: 12,
      paddingVertical: 16,
      marginTop: 24,
      shadowColor: Palette.primaryXLight,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
      backgroundColor: Palette.primary
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingIndicator: {
      marginRight: 8
    },
    buttonText: {
      color: Palette.textOnPrimary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase'
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24
    },
    footerText: {
      color: colors.textSecondary,
      marginRight: 4,
      fontFamily: 'sans-serif'
    },
    helpLink: {
      color: colors.secondary,
      fontWeight: '600',
      textDecorationLine: 'underline',
      fontFamily: 'sans-serif-medium'
    },
    errorText: {
      fontSize: 14,
      marginBottom: 8,
      color: colors.error,
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }
  });

export default LoginScreen;