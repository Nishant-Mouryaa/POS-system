import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  Portal,
  Modal,
  useTheme,
  ActivityIndicator,
  Avatar,
  Divider,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const auth = getAuth();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todaysSales: 0,
    activeShifts: 0,
    totalStaff: 0,
    pendingOrders: 0,
    recentActivity: [],
    lowStockItems: 0,
    monthlyRevenue: 0,
  });
  const [realtimeData, setRealtimeData] = useState({
    activeOrders: 0,
    onlineStaff: 0,
  });
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Setup real-time listeners
    const unsubscribeOrders = setupOrdersListener();
    const unsubscribeShifts = setupShiftsListener();

    return () => {
      unsubscribeOrders && unsubscribeOrders();
      unsubscribeShifts && unsubscribeShifts();
    };
  }, []);

const loadDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Get current user's data from STAFF collection (not users)
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user');
      navigation.navigate('Auth');
      return;
    }

    console.log('Fetching admin data from staff collection for:', user.uid);
    
    // Look in staff collection for admin
    const adminRef = doc(db, 'staff', user.uid);
    const adminSnap = await getDoc(adminRef);
    
    if (!adminSnap.exists()) {
      throw new Error("Admin document not found in staff collection");
    }

    const adminData = adminSnap.data();
    console.log('Admin data:', adminData);
    
    const cafeId = adminData.cafeId;
    console.log('Found cafeId:', cafeId);

    if (!cafeId) {
      throw new Error("Admin is not associated with a cafe");
    }

    // Verify user is admin
    if (adminData.role !== 'admin') {
      throw new Error("User does not have admin permissions");
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Fetch all data with cafeId
    const [
      todaysSales,
      activeShifts, 
      totalStaff,
      pendingOrders,
      recentActivity,
      lowStockItems,
      monthlyRevenue
    ] = await Promise.all([
      getTodaysSales(startOfDay, endOfDay, cafeId),
      getActiveShifts(cafeId),
      getTotalStaff(cafeId), 
      getPendingOrders(cafeId),
      getRecentActivity(cafeId),
      getLowStockCount(cafeId),
      getMonthlyRevenue(cafeId)
    ]);

    setDashboardData({
      todaysSales,
      activeShifts,
      totalStaff,
      pendingOrders,
      recentActivity,
      lowStockItems,
      monthlyRevenue,
    });
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

// Update getTotalStaff to count from users collection (employees)
const getTotalStaff = async (cafeId) => {
  try {
    const staffQuery = query(
      collection(db, 'users'), // Employees are in users collection
      where('cafeId', '==', cafeId),
      where('employment.isActive', '==', true)
    );
    const snapshot = await getDocs(staffQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting total staff:', error);
    return 0;
  }
};

// Update real-time listeners setup
useEffect(() => {
  const setupListeners = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Get admin data to find cafeId
      const adminRef = doc(db, 'staff', user.uid);
      const adminSnap = await getDoc(adminRef);
      
      if (adminSnap.exists()) {
        const cafeId = adminSnap.data().cafeId;
        if (cafeId) {
          const unsubscribeOrders = setupOrdersListener(cafeId);
          const unsubscribeShifts = setupShiftsListener(cafeId);
          
          return () => {
            unsubscribeOrders && unsubscribeOrders();
            unsubscribeShifts && unsubscribeShifts();
          };
        }
      }
    } catch (error) {
      console.error('Error setting up listeners:', error);
    }
  };

  setupListeners();
}, []);

// Update all your data fetching functions to include cafeId
const getTodaysSales = async (startOfDay, endOfDay, cafeId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('cafeId', '==', cafeId), 
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<', endOfDay),
      where('status', '==', 'completed')
    );
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.reduce((total, doc) => total + (doc.data().total || 0), 0);
  } catch (error) {
    console.error('Error getting today sales:', error);
    return 0;
  }
};

const getActiveShifts = async (cafeId) => {
  try {
    const shiftsQuery = query(
      collection(db, 'shifts'),
      where('cafeId', '==', cafeId), // Add this filter
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(shiftsQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting active shifts:', error);
    return 0;
  }
};



const getPendingOrders = async (cafeId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('cafeId', '==', cafeId), // Add this filter
      where('status', 'in', ['pending', 'preparing'])
    );
    const snapshot = await getDocs(ordersQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting pending orders:', error);
    return 0;
  }
};

// Update real-time listeners too
const setupOrdersListener = (cafeId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('cafeId', '==', cafeId), // Add this filter
      where('status', 'in', ['pending', 'preparing'])
    );
    
    return onSnapshot(ordersQuery, (snapshot) => {
      setRealtimeData(prev => ({
        ...prev,
        activeOrders: snapshot.size
      }));
    });
  } catch (error) {
    console.error('Error setting up orders listener:', error);
    return null;
  }
};

  const getRecentActivity = async () => {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(activitiesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  };

  const getLowStockCount = async () => {
    try {
      const inventoryQuery = query(
        collection(db, 'inventory'),
        where('quantity', '<=', 10)
      );
      const snapshot = await getDocs(inventoryQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting low stock count:', error);
      return 0;
    }
  };

  const getMonthlyRevenue = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', startOfMonth),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(ordersQuery);
      return snapshot.docs.reduce((total, doc) => total + (doc.data().total || 0), 0);
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return 0;
    }
  };
  const setupShiftsListener = () => {
    try {
      const shiftsQuery = query(
        collection(db, 'shifts'),
        where('status', '==', 'active')
      );
      
      return onSnapshot(shiftsQuery, (snapshot) => {
        setRealtimeData(prev => ({
          ...prev,
          onlineStaff: snapshot.size
        }));
      });
    } catch (error) {
      console.error('Error setting up shifts listener:', error);
      return null;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const navigateToSection = (section) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (section) {
      case 'staff':
        navigation.navigate('StaffManagement');
        break;
      case 'inventory':
        navigation.navigate('InventoryManagement');
        break;
      case 'reports':
        navigation.navigate('Reports');
        break;
      case 'settings':
        navigation.navigate('AdminSettings');
        break;
      case 'orders':
        navigation.navigate('OrderManagement');
        break;
      case 'menu':
        navigation.navigate('MenuManagement');
        break;
      default:
        console.log('Navigate to:', section);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, onPress }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View style={[styles.statCard, { transform: [{ scale: scaleValue }] }]}>
          <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.statHeader}>
                <MaterialCommunityIcons name={icon} size={32} color={color} />
                {trend && (
                  <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#E8F5E8' : '#FFF2F2' }]}>
                    <MaterialCommunityIcons 
                      name={trend > 0 ? 'trending-up' : 'trending-down'} 
                      size={12} 
                      color={trend > 0 ? '#4CAF50' : '#F44336'} 
                    />
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statTitle}>{title}</Text>
            </Card.Content>
          </Card>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.title}>Admin Dashboard</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              size={24}
              iconColor={Palette.primary}
              onPress={handleRefresh}
            />
            <IconButton
              icon="logout"
              size={24}
              iconColor={Palette.error}
              onPress={handleLogout}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Palette.primary]}
            tintColor={Palette.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Real-time Stats */}
          <View style={styles.realtimeContainer}>
            <Text style={styles.sectionTitle}>Live Stats</Text>
            <View style={styles.realtimeStats}>
              <View style={styles.realtimeStat}>
                <Text style={styles.realtimeValue}>{realtimeData.activeOrders}</Text>
                <Text style={styles.realtimeLabel}>Active Orders</Text>
              </View>
              <View style={styles.realtimeStat}>
                <Text style={styles.realtimeValue}>{realtimeData.onlineStaff}</Text>
                <Text style={styles.realtimeLabel}>Online Staff</Text>
              </View>
            </View>
          </View>

          {/* Key Metrics */}
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Sales Today"
              value={`₹${dashboardData.todaysSales.toFixed(2)}`}
              icon="currency-rupee"
              color={Palette.success}
              onPress={() => navigateToSection('reports')}
            />
            <StatCard
              title="Active Shifts"
              value={dashboardData.activeShifts}
              icon="account-clock"
              color={Palette.primary}
              onPress={() => navigateToSection('staff')}
            />
            <StatCard
              title="Pending Orders"
              value={dashboardData.pendingOrders}
              icon="clipboard-list"
              color={Palette.warning}
              onPress={() => navigateToSection('orders')}
            />
            <StatCard
              title="Low Stock Items"
              value={dashboardData.lowStockItems}
              icon="alert-circle"
              color={Palette.error}
              onPress={() => navigateToSection('inventory')}
            />
          </View>

          {/* Monthly Stats */}
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.monthlyContainer}>
            <Card style={styles.monthlyCard}>
              <Card.Content>
                <View style={styles.monthlyStats}>
                  <View style={styles.monthlyStat}>
                    <Text style={styles.monthlyValue}>₹{dashboardData.monthlyRevenue.toFixed(2)}</Text>
                    <Text style={styles.monthlyLabel}>Revenue</Text>
                  </View>
                  <View style={styles.monthlyStat}>
                    <Text style={styles.monthlyValue}>{dashboardData.totalStaff}</Text>
                    <Text style={styles.monthlyLabel}>Total Staff</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="account-plus"
              onPress={() => navigateToSection('staff')}
              style={styles.quickActionBtn}
              buttonColor={Palette.primary}
            >
              Manage Staff
            </Button>
            <Button
              mode="contained"
              icon="package-variant"
              onPress={() => navigateToSection('inventory')}
              style={styles.quickActionBtn}
              buttonColor={Palette.secondary}
            >
              Inventory
            </Button>
            <Button
              mode="contained"
              icon="chart-line"
              onPress={() => navigateToSection('reports')}
              style={styles.quickActionBtn}
              buttonColor={Palette.accent}
            >
              View Reports
            </Button>
            <Button
              mode="contained"
              icon="cog"
              onPress={() => navigateToSection('settings')}
              style={styles.quickActionBtn}
              buttonColor={Palette.surface}
              textColor={Palette.text}
            >
              Settings
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.textSecondary,
  },
  header: {
    backgroundColor: Palette.surface,
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: Palette.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  realtimeContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 16,
  },
  realtimeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  realtimeStat: {
    alignItems: 'center',
  },
  realtimeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Palette.primary,
    marginBottom: 4,
  },
  realtimeLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: cardWidth,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Palette.surface,
    elevation: 2,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trendBadge: {
    borderRadius: 12,
    padding: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  monthlyContainer: {
    marginBottom: 24,
  },
  monthlyCard: {
    backgroundColor: Palette.surface,
    elevation: 2,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  monthlyStat: {
    alignItems: 'center',
  },
  monthlyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.primary,
    marginBottom: 4,
  },
  monthlyLabel: {
    fontSize: 14,
    color: Palette.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionBtn: {
    width: cardWidth,
    marginBottom: 12,
  },
});

export default AdminDashboard;