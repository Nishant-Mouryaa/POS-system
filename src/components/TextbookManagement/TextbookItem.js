import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Card, Button, Divider, Chip, Text, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

function hexToRgba(hex, alpha = 1) {
  const color = hex.replace(/^#/, '');
  const bigint = parseInt(color, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
const TextbookItem = memo(function TextbookItem({
  item,
  navigation,
  handleEditTextbook,
  handleDelete,
  getBoardColor
}) {
  const boardColor = getBoardColor(item.board);
  const boardTintColor = `${boardColor}15`; // 8% opacity

  const getSubjectIcon = (subject) => {
    const icons = {
      'Mathematics': 'calculator',
      'Physics': 'atom',
      'Chemistry': 'flask',
      'Biology': 'leaf',
      'Science': 'microscope',
      'English': 'alphabetical',
      'History': 'history',
      'Geography': 'earth',
      'Economics': 'finance',
      'Hindi': 'alphabet-devanagari',
      'Marathi': 'alphabet-cyrillic',
      'Sanskrit': 'alphabetical-variant',
    };
    return icons[subject] || 'book';
  };

  return (
    <Surface style={styles.card} elevation={1}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('PdfViewer', { 
          pdfUrl: item.pdfUrl, 
          title: item.title 
        })}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: boardTintColor }
            ]}>
              <Icon 
                name={getSubjectIcon(item.subject)} 
                size={24} 
                color={boardColor} 
              />
            </View>
            <View style={styles.cardInfo}>
              <Text variant="titleMedium" style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text variant="bodyMedium" style={styles.cardSubject} numberOfLines={1}>
                {item.subject}
              </Text>
              <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                  <Icon name="school" size={14} color={AdminPalette.textMuted} />
                  <Text variant="labelSmall" style={styles.metaText}>
                    {item.board}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="account-group" size={14} color={AdminPalette.textMuted} />
                  <Text variant="labelSmall" style={styles.metaText}>
                    Class {item.standard}
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
                    backgroundColor: boardColor,
                    color: AdminPalette.textLight
                  }
                ]}
              >
                <Icon name="file" size={16} color={AdminPalette.textLight} />
              </Badge>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <Divider style={styles.cardDivider} />
      
      <View style={styles.cardActions}>
        <Button 
          mode="text" 
          icon="eye-outline"
          onPress={() => navigation.navigate('PdfViewer', { 
            pdfUrl: item.pdfUrl, 
            title: item.title 
          })}
          compact
          textColor={AdminPalette.text}
          style={styles.actionButton}
          labelStyle={styles.actionButtonLabel}
        >
          View
        </Button>
        <Button 
          mode="text" 
          icon="pencil-outline"
          onPress={() => handleEditTextbook(item)}
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
          onPress={() => handleDelete(item.id, item.title)}
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
});

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
  cardTitle: {
    color: AdminPalette.text,
    marginBottom: 4,
    fontWeight: '600',
  },
  cardSubject: {
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

export default TextbookItem;