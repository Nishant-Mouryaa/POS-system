// OrderDetailScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated } from 'react-native';
import { Text, IconButton, Divider, Chip, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette } from '../../theme/colors';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { Alert } from 'react-native';
import { serverTimestamp } from 'firebase/firestore';

const OrderDetailScreen = () => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  const auth = getAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Fetch order details
  useEffect(() => {
    const orderRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        const orderData = doc.data();
       setOrder({
  id: doc.id,
  ...orderData,
  orderFlow: {
    status: orderData.orderFlow.status || 'pending', // Add default status
    ...orderData.orderFlow,
    orderedAt: orderData.orderFlow.orderedAt?.toDate(),
    formattedTime: format(orderData.orderFlow.orderedAt?.toDate(), 'hh:mm a'),
    formattedDate: format(orderData.orderFlow.orderedAt?.toDate(), 'MMM dd, yyyy')
  }
});
        setLoading(false);
      } else {
        console.log("No such order!");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  const isValidTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    pending: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };
  return validTransitions[currentStatus]?.includes(newStatus);
};

const updateOrderStatus = async (newStatus) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Authentication Required", "Please sign in to update orders");
      return;
    }

    // Validate status transition
    if (!isValidTransition(order.orderFlow.status, newStatus)) {
      Alert.alert("Invalid Status", `Cannot change from ${order.orderFlow.status} to ${newStatus}`);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Minimal update that should work with permissive rules
   await updateDoc(doc(db, "orders", orderId), {
"orderFlow.status": newStatus,
"orderFlow.updatedAt": serverTimestamp(),
});

  } catch (error) {
    console.error("Update Error:", error);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "Update Failed", 
      error.message || "Could not update order status"
    );
  }
};

const getStatusColor = (status) => {
  if (!status) return Palette.primary; // Handle undefined/null
  
  switch (status.toLowerCase()) { // Also make case-insensitive
    case 'pending': return Palette.warning;
    case 'preparing': return Palette.accent;
    case 'ready': return Palette.success;
    case 'completed': return Palette.secondary;
    case 'cancelled': return Palette.error;
    default: return Palette.primary;
  }
};

  const getStatusActions = () => {
    if (!order) return [];

    switch (order.orderFlow.status) {
      case 'pending':
        return [
          { 
            label: 'Start Preparing', 
            status: 'preparing', 
            icon: 'clock-start',
            color: Palette.accent
          }
        ];
      case 'preparing':
        return [
          { 
            label: 'Mark as Ready', 
            status: 'ready', 
            icon: 'check-circle',
            color: Palette.success
          }
        ];
      case 'ready':
        return [
          { 
            label: 'Complete Order', 
            status: 'completed', 
            icon: 'checkbox-marked-circle',
            color: Palette.secondary
          }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={48} 
          color={Palette.error} 
        />
        <Text style={styles.emptyText}>Order not found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          labelStyle={styles.buttonLabel}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton 
            icon={() => <MaterialCommunityIcons name="arrow-left" size={24} color={Palette.primary} />}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.goBack();
            }}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
            <Chip 
              mode="outlined"
              style={[styles.statusChip, { backgroundColor: `${getStatusColor(order.orderFlow.status)}20`, borderColor: getStatusColor(order.orderFlow.status) }]}
              textStyle={{ color: getStatusColor(order?.orderFlow?.status || '') }}
            >
              {order.orderFlow.status.charAt(0).toUpperCase() + order.orderFlow.status.slice(1)}
            </Chip>
          </View>

          <View style={styles.orderMeta}>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons 
                name={order.type === 'dine_in' ? 'table-chair' : order.type === 'takeaway' ? 'bag-suitcase' : 'motorbike'} 
                size={20} 
                color={Palette.textMuted} 
              />
              <Text style={styles.metaText}>
                {order.type === 'dine_in' ? 'Dine In' : order.type === 'takeaway' ? 'Takeaway' : 'Delivery'}
              </Text>
              {order.dining?.tableNumber && (
                <Text style={styles.tableText}>Table {order.dining.tableNumber}</Text>
              )}
            </View>

            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={Palette.textMuted} />
              <Text style={styles.metaText}>
                {order.orderFlow.formattedTime} • {order.orderFlow.formattedDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <View style={styles.customerInfo}>
            <MaterialCommunityIcons name="account-outline" size={24} color={Palette.primary} />
            <View style={styles.customerText}>
              <Text style={styles.customerName}>{order.customer.name}</Text>
              <Text style={styles.customerContact}>{order.customer.phone}</Text>
              {order.type === 'delivery' && (
                <Text style={styles.customerAddress}>{order.delivery.address}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                {item.notes && (
                  <Text style={styles.itemNotes}>Notes: {item.notes}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>
                {(item.price * item.quantity).toFixed(2)} {order.pricing.currency}
              </Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {order.pricing.total.toFixed(2)} {order.pricing.currency}
            </Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <MaterialCommunityIcons 
              name={order.payment.method === 'cash' ? 'cash' : 'credit-card-outline'} 
              size={20} 
              color={Palette.textMuted} 
            />
            <Text style={styles.paymentText}>
              {order.payment.method === 'cash' ? 'Cash' : 'Card'} Payment • {order.payment.status}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {getStatusActions().length > 0 && (
        <View style={styles.actionsContainer}>
          {getStatusActions().map((action) => (
            <Animated.View 
              key={action.status}
              style={{ transform: [{ scale: buttonScale }] }}
            >
              <Button
                mode="contained"
                onPress={() => updateOrderStatus(action.status)}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                style={[styles.actionButton, { backgroundColor: action.color }]}
                labelStyle={styles.buttonLabel}
                icon={() => <MaterialCommunityIcons name={action.icon} size={20} color={Palette.textOnPrimary} />}
              >
                {action.label}
              </Button>
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
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
    color: Palette.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: Palette.text,
    fontWeight: '500',
  },
  backButton: {
    marginTop: 16,
    backgroundColor: Palette.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    margin: 0,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  statusChip: {
    borderRadius: 12,
    height: 32,
  },
  orderMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  tableText: {
    fontSize: 14,
    color: Palette.primary,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  customerText: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
  },
  customerContact: {
    fontSize: 14,
    color: Palette.textMuted,
    marginTop: 2,
  },
  customerAddress: {
    fontSize: 14,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: Palette.text,
  },
  itemNotes: {
    fontSize: 13,
    color: Palette.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: Palette.borderLight,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 14,
    color: Palette.text,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 2,
  },
  buttonLabel: {
    color: Palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default OrderDetailScreen;
