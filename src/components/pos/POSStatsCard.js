import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const POSStatsCard = ({ shiftData, statsCardScale, colors, styles, isLoading }) => {
  // Helper function to format large numbers in INR
  const formatNumber = (value, isCurrency = false) => {
    if (value === undefined || value === null) return isCurrency ? '₹0.00' : '0';
    
    if (isCurrency) {
      // For currency values in INR with Indian number formatting
      if (value >= 10000000) { // 1 crore
        return `₹${(value / 10000000).toFixed(2)}Cr`;
      }
      if (value >= 100000) { // 1 lakh
        return `₹${(value / 100000).toFixed(2)}L`;
      }
      if (value >= 1000) { // 1 thousand
        return `₹${(value / 1000).toFixed(2)}K`;
      }
      return `₹${value.toFixed(2)}`;
    } else {
      // For count values
      if (value >= 10000000) { // 1 crore
        return `${(value / 10000000).toFixed(1)}Cr`;
      }
      if (value >= 100000) { // 1 lakh
        return `${(value / 100000).toFixed(1)}L`;
      }
      if (value >= 1000) { // 1 thousand
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    }
  };

  // Alternative: Indian number formatting with commas (optional)
  const formatIndianCurrency = (value) => {
    if (value === undefined || value === null) return '₹0.00';
    
    // Convert to fixed 2 decimals
    const fixedValue = value.toFixed(2);
    
    // Split into integer and decimal parts
    const [integer, decimal] = fixedValue.split('.');
    
    // Apply Indian comma formatting (last 3 digits, then groups of 2)
    let formattedInteger = integer;
    if (integer.length > 3) {
      const lastThree = integer.slice(-3);
      const remaining = integer.slice(0, -3);
      formattedInteger = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    
    return `₹${formattedInteger}.${decimal}`;
  };

  // Use compact format for display
  const displayCurrency = (value) => {
    if (value >= 10000) {
      return formatNumber(value, true);
    }
    return formatIndianCurrency(value);
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
              {displayCurrency(shiftData?.totalSales || 0)}
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
              {displayCurrency(shiftData?.averageOrderValue || 0)}
            </Text>
            <Text style={styles.statLabel}>Avg. Order</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

export default POSStatsCard;