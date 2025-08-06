import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OrderItem from './OrderItem';
import { Palette } from '../../theme/colors';

const RecentOrders = ({ recentOrders, loadingOrders, styles, colors, onOrderPress, getStatusColor, getStatusIcon, formatTimeAgo }) => (
  <View style={styles.ordersCard}>
    {loadingOrders ? (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons 
          name="loading" 
          size={24} 
          color={colors.primary} 
          style={{ marginRight: 8 }}
        />
        <Text style={styles.loadingText}>Loading recent orders...</Text>
      </View>
    ) : recentOrders.length > 0 ? (
      recentOrders.map((order, index) => (
        <OrderItem
          key={order.id}
          order={order}
          index={index}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          formatTimeAgo={formatTimeAgo}
          styles={styles}
          colors={colors}
          onPress={onOrderPress}
        />
      ))
    ) : (
      <View style={styles.emptyOrdersContainer}>
        <MaterialCommunityIcons 
          name="tray-remove" 
          size={48} 
          color={Palette.textMuted} 
        />
        <Text style={styles.emptyOrdersTitle}>No Recent Orders</Text>
        <Text style={styles.emptyOrdersText}>
          New orders will appear here as they come in
        </Text>
      </View>
    )}
  </View>
);

export default RecentOrders;