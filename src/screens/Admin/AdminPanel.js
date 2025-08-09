import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';
import AdminOnly from '../../components/AdminOnly';

import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import AdminHeader from '../../components/AdminPanel/AdminHeader';
import AdminStats from '../../components/AdminPanel/AdminStats';
import AdminManagementSections from '../../components/AdminPanel/AdminManagementSections';
import AdminQuickActions from '../../components/AdminPanel/AdminQuickActions';

const Tab = createMaterialBottomTabNavigator();

const AdminDashboard = ({ navigation }) => {
  const styles = makeStyles(AdminPalette);

  // State for Firebase data
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeUsers: 0,
    totalTextbooks: 0,
    totalTests: 0,
    testsTaken: 0,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch data from Firebase in parallel
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all main collections in parallel
        const [
          usersSnapshot,
          textbooksSnapshot,
          testsSnapshot,
          testResultsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'textbook')),
          getDocs(collection(db, 'tests')),
          getDocs(collection(db, 'testResults')),
        ]);

        // Fetch active user count separately
        const activeUsersQuery = query(
          collection(db, 'users'),
          where('isActive', '==', true)
        );
        const activeUsersSnapshot = await getDocs(activeUsersQuery);

        setDashboardData({
          activeUsers: activeUsersSnapshot.size,
          totalUsers: usersSnapshot.size,
          totalTextbooks: textbooksSnapshot.size,
          totalTests: testsSnapshot.size,
          testsTaken: testResultsSnapshot.size,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time listeners for updates
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), snapshot => {
      setDashboardData(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    const unsubscribeTextbooks = onSnapshot(
      collection(db, 'textbooks'),
      snapshot => {
        setDashboardData(prev => ({ ...prev, totalTextbooks: snapshot.size }));
      }
    );

    const unsubscribeTests = onSnapshot(collection(db, 'tests'), snapshot => {
      setDashboardData(prev => ({ ...prev, totalTests: snapshot.size }));
    });

    const unsubscribeTestResults = onSnapshot(
      collection(db, 'testResults'),
      snapshot => {
        setDashboardData(prev => ({ ...prev, testsTaken: snapshot.size }));
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeTextbooks();
      unsubscribeTests();
      unsubscribeTestResults();
    };
  }, []);

  // Fade-in animation once data is loaded
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim, loading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const features = [
    {
      title: 'Content',
      icon: 'bookshelf',
      items: [
        {
          label: 'Textbooks',
          icon: 'book-open-variant',
          action: () => navigation.navigate('TextbookManagement'),
          color: AdminPalette.primary,
          count: (dashboardData.totalTextbooks || 0).toString(),
          description: 'Manage course materials',
        },
        {
          label: 'Tests',
          icon: 'clipboard-text',
          action: () => navigation.navigate('TestManagement'),
          color: AdminPalette.accent,
          count: (dashboardData.totalTests || 0).toString(),
          description: 'Create and edit assessments',
        },
      ],
    },
    {
      title: 'Administration',
      icon: 'cog',
      items: [
        {
          label: 'Users',
          icon: 'account-group',
          action: () => navigation.navigate('UserManagement'),
          color: AdminPalette.warning,
          count: (dashboardData.totalUsers || 0).toString(),
          description: 'Manage user accounts',
        },
        {
          label: 'Analytics',
          icon: 'chart-line',
          action: () => navigation.navigate('Analytics'),
          color: AdminPalette.success,
          count: (dashboardData.testsTaken || 0).toString(),
          description: 'View platform insights',
        },
      ],
    },
  ];

  const stats = [
    {
      value: (dashboardData.activeUsers || 0).toLocaleString(),
      label: 'Active Users',
      icon: 'account-check',
      color: AdminPalette.success,
    },
    {
      value: (dashboardData.totalTextbooks || 0).toLocaleString(),
      label: 'Textbooks',
      icon: 'book-multiple',
      color: AdminPalette.primary,
    },
    {
      value: (dashboardData.testsTaken || 0).toLocaleString(),
      label: 'Tests Taken',
      icon: 'clipboard-check',
      color: AdminPalette.accent,
    },
  ];

  if (loading) {
    return (
      <View style={[styles.screenWrapper, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={AdminPalette.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const lastLogin = `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  return (
    <View style={styles.screenWrapper}>
      <AdminHeader
        onLogout={handleLogout}
        palette={AdminPalette}
        styles={styles}
        userName="Administrator"
        lastLogin={lastLogin}
      />
      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <AdminStats stats={stats} styles={styles} />
        <AdminManagementSections
          features={features}
          fadeAnim={fadeAnim}
          styles={styles}
        />
        <AdminQuickActions
          navigation={navigation}
          fadeAnim={fadeAnim}
          styles={styles}
          palette={AdminPalette}
        />
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
};

const AdminTabs = () => {
  const styles = makeStyles(AdminPalette);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      activeColor={AdminPalette.primaryLight}
      inactiveColor={AdminPalette.textMuted}
      barStyle={styles.tabBar}
      shifting={false}
      labeled
      sceneAnimationEnabled={false}
      screenOptions={{
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              name="view-dashboard"
              color={focused ? AdminPalette.primaryLight : AdminPalette.textMuted}
              size={24}
            />
          ),
          tabBarLabel: 'Dashboard',
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: styles.tabIcon,
        }}
      />
      {/* <Tab.Screen
        name="TextbookManagement"
        component={TextbookManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              name="book-open-variant"
              color={focused ? AdminPalette.primaryLight : AdminPalette.textMuted}
              size={24}
            />
          ),
          tabBarLabel: 'Textbooks',
          tabBarLabelStyle: styles.tabLabel,
        }}
      /> */}
      {/* <Tab.Screen
        name="TestManagement"
        component={TestManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              name="clipboard-text"
              color={focused ? AdminPalette.primaryLight : AdminPalette.textMuted}
              size={24}
            />
          ),
          tabBarLabel: 'Tests',
          tabBarLabelStyle: styles.tabLabel,
        }}
      />
      <Tab.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Icon
              name="account-group"
              color={focused ? AdminPalette.primaryLight : AdminPalette.textMuted}
              size={24}
            />
          ),
          tabBarLabel: 'Users',
          tabBarLabelStyle: styles.tabLabel,
        }}
      /> */}
    </Tab.Navigator>
  );
};

const AdminPanel = () => {
  return (
    <AdminOnly>
      <AdminTabs />
    </AdminOnly>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: 16,
    },
    headerContainer: {
      paddingTop:
        Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerGreeting: {
      color: `${AdminPalette.textMuted}90`,
      fontSize: 14,
      fontWeight: '500',
    },
    headerTitle: {
      color: AdminPalette.text,
      fontSize: 28,
      fontWeight: '700',
      marginTop: 2,
    },
    headerSubtitle: {
      color: `${colors.textMuted}70`,
      fontSize: 13,
      marginTop: 4,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${colors.textMuted}10`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 24,
    },
    statsSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 16,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    statCard: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    // Changed from cardsGrid to cardsRow for side-by-side layout
    cardsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    managementCard: {
      flex: 1, // Ensures equal width for side-by-side cards
      borderRadius: 16,
    },
    cardSurface: {
      padding: 24,
      borderRadius: 16,
      backgroundColor: colors.surface,
      height: 190, // Fixed height for consistent card sizes
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    cardIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBadge: {
      fontSize: 12,
      paddingHorizontal: 8,
      height: 24,
      lineHeight: 24,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    quickActionsContainer: {
      borderRadius: 16,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    quickActionItem: {
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    quickActionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    quickActionText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: colors.textMuted,
    },
    divider: {
      backgroundColor: colors.divider,
      marginHorizontal: 20,
    },
    bottomSpacer: {
      height: 80,
    },
    tabBar: {
      backgroundColor: AdminPalette.bg,
      height: 64,
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    adminBadge: {
      fontSize: 12,
      paddingHorizontal: 8,
      height: 24,
      marginLeft: 8,
      alignSelf: 'center',
    },
    // Overriding top-level headerIconButton for AdminHeader
    // (e.g. logout button in the top-right corner)
    headerIconButtonGlobal: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerIconButtonGlobal: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabLabel: {
      fontSize: 12,
      marginBottom: 4,
      fontWeight: '500',
    },
    tabIcon: {
      marginTop: 8,
    },
    tabItem: {
      height: 64,
      justifyContent: 'center',
      // Note: Adding pseudo-selectors like ":hover" does not apply in React Native
    },
  });

export default AdminPanel;

