import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Animated } from 'react-native';
import MessageCard from './MessageCard';
import MessageEmptyState from './MessageEmptyState';

const MessageList = ({
  messages,
  readMessages,
  animationValues,
  colors,
  styles,
  onMessagePress,
  copyToClipboard,
  isRefreshing,
  onRefresh,
  loading,
  searchQuery,
  activeFilter,
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading messages…</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <MessageEmptyState 
          searchQuery={searchQuery} 
          activeFilter={activeFilter}
          styles={styles} 
        />
      }
      renderItem={({ item }) => (
        <MessageCard
          item={item}
          isUnread={!readMessages.has(item.id)}
          animValue={animationValues.current[item.id] || new Animated.Value(0)}
          colors={colors}
          styles={styles}
          onPress={onMessagePress}
          copyToClipboard={copyToClipboard}
        />
      )}
    />
  );
};

export default MessageList; 