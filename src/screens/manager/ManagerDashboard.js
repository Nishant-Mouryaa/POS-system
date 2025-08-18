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
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const ManagerDashboard = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todaysSales: 0,
    activeTables: 0,
    pendingOrders: 0,
    completedOrders: 0,
    popularItems: [],
    staffOnShift: [],
  });
  const [realtimeData, setRealtimeData] = useState({
    activeOrders: 0,
    tablesOccupied: 0,
  });

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
    const unsubscribeTables = setupTablesListener();

    return () => {
      unsubscribeOrders && unsubscribeOrders();
      unsubscribeTables && unsubscribeTables();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Parallel data fetching
      const [
        todaySalesData,
        activeTablesData,
        pendingOrdersData,
        completedOrdersData,
        popularItemsData,
        staffData,
      ] = await Promise.all([
        getTodaysSales(startOfDay),
        getActiveTables(),
        getPendingOrders(),
        getCompletedOrders(startOfDay),
        getPopularItems(),
        getStaffOnShift(),
      ]);

      setDashboardData({
        todaysSales: todaySalesData,
        activeTables: activeTablesData,
        pendingOrders: pendingOrdersData,
        completedOrders: completedOrdersData,
        popularItems: popularItemsData,
        staffOnShift: staffData,
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Data fetching functions
  const getTodaysSales = async (startOfDay) => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', startOfDay),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(ordersQuery);
      return snapshot.docs.reduce((total, doc) => total + (doc.data().total || 0), 0);
    } catch (error) {
      console.error('Error getting today sales:', error);
      return 0;
    }
  };

  const getActiveTables = async () => {
    try {
      const tablesQuery = query(
        collection(db, 'tables'),
        where('status', '==', 'occupied')
      );
      const snapshot = await getDocs(tablesQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting active tables:', error);
      return 0;
    }
  };

  const getPendingOrders = async () => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('status', 'in', ['pending', 'preparing'])
      );
      const snapshot = await getDocs(ordersQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting pending orders:', error);
      return 0;
    }
  };

  const getCompletedOrders = async (startOfDay) => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('createdAt', '>=', startOfDay),
        where('status', '==', 'completed')
      );
      const snapshot = await getCountFromServer(ordersQuery);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error getting completed orders:', error);
      return 0;
    }
  };

  const getPopularItems = async () => {
    try {
      // In a real app, you would query order items and aggregate
      return [
        { name: 'Chicken Biryani', orders: 24 },
        { name: 'Paneer Tikka', orders: 18 },
        { name: 'Butter Naan', orders: 15 },
      ];
    } catch (error) {
      console.error('Error getting popular items:', error);
      return [];
    }
  };

  const getStaffOnShift = async () => {
    try {
      const shiftsQuery = query(
        collection(db, 'shifts'),
        where('status', '==', 'active'),
        orderBy('startTime', 'desc')
      );
      const snapshot = await getDocs(shiftsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting staff on shift:', error);
      return [];
    }
  };

  // Real-time listeners
  const setupOrdersListener = () => {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
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

  const setupTablesListener = () => {
    try {
      const tablesQuery = query(
        collection(db, 'tables'),
        where('status', '==', 'occupied')
      );
      
      return onSnapshot(tablesQuery, (snapshot) => {
        setRealtimeData(prev => ({
          ...prev,
          tablesOccupied: snapshot.size
        }));
      });
    } catch (error) {
      console.error('Error setting up tables listener:', error);
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
      case 'orders':
        navigation.navigate('OrderManagement');
        break;
      case 'tables':
        navigation.navigate('TableManagement');
        break;
      case 'staff':
        navigation.navigate('StaffManagement');
        break;
      case 'menu':
        navigation.navigate('MenuManagement');
        break;
      case 'inventory':
        navigation.navigate('InventoryManagement');
        break;
      default:
        console.log('Navigate to:', section);
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }) => {
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
            <Text style={styles.greeting}>Good {getTimeOfDayGreeting()}</Text>
            <Text style={styles.title}>Manager Dashboard</Text>
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
                <Text style={styles.realtimeValue}>{realtimeData.tablesOccupied}</Text>
                <Text style={styles.realtimeLabel}>Tables Occupied</Text>
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
              title="Active Tables"
              value={dashboardData.activeTables}
              icon="table-chair"
              color={Palette.primary}
              onPress={() => navigateToSection('tables')}
            />
            <StatCard
              title="Pending Orders"
              value={dashboardData.pendingOrders}
              icon="clipboard-list"
              color={Palette.warning}
              onPress={() => navigateToSection('orders')}
            />
            <StatCard
              title="Completed Orders"
              value={dashboardData.completedOrders}
              icon="check-circle"
              color={Palette.accent}
              onPress={() => navigateToSection('orders')}
            />
          </View>

          {/* Sales Chart */}
          <Text style={styles.sectionTitle}>Today's Sales Trend</Text>
          <Card style={styles.chartCard}>
            <Card.Content>
              <BarChart
                data={{
                  labels: ['9AM', '12PM', '3PM', '6PM', '9PM'],
                  datasets: [{
                    data: [1500, 4500, 2200, 8000, 5000]
                  }]
                }}
                width={width - 48}
                height={200}
                yAxisLabel="₹"
                chartConfig={{
                  backgroundColor: Palette.surface,
                  backgroundGradientFrom: Palette.surface,
                  backgroundGradientTo: Palette.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            </Card.Content>
          </Card>

          {/* Popular Items */}
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <Card style={styles.listCard}>
            <Card.Content>
              {dashboardData.popularItems.map((item, index) => (
                <View key={index}>
                  <View style={styles.listItem}>
                    <Text style={styles.listItemName}>{item.name}</Text>
                    <Text style={styles.listItemValue}>{item.orders} orders</Text>
                  </View>
                  {index < dashboardData.popularItems.length - 1 && <Divider />}
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Staff On Shift */}
          <Text style={styles.sectionTitle}>Staff On Shift</Text>
          <Card style={styles.listCard}>
            <Card.Content>
              {dashboardData.staffOnShift.map((staff, index) => (
                <View key={index}>
                  <View style={styles.staffItem}>
                    <Avatar.Text 
                      size={40} 
                      label={staff.staffName.substring(0, 2).toUpperCase()}
                      backgroundColor={Palette.primary}
                      color="white"
                    />
                    <View style={styles.staffInfo}>
                      <Text style={styles.staffName}>{staff.staffName}</Text>
                      <Text style={styles.staffRole}>{staff.role}</Text>
                    </View>
                    <View style={styles.staffTime}>
                      <Text style={styles.timeLabel}>Started</Text>
                      <Text style={styles.timeValue}>
                        {staff.startTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  {index < dashboardData.staffOnShift.length - 1 && <Divider />}
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="clipboard-list"
              onPress={() => navigateToSection('orders')}
              style={styles.quickActionBtn}
              buttonColor={Palette.primary}
            >
              Manage Orders
            </Button>
            <Button
              mode="contained"
              icon="table-chair"
              onPress={() => navigateToSection('tables')}
              style={styles.quickActionBtn}
              buttonColor={Palette.secondary}
            >
              Table Status
            </Button>
            <Button
              mode="contained"
              icon="account-group"
              onPress={() => navigateToSection('staff')}
              style={styles.quickActionBtn}
              buttonColor={Palette.accent}
            >
              Staff Management
            </Button>
            <Button
              mode="contained"
              icon="food"
              onPress={() => navigateToSection('menu')}
              style={styles.quickActionBtn}
              buttonColor={Palette.warning}
            >
              Menu Items
            </Button>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Quick Order FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigateToSection('orders')}
        color="white"
        label="New Order"
      />
    </View>
  );
};

// Helper function to get time-based greeting
const getTimeOfDayGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
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
  chartCard: {
    backgroundColor: Palette.surface,
    marginBottom: 24,
    elevation: 2,
  },
  listCard: {
    backgroundColor: Palette.surface,
    marginBottom: 24,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listItemName: {
    fontSize: 14,
    color: Palette.text,
  },
  listItemValue: {
    fontSize: 14,
    color: Palette.textSecondary,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  staffInfo: {
    flex: 1,
    marginLeft: 12,
  },
  staffName: {
    fontSize: 14,
    color: Palette.text,
    fontWeight: '600',
  },
  staffRole: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  staffTime: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 10,
    color: Palette.textSecondary,
  },
  timeValue: {
    fontSize: 12,
    color: Palette.text,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionBtn: {
    width: cardWidth,
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Palette.primary,
  },
});

export default ManagerDashboard;