import React from 'react';
import { View, StyleSheet, Platform, TouchableWithoutFeedback } from 'react-native';
import { Text } from 'react-native-paper';
import { Palette } from '../../theme/colors';

const RoleSelection = ({ role, setRole,  }) => {
  return (
    <View style={styles.roleSelection}>
      <Text style={[styles.label, { color: Palette.textLight }]}>I am a</Text>
      <View style={styles.roleToggleContainer}>
        <TouchableWithoutFeedback onPress={() => setRole('Student')}>
          <View
            style={[
              styles.roleToggle,
              role === 'Student' && [styles.roleToggleSelected, { backgroundColor: Palette.primaryXXLight, borderColor: Palette.primary }],
            ]}
          >
            <Text
              style={[
                styles.roleToggleText,
                { color: Palette.text },
                role === 'Student' && [styles.roleToggleTextSelected, { color: Palette.primary }],
              ]}
            >
              Student
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => setRole('Teacher')}>
          <View
            style={[
              styles.roleToggle,
              role === 'Teacher' && [styles.roleToggleSelected, { backgroundColor: Palette.primaryXXLight, borderColor: Palette.primary }],
            ]}
          >
            <Text
              style={[
                styles.roleToggleText,
                { color: Palette.text },
                role === 'Teacher' && [styles.roleToggleTextSelected, { color: Palette.primary }],
              ]}
            >
              Teacher
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  roleSelection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  roleToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  roleToggle: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  roleToggleSelected: {
    borderColor: 'transparent',
  },
  roleToggleText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  roleToggleTextSelected: {
    fontWeight: '700',
  },
});

export default RoleSelection; 