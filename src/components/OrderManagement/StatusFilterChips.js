// components/StatusFilterChips.js
import React, { useRef } from 'react';
import { Animated, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

// Define status options outside component to avoid recreation
const statusOptions = [
  { value: 'all', label: 'All', icon: 'format-list-bulleted' },
  { value: 'pending', label: 'Pending', icon: 'clock-outline' },
  { value: 'preparing', label: 'Preparing', icon: 'coffee-maker' },
  { value: 'ready', label: 'Ready', icon: 'check-circle-outline' },
  { value: 'completed', label: 'Completed', icon: 'checkbox-marked-circle' },
  { value: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
];

const StatusFilterChips = ({ 
  statusFilter = 'all', 
  onStatusFilterChange = () => {}, 
  orders = [] 
}) => {
  // Initialize scale values for animations
  const scaleValues = useRef(statusOptions.map(() => new Animated.Value(1))).current;

  // Safe order counting function
  const getOrderCountForStatus = (status) => {
    try {
      if (!Array.isArray(orders)) return 0;
      return orders.filter(o => o?.status === status).length;
    } catch (error) {
      console.error('Error counting orders:', error);
      return 0;
    }
  };

  // Get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return Palette.warning;
      case 'preparing': return Palette.accent;
      case 'ready': return Palette.success;
      case 'completed': return Palette.secondary;
      case 'cancelled': return Palette.error;
      default: return Palette.primary;
    }
  };

  // Animation handlers
  const handlePressIn = (index) => {
    Animated.spring(scaleValues[index], {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(scaleValues[index], {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleStatusPress = (status, index) => {
    try {
      Haptics.selectionAsync();
      onStatusFilterChange(status);
    } catch (error) {
      console.error('Error handling status change:', error);
    }
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {statusOptions.map((option, index) => (
        <Animated.View 
          key={option.value}
          style={{ transform: [{ scale: scaleValues[index] }] }}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              statusFilter === option.value && {
                backgroundColor: getStatusColor(option.value),
                borderColor: getStatusColor(option.value),
              }
            ]}
            onPress={() => handleStatusPress(option.value, index)}
            onPressIn={() => handlePressIn(index)}
            onPressOut={() => handlePressOut(index)}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons 
              name={option.icon} 
              size={16} 
              color={statusFilter === option.value ? Palette.textOnPrimary : getStatusColor(option.value)} 
              style={styles.icon}
            />
            <Text style={[
              styles.text,
              statusFilter === option.value && styles.textActive
            ]}>
              {option.label}
            </Text>
            {statusFilter !== option.value && option.value !== 'all' && (
              <View style={[
                styles.badge,
                { backgroundColor: `${getStatusColor(option.value)}20` }
              ]}>
                <Text style={[styles.badgeText, { color: getStatusColor(option.value) }]}>
                  {getOrderCountForStatus(option.value)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = {
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: Palette.surfaceVariant,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: Palette.text,
  },
  textActive: {
    color: Palette.textOnPrimary,
  },
  badge: {
    marginLeft: 6,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
};

export default StatusFilterChips;