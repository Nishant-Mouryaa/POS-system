// components/OrderListHeader.js
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '../../theme/colors';

const OrderListHeader = ({ orderCount }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Showing {orderCount} order{orderCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};

const styles = {
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  text: {
    fontSize: 14,
    color: Palette.textMuted,
    fontWeight: '500',
  },
};

export default OrderListHeader;