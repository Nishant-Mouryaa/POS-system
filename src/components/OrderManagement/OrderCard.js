import React, { useState, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Text, Menu, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

const OrderCard = ({ order, onPress, onStatusChange }) => {
  const [visibleMenu, setVisibleMenu] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

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

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress(order);
  };

  const handleStatusChange = (newStatus) => {
    // This calls your parent’s function, which updates Firestore with:
    //   "orderFlow.status": newStatus
    //   "orderFlow.updatedAt": serverTimestamp()
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStatusChange(newStatus);
    setVisibleMenu(false);
  };

  // Instead of using order.status, read from order.orderFlow.status:
  const currentStatus = order.orderFlow?.status || 'pending'; 

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':    return Palette.warning;
      case 'preparing':  return Palette.accent;
      case 'ready':      return Palette.success;
      case 'completed':  return Palette.secondary;
      case 'cancelled':  return Palette.error;
      default:           return Palette.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':    return 'clock';
      case 'preparing':  return 'clock-outline';
      case 'ready':      return 'check-circle';
      case 'completed':  return 'checkbox-marked-circle';
      case 'cancelled':  return 'cancel';
      default:           return 'help-circle';
    }
  };

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case 'dine_in':  return 'table-chair';
      case 'takeaway': return 'bag-suitcase';
      case 'delivery': return 'motorbike';
      default:         return 'help-circle-outline';
    }
  };

  const renderMenuItems = () => {
    const items = [];

    if (currentStatus === 'pending') {
      items.push(
        <Menu.Item 
          key="preparing"
          title="Start Preparing" 
          onPress={() => handleStatusChange('preparing')}
          leadingIcon="clock-start"
        />
      );
    }

    if (currentStatus === 'preparing') {
      items.push(
        <Menu.Item 
          key="ready"
          title="Mark as Ready" 
          onPress={() => handleStatusChange('ready')}
          leadingIcon="check-circle"
        />
      );
    }

    if (currentStatus === 'ready') {
      items.push(
        <Menu.Item 
          key="completed"
          title="Complete Order" 
          onPress={() => handleStatusChange('completed')}
          leadingIcon="checkbox-marked-circle"
        />
      );
    }

    if (currentStatus !== 'cancelled') {
      items.push(
        <Menu.Item 
          key="cancel"
          title="Cancel Order" 
          onPress={() => handleStatusChange('cancelled')}
          leadingIcon="cancel"
          titleStyle={{ color: Palette.error }}
        />
      );
    }

    items.push(<Divider key="divider" />);
    items.push(
      <Menu.Item 
        key="details"
        title="View Details" 
        onPress={() => {
          setVisibleMenu(false);
          onPress(order);
        }}
        leadingIcon="information"
      />
    );

    return items;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity 
        style={[
          styles.orderCard,
          { borderLeftColor: getStatusColor(currentStatus) }
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>
              #{order.orderNumber || order.id?.slice(0, 8)}
            </Text>
            <Text style={styles.orderTime}>
              {order.orderFlow?.orderedAt
                ? formatDistanceToNow(order.orderFlow.orderedAt, { addSuffix: true })
                : 'Just now'}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(currentStatus)}20` }]}>
            <MaterialCommunityIcons 
              name={getStatusIcon(currentStatus)} 
              size={16} 
              color={getStatusColor(currentStatus)} 
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: getStatusColor(currentStatus) }]}>
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderTypeRow}>
            <MaterialCommunityIcons 
              name={getOrderTypeIcon(order.type)} 
              size={18} 
              color={Palette.textMuted} 
            />
            <Text style={styles.orderTypeText}>
              {order.type === 'dine_in' 
                ? 'Dine In' 
                : order.type === 'takeaway'
                ? 'Takeaway'
                : order.type === 'delivery'
                ? 'Delivery'
                : 'Other'}
            </Text>
            
            {order.dining?.tableNumber && (
              <View style={styles.tableBadge}>
                <Text style={styles.tableNumber}>
                  Table {order.dining.tableNumber}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.itemsText} numberOfLines={1}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''}: 
            {' ' + order.items.map(i => i.name).join(', ')}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>
            {order.pricing.total.toFixed(2)} {order.pricing.currency}
          </Text>
          
          <Menu
            visible={visibleMenu}
            onDismiss={() => setVisibleMenu(false)}
            anchor={
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setVisibleMenu(true);
                }}
                style={styles.menuButton}
              >
                <MaterialCommunityIcons 
                  name="dots-vertical" 
                  size={20} 
                  color={Palette.textMuted} 
                />
              </TouchableOpacity>
            }
          >
            {renderMenuItems()}
          </Menu>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = {
  orderCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  orderTime: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTypeText: {
    fontSize: 13,
    color: Palette.textMuted,
    marginLeft: 8,
    marginRight: 8,
  },
  tableBadge: {
    backgroundColor: Palette.primaryXXLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tableNumber: {
    fontSize: 12,
    color: Palette.primary,
    fontWeight: '600',
  },
  itemsText: {
    fontSize: 13,
    color: Palette.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
    paddingTop: 12,
    marginTop: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  menuButton: {
    padding: 4,
  },
};

export default OrderCard;
 