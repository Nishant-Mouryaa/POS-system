import React, {
  useState,
  useRef,
  useCallback,
  useMemo
} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HelperText,
  Text,
  useTheme,
  ActivityIndicator,
  Button
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';

import BackgroundWrapper from '../../components/BackgroundWrapper';
import SignupHeader from '../../components/signup/SignupHeader';
import RoleSelection from '../../components/signup/RoleSelection';
import CommonFormFields from '../../components/signup/CommonFormFields';
import StudentForm from '../../components/signup/StudentForm';
import TeacherForm from '../../components/signup/TeacherForm';
import AddressForm from '../../components/signup/AddressForm';

import { db } from '../../config/firebase';
import { Palette } from '../../theme/colors';

// -----------------------------------------------------------------------------

const SignupScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  // Form state
  const [role, setRole] = useState('Student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolBoard, setSchoolBoard] = useState('');
  const [grade, setGrade] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [adminCode, setAdminCode] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Refs for input fields
  const emailInput = useRef();
  const passwordInput = useRef();
  const schoolBoardInput = useRef();
  
  const mobileInput = useRef();
  

  const auth = getAuth();

  // Animated value for button scale
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Memoized input theme to avoid re-creating the object on every render
  const inputTheme = useMemo(
    () => ({
      colors: {
        primary: colors.primary,
        background: colors.surface,
        placeholder: colors.textMuted,
        text: colors.text,
        surface: 'transparent'
      },
      roundness: 10
    }),
    [colors]
  );

  // Animations for button press
  const handlePressIn = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [buttonScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, [buttonScale]);

  // Simulated OTP sending


  const handleSignUp = useCallback(async () => {
    Keyboard.dismiss();
    setError('');

    // Basic validation
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (!address || !city || !state || !pincode) {
      setError('Please fill in all address fields');
      return;
    }

    if (role === 'Student') {
      if (!schoolBoard || !grade || !mobileNumber ) {
        setError('Please fill all student information');
        return;
      }
      
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Profile
      await updateProfile(user, { displayName: fullName });

      // Determine if user is an Admin
      

      // Construct user data
      const userData = {
        uid: user.uid,
        email: user.email,
        name: fullName,
        fullName,
        role,
        isAdmin,
        createdAt: new Date(),
        emailVerified: false,
        activeCourses: 0,
        completedTests: 0,
        avgScore: 0,
        address: {
          street: address,
          city,
          state,
          pincode
        }
      };

      // Additional student fields
      if (role === 'Student') {
        userData.schoolBoard = schoolBoard;
        userData.grade = grade;
        userData.mobileNumber = mobileNumber;
      }

      // Save user data in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      // Send email verification
      await sendEmailVerification(user);

      Alert.alert(
        'Verification Sent',
        `A verification email has been sent to ${email}. Please verify to continue.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        default:
          break;
      }
      setError(errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [
    fullName,
    email,
    password,
    address,
    city,
    state,
    pincode,
    role,
    schoolBoard,
    grade,
    mobileNumber,
    
    adminCode,
    auth,
    navigation
  ]);

  return (
    <BackgroundWrapper>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <SafeAreaView style={styles.safeArea}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <SignupHeader colors={colors} />

              {/* Role Selection */}
              <RoleSelection role={role} setRole={setRole} colors={colors} />

              {/* Form Container */}
              <View style={styles.formContainer}>
                <CommonFormFields
                  fullName={fullName}
                  setFullName={setFullName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  secureTextEntry={secureTextEntry}
                  setSecureTextEntry={setSecureTextEntry}
                  colors={colors}
                  inputTheme={inputTheme}
                  emailInput={emailInput}
                  passwordInput={passwordInput}
                  onPasswordSubmit={
                    role === 'Student'
                      ? () => schoolBoardInput.current?.focus()
                      : handleSignUp
                  }
                />

                {role === 'Teacher' ? (
                  <TeacherForm
                    
                    colors={colors}
                    inputTheme={inputTheme}
                    
                  />
                ) : (
                  <StudentForm
                    schoolBoard={schoolBoard}
                    setSchoolBoard={setSchoolBoard}
                    grade={grade}
                    setGrade={setGrade}
                    mobileNumber={mobileNumber}
                    setMobileNumber={setMobileNumber}
                    colors={colors}
                    inputTheme={inputTheme}
                    mobileInput={mobileInput}
                  />
                )}

                <AddressForm
                  address={address}
                  setAddress={setAddress}
                  city={city}
                  setCity={setCity}
                  state={state}
                  setState={setState}
                  pincode={pincode}
                  setPincode={setPincode}
                  colors={colors}
                  inputTheme={inputTheme}
                />

                {/* Error message */}
                {!!error && (
                  <HelperText
                    type="error"
                    style={[styles.errorText, { color: colors.error }]}
                    visible={Boolean(error)}
                  >
                    {error}
                  </HelperText>
                )}

                {/* Sign Up Button */}
                <TouchableWithoutFeedback
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <Animated.View
                    style={[
                      styles.signUpButton,
                      {
                        transform: [{ scale: buttonScale }],
                        backgroundColor: loading
                          ? colors.primaryLight
                          : colors.primary
                      }
                    ]}
                  >
                    <View style={styles.buttonContent}>
                      {loading && (
                        <ActivityIndicator
                          color={colors.iconlight}
                          size="small"
                          style={styles.loadingIndicator}
                        />
                      )}
                      <Text style={styles.buttonText}>
                        {loading ? 'Creating...' : 'Sign Up'}
                      </Text>
                    </View>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: Palette.textLight }]}>
                  Already have an account?
                </Text>
                <Button
                  mode="text"
                  onPress={() => {
                    Haptics.selectionAsync();
                    navigation.navigate('Login');
                  }}
                  labelStyle={[styles.loginLink, { color: colors.primary }]}
                  compact
                >
                  Sign In
                </Button>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </BackgroundWrapper>
  );
};

// -----------------------------------------------------------------------------

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent'
    },
    safeArea: {
      flex: 1
    },
    scrollContainer: {
      flexGrow: 1,
      paddingVertical: 24,
      paddingHorizontal: 24,
      justifyContent: 'center'
    },
    formContainer: {
      marginBottom: 24,
      backgroundColor: Palette.bg,
      borderRadius: 20,
      padding: 24,
      shadowColor: Palette.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 3
    },
    errorText: {
      fontSize: 14,
      marginBottom: 8,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
    },
    signUpButton: {
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 8,
      alignItems: 'center',
      justifyContent: 'center'
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
      color: Palette.textLight,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12
    },
    footerText: {
      marginRight: 4,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontSize: 14
    },
    loginLink: {
      fontWeight: '600',
      textDecorationLine: 'underline',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
      fontSize: 14
    }
  });

export default SignupScreen;