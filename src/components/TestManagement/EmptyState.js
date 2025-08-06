import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const EmptyState = ({ searchQuery, onCreateTest }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="clipboard-text-outline" size={64} color={AdminPalette.textMuted} />
      </View>
      <Title style={styles.emptyTitle}>No Tests Found</Title>
      <Text style={styles.emptyText}>
        {searchQuery ? 'Try adjusting your search terms' : 'Start by creating your first test'}
      </Text>
      {!searchQuery && (
        <Button 
          mode="contained" 
          onPress={onCreateTest}
          style={styles.emptyButton}
          icon="plus"
        >
          Create First Test
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
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${AdminPalette.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: AdminPalette.onSurface,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: AdminPalette.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
  emptyButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
});

export default EmptyState; 