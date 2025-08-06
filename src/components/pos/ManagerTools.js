import React from 'react';
import { Text } from 'react-native-paper';
import QuickActionItem from './QuickActionItem';

const ManagerTools = ({ isManager, onDashboardPress, featureAnimations, pulseAnim, styles }) => {
  if (!isManager) return null;
  return (
    <>
      <Text style={styles.sectionTitle}>Manager Tools</Text>
      <QuickActionItem
        icon="chart-box"
        title="Reports"
        onPress={onDashboardPress}
        index={0}
        featureAnimations={featureAnimations}
        pulseAnim={pulseAnim}
        styles={styles}
      />
      <QuickActionItem
        icon="account-cog"
        title="Staff"
        onPress={() => onDashboardPress('staff')}
        index={1}
        featureAnimations={featureAnimations}
        pulseAnim={pulseAnim}
        styles={styles}
      />
    </>
  );
};

export default ManagerTools;