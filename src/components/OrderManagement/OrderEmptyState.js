// components/OrderEmptyState.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
const OrderEmptyState = ({ searchQuery, onResetFilters }) => {
  return (
    <View style={styles.emptyContainer}>
      <Icon name="tray-remove" size={48} color={Palette.textMuted} />
      <Text style={styles.emptyText}>No orders found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery ? 'Try a different search' : 'Try adjusting your filters'}
      </Text>
      {!searchQuery && (
        <Button 
          mode="contained" 
          onPress={onResetFilters}
          style={styles.resetFiltersButton}
          labelStyle={styles.resetFiltersButtonText}
        >
          Reset Filters
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: Palette.text,
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: Palette.textMuted,
    marginTop: 8,
  },
  resetFiltersButton: {
    marginTop: 16,
    backgroundColor: Palette.primary,
    borderRadius: 8,
  },
  resetFiltersButtonText: {
    color: Palette.textOnPrimary,
    fontWeight: '500',
  },
});

export default OrderEmptyState;