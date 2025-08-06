import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const EmptyState = ({ searchQuery }) => {
  const styles = makeStyles(AdminPalette);

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          name="account-group-outline"
          size={64}
          color={AdminPalette.textMuted}
        />
      </View>
      <Text style={styles.emptyTitle}>No Users Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try adjusting your search terms'
          : 'No users are currently registered.'}
      </Text>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
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
      backgroundColor: `${colors.primary}10`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
      paddingHorizontal: 48,
    },
  });

export default EmptyState; 