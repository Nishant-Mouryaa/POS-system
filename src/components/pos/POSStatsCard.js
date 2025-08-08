import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const POSStatsCard = ({ shiftData, statsCardScale, colors, styles, isLoading }) => {
  // Helper function to format large numbers
  const formatNumber = (value, isCurrency = false) => {
    if (value === undefined || value === null) return isCurrency ? '0.00' : '0';
    
    if (isCurrency) {
      // For currency values
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
      }
      if (value >= 1000) {
        return `$${(value / 1000).toFixed(2)}K`;
      }
      return `$${value.toFixed(2)}`;
    } else {
      // For count values
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    }
  };

  return (
    <Animated.View style={[styles.statsCard, { transform: [{ scale: statsCardScale }] }]}>
      {isLoading ? (
        <Text>Loading stats...</Text>
      ) : (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text 
              style={styles.statValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {formatNumber(shiftData?.totalOrders)}
            </Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text 
              style={styles.statValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {formatNumber(shiftData?.totalSales, true)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text 
              style={styles.statValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {formatNumber(shiftData?.averageOrderValue, true)}
            </Text>
            <Text style={styles.statLabel}>Avg. Order</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};



export default POSStatsCard;