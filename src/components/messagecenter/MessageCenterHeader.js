import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';

const MessageCenterHeader = ({ unreadCount, onMarkAllAsRead, liveIndicatorAnim, colors, filteredCount, totalCount, activeFilter }) => (
  <View style={styles.headerContainer(colors)}>
    <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>{'Messages'}</Text>
      <View style={styles.headerActions}>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.unreadCountContainer} onPress={onMarkAllAsRead}>
            <Text style={styles.unreadCountText}>{unreadCount} unread</Text>
            <Icon name="check-all" size={16} color={Palette.textLight} />
          </TouchableOpacity>
        )}
       
      </View>
    </View>
    <Text style={styles.headerSubtitle}>
      {activeFilter === 'all' 
        ? `${totalCount} messages received from Admin`
        : `${filteredCount} of ${totalCount} messages (${activeFilter})`
      }
    </Text>
  </View>
);

const styles = {
  headerContainer: (colors) => ({
    paddingBottom: 16,
    paddingTop: 0,
  }),
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.textLight,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Palette.textLight,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unreadCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  unreadCountText: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '600',
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: Palette.textLight,
    fontWeight: '600',
  },
};

export default MessageCenterHeader; 