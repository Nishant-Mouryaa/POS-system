import React from 'react';
import { View, StyleSheet, StatusBar, Animated } from 'react-native';
import { Appbar, Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const Header = ({ 
  navigation, 
  totalUsers, 
  totalStudents, 
  totalTeachers, 
  scrollY, 
  onRefresh 
}) => {
  const styles = makeStyles(AdminPalette);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [140, 80],
    extrapolate: 'clamp',
  });

  const stats = [
    {
      value: totalUsers,
      label: 'Total Users',
      icon: 'account-group',
      color: AdminPalette.primary
    },
    {
      value: totalStudents,
      label: 'Students',
      icon: 'school',
      color: AdminPalette.success
    },
    {
      value: totalTeachers,
      label: 'Teachers',
      icon: 'school',
      color: AdminPalette.warning
    }
  ];

  return (
    <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
      <StatusBar backgroundColor={AdminPalette.primaryDark} barStyle="light-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color={AdminPalette.text}
        />
        <Appbar.Content
          title="User Management"
          titleStyle={styles.headerTitle}
          subtitle={`${totalUsers} users registered`}
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
          {stats.map((stat) => (
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
    </Animated.View>
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