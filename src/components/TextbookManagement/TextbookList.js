import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Button, Title, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';
import TextbookItem from './TextbookItem';

const TextbookList = ({
  filteredTextbooks,
  navigation,
  handleEditTextbook,
  handleDelete,
  getBoardColor,
  searchQuery,
  handleAddTextbook,
}) => {
  const styles = makeStyles(AdminPalette);
  return (
    <FlatList
      data={filteredTextbooks}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={21}
      renderItem={({ item }) => (
        <TextbookItem 
          item={item}
          navigation={navigation}
          handleEditTextbook={handleEditTextbook}
          handleDelete={handleDelete}
          getBoardColor={getBoardColor}
        />
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="book-open-blank-variant" size={64} color={AdminPalette.textMuted} />
          </View>
          <Title style={styles.emptyTitle}>No Textbooks Found</Title>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Start by adding your first textbook'
            }
          </Text>
          {!searchQuery && (
            <Button 
              mode="contained" 
              onPress={handleAddTextbook}
              style={styles.emptyButton}
              icon="plus"
            >
              Add First Textbook
            </Button>
          )}
        </View>
      }
    />
  );
};

const makeStyles = (colors) => StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
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
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: AdminPalette.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted, 
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
  emptyButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
});

export default TextbookList; 