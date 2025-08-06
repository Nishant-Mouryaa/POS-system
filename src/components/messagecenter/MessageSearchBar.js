import React from 'react';
import { Surface, Searchbar } from 'react-native-paper';

const MessageSearchBar = ({ searchQuery, onChange, colors, styles }) => (
  <Surface style={styles.searchContainer} elevation={1}>
    <Searchbar
      placeholder="Search messages…"
      onChangeText={onChange}
      value={searchQuery}
      style={styles.searchbar}
      inputStyle={styles.searchInput}
      icon="magnify"
      clearIcon="close"
    />
  </Surface>
);

export default MessageSearchBar; 