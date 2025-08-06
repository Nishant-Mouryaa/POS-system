import React from 'react';
import { Text } from 'react-native-paper';
import HomeQuickActionItem from './HomeQuickActionItem';

const HomeAdminTools = ({ isAdmin, onDashboardPress, featureAnimations, pulseAnim, styles }) => {
  if (!isAdmin) return null;
  return (
    <>
      <Text style={styles.sectionTitle}>Admin Tools</Text>
      <HomeQuickActionItem
        icon="shield-account"
        title="Dashboard"
        onPress={onDashboardPress}
        index={0}
        featureAnimations={featureAnimations}
        pulseAnim={pulseAnim}
        styles={styles}
      />
    </>
  );
};

export default HomeAdminTools; 