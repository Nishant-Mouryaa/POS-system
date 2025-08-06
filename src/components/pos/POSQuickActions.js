import React from 'react';
import { View } from 'react-native';
import QuickActionItem from './QuickActionItem';

const POSQuickActions = ({ actions, featureAnimations, pulseAnim, styles }) => (
  <View style={styles.featuresGrid}>
    {actions.map((action, idx) => (
      <QuickActionItem
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

export default POSQuickActions;