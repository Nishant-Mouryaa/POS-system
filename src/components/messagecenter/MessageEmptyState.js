import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';

const MessageEmptyState = ({ searchQuery, activeFilter, styles }) => {
  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        icon: 'magnify',
        title: 'No Results Found',
        text: 'No messages match your search criteria.',
      };
    }
    
    switch (activeFilter) {
      case 'unread':
        return {
          icon: 'email',
          title: 'No Unread Messages',
          text: 'All your messages have been read.',
        };
      case 'read':
        return {
          icon: 'email-open-outline',
          title: 'No Read Messages',
          text: 'You have no read messages yet.',
        };
      default:
        return {
          icon: 'email-outline',
          title: 'No Messages',
          text: "You don't have any messages yet.",
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name={content.icon} size={64} color={Palette.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{content.title}</Text>
      <Text style={styles.emptyText}>{content.text}</Text>
    </View>
  );
};

export default MessageEmptyState; 