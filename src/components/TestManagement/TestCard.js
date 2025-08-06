import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, Button, Badge, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const TestCard = ({ 
  test, 
  onEdit, 
  onDelete, 
  onPreview
}) => {
  const getSubjectIcon = (subject) => {
    const icons = {
      'Mathematics': 'calculator',
      'Physics': 'atom',
      'Chemistry': 'flask',
      'Biology': 'leaf',
      'Science': 'microscope',
      'English': 'alphabetical',
      'History': 'history',
    };
    return icons[subject] || 'book';
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': AdminPalette.primary,
      'Physics': AdminPalette.accent,
      'Chemistry': AdminPalette.warning,
      'Biology': AdminPalette.success,
      'Science': AdminPalette.info,
      'English': AdminPalette.chart5, // Using purple from chart colors
      'History': AdminPalette.chart6, // Using pink from chart colors
    };
    return colors[subject] || AdminPalette.textMuted;
  };

  const subjectColor = getSubjectColor(test.subject);
  const subjectTintColor = `${subjectColor}15`; // 8% opacity

  return (
    <Surface style={styles.card} elevation={1}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => onPreview(test)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: subjectTintColor }
            ]}>
              <Icon 
                name={getSubjectIcon(test.subject)} 
                size={24} 
                color={subjectColor} 
              />
            </View>
            <View style={styles.cardInfo}>
              <Text variant="titleMedium" style={styles.cardSubject}>
                {test.subject}
              </Text>
              <Text variant="bodyMedium" style={styles.cardChapter} numberOfLines={1}>
                {test.chapter}
              </Text>
              <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                  <Icon name="school" size={14} color={AdminPalette.textMuted} />
                  <Text variant="labelSmall" style={styles.metaText}>
                    {test.board}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="account-group" size={14} color={AdminPalette.textMuted} />
                  <Text variant="labelSmall" style={styles.metaText}>
                    Class {test.standard}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="clock-outline" size={14} color={AdminPalette.textMuted} />
                  <Text variant="labelSmall" style={styles.metaText}>
                    {test.duration || 'N/A'} mins
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.cardBadge}>
              <Badge 
                size={28} 
                style={[
                  styles.badge, 
                  { 
                    backgroundColor: subjectColor,
                    color: AdminPalette.textLight
                  }
                ]}
              >
                {test.questions?.length || 0}
              </Badge>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <Divider style={styles.cardDivider} />
      
      <View style={styles.cardActions}>
        <Button 
          mode="text" 
          icon="pencil-outline"
          onPress={() => onEdit(test)}
          compact
          textColor={AdminPalette.textMuted}
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
        >
          Edit
        </Button>
        <Button 
          mode="text" 
          icon="delete-outline"
          onPress={() => onDelete(test.id, test)}
          compact
          textColor={AdminPalette.error}
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
        >
          Delete
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: AdminPalette.surfaceLight,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AdminPalette.divider,
  },
  cardContent: {
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardSubject: {
    color: AdminPalette.text,
    marginBottom: 4,
    fontWeight: '600',
  },
  cardChapter: {
    color: AdminPalette.textMuted,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: AdminPalette.textMuted,
  },
  cardBadge: {
    justifyContent: 'center',
  },
  badge: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDivider: {
    backgroundColor: AdminPalette.divider,
    height: 1,
    marginHorizontal: 0,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: AdminPalette.surface,
  },
  actionButton: {
    marginHorizontal: 4,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default TestCard;