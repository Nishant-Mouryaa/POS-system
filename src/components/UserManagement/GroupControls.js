import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { AdminPalette } from '../../theme/colors';

const GroupControls = ({ expandAllGroups, collapseAllGroups }) => {
  const styles = makeStyles(AdminPalette);
  
  return (
    <View style={styles.container}>
      <View style={styles.controlsWrapper}>
        <TouchableOpacity 
          onPress={expandAllGroups}
          style={styles.controlButton}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons 
              name="unfold-more" 
              size={18} 
              color={AdminPalette.primary} 
              style={styles.buttonIcon}
            />
            <Text variant="labelMedium" style={styles.buttonText}>
              Expand All
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          onPress={collapseAllGroups}
          style={styles.controlButton}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons 
              name="unfold-less" 
              size={18} 
              color={AdminPalette.primary} 
              style={styles.buttonIcon}
            />
            <Text variant="labelMedium" style={styles.buttonText}>
              Collapse All
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    controlsWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      paddingVertical: 4,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    controlButton: {
      flex: 1,
      paddingVertical: 10,
    },
    buttonContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonIcon: {
      marginRight: 8,
    },
    buttonText: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    divider: {
      width: 1,
      height: 24,
      backgroundColor: colors.outlineVariant,
      opacity: 0.5,
    },
  });

export default GroupControls;