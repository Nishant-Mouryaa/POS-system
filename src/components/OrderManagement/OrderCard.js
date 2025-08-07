// components/OrderCard.js
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Menu, Divider, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';
import OrderStatusBadge from '../OrderStatusBadge';

const OrderCard = ({ order, onPress, onStatusChange }) => {
  const [visibleMenu, setVisibleMenu] = useState(false);

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress(order);
  };

  const handleStatusChange = (newStatus) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStatusChange(newStatus);
    setVisibleMenu(false);
  };

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case 'dine_in': return 'table-chair';
      case 'takeaway': return 'bag-suitcase';
      case 'delivery': return 'motorbike';
      default: return 'help-circle-outline';
    }
  };

  const getOrderTypeLabel = (type) => {
    switch (type) {
      case 'dine_in': return 'Dine In';
      case 'takeaway': return 'Takeaway';
      case 'delivery': return 'Delivery';
      default: return 'Unknown';
    }
  };

  const getCardStyle = () => {
    const baseStyle = [styles.orderCard];
    switch (order.status) {
      case 'pending':
        return [...baseStyle, styles.orderCardPending];
      case 'preparing':
        return [...baseStyle, styles.orderCardPreparing];
      case 'ready':
        return [...baseStyle, styles.orderCardReady];
      case 'completed':
        return [...baseStyle, styles.orderCardCompleted];
      case 'cancelled':
        return [...baseStyle, styles.orderCardCancelled];
      default:
        return baseStyle;
    }
  };

  const renderMenuItems = () => {
    const items = [];
    
    if (order.status === 'pending') {
      items.push(
        <Menu.Item 
          key="preparing"
          title="Start Preparing" 
          onPress={() => handleStatusChange('preparing')}
          leadingIcon="clock-start"
          titleStyle={styles.menuItemText}
        />
      );
    }
    
    if (order.status === 'preparing') {
      items.push(
        <Menu.Item 
          key="ready"
          title="Mark as Ready" 
          onPress={() => handleStatusChange('ready')}
          leadingIcon="check-circle"
          titleStyle={styles.menuItemText}
        />
      );
    }
    
    if (order.status === 'ready') {
      items.push(
        <Menu.Item 
          key="completed"
          title="Complete Order" 
          onPress={() => handleStatusChange('completed')}
          leadingIcon="checkbox-marked-circle"
          titleStyle={styles.menuItemText}
        />
      );
    }
    
    if (order.status !== 'cancelled') {
      items.push(
        <Menu.Item 
          key="cancel"
          title="Cancel Order" 
          onPress={() => handleStatusChange('cancelled')}
          leadingIcon="cancel"
          titleStyle={[styles.menuItemText, { color: Palette.error }]}
        />
      );
    }

    items.push(<Divider key="divider" style={styles.menuDivider} />);
    items.push(
      <Menu.Item 
        key="details"
        title="View Details" 
        onPress={() => {
          setVisibleMenu(false);
          onPress(order);
        }}
        leadingIcon="information"
        titleStyle={styles.menuItemText}
      />
    );

    return items;
  };

  return (
    <TouchableOpacity 
      style={getCardStyle()}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>#{order.orderNumber || order.id.slice(0, 8)}</Text>
          <Text style={styles.orderTime}>
            {order.orderFlow.formattedTime} • {formatDistanceToNow(order.orderFlow.orderedAt, { addSuffix: true })}
          </Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderType}>
          <Icon 
            name={getOrderTypeIcon(order.type)} 
            size={20} 
            color={Palette.textSecondary} 
            style={styles.orderTypeIcon}
          />
          <Text style={styles.orderTypeText}>
            {getOrderTypeLabel(order.type)}
          </Text>
          {order.dining?.tableNumber && (
            <View style={styles.tableBadge}>
              <Text style={styles.tableNumber}>Table {order.dining.tableNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.orderItems}>
          <Text style={styles.itemsText} numberOfLines={1}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''}: {order.items.map(i => i.name).join(', ')}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>
          {formatCurrency(order.pricing.total, order.pricing.currency)}
        </Text>
        
        <Menu
          visible={visibleMenu}
          onDismiss={() => setVisibleMenu(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => setVisibleMenu(true)}
              style={styles.menuButton}
              iconColor={Palette.textSecondary}
            />
          }
          contentStyle={styles.menuContent}
        >
          {renderMenuItems()}
        </Menu>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
  },
  orderCardPending: {
    borderLeftColor: Palette.warning,
  },
  orderCardPreparing: {
    borderLeftColor: Palette.accent,
  },
  orderCardReady: {
    borderLeftColor: Palette.success,
  },
  orderCardCompleted: {
    borderLeftColor: Palette.secondary,
  },
  orderCardCancelled: {
    borderLeftColor: Palette.error,
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
    fontSize: 13,
    color: Palette.textMuted,
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTypeIcon: {
    marginRight: 8,
  },
  orderTypeText: {
    fontSize: 14,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  tableBadge: {
    backgroundColor: Palette.primaryXXLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  tableNumber: {
    fontSize: 12,
    color: Palette.primary,
    fontWeight: '600',
  },
  orderItems: {
    flexDirection: 'row',
  },
  itemsText: {
    fontSize: 14,
    color: Palette.textMuted,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.primary,
  },
  menuButton: {
    margin: 0,
  },
  menuContent: {
    backgroundColor: Palette.surface,
    borderRadius: 8,
    elevation: 4,
  },
  menuItemText: {
    color: Palette.text,
    fontSize: 14,
  },
  menuDivider: {
    backgroundColor: Palette.borderLight,
  },
});

export default OrderCard;