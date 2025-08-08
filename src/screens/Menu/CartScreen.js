// CartScreen.js - Fixed version with proper CartContext integration
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  TextInput
} from 'react-native';
import { 
  Text, 
  Button, 
  Divider, 
  Chip, 
  IconButton,
  Badge
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import { db, auth } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../context/CartContext'; // Import useCart hook

const { width, height } = Dimensions.get('window');

export default function CartScreen({ navigation, route }) {
  // Use the CartContext instead of local state
  const { cartItems, clearCart, removeFromCart, removeByIndex, getCartTotals } = useCart();
  
  // Local state for the staff's inputs:
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState('1');
  const [tableNumber, setTableNumber] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  // Animations
  const slideAnim = useState(new Animated.Value(height))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Get totals from CartContext
  const { subtotal, tax, serviceCharge, total } = getCartTotals();

  const removeItem = (index) => {
    Haptics.selectionAsync();
    // Use the cart item's unique ID for removal
    const itemToRemove = cartItems[index];
    if (itemToRemove.cartItemId) {
      removeFromCart(itemToRemove.cartItemId);
    } else {
      // Fallback: remove by index
      removeByIndex(index);
    }
  };

  const handleEditItem = (index) => {
    Haptics.selectionAsync();
    navigation.navigate('ItemDetail', {
      itemId: cartItems[index].id,
      cafeId: cartItems[index].cafeId,
      editMode: true,
      editIndex: index,
      existingData: {
        customizations: cartItems[index].customizations,
        quantity: cartItems[index].quantity,
        notes: cartItems[index].notes
      }
    });
  };

  const processOrder = async () => {
    // Prevent multiple simultaneous calls
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get cafeId from the first item
      const cafeId = cartItems[0]?.cafeId;
      if (!cafeId) throw new Error('No cafe ID found');

      // Prepare items - create a snapshot to avoid reference issues
      const itemsSnapshot = [...cartItems];
      const items = itemsSnapshot.map((item, index) => ({
        itemId: item.id,
        name: item.basicInfo?.name || item.name,
        quantity: item.quantity || 1,
        unitPrice: item.pricing?.basePrice || item.price || 0,
        totalPrice: item.totalPrice || (item.pricing?.basePrice || item.price || 0),
        notes: item.customizations?.notes || item.notes || '',
        customizations: [
          ...(item.customizations?.size ? [{
            customizationId: `size_${item.customizations.size.name.toLowerCase().replace(/\s+/g, '_')}`,
            name: 'Size',
            price: item.customizations.size.price,
            selectedOption: item.customizations.size.name
          }] : []),
          ...(item.customizations?.options?.map((opt, optIndex) => ({
            customizationId: `opt_${opt.name.toLowerCase().replace(/\s+/g, '_')}_${optIndex}`,
            name: opt.name,
            price: opt.price,
            selectedOption: opt.name
          })) || [])
        ]
      }));

      // Get totals snapshot
      const totalsSnapshot = getCartTotals();

      const orderRef = await addDoc(collection(db, 'orders'), {
        cafeId,
        customer: {
          customerId: '',
          name: customerName || 'Guest',
          email: '',
          phone: customerPhone,
          loyaltyNumber: ''
        },
        dining: {
          tableNumber: parseInt(tableNumber, 10) || 1,
          numberOfGuests: parseInt(numberOfGuests, 10) || 1,
          specialRequests: '' 
        },
        items,
        orderFlow: {
          orderedAt: serverTimestamp(),
          estimatedReadyTime: null,
          completedAt: null,
          orderNumber: `ORD-${new Date().toISOString().replace(/[^0-9]/g, '').slice(-12)}`
        },
        payment: {
          method: paymentMethod,
          status: 'pending',
          transactionId: null
        },
        pricing: {
          subtotal: totalsSnapshot.subtotal,
          tax: totalsSnapshot.tax,
          serviceCharge: totalsSnapshot.serviceCharge,
          discount: 0,
          total: totalsSnapshot.total,
          currency: itemsSnapshot[0]?.pricing?.currency || 'INR'
        },
        staff: {
          cashierId: user.uid,
          cashierName: user.displayName || 'Staff',
          kitchenAssignedTo: null,
          servedBy: null
        },
        status: 'pending',
        type: 'dine_in',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Clear cart using CartContext method
      clearCart();
      
      // Navigate after successful order creation
      navigation.replace('OrderConfirmation', { orderId: orderRef.id });
    } catch (error) {
      console.error("Error processing order:", error);
      Alert.alert("Error", "Failed to process order. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmClearCart = () => {
    Haptics.selectionAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          onPress: () => {
            clearCart(); // Use CartContext method
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              color={Palette.primary}
            />
            <Text style={styles.title}>Create Order</Text>
            {cartItems.length > 0 && (
              <IconButton
                icon="trash-can-outline"
                size={24}
                onPress={confirmClearCart}
                color={Palette.error}
              />
            )}
          </View>

          {/* Cart empty state */}
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Icon name="cart-remove" size={60} color={Palette.textMuted} />
              <Text style={styles.emptyText}>No items in the cart</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('MenuCategories')}
                style={styles.browseButton}
                labelStyle={styles.browseButtonText}
              >
                Browse Menu
              </Button>
            </View>
          ) : (
            <>
              {/* List of items in cart */}
              {cartItems.map((item, index) => {
                // Calculate item total price
                const itemTotal = item.totalPrice || 
                  (item.pricing?.basePrice || item.price || 0) + 
                  (item.customizations?.size?.price || 0) +
                  (item.customizations?.options?.reduce((s, opt) => s + (opt.price || 0), 0) || 0);

                return (
                  <View key={`cart-item-${item.cartItemId || item.id}-${index}`} style={styles.itemContainer}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.basicInfo?.name || item.name}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {itemTotal.toFixed(2)} {item.pricing?.currency || 'INR'}
                      </Text>
                    </View>

                    {/* Quantity */}
                    {item.quantity > 1 && (
                      <View style={styles.customizationRow}>
                        <Text style={styles.customizationLabel}>Qty:</Text>
                        <Chip style={styles.customizationChip}>
                          {item.quantity}
                        </Chip>
                      </View>
                    )}

                    {/* Size */}
                    {item.customizations?.size && (
                      <View style={styles.customizationRow}>
                        <Text style={styles.customizationLabel}>Size:</Text>
                        <Chip style={styles.customizationChip}>
                          {item.customizations.size.name} (+{item.customizations.size.price})
                        </Chip>
                      </View>
                    )}

                    {/* Options */}
                    {item.customizations?.options?.length > 0 && (
                      <View style={styles.customizationRow}>
                        <Text style={styles.customizationLabel}>Options:</Text>
                        <View style={styles.customizationOptions}>
                          {item.customizations.options.map((opt, optIndex) => (
                            <Chip key={`option-${index}-${optIndex}`} style={styles.customizationChip}>
                              {opt.name}
                              {opt.price > 0 ? ` (+${opt.price})` : ''}
                            </Chip>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Notes */}
                    {(item.customizations?.notes || item.notes) && (
                      <View style={styles.notesRow}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>
                          {item.customizations?.notes || item.notes}
                        </Text>
                      </View>
                    )}

                    {/* Edit/Remove Buttons */}
                    <View style={styles.itemActions}>
                      <Button
                        mode="text"
                        onPress={() => handleEditItem(index)}
                        icon="pencil"
                        labelStyle={styles.actionButtonText}
                      >
                        Edit
                      </Button>
                      <Button
                        mode="text"
                        onPress={() => removeItem(index)}
                        icon="delete"
                        labelStyle={[styles.actionButtonText, { color: Palette.error }]}
                      >
                        Remove
                      </Button>
                    </View>

                    {index < cartItems.length - 1 && <Divider style={styles.divider} />}
                  </View>
                );
              })}

              {/* Order Totals */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>{subtotal.toFixed(2)} INR</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax (18%):</Text>
                  <Text style={styles.summaryValue}>{tax.toFixed(2)} INR</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Service Charge (10%):</Text>
                  <Text style={styles.summaryValue}>{serviceCharge.toFixed(2)} INR</Text>
                </View>
                <Divider style={styles.totalDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>{total.toFixed(2)} INR</Text>
                </View>
              </View>
            </>
          )}

          {/* Staff-entered customer + table info */}
          {cartItems.length > 0 && (
            <View style={styles.customerSection}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.paymentMethodRow}>
                <Button
                  mode={paymentMethod === 'cash' ? 'contained' : 'outlined'}
                  onPress={() => setPaymentMethod('cash')}
                  style={styles.paymentButton}
                >
                  Cash
                </Button>
                <Button
                  mode={paymentMethod === 'card' ? 'contained' : 'outlined'}
                  onPress={() => setPaymentMethod('card')}
                  style={styles.paymentButton}
                >
                  Card
                </Button>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Footer with "Process Order" button */}
      {cartItems.length > 0 && (
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Button
            mode="contained"
            onPress={processOrder}
            loading={isProcessing}
            disabled={isProcessing}
            style={styles.checkoutButton}
            labelStyle={styles.checkoutButtonText}
            icon="cash-register"
          >
            {isProcessing ? 'Processing...' : 'Process Order'}
          </Button>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    color: Palette.textMuted,
    marginVertical: 16,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: Palette.primary,
  },
  browseButtonText: {
    color: Palette.textOnPrimary,
    fontWeight: '600',
  },
  itemContainer: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.primary,
  },
  customizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  customizationLabel: {
    fontSize: 14,
    color: Palette.textMuted,
    marginRight: 8,
    width: 70,
  },
  customizationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  customizationChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: Palette.surfaceVariant,
    height: 28,
  },
  notesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: Palette.textMuted,
    marginRight: 8,
    width: 70,
  },
  notesText: {
    fontSize: 14,
    color: Palette.text,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: Palette.primary,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: Palette.borderLight,
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Palette.surface,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    color: Palette.text,
    fontWeight: '500',
  },
  totalDivider: {
    marginVertical: 8,
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
  customerSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: Palette.text,
  },
  input: {
    backgroundColor: Palette.surfaceVariant,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    color: Palette.text,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Palette.background,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  checkoutButton: {
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: Palette.primary,
  },
  checkoutButtonText: {
    color: Palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});