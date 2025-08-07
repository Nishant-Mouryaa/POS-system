// components/OrderListHeader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '../../theme/colors';

const OrderListHeader = ({ orderCount }) => {
  return (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>
        Showing {orderCount} order{orderCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  listHeader: {
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 14,
    color: Palette.textMuted,
    fontWeight: '500',
  },
});

export default OrderListHeader;