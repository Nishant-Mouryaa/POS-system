import React, { useState, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Animated, 
  Easing, 
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { Text, useTheme, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Palette } from '../../theme/colors';
import Sidebar from '../../navigation/Sidebar';
import { useFocusEffect } from '@react-navigation/native';

import BackgroundWrapper from '../../components/BackgroundWrapper';
import HomeMenuButton from '../../components/home/HomeMenuButton';
import HomeUserHeader from '../../components/home/HomeUserHeader';
import HomeStatsCard from '../../components/home/HomeStatsCard';
import HomeQuickActions from '../../components/home/HomeQuickActions';
import HomeRecentActivity from '../../components/home/HomeRecentActivity';
import HomeAdminTools from '../../components/home/HomeAdminTools';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  // Get the theme from react-native-paper
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const auth = getAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [recentTests, setRecentTests] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  
  // Track if animations have been initialized
  const [animationsInitialized, setAnimationsInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Animation refs and values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-100)).current;
  const statsCardScale = useRef(new Animated.Value(0.8)).current;
  const featureAnimations = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  const activitySlideAnim = useRef(new Animated.Value(width)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const menuButtonScale = useRef(new Animated.Value(1)).current;

  // Animated background circles
  const circle1Anim = useRef(new Animated.Value(0)).current;
  const circle2Anim = useRef(new Animated.Value(0)).current;

  // Refs to track running animations
  const backgroundAnimationRef = useRef(null);
  const pulseAnimationRef = useRef(null);

  // Fetch recent test results
  const fetchRecentTests = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoadingActivity(true);
      const testResultsRef = collection(db, 'testResults');
      const q = query(
        testResultsRef,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const tests = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tests.push({
          id: doc.id,
          ...data,
          completedAt: data.timestamp?.toDate() || new Date(data.completedAt),
        });
      });

      setRecentTests(tests);
    } catch (error) {
      console.error('Error fetching recent tests:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Fetch and set user data
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsAdmin(data.isAdmin || false);
          setUserData(data);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error("Error reading user data:", error);
      }
    }
  };

  // Format time ago helper function
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Format time taken helper
  const formatTimeTaken = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get performance color based on percentage
  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    return '#F44336';
  };

  // Get performance icon based on percentage
  const getPerformanceIcon = (percentage) => {
    if (percentage >= 80) return 'trending-up';
    if (percentage >= 60) return 'trending-neutral';
    return 'trending-down';
  };

  // Animate background circles continuously
  const startBackgroundAnimation = () => {
    // Stop existing animation if running
    if (backgroundAnimationRef.current) {
      backgroundAnimationRef.current.stop();
    }

    backgroundAnimationRef.current = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(circle1Anim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(circle1Anim, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(circle2Anim, {
            toValue: 1,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(circle2Anim, {
            toValue: 0,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    
    backgroundAnimationRef.current.start();
  };

  // Animate pulsing element
  const startPulseAnimation = () => {
    // Stop existing animation if running
    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
    }

    pulseAnimationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimationRef.current.start();
  };

  // Main animation sequence - only run when needed
  const runEntranceAnimations = () => {
    if (animationsInitialized) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(statsCardScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.stagger(
        100,
        featureAnimations.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        )
      ),
      Animated.spring(activitySlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationsInitialized(true);
    });
  };

  // Set animations to completed state without animating
  const setAnimationsToCompletedState = () => {
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);
    slideUpAnim.setValue(0);
    headerSlideAnim.setValue(0);
    statsCardScale.setValue(1);
    featureAnimations.forEach(anim => anim.setValue(1));
    activitySlideAnim.setValue(0);
  };

  // Initialize or refresh data without animations
  const initializeScreen = useCallback(() => {
    // Always fetch fresh data when screen comes into focus
    fetchUserData();
    fetchRecentTests();
    
    // Start continuous animations (these should always run)
    startBackgroundAnimation();
    startPulseAnimation();

    // Only run entrance animations on first load
    if (!animationsInitialized) {
      runEntranceAnimations();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // If already initialized, just ensure animations are in completed state
      setAnimationsToCompletedState();
    }
  }, [animationsInitialized]);

  // Use focus effect for when screen comes into focus
  useFocusEffect(initializeScreen);

  // Cleanup animations when component unmounts
  React.useEffect(() => {
    return () => {
      if (backgroundAnimationRef.current) {
        backgroundAnimationRef.current.stop();
      }
      if (pulseAnimationRef.current) {
        pulseAnimationRef.current.stop();
      }
    };
  }, []);

  const handleMenuPress = () => {
    Animated.sequence([
      Animated.timing(menuButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(menuButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsSidebarVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  // Quick actions array
  const quickActions = [
    {
      icon: 'book-open-outline',
      title: 'Library',
      onPress: () => navigation.navigate('Textbooks'),
    },
    {
      icon: 'clipboard-text-outline',
      title: 'Tests',
      onPress: () => navigation.navigate('Tests'),
    },
    {
      icon: 'notebook',
      title: 'Notes',
      onPress: () => Alert.alert('Coming Soon', 'Notes feature will be available soon!'),
    },
    {
      icon: 'chart-line',
      title: 'Progress',
      onPress: () => Alert.alert('Coming Soon', 'Progress tracking feature will be available soon!'),
    },
  ];

  // Handler for activity item press
  const handleActivityPress = (test) => {
    Haptics.selectionAsync();
    Alert.alert(
      'Test Details',
      `Test: ${test.testName}\nScore: ${test.score}/${test.totalQuestions} (${test.percentage}%)\nTime: ${formatTimeTaken(test.timeTaken)}`
    );
  };

  // Handler for admin dashboard
  const handleDashboardPress = () => {
    navigation.navigate('Admin', { screen: 'AdminPanel' });
  };

  return (
    <BackgroundWrapper>
      <View style={styles.screenContainer}>
        {/* Sidebar */}
        <Sidebar 
          isVisible={isSidebarVisible} 
          onClose={() => setIsSidebarVisible(false)}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          isAdmin={isAdmin}
        />

        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim }, 
              { translateY: slideUpAnim },
            ],
          }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Menu Button */}
            <HomeMenuButton
              onPress={handleMenuPress}
              menuButtonScale={menuButtonScale}
              colors={colors}
              styles={styles}
            />

            {/* Header / User Info */}
            <Animated.View 
              style={[
                styles.headerContainer,
                { transform: [{ translateX: headerSlideAnim }] },
              ]}
            >
              <HomeUserHeader
                userData={userData}
                pulseAnim={pulseAnim}
                colors={colors}
                styles={styles}
              />
            </Animated.View>

            {/* Stats Card */}
            <HomeStatsCard
              userData={userData}
              statsCardScale={statsCardScale}
              colors={colors}
              styles={styles}
            />

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <HomeQuickActions
              actions={quickActions}
              featureAnimations={featureAnimations}
              pulseAnim={pulseAnim}
              styles={styles}
            />

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Animated.View 
              style={[
                styles.activityCard, 
                { transform: [{ translateX: activitySlideAnim }] },
              ]}
            >
              <HomeRecentActivity
                recentTests={recentTests}
                loadingActivity={loadingActivity}
                styles={styles}
                colors={colors}
                onActivityPress={handleActivityPress}
                getPerformanceColor={getPerformanceColor}
                getPerformanceIcon={getPerformanceIcon}
                formatTimeAgo={formatTimeAgo}
                formatTimeTaken={formatTimeTaken}
              />
            </Animated.View>

            {/* Admin Tools (Only if isAdmin is true) */}
            <HomeAdminTools
              isAdmin={isAdmin}
              onDashboardPress={handleDashboardPress}
              featureAnimations={featureAnimations}
              pulseAnim={pulseAnim}
              styles={styles}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </BackgroundWrapper>
  );
};

const makeStyles = (colors) => 
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      position: 'relative',
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      backgroundColor: 'transparent',
      paddingBottom: 40,
    },
    menuButton: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 60,
      padding: 16,
      zIndex: 999,
    },
    menuButtonInner: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContainer: { 
      marginTop: 48,
      marginBottom: 16,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 16,
    },
    avatar: {
      marginRight: 16,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    userText: {
      flex: 1,
      justifyContent: 'center',
    },
    welcomeText: {
      fontSize: 18,
      color: Palette.textLight,
      marginBottom: 4,
      fontWeight: '400',
    },
    userName: {
      fontSize: 26,
      fontWeight: '700',
      color: Palette.textLight,
      letterSpacing: 0.5,
    },
    statsCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 28,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 5,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: Palette.border,
      marginHorizontal: 15,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 6,
      color: colors.primary,
    },
    statLabel: {
      fontSize: 13,
      textAlign: 'center',
      color: Palette.textMuted,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      color: Palette.textLight,
      letterSpacing: 0.5,
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    featureItemContainer: {
      width: '48%',
      marginBottom: 16,
      shadowColor: '#333',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.50,
      shadowRadius: 8,
      elevation: 4,
    },
    featureItem: {
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 16,
      alignItems: 'center',
      backgroundColor: colors.surface,
      shadowColor: '#333',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.50,
      shadowRadius: 8,
      elevation: 4,
    },
    featureIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    featureItemTitle: {
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.text,
      letterSpacing: 0.3,
    },
    activityCard: {
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 8,
      marginBottom: 55,
      backgroundColor: colors.surface,
      minHeight: 120,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Palette.border + '30',
    },
    activityIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      fontSize: 15,
      color: colors.onSurface,
      fontWeight: '600',
      marginBottom: 4,
    },
    activitySubInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    activityScore: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '500',
    },
    activityTime: {
      fontSize: 12,
      color: Palette.textMuted,
      fontWeight: '400',
    },
    loadingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 24,
    },
    loadingText: {
      fontSize: 14,
      color: Palette.textMuted,
      fontWeight: '500',
    },
    emptyActivityContainer: {
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    emptyActivityTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.onSurface,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyActivityText: {
      fontSize: 14,
      color: Palette.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    emptyActivityButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 20,
    },
    emptyActivityButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default HomeScreen;