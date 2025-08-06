import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette } from '../../theme/colors';

const SignupHeader = ({ colors }) => {
  return (
    <View style={styles.header}>
      <MaterialCommunityIcons
        name="account-plus"
        size={48}
        color={colors.primary}
        style={styles.headerIcon}
      />
      <Text style={[styles.title, { color: Palette.textLight }]}>
        Create Account
      </Text>
      <Text style={[styles.subtitle, { color: Palette.textLight }]}>
        Join us to continue your learning journey
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default SignupHeader; 