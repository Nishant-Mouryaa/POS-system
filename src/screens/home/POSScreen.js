import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Animated, 
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Palette } from '../../theme/colors';
// Your local components:
import Sidebar from '../../navigation/Sidebar';
import POSMenuButton from '../../components/pos/POSMenuButton';
import POSUserHeader from '../../components/pos/POSUserHeader';
import POSStatsCard from '../../components/pos/POSStatsCard';
import POSQuickActions from '../../components/pos/POSQuickActions';
import RecentOrders from '../../components/pos/RecentOrders';
import ManagerTools from '../../components/pos/ManagerTools';

const { width } = Dimensions.get('window');

const POSScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const auth = getAuth();

  // State management
  const [isManager, setIsManager] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [shiftData, setShiftData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Safe state setter helper
  const safeSetState = useCallback((setter) => {
    if (isMountedRef.current) {
      setter();
    }
  }, []);

  // Animations
  const fadeAnim        = useRef(new Animated.Value(0)).current;
  const scaleAnim       = useRef(new Animated.Value(0.9)).current;
  const slideUpAnim     = useRef(new Animated.Value(30)).current;
  const headerSlideAnim = useRef(new Animated.Value(-100)).current;
  const ordersSlideAnim = useRef(new Animated.Value(width)).current;
  const statsCardScale  = useRef(new Animated.Value(0.8)).current;
  const featureAnimations = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  const pulseAnim       = useRef(new Animated.Value(1)).current;
  const menuButtonScale = useRef(new Animated.Value(1)).current;

  // Fetch stats with better error handling and validation
  const fetchStats = useCallback(async (cafeId) => {
    if (!cafeId || typeof cafeId !== 'string') {
      throw new Error('Invalid cafe ID provided for stats fetch');
    }

    console.log('Fetching stats for cafe:', cafeId);

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('cafeId', '==', cafeId),
        where('orderFlow.orderedAt', '>=', todayStart),
        where('status', '!=', 'cancelled')
      );
      
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} orders for stats`);

      let stats = {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        completedOrders: 0,
        preparingOrders: 0,
      };

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const total = data.pricing?.total || 0;
        
        stats.totalSales += total;
        stats.totalOrders++;
        
        if (data.status === 'completed') {
          stats.completedOrders++;
        } else if (data.status === 'preparing') {
          stats.preparingOrders++;
        }
      });

      if (stats.totalOrders > 0) {
        stats.averageOrderValue = stats.totalSales / stats.totalOrders;
      }

      console.log('Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error in fetchStats:', error);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  }, []);

  // Fetch recent orders with improved validation
  const fetchRecentOrders = useCallback(async (cafeId) => {
    if (!cafeId || typeof cafeId !== 'string') {
      throw new Error('Invalid cafe ID provided for recent orders');
    }

    console.log('Fetching recent orders for cafe:', cafeId);

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('cafeId', '==', cafeId),
        orderBy('orderFlow.orderedAt', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} recent orders`);

      const orders = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          // Convert Firestore Timestamp -> JS Date safely
          orderFlow: {
            ...data.orderFlow,
            orderedAt: data.orderFlow?.orderedAt?.toDate() || new Date(),
          },
        };
      });

      return orders;
    } catch (error) {
      console.error('Error in fetchRecentOrders:', error);
      throw new Error(`Failed to fetch recent orders: ${error.message}`);
    }
  }, []);

  // Fetch shift data if shiftId is provided
  const fetchShiftData = useCallback(async (shiftId) => {
    if (!shiftId) return null;

    try {
      console.log('Fetching shift data for:', shiftId);
      const shiftRef = doc(db, 'shifts', shiftId);
      const shiftSnap = await getDoc(shiftRef);
      
      if (shiftSnap.exists()) {
        console.log('Shift data found');
        return shiftSnap.data();
      } else {
        console.log('No shift data found for ID:', shiftId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching shift data:', error);
      // Don't throw here, just return null as shift data is optional
      return null;
    }
  }, []);

  // Main data fetching function with proper error handling and state management
  const fetchAllData = useCallback(async () => {
    // Prevent multiple concurrent fetches
    if (isInitializing) {
      console.log('Already initializing, skipping fetch');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user, redirecting to Auth');
      navigation.navigate('Auth');
      return;
    }

    console.log('Starting data fetch for user:', user.uid);

    safeSetState(() => {
      setIsInitializing(true);
      setStatsLoading(true);
      setLoadingOrders(true);
    });

    try {
      // 1) Fetch user document
      console.log('Fetching user document...');
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("User document not found");
      }

      const uData = userSnap.data();
      console.log('User data retrieved:', { 
        cafeId: uData.cafeId, 
        role: uData.employment?.role 
      });
      
      // Validate cafeId early
      if (!uData.cafeId || typeof uData.cafeId !== 'string') {
        throw new Error("User is not associated with a valid café ID");
      }

      // Update user data immediately
      safeSetState(() => {
        setUserData(uData);
        setIsManager(uData.employment?.role === 'manager');
      });

      // 2) Fetch all data in parallel for better performance
      console.log('Fetching stats, orders, and shift data in parallel...');
      const [statsData, ordersData, shiftDataResult] = await Promise.allSettled([
        fetchStats(uData.cafeId),
        fetchRecentOrders(uData.cafeId),
        fetchShiftData(route.params?.shiftId)
      ]);

      // Handle stats data
      if (statsData.status === 'fulfilled') {
        console.log('Stats data fetched successfully');
        safeSetState(() => {
          setShiftData(prev => ({ ...prev, ...statsData.value }));
        });
      } else {
        console.error('Stats fetch failed:', statsData.reason);
        // Don't throw here, just log the error and continue
      }

      // Handle orders data
      if (ordersData.status === 'fulfilled') {
        console.log('Orders data fetched successfully');
        safeSetState(() => {
          setRecentOrders(ordersData.value);
        });
      } else {
        console.error('Orders fetch failed:', ordersData.reason);
        // Don't throw here, just log the error and continue
      }

      // Handle shift data
      if (shiftDataResult.status === 'fulfilled' && shiftDataResult.value) {
        console.log('Shift data fetched successfully');
        safeSetState(() => {
          setShiftData(prev => ({ ...prev, ...shiftDataResult.value }));
        });
      } else if (shiftDataResult.status === 'rejected') {
        console.error('Shift fetch failed:', shiftDataResult.reason);
      }

      console.log('Data fetch completed successfully');

    } catch (error) {
      console.error("Critical error in fetchAllData:", error);
      
      // Show user-friendly error messages
      const errorMessage = error.message || "Failed to load data. Please try again.";
      Alert.alert("Error", errorMessage);
      
      // If it's a critical error (like invalid cafe ID), don't retry
      if (error.message?.includes("café ID")) {
        return;
      }
    } finally {
      // Always reset loading states
      safeSetState(() => {
        setStatsLoading(false);
        setLoadingOrders(false);
        setIsInitializing(false);
      });
    }
  }, [
    isInitializing,
    auth.currentUser,
    navigation, 
    route.params?.shiftId, 
    fetchStats, 
    fetchRecentOrders,
    fetchShiftData,
    safeSetState
  ]);

  // Effect to fetch data when component mounts or shiftId changes
  useEffect(() => {
    console.log('Effect triggered - fetching data...');
    fetchAllData();
  }, [route.params?.shiftId]); // Only depend on shiftId changes

  // Add a retry mechanism for failed data loads
  const handleRetry = useCallback(() => {
    console.log('Retrying data fetch...');
    fetchAllData();
  }, [fetchAllData]);

  // Start animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlideAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(ordersSlideAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(statsCardScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger the "featureAnimations"
    Animated.stagger(
      100, 
      featureAnimations.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        })
      )
    ).start();

    // Pulse anim loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Format "time ago" helper
  const formatTimeAgo = useCallback((date) => {
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
  }, []);

  // Status color
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed':
        return Palette.success;
      case 'preparing':
        return Palette.warning;
      case 'served':
        return '#4ECDC4';
      case 'cancelled':
        return Palette.error;
      default:
        return Palette.primary;
    }
  }, []);

  // Status icon
  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'preparing':
        return 'clock';
      case 'served':
        return 'truck-delivery';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'receipt';
    }
  }, []);

  // Quick actions
  const quickActions = React.useMemo(() => [
    {
      icon: 'point-of-sale',
      title: 'New Order',
      onPress: () => navigation.navigate('NewOrder'),
    },
    {
      icon: 'table-chair',
      title: 'Tables',
      onPress: () => navigation.navigate('Tables'),
    },
    {
      icon: 'food',
      title: 'Menu',
      onPress: () => navigation.navigate('Menu'),
    },
    {
      icon: 'account-group',
      title: 'Customers',
      onPress: () => navigation.navigate('Customers'),
    },
  ], [navigation]);

  // Tap on a recent order
  const handleOrderPress = useCallback((order) => {
    Haptics.selectionAsync();
    navigation.navigate('OrderDetail', { orderId: order.id });
  }, [navigation]);

  // Manager tools
  const handleDashboardPress = useCallback((tab) => {
    navigation.navigate('Manager', { screen: tab || 'Dashboard' });
  }, [navigation]);

  return (
    <View style={styles.screenContainer}>
      {/* Sidebar */}
      <Sidebar 
        isVisible={isSidebarVisible} 
        onClose={() => setIsSidebarVisible(false)}
        isManager={isManager}
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
          {/* Menu Button to open sidebar */}
          <POSMenuButton
            onPress={() => setIsSidebarVisible(true)}
            menuButtonScale={menuButtonScale}
            colors={colors}
            styles={styles}
          />

          {/* Header / User info */}
          <Animated.View 
            style={[
              styles.headerContainer,
              { transform: [{ translateX: headerSlideAnim }] },
            ]}
          >
            <POSUserHeader
              userData={userData}
              pulseAnim={pulseAnim}
              colors={colors}
              styles={styles}
            />
          </Animated.View>

          {/* Stats Card with retry capability */}
          <POSStatsCard
            shiftData={shiftData}
            statsCardScale={statsCardScale}
            colors={colors}
            styles={styles}
            isLoading={statsLoading}
            onRetry={handleRetry}
          />

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <POSQuickActions
            actions={quickActions}
            featureAnimations={featureAnimations}
            pulseAnim={pulseAnim}
            styles={styles}
          />

          {/* Recent Orders */}
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Animated.View 
            style={[
              styles.ordersCard, 
              { transform: [{ translateX: ordersSlideAnim }] },
            ]}
          >
            <RecentOrders
              recentOrders={recentOrders}
              loadingOrders={loadingOrders}
              styles={styles}
              colors={colors}
              onOrderPress={handleOrderPress}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              formatTimeAgo={formatTimeAgo}
              onRetry={handleRetry}
            />
          </Animated.View>

          {/* Manager Tools */}
          <ManagerTools
            isManager={isManager}
            onDashboardPress={handleDashboardPress}
            featureAnimations={featureAnimations}
            pulseAnim={pulseAnim}
            styles={styles}
          />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      position: 'relative',
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
      backgroundColor: Palette.background,
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
      borderWidth: 1,
      borderColor: Palette.glassBorder, 
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
      shadowColor: Palette.shadowColored, 
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
      color: Palette.textSecondary,
      marginBottom: 4,
      fontWeight: '400',
    },
    userName: {
      fontSize: 26,
      fontWeight: '700',
      color: Palette.text, 
      letterSpacing: 0.5,
    },
        
    statsCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 28,
      backgroundColor: Palette.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: Palette.borderLight,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
      minWidth: 80,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: Palette.divider, 
      marginHorizontal: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 6,
      color: colors.primary,
      maxWidth: '100%',
    },
    statLabel: {
      fontSize: 12,
      textAlign: 'center',
      color: Palette.textMuted,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
      color: Palette.text,
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
      shadowColor: Palette.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    featureItem: {
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 16,
      alignItems: 'center',
      backgroundColor: Palette.surfaceContainer,
      borderWidth: 1,
      borderColor: Palette.borderLight,
      overflow: 'hidden',
    },
    featureIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      backgroundColor: colors.primary,
      shadowColor: Palette.shadowColored,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    featureItemTitle: {
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      color: Palette.text,
      letterSpacing: 0.3,
    },
    ordersCard: {
      borderRadius: 20,
      padding: 16,
      marginBottom: 28,
      backgroundColor: Palette.surfaceContainer,
      borderWidth: 1,
      borderColor: Palette.borderLight,
      shadowColor: Palette.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Palette.divider + '80',
    },
    activityIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: Palette.surfaceVariant,
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      fontSize: 15,
      color: Palette.text,
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
      color: Palette.text,
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
      shadowColor: Palette.shadowColored,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    }, 
    emptyActivityButtonText: {
      color: Palette.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default POSScreen;