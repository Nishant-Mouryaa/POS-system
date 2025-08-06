import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette } from '../../theme/colors';

const OrderItem = ({ order, index, getStatusColor, getStatusIcon, formatTimeAgo, styles, colors, onPress }) => {
  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);

  return (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => onPress(order)}
    >
      <View style={[styles.orderIconContainer, { backgroundColor: `${statusColor}20` }]}>
        <MaterialCommunityIcons 
          name={statusIcon} 
          size={20} 
          color={statusColor} 
        />
      </View>
      <View style={styles.orderContent}>
        <Text style={styles.orderText} numberOfLines={1}>
          Order #{order.orderNumber}
        </Text>
        <View style={styles.orderSubInfo}>
          <Text style={styles.orderAmount}>
            {order.pricing.total.toFixed(2)} {order.pricing.currency} • {order.items.length} items
          </Text>
          <Text style={styles.orderTime}>
            {formatTimeAgo(order.orderFlow.orderedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OrderItem;