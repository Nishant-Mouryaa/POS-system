import React from 'react';
import { View, Animated } from 'react-native';
import { Title, Text, Surface, TouchableRipple, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminQuickActions = ({ navigation, fadeAnim, styles, palette }) => (
  <Animated.View 
    style={[
      styles.quickActionsSection,
      {
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [40, 0],
          }),
        }],
      },
    ]}
  >
    <Title style={styles.sectionTitle}>Quick Actions</Title>
    <Surface style={styles.quickActionsContainer} elevation={2}>
      <TouchableRipple
        onPress={() => navigation.navigate('TextbookManagement')}
        style={styles.quickActionItem}
        rippleColor={`${palette.primary}20`}
      >
        <View style={styles.quickActionContent}>
          <Icon name="book-plus" size={24} color={palette.primary} />
          <Text style={styles.quickActionText}>Add Textbook</Text>
          <Icon name="chevron-right" size={20} color={palette.textMuted} />
        </View>
      </TouchableRipple>
      <Divider style={styles.divider} />
      <TouchableRipple
        onPress={() => navigation.navigate('TestManagement')}
        style={styles.quickActionItem}
        rippleColor={`${palette.accent}20`}
      >
        <View style={styles.quickActionContent}>
          <Icon name="file-plus" size={24} color={palette.accent} />
          <Text style={styles.quickActionText}>Create Test</Text>
          <Icon name="chevron-right" size={20} color={palette.textMuted} />
        </View>
      </TouchableRipple>
      <Divider style={styles.divider} />
      <TouchableRipple
        onPress={() => navigation.navigate('UserManagement')}
        style={styles.quickActionItem}
        rippleColor={`${palette.warning}20`}
      >
        <View style={styles.quickActionContent}>
          <Icon name="account-plus" size={24} color={palette.warning} />
          <Text style={styles.quickActionText}>Add User</Text>
          <Icon name="chevron-right" size={20} color={palette.textMuted} />
        </View>
      </TouchableRipple>
      {/* <Divider style={styles.divider} />
      <TouchableRipple
        onPress={() => navigation.navigate('NotificationDebug')}
        style={styles.quickActionItem}
        rippleColor={`${palette.info}20`}
      >
        <View style={styles.quickActionContent}>
          <Icon name="bell-alert" size={24} color={palette.info} />
          <Text style={styles.quickActionText}>Notification Debug</Text>
          <Icon name="chevron-right" size={20} color={palette.textMuted} />
        </View>
      </TouchableRipple> */}
    </Surface>
  </Animated.View>
);

export default AdminQuickActions; 