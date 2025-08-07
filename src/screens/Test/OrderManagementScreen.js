import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Animated } from 'react-native';
import { Text, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette } from '../../theme/colors';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';

// Components
import OrderFilters from '../../components/OrderManagement/OrderFilters';
import OrderCard from '../../components/OrderManagement/OrderCard';
import OrderEmptyState from '../../components/OrderManagement/OrderEmptyState';
import OrderListHeader from '../../components/OrderManagement/OrderListHeader';

// Hooks
import { useOrderFilters } from '../../hooks/useOrderFilters';
import { useOrderData } from '../../hooks/useOrderData';

const OrderManagementScreen = () => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const navigation = useNavigation();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserCafeId, setCurrentUserCafeId] = useState(null);
  const headerScale = useRef(new Animated.Value(1)).current;

  // Custom hooks for filters and data management
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    timeFilter,
    setTimeFilter,
    filteredOrders,
    resetFilters
  } = useOrderFilters(orders);

  // Get current user's cafeId
  useEffect(() => {
    const fetchUserCafeId = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUserCafeId(userDoc.data().cafeId);
          }
        }
      } catch (error) {
        console.error("Error fetching user cafeId:", error);
      }
    };

    fetchUserCafeId();
  }, []);

  // Fetch orders from Firestore
  useEffect(() => {
    if (!currentUserCafeId) return;

    setLoading(true);
    
    let q = query(
      collection(db, 'orders'),
      where('cafeId', '==', currentUserCafeId),
      orderBy('orderFlow.orderedAt', 'desc')
    );

    // Apply time filter
    if (timeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      q = query(q, where('orderFlow.orderedAt', '>=', today));
    } else if (timeFilter === 'this_week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      q = query(q, where('orderFlow.orderedAt', '>=', weekAgo));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        ordersData.push({
          id: doc.id,
          ...orderData,
          orderFlow: {
            ...orderData.orderFlow,
            orderedAt: orderData.orderFlow.orderedAt?.toDate(),
            formattedTime: format(orderData.orderFlow.orderedAt?.toDate(), 'hh:mm a'),
            formattedDate: format(orderData.orderFlow.orderedAt?.toDate(), 'MMM dd, yyyy')
          }
        });
      });
      setOrders(ordersData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [timeFilter, currentUserCafeId]);

  const handleRefresh = () => {
    Haptics.selectionAsync();
    setRefreshing(true);
    // The snapshot listener will automatically update
  };

  const handleOrderPress = (order) => {
    Haptics.selectionAsync();
    navigation.navigate('OrderDetail', { orderId: order.id });
  };

  const handleStatusChange = (orderId, newStatus) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In a real app, you would update the order status in Firestore here
    console.log(`Updating order ${orderId} to status ${newStatus}`);
  };

  const handleButtonPressIn = () => {
    Animated.spring(headerScale, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(headerScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const renderOrderItem = ({ item }) => (
    <OrderCard
      order={item}
      onPress={() => handleOrderPress(item)}
      onStatusChange={(newStatus) => handleStatusChange(item.id, newStatus)}
    />
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <View style={styles.headerActions}>
          <Animated.View style={{ transform: [{ scale: headerScale }] }}>
            <IconButton 
              icon={() => <MaterialCommunityIcons name="filter-variant" size={24} color={Palette.primary} />}
              size={32}
              onPress={() => {
                Haptics.selectionAsync();
                console.log('Advanced filters');
              }}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              style={styles.headerButton}
            />
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: headerScale }] }}>
            <IconButton 
              icon={() => <MaterialCommunityIcons name="cog-outline" size={24} color={Palette.textSecondary} />}
              size={32}
              onPress={() => {
                Haptics.selectionAsync();
                console.log('Settings');
              }}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              style={styles.headerButton}
            />
          </Animated.View>
        </View>
      </Animated.View>

      {/* Search and Filter Section */}
      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        orders={orders}
      />

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Palette.primary]}
            tintColor={Palette.primary}
          />
        }
        ListEmptyComponent={
          <OrderEmptyState
            searchQuery={searchQuery}
            onResetFilters={resetFilters}
          />
        }
        ListHeaderComponent={
          filteredOrders.length > 0 && (
            <OrderListHeader orderCount={filteredOrders.length} />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 8,
    backgroundColor: Palette.surface, 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    marginTop: 16,
    color: Palette.text,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
});

export default OrderManagementScreen;