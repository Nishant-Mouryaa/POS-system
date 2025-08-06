import React from 'react';
import { View, Animated } from 'react-native';
import { Text } from 'react-native-paper';

const POSStatsCard = ({ shiftData, statsCardScale, colors, styles }) => (
  <Animated.View style={[styles.statsCard, { transform: [{ scale: statsCardScale }] }]}>
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{shiftData?.totalOrders ?? 0}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>
          {shiftData?.totalSales ? shiftData.totalSales.toFixed(2) : '0.00'}
        </Text>
        <Text style={styles.statLabel}>Sales</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{shiftData?.tableTurns ?? 0}</Text>
        <Text style={styles.statLabel}>Table Turns</Text>
      </View>
    </View>
  </Animated.View>
);

export default POSStatsCard;