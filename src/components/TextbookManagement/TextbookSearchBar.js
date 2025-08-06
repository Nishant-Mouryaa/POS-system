import React from 'react';
import { Searchbar } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { AdminPalette } from '../../theme/colors';

const TextbookSearchBar = ({ searchQuery, onSearch }) => {
  const styles = makeStyles(AdminPalette);
  
  return (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search textbooks..."
        placeholderTextColor={AdminPalette.textMuted}
        onChangeText={onSearch}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        icon="magnify"
        iconColor={AdminPalette.text}
        clearIcon="close"
        onIconPress={() => console.log('Search icon pressed')} // Optional
        onSubmitEditing={() => console.log('Search submitted')} // Optional
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    flex: 1, // Important if in a flex container
  },
  searchbar: {
    backgroundColor: colors.surface,
    elevation: 1, // Small elevation for better visibility
    height: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  searchInput: {
    fontSize: 14,
    color: colors.text,
    minHeight: 0,
    paddingVertical: 0,
    includeFontPadding: false, // Removes extra padding
  },
});

export default TextbookSearchBar;