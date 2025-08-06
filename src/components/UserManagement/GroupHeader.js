import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { AdminPalette } from '../../theme/colors';

const GroupHeader = ({ group, expanded, toggleGroup, notifyGroup }) => {
  const styles = makeStyles(AdminPalette);
  
  return (
    <Surface style={styles.groupHeader} elevation={2}>
      <View style={styles.groupHeaderContent}>
        <TouchableOpacity 
          style={styles.groupInfoContainer}
          onPress={() => toggleGroup(group.standard)}
          activeOpacity={0.8}
        >
          <View style={styles.groupInfo}>
            <View style={styles.groupTitleContainer}>
              <MaterialIcons
                name="class"
                size={20}
                color={AdminPalette.primary}
                style={styles.groupIcon}
              />
              <Text style={styles.groupTitle} numberOfLines={1} ellipsizeMode="tail">
                {group.title}
              </Text>
              <MaterialIcons
                name={expanded ? 'expand-less' : 'expand-more'}
                size={24}
                color={AdminPalette.textMuted}
                style={styles.chevronIcon}
              />
            </View>
            <View style={styles.groupStats}>
              <View style={styles.statBadge}>
                <MaterialIcons
                  name="person"
                  size={14}
                  color={AdminPalette.primary}
                />
                <Text style={styles.statText}>
                  {group.data.length} {group.data.length === 1 ? 'Student' : 'Students'}
                </Text>
              </View>
              <View style={[styles.statBadge, styles.teacherBadge]}>
                <MaterialIcons
                  name="person"
                  size={14}
                  color={AdminPalette.secondary}
                />
                <Text style={styles.statText}>
                  {group.data.filter((u) => u.role === 'Teacher').length} Teachers
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notifyButton}
          onPress={() => notifyGroup(group)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="notifications"
            size={20}
            color={AdminPalette.textLight}
          />
          <Text style={styles.notifyButtonText}>Notify</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    groupHeader: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      overflow: 'hidden',
    },
    groupHeaderContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    groupInfoContainer: {
      flex: 1,
    },
    groupInfo: {
      flex: 1,
    },
    groupTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    groupIcon: {
      marginRight: 8,
    },
    chevronIcon: {
      marginLeft: 'auto',
    },
    groupTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      maxWidth: '60%',
    },
    groupStats: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 2,
    },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      paddingVertical: 2,
      paddingHorizontal: 8,
      marginRight: 8,
      marginBottom: 2,
    },
    teacherBadge: {
      backgroundColor: colors.secondaryContainer,
    },
    statText: {
      fontSize: 12,
      color: colors.text,
      marginLeft: 4,
    },
    notifyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginLeft: 12,
      minWidth: 80,
      justifyContent: 'center',
    },
    notifyButtonText: {
      color: colors.textLight,
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
    },
  });

export default GroupHeader;