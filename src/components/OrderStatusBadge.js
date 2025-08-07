import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '../theme/colors';

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return Palette.warning;
      case 'preparing':
        return Palette.accent;
      case 'ready':
        return Palette.success;
      case 'completed':
        return Palette.primary;
      case 'cancelled':
        return Palette.error;
      default:
        return Palette.textMuted;
    }
  };

  const getStatusText = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() + '20' }]}>
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderStatusBadge;