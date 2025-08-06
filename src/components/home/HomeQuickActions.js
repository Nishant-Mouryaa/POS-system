import React from 'react';
import { View } from 'react-native';
import HomeQuickActionItem from './HomeQuickActionItem';

const HomeQuickActions = ({ actions, featureAnimations, pulseAnim, styles }) => (
  <View style={styles.featuresGrid}>
    {actions.map((action, idx) => (
      <HomeQuickActionItem
        key={action.title}
        icon={action.icon}
        title={action.title}
        onPress={action.onPress}
        index={idx}
        featureAnimations={featureAnimations}
        pulseAnim={pulseAnim}
        styles={styles}
      />
    ))}
  </View>
);

export default HomeQuickActions; 