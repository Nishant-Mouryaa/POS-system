// components/OrderFilters.js
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Searchbar, SegmentedButtons } from 'react-native-paper';
import { Palette } from '../../theme/colors';
import StatusFilterChips from './StatusFilterChips';

const OrderFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  timeFilter,
  onTimeFilterChange,
  orders
}) => {
  // Order type options
  const typeOptions = [
    { value: 'all', label: 'All', icon: 'shuffle-variant' },
    { value: 'dine_in', label: 'Dine In', icon: 'table-chair' },
    { value: 'takeaway', label: 'Takeaway', icon: 'bag-suitcase' },
    { value: 'delivery', label: 'Delivery', icon: 'motorbike' },
  ];

  // Time filter options
  const timeOptions = [
    { value: 'today', label: 'Today', icon: 'calendar-today' },
    { value: 'this_week', label: 'This Week', icon: 'calendar-week' },
    { value: 'all_time', label: 'All Time', icon: 'calendar' },
  ];

  return (
    <View style={styles.filterSection}>
      <Searchbar
        placeholder="Search orders..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor={Palette.primary}
        placeholderTextColor={Palette.textMuted}
        selectionColor={Palette.primaryLight}
        theme={{ colors: { primary: Palette.primary } }}
      />

      <StatusFilterChips
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        orders={orders}
      />

      <View style={styles.segmentedContainer}>
        <SegmentedButtons
          value={typeFilter}
          onValueChange={onTypeFilterChange}
          buttons={typeOptions.map(option => ({
            value: option.value,
            label: option.label,
            icon: option.icon,
            style: {
              minWidth: 100,
              borderColor: Palette.primary,
              backgroundColor: typeFilter === option.value ? Palette.primaryXXLight : Palette.surface,
            },
            labelStyle: {
              color: typeFilter === option.value ? Palette.primary : Palette.textSecondary,
            },
            checkedColor: Palette.primary,
            uncheckedColor: Palette.textSecondary,
          }))}
          density="small"
        />
      </View>

      <View style={styles.timeFilterContainer}>
        <Text style={styles.filterLabel}>Time Period:</Text>
        <SegmentedButtons
          value={timeFilter}
          onValueChange={onTimeFilterChange}
          buttons={timeOptions.map(option => ({
            value: option.value,
            label: option.label,
            icon: option.icon,
            style: {
              minWidth: 100,
              borderColor: Palette.primary,
              backgroundColor: timeFilter === option.value ? Palette.primaryXXLight : Palette.surface,
            },
            labelStyle: {
              color: timeFilter === option.value ? Palette.primary : Palette.textSecondary,
            },
            checkedColor: Palette.primary,
            uncheckedColor: Palette.textSecondary,
          }))}
          density="small"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 1,
    backgroundColor: Palette.surfaceVariant,
    borderRadius: 8,
    height: 48,
  },
  searchInput: {
    minHeight: 40,
    color: Palette.text,
  },
  segmentedContainer: {
    marginTop: 8,
  },
  timeFilterContainer: {
    marginTop: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: Palette.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default OrderFilters;