import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeActivityItem = ({ test, index, getPerformanceColor, getPerformanceIcon, formatTimeAgo, formatTimeTaken, styles, colors, onPress }) => {
  const performanceColor = getPerformanceColor(test.percentage);
  const performanceIcon = getPerformanceIcon(test.percentage);

  return (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={() => onPress(test)}
    >
      <View style={[styles.activityIconContainer, { backgroundColor: `${performanceColor}20` }] }>
        <MaterialCommunityIcons 
          name={performanceIcon} 
          size={20} 
          color={performanceColor} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText} numberOfLines={1}>
          {test.testName}
        </Text>
        <View style={styles.activitySubInfo}>
          <Text style={styles.activityScore}>
            {test.percentage}% • {test.score}/{test.totalQuestions}
          </Text>
          <Text style={styles.activityTime}>
            {formatTimeAgo(test.completedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HomeActivityItem; 