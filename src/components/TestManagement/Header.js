import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { Appbar, Text, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const Header = ({ 
  navigation, 
  tests, 
  onRefresh 
}) => {
  const styles = makeStyles(AdminPalette);
  
  // Stats data
  const stats = [
    {
      value: tests.length,
      label: 'Total Tests',
      icon: 'file-document-multiple',
      color: AdminPalette.primary
    },
    {
      value: tests.reduce((sum, test) => sum + (test.questions?.length || 0), 0),
      label: 'Questions',
      icon: 'help-circle',
      color: AdminPalette.success
    },
    {
      value: [...new Set(tests.map(t => t.subject))].length,
      label: 'Subjects',
      icon: 'book-open-variant',
      color: AdminPalette.warning
    }
  ];

  return (
    <View style={styles.headerContainer}>
      <StatusBar backgroundColor={AdminPalette.primaryDark} barStyle="light-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={AdminPalette.text} />
        <Appbar.Content 
          title="Test Library" 
          titleStyle={styles.headerTitle}
          subtitle={`${tests.length} tests available`}
          subtitleStyle={styles.headerSubtitle}
        />
        <Appbar.Action 
          icon="refresh" 
          onPress={onRefresh} 
          color={AdminPalette.text} 
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
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    marginTop: StatusBar.currentHeight || 0,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: `${colors.text}90`,
    fontSize: 14,
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
});

export default Header;