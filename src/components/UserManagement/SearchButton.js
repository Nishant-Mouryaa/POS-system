import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Searchbar, Portal, Modal, Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const SearchButton = ({ searchQuery, onSearch }) => {
  const styles = makeStyles(AdminPalette);
  const [visible, setVisible] = useState(false);
  const [tempQuery, setTempQuery] = useState(searchQuery);

  const showModal = () => {
    setTempQuery(searchQuery);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
  };

  const handleSearch = (query) => {
    setTempQuery(query);
    onSearch(query);
  };

  const clearSearch = () => {
    setTempQuery('');
    onSearch('');
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={showModal}
      >
        <Icon 
          name="magnify" 
          size={20} 
          color={searchQuery ? AdminPalette.primary : AdminPalette.text} 
        />
        {searchQuery && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        )}
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalSurface} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Users</Text>
              <TouchableOpacity onPress={hideModal}>
                <Icon name="close" size={24} color={AdminPalette.text} />
              </TouchableOpacity>
            </View>
            
            <Searchbar
              placeholder="Search by name, email, or role…"
              placeholderTextColor={AdminPalette.textMuted}
              onChangeText={handleSearch}
              value={tempQuery}
              style={styles.searchbar}
              inputStyle={styles.searchInput}
              icon="magnify"
              iconColor={AdminPalette.text}
              clearIcon="close"
            />
            
            <View style={styles.modalActions}>
              <Button 
                mode="outlined" 
                onPress={clearSearch}
                style={styles.actionButton}
              >
                Clear
              </Button>
              <Button 
                mode="contained" 
                onPress={hideModal}
                style={styles.actionButton}
              >
                Done
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    margin: 20,
    justifyContent: 'center',
  },
  modalSurface: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchbar: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 16,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    minWidth: 80,
  },
});

export default SearchButton; 