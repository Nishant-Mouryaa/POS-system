import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Surface } from 'react-native-paper';

const MessageFilterBar = ({ activeFilter, onFilterChange, colors, styles }) => {
  const filters = [
    { key: 'all', label: 'All', icon: 'email-multiple' },
    { key: 'unread', label: 'Unread', icon: 'email' },
    { key: 'read', label: 'Read', icon: 'email-open-outline' },
  ];

  return (
    <Surface style={styles.filterContainer} >
      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            icon={filter.icon}
            selected={activeFilter === filter.key}
            onPress={() => onFilterChange(filter.key)}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.activeFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              activeFilter === filter.key && styles.activeFilterChipText
            ]}
            mode="outlined"
          >
            {filter.label}
          </Chip>
        ))}
      </View>
    </Surface>
  );
};

export default MessageFilterBar; 