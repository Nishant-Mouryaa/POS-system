import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeActivityItem from './HomeActivityItem';
import { Palette } from '../../theme/colors';

const HomeRecentActivity = ({ recentTests, loadingActivity, styles, colors, onActivityPress, getPerformanceColor, getPerformanceIcon, formatTimeAgo, formatTimeTaken }) => (
  <View style={styles.activityCard}>
    {loadingActivity ? (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons 
          name="loading" 
          size={24} 
          color={colors.primary} 
          style={{ marginRight: 8 }}
        />
        <Text style={styles.loadingText}>Loading recent activity...</Text>
      </View>
    ) : recentTests.length > 0 ? (
      recentTests.map((test, index) => (
        <HomeActivityItem
          key={test.id}
          test={test}
          index={index}
          getPerformanceColor={getPerformanceColor}
          getPerformanceIcon={getPerformanceIcon}
          formatTimeAgo={formatTimeAgo}
          formatTimeTaken={formatTimeTaken}
          styles={styles}
          colors={colors}
          onPress={onActivityPress}
        />
      ))
    ) : (
      <View style={styles.emptyActivityContainer}>
        <MaterialCommunityIcons 
          name="clipboard-text-off-outline" 
          size={48} 
          color={Palette.textMuted} 
        />
        <Text style={styles.emptyActivityTitle}>No Recent Activity</Text>
        <Text style={styles.emptyActivityText}>
          Start taking tests to see your recent activity here!
        </Text>
      </View>
    )}
  </View>
);

export default HomeRecentActivity; 