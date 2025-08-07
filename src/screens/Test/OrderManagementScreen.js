// OrderManagementScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { Palette } from '../../theme/colors';
import { collection, query, where, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

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
    setRefreshing(true);
    // The snapshot listener will automatically update
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetail', { orderId: order.id });
  };

  const handleStatusChange = (orderId, newStatus) => {
    // In a real app, you would update the order status in Firestore here
    console.log(`Updating order ${orderId} to status ${newStatus}`);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <View style={styles.headerActions}>
          <IconButton 
            icon="filter-variant" 
            size={24} 
            iconColor={Palette.primary}
            onPress={() => console.log('Advanced filters')}
          />
          <IconButton 
            icon="cog-outline" 
            size={24} 
            iconColor={Palette.textSecondary}
            onPress={() => console.log('Settings')}
          />
        </View>
      </View>

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
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
  },
  headerActions: {
    flexDirection: 'row',
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
});

export default OrderManagementScreen;