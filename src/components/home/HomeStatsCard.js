import React from 'react';
import { View, Animated } from 'react-native';
import { Text } from 'react-native-paper';

const HomeStatsCard = ({ userData, statsCardScale, colors, styles }) => (
  <Animated.View style={[styles.statsCard, { transform: [{ scale: statsCardScale }] }] }>
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{userData?.completedTests ?? 0}</Text>
        <Text style={styles.statLabel}>Completed Tests</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>
          {userData?.avgScore ? `${userData.avgScore}%` : 'N/A'}
        </Text>
        <Text style={styles.statLabel}>Avg. Score</Text>
      </View>
    </View>
  </Animated.View>
);

export default HomeStatsCard; 