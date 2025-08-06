import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';
import SearchButton from './SearchButton';

const FilterBar = ({ 
  activeTab, 
  setActiveTab, 
  activeBoard, 
  setActiveBoard, 
  availableBoards,
  searchQuery,
  onSearch 
}) => {
  const styles = makeStyles(AdminPalette);
  const [visibleMenu, setVisibleMenu] = useState(null);

  const openMenu = (menu) => setVisibleMenu(menu);
  const closeMenu = () => setVisibleMenu(null);

  const userTypes = [
    { id: 'all', label: 'All Users' },
    { id: 'students', label: 'Students' },
    { id: 'teachers', label: 'Teachers' }
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeTab !== 'all') count++;
    if (activeBoard !== 'all') count++;
    if (searchQuery) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {/* Search Button */}
        <SearchButton searchQuery={searchQuery} onSearch={onSearch} />
        
        {/* User Type Filter */}
        <Menu
          visible={visibleMenu === 'userType'}
          onDismiss={closeMenu}
          anchor={
            <TouchableOpacity 
              onPress={() => openMenu('userType')}
              style={styles.filterButton}
            >
              <Icon 
                name="account-group" 
                size={20} 
                color={activeTab !== 'all' ? AdminPalette.primary : AdminPalette.text} 
              />
              {activeTab !== 'all' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              )}
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          {userTypes.map((type) => (
            <Menu.Item
              key={type.id}
              onPress={() => {
                setActiveTab(type.id);
                closeMenu();
              }}
              title={type.label}
              titleStyle={[
                styles.menuItemText,
                activeTab === type.id && styles.activeMenuItemText
              ]}
            />
          ))}
        </Menu>
        
        {/* Board Filter */}
        {availableBoards.length > 0 && (
          <Menu
            visible={visibleMenu === 'board'}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity 
                onPress={() => openMenu('board')}
                style={styles.filterButton}
              >
                <Icon 
                  name="school" 
                  size={20} 
                  color={activeBoard !== 'all' ? AdminPalette.primary : AdminPalette.text} 
                />
                {activeBoard !== 'all' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                setActiveBoard('all');
                closeMenu();
              }}
              title="All Boards"
              titleStyle={[
                styles.menuItemText,
                activeBoard === 'all' && styles.activeMenuItemText
              ]}
            />
            <Divider />
            {availableBoards.map((board) => (
              <Menu.Item
                key={board}
                onPress={() => {
                  setActiveBoard(board);
                  closeMenu();
                }}
                title={board}
                titleStyle={[
                  styles.menuItemText,
                  activeBoard === board && styles.activeMenuItemText
                ]}
              />
            ))}
          </Menu>
        )}
      </View>
      
      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </Text>
        </View>
      )}
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
  
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,

  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
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
  menuContent: {
    backgroundColor: colors.surface,
  },
  menuItemText: {
    color: colors.text,
  },
  activeMenuItemText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  summaryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default FilterBar; 