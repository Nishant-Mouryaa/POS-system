// components/StatusFilterChips.js
import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

const StatusFilterChips = ({ statusFilter, onStatusFilterChange, orders }) => {
  // Order status options
  const statusOptions = [
    { value: 'all', label: 'All', icon: 'format-list-bulleted' },
    { value: 'pending', label: 'Pending', icon: 'clock-outline' },
    { value: 'preparing', label: 'Preparing', icon: 'coffee-maker' },
    { value: 'ready', label: 'Ready', icon: 'check-circle-outline' },
    { value: 'completed', label: 'Completed', icon: 'checkbox-marked-circle' },
    { value: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
  ];

  const handleStatusPress = (status) => {
    Haptics.selectionAsync();
    onStatusFilterChange(status);
  };

  const getOrderCountForStatus = (status) => {
    return orders.filter(o => o.status === status).length;
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.statusFilterContainer}
    >
      {statusOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.statusFilterButton,
            statusFilter === option.value && styles.statusFilterButtonActive
          ]}
          onPress={() => handleStatusPress(option.value)}
        >
          <Icon 
            name={option.icon} 
            size={16} 
            color={statusFilter === option.value ? Palette.textOnPrimary : Palette.primary} 
            style={styles.filterIcon}
          />
          <Text style={[
            styles.statusFilterText,
            statusFilter === option.value && styles.statusFilterTextActive
          ]}>
            {option.label}
          </Text>
          {statusFilter !== option.value && option.value !== 'all' && (
            <Badge style={styles.statusBadge}>
              {getOrderCountForStatus(option.value)}
            </Badge>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statusFilterContainer: {
    paddingBottom: 8,
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Palette.surfaceVariant,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusFilterButtonActive: {
    backgroundColor: Palette.primary,
  },
  filterIcon: {
    marginRight: 6,
  },
  statusFilterText: {
    fontSize: 14,
    color: Palette.text,
  },
  statusFilterTextActive: {
    color: Palette.textOnPrimary,
  },
  statusBadge: {
    marginLeft: 4,
    backgroundColor: Palette.primary,
    color: Palette.textOnPrimary,
  },
});

export default StatusFilterChips;