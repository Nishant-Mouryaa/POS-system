// components/OrderFilters.js
import React, { useRef } from 'react';
import { Animated, View } from 'react-native';
import { Text, Searchbar, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
  const scaleValues = useRef({
    type: new Animated.Value(1),
    time: new Animated.Value(1),
  }).current;

  const typeOptions = [
    { value: 'all', label: 'All', icon: 'shuffle-variant' },
    { value: 'dine_in', label: 'Dine In', icon: 'table-chair' },
    { value: 'takeaway', label: 'Takeaway', icon: 'bag-suitcase' },
    { value: 'delivery', label: 'Delivery', icon: 'motorbike' },
  ];

  const timeOptions = [
    { value: 'today', label: 'Today', icon: 'calendar-today' },
    { value: 'this_week', label: 'This Week', icon: 'calendar-week' },
    { value: 'all_time', label: 'All Time', icon: 'calendar' },
  ];

  const handlePressIn = (type) => {
    Animated.spring(scaleValues[type], {
      toValue: 0.97,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (type) => {
    Animated.spring(scaleValues[type], {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleFilterChange = (value, type) => {
    Haptics.selectionAsync();
    if (type === 'type') {
      onTypeFilterChange(value);
    } else {
      onTimeFilterChange(value);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search orders..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.search}
        inputStyle={styles.searchInput}
        iconColor={Palette.primary}
        placeholderTextColor={Palette.textMuted}
        selectionColor={Palette.primaryLight}
        theme={{ colors: { primary: Palette.primary } }}
      />

      <StatusFilterChips
  statusFilter={statusFilter}
  onStatusFilterChange={onStatusFilterChange}
  orders={orders || []}  // Ensure orders is at least an empty array
/>

      <View style={styles.filterGroup}>
        <Text style={styles.label}>Order Type</Text>
        <View style={styles.buttonsContainer}>
          {typeOptions.map((option) => (
            <Animated.View 
              key={option.value}
              style={{ transform: [{ scale: scaleValues.type }] }}
            >
              <TouchableRipple
                style={[
                  styles.button,
                  typeFilter === option.value && styles.buttonActive
                ]}
                onPress={() => handleFilterChange(option.value, 'type')}
                onPressIn={() => handlePressIn('type')}
                onPressOut={() => handlePressOut('type')}
                borderless
                rippleColor={Palette.primaryLight}
              >
                <>
                  <MaterialCommunityIcons 
                    name={option.icon} 
                    size={18} 
                    color={typeFilter === option.value ? Palette.primary : Palette.textMuted} 
                  />
                  <Text style={[
                    styles.buttonText,
                    typeFilter === option.value && styles.buttonTextActive
                  ]}>
                    {option.label}
                  </Text>
                </>
              </TouchableRipple>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.label}>Time Period</Text>
        <View style={styles.buttonsContainer}>
          {timeOptions.map((option) => (
            <Animated.View 
              key={option.value}
              style={{ transform: [{ scale: scaleValues.time }] }}
            >
              <TouchableRipple
                style={[
                  styles.button,
                  timeFilter === option.value && styles.buttonActive
                ]}
                onPress={() => handleFilterChange(option.value, 'time')}
                onPressIn={() => handlePressIn('time')}
                onPressOut={() => handlePressOut('time')}
                borderless
                rippleColor={Palette.primaryLight}
              >
                <>
                  <MaterialCommunityIcons 
                    name={option.icon} 
                    size={18} 
                    color={timeFilter === option.value ? Palette.primary : Palette.textMuted} 
                  />
                  <Text style={[
                    styles.buttonText,
                    timeFilter === option.value && styles.buttonTextActive
                  ]}>
                    {option.label}
                  </Text>
                </>
              </TouchableRipple>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = {
  container: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  search: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: Palette.surfaceVariant,
    borderRadius: 8,
    height: 44,
  },
  searchInput: {
    minHeight: 36,
    color: Palette.text,
    fontSize: 14,
  },
  filterGroup: {
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    color: Palette.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Palette.surfaceVariant,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  buttonActive: {
    backgroundColor: Palette.primaryXXLight,
    borderColor: Palette.primary,
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 13,
    color: Palette.textMuted,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: Palette.primary,
  },
};

export default OrderFilters;