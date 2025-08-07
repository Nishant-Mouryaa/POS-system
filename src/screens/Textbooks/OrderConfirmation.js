import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import {
  Text,
  Button,
  Divider,
  IconButton,
  useTheme,
  ActivityIndicator
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { getAuth } from 'firebase/auth';
import { Easing } from 'react-native';
import { useCart } from '../../context/CartContext';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

export default function OrderConfirmation({ navigation, route }) {
  const { orderId } = route.params;
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { clearCart } = useCart();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cafeDetails, setCafeDetails] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(30))[0];
  const [printing, setPrinting] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          const orderedAt = orderData.orderFlow.orderedAt?.toDate();
          
          setOrder({
            id: orderSnap.id,
            ...orderData,
            orderFlow: {
              ...orderData.orderFlow,
              orderedAt,
              formattedTime: format(orderedAt, 'hh:mm a'),
              formattedDate: format(orderedAt, 'MMM dd, yyyy')
            }
          });

          // Fetch cafe details
          if (orderData.cafeId) {
            const cafeRef = doc(db, 'cafes', orderData.cafeId);
            const cafeSnap = await getDoc(cafeRef);
            if (cafeSnap.exists()) {
              setCafeDetails({
                ...cafeSnap.data(),
                addressString: formatAddress(cafeSnap.data().address)
              });
            }
          }
        } else {
          console.warn('Order not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        Alert.alert("Error", "Failed to load order details");
      } finally {
        setLoading(false);
        // Animation sequence
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
  }, [orderId]);

  const formatAddress = (address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`;
  };

  const handlePrintReceipt = async () => {
    try {
      setPrinting(true);
      Haptics.selectionAsync();
      
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would connect to a printer here
      // await printOrderReceipt(order);
      
      Alert.alert("Receipt Printed", "The receipt has been sent to the printer");
    } catch (error) {
      Alert.alert("Print Error", "Failed to print receipt");
      console.error("Printing error:", error);
    } finally {
      setPrinting(false);
    }
  };

  const handleNewOrder = () => {
    Haptics.selectionAsync();
    clearCart(); // Clear the cart when starting a new order
    navigation.navigate('MenuCategoryScreen');
  };

  const handleViewOrder = () => {
    Haptics.selectionAsync();
    navigation.navigate('OrderDetail', { orderId });
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
          {/* Header with order confirmation */}
          <View style={styles.header}>
            <Icon
              name="check-circle"
              size={80}
              color={Palette.success}
              style={styles.successIcon}
            />
            <Text style={styles.title}>Order #{order.orderNumber || order.id.slice(0, 8)}</Text>
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
                <Text style={styles.summaryValue}>
                  {order.dining.tableNumber}
                </Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + '20' }
              ]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {order.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Items List Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items Ordered ({order.items.length})</Text>
            {order.items.map((item, index) => (
              <View key={`${item.itemId}-${index}`} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                  </Text>
                  {item.customizations?.size && (
                    <Text style={styles.itemCustomization}>
                      Size: {item.customizations.size.name}
                    </Text>
                  )}
                  {item.customizations?.options?.length > 0 && (
                    <Text style={styles.itemCustomization}>
                      {item.customizations.options.map(opt => opt.name).join(', ')}
                    </Text>
                  )}
                  {item.notes && (
                    <Text style={styles.itemNotes}>
                      Note: {item.notes}
                    </Text>
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
              <Text style={styles.summaryLabel}>Tax ({order.pricing.taxRate ? (order.pricing.taxRate * 100) : 18}%):</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(order.pricing.tax, order.pricing.currency)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Charge ({order.pricing.serviceChargeRate ? (order.pricing.serviceChargeRate * 100) : 10}%):</Text>
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
                      {formatCurrency(order.payment.change, order.pricing.currency)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Cafe Information Section */}
          {cafeDetails && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cafe Information</Text>
              <Text style={styles.cafeName}>{cafeDetails.name}</Text>
              <Text style={styles.cafeAddress}>{cafeDetails.addressString}</Text>
              <Text style={styles.cafeContact}>
                {cafeDetails.contact.phone} • {cafeDetails.contact.email}
              </Text>
              <Text style={styles.thankYou}>
                Thank you for your order! Please visit again.
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Action Buttons Footer */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handlePrintReceipt}
          style={styles.printButton}
          labelStyle={styles.buttonLabel}
          icon={printing ? "loading" : "printer"}
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
            labelStyle={[styles.buttonLabel, { color: colors.primary }]}
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
  switch (status.toLowerCase()) {
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
    color: Palette.text,
  },
  scrollContainer: {
    paddingBottom: Platform.OS === 'ios' ? 200 : 180,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Palette.textMuted,
    textAlign: 'center',
    lineHeight: 24,
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
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: Palette.textMuted,
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    color: Palette.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  orderTypeBadge: {
    backgroundColor: Palette.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderTypeText: {
    color: Palette.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 4,
  },
  itemCustomization: {
    fontSize: 13,
    color: Palette.textMuted,
    marginBottom: 2,
  },
  itemNotes: {
    fontSize: 13,
    color: Palette.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    minWidth: 80,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: Palette.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.primary,
  },
  cafeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  cafeAddress: {
    fontSize: 14,
    color: Palette.textMuted,
    marginBottom: 4,
    lineHeight: 20,
  },
  cafeContact: {
    fontSize: 14,
    color: Palette.textMuted,
    marginBottom: 12,
  },
  thankYou: {
    fontSize: 16,
    color: Palette.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
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
    elevation: 4,
  },
  printButton: {
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: Palette.primary,
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    borderColor: Palette.primary,
  },
  primaryButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: Palette.primary,
  },
  buttonLabel: {
    color: Palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});