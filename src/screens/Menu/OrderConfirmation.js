import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  BackHandler,
  Alert,
  Platform,
  Dimensions,
  Animated,
  StyleSheet
} from 'react-native';
import {
  Text,
  Button,
  IconButton,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../context/CartContext';
import { Palette } from '../../theme/colors';
import { Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OrderConfirmation({ navigation, route }) {
  const { orderId } = route.params;
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  // Animated values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(30))[0];

  // Handle back navigation with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Leave Order Confirmation?',
          'Are you sure you want to leave this screen?',
          [
            {
              text: 'Stay',
              style: 'cancel'
            },
            {
              text: 'Go to Menu',
              onPress: () => {
                clearCart();
                // Navigate back to the Main (BottomTabNavigator) and show Menu tab
                navigation.navigate('Main', { 
                  screen: 'MenuCategoryScreen' 
                });
              }
            }
          ]
        );
        return true;
      };

      // Subscribe to hardware back press
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      // Override header's back button
      navigation.setOptions({
        headerLeft: () => (
          <IconButton
            icon="arrow-left"
            onPress={onBackPress}
          />
        )
      });

      return () => subscription.remove();
    }, [navigation, clearCart])
  );

  // Fetch order details once
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const data = orderSnap.data();
          const orderedAt = data.orderFlow?.orderedAt?.toDate?.();

          setOrder({
            id: orderSnap.id,
            ...data,
            orderFlow: {
              ...data.orderFlow,
              orderedAt,
              formattedTime: orderedAt ? format(orderedAt, 'hh:mm a') : '',
              formattedDate: orderedAt ? format(orderedAt, 'MMM dd, yyyy') : ''
            }
          });
        } else {
          console.warn('Order not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        Alert.alert('Error', 'Failed to load order details');
      } finally {
        setLoading(false);

        // Animate in once data is ready
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(slideUpAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.exp)
          })
        ]).start();
      }
    };

    fetchOrder();
  }, [orderId, navigation, fadeAnim, slideUpAnim]);

  const handlePrintReceipt = async () => {
    try {
      setPrinting(true);
      Haptics.selectionAsync();
      // Simulate a print delay
      await new Promise((res) => setTimeout(res, 1500));
      Alert.alert('Receipt Printed', 'The receipt has been sent to the printer');
    } catch (error) {
      console.error('Printing error:', error);
      Alert.alert('Print Error', 'Failed to print receipt');
    } finally {
      setPrinting(false);
    }
  };

  // FIXED: Navigate back to tab navigator
  const handleNewOrder = () => {
    Haptics.selectionAsync();
    clearCart();
    
    // Navigate back to the Main screen (BottomTabNavigator) and then to Menu tab
    navigation.navigate('Main', { 
      screen: 'MenuCategoryScreen' 
    });
  };

  // ALTERNATIVE: If you want to go back to the previous screen in the tab
  const handleNewOrderSimple = () => {
    Haptics.selectionAsync();
    clearCart();
    
    // Simply go back to previous screen
    navigation.goBack();
    
    // Or go back multiple screens if needed
    // navigation.pop(2); // Go back 2 screens
    
    // Or navigate to a specific screen within current tab
    // navigation.navigate('MenuCategoryScreen');
  };

  const handleViewOrder = () => {
    Haptics.selectionAsync();
    navigation.navigate('OrderDetail', { orderId });
  };

  // Example currency formatter; replace with your own or use an intl library
  const formatCurrency = (amount, currency) => {
    if (!amount || Number.isNaN(amount)) return 'N/A';
    return `${currency || '$'}${parseFloat(amount).toFixed(2)}`;
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ transform: [{ translateY: slideUpAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <Icon
              name="check-circle"
              size={80}
              color={Palette.success}
              style={styles.successIcon}
            />
            <Text style={styles.title}>
              Order #{order.orderNumber || order.id.slice(0, 8)}
            </Text>
            <Text style={styles.subtitle}>
              {order.orderFlow.formattedDate} at {order.orderFlow.formattedTime}
            </Text>
          </View>

          {/* Order Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Type:</Text>
              <View style={styles.orderTypeBadge}>
                <Text style={styles.orderTypeText}>
                  {order.type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                </Text>
              </View>
            </View>

            {order.dining?.tableNumber && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Table:</Text>
                <Text style={styles.summaryValue}>{order.dining.tableNumber}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) + '20' }
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) }
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Items List Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Items Ordered ({order.items.length})
            </Text>
            {order.items.map((item, index) => (
              <View key={`${item.itemId}-${index}`} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.quantity > 1 ? `${item.quantity}x ` : ''}
                    {item.name}
                  </Text>
                  {item.customizations?.size && (
                    <Text style={styles.itemCustomization}>
                      Size: {item.customizations.size.name}
                    </Text>
                  )}
                  {item.customizations?.options?.length > 0 && (
                    <Text style={styles.itemCustomization}>
                      {item.customizations.options
                        .map((opt) => opt.name)
                        .join(', ')}
                    </Text>
                  )}
                  {item.notes && (
                    <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                  )}
                </View>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.totalPrice, order.pricing.currency)}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.pricing.subtotal, order.pricing.currency)}
              </Text>
            </View>

            {order.pricing.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={[styles.summaryValue, { color: Palette.success }]}>
                  -{formatCurrency(order.pricing.discount, order.pricing.currency)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Tax (
                {order.pricing.taxRate
                  ? order.pricing.taxRate * 100
                  : 18}
                %):
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.pricing.tax, order.pricing.currency)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Service Charge (
                {order.pricing.serviceChargeRate
                  ? order.pricing.serviceChargeRate * 100
                  : 10}
                %):
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.pricing.serviceCharge, order.pricing.currency)}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(order.pricing.total, order.pricing.currency)}
              </Text>
            </View>

            {order.payment && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Payment Method:</Text>
                  <Text style={styles.summaryValue}>
                    {order.payment.method === 'cash' ? 'Cash' : 'Card'}
                  </Text>
                </View>
                {order.payment.change > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Change:</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(
                        order.payment.change,
                        order.pricing.currency
                      )}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons Footer */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handlePrintReceipt}
          style={styles.printButton}
          labelStyle={styles.buttonLabel}
          icon={printing ? 'loading' : 'printer'}
          loading={printing}
          disabled={printing}
        >
          {printing ? 'Printing...' : 'Print Receipt'}
        </Button>

        <View style={styles.buttonGroup}>
          <Button
            mode="outlined"
            onPress={handleViewOrder}
            style={styles.secondaryButton}
            labelStyle={[styles.buttonLabel, { color: Palette.primary }]}
            icon="text-box"
          >
            View Details
          </Button>
          <Button
            mode="contained"
            onPress={handleNewOrder}
            style={styles.primaryButton}
            labelStyle={styles.buttonLabel}
            icon="plus"
          >
            New Order
          </Button>
        </View>
      </View>
    </Animated.View>
  );
}

// Helper function to get status color
const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'completed':
      return Palette.success;
    case 'preparing':
      return Palette.warning;
    case 'pending':
      return Palette.accent;
    case 'cancelled':
      return Palette.error;
    default:
      return Palette.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background
  },
  loadingText: {
    marginTop: 16,
    color: Palette.text
  },
  scrollContainer: {
    paddingBottom: Platform.OS === 'ios' ? 200 : 180
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16
  },
  successIcon: {
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 4,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 24
  },
  section: {
    backgroundColor: Palette.surface,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 15,
    color: Palette.textMuted,
    flex: 1
  },
  summaryValue: {
    fontSize: 15,
    color: Palette.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-end'
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14
  },
  orderTypeBadge: {
    backgroundColor: Palette.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  orderTypeText: {
    color: Palette.primary,
    fontWeight: '600',
    fontSize: 14
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight
  },
  itemInfo: {
    flex: 1,
    marginRight: 12
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 4
  },
  itemCustomization: {
    fontSize: 13,
    color: Palette.textMuted,
    marginBottom: 2
  },
  itemNotes: {
    fontSize: 13,
    color: Palette.primary,
    fontStyle: 'italic',
    marginTop: 4
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    minWidth: 80,
    textAlign: 'right'
  },
  divider: {
    marginVertical: 12,
    backgroundColor: Palette.border
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.primary
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Palette.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
    elevation: 4
  },
  printButton: {
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: Palette.primary,
    marginBottom: 12
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  secondaryButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    borderColor: Palette.primary
  },
  primaryButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: Palette.primary
  },
  buttonLabel: {
    color: Palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '600'
  }
});