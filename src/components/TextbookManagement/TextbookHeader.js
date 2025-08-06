import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Appbar, Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';
import TextbookSearchBar from './TextbookSearchBar';

const TextbookHeader = ({ textbooks, onBack, onRefresh }) => {
  const styles = makeStyles(AdminPalette);
  
  const stats = [
    {
      value: textbooks.length,
      label: 'Books',
      icon: 'book-multiple',
      color: AdminPalette.primary
    },
    {
      value: [...new Set(textbooks.map(t => t.subject))].length,
      label: 'Subjects',
      icon: 'bookshelf',
      color: AdminPalette.success
    },
    {
      value: [...new Set(textbooks.map(t => t.standard))].length,
      label: 'Classes',
      icon: 'account-group',
      color: AdminPalette.warning
    }
  ];

  return (
    <View style={styles.headerContainer}>
      <StatusBar backgroundColor={AdminPalette.primaryDark} barStyle="light-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={onBack} color={AdminPalette.text} />
        <Appbar.Content 
          title="Textbook Library" 
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action 
          icon="refresh" 
          onPress={onRefresh} 
          color={AdminPalette.text} 
          size={24}
          style={styles.refreshButton}
        />
      </Appbar.Header>
      
      <View style={styles.topBar}>
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View key={stat.label} style={styles.statChip}>
              <Icon 
                name={stat.icon} 
                size={16} 
                color={stat.color} 
                style={styles.statIcon}
              />
              <Text style={[styles.statText, { color: stat.color }]}>
                {stat.value} {stat.label}
              </Text>

            </View>
          ))}
        </View>
      
        
      </View>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  headerContainer: {
    paddingBottom: 8,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    marginTop: StatusBar.currentHeight || 0,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButton: {
    margin: 0,
  },
});



export default TextbookHeader;