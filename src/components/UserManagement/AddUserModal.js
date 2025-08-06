// components/UserManagement/AddUserModal.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {
  Portal,
  Surface,
  Text,
  TextInput,
  Button,
  IconButton,
  HelperText,
  Divider,
  RadioButton,
  Switch,
  ActivityIndicator,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const AddUserModal = ({
  visible,
  onDismiss,
  onSave,
  saving,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '', // For display purposes only
    role: 'Student',
    isAdmin: false,
    grade: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const grades = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const states = [
    'Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu',
    'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Madhya Pradesh',
    'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab', 'Haryana',
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.role === 'Student' && !formData.grade) {
      newErrors.grade = 'Grade is required for students';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.address.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'Student',
      isAdmin: false,
      grade: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
      },
    });
    setErrors({});
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => {
          if (!saving) {
            onDismiss();
            resetForm();
          }
        }}
        transparent={true}
        animationType="slide"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Surface style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Icon name="account-plus" size={28} color={AdminPalette.primary} />
                  <Text variant="titleLarge" style={styles.modalTitle}>Add New User</Text>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => {
                    if (!saving) {
                      onDismiss();
                      resetForm();
                    }
                  }}
                  disabled={saving}
                  iconColor={AdminPalette.textMuted}
                />
              </View>

              <Divider style={styles.divider} />

              {/* Form */}
              <View style={styles.form}>
                {/* Basic Information */}
                <Text variant="titleSmall" style={styles.sectionTitle}>Basic Information</Text>

                <TextInput
                  label="Full Name"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.fullName}
                  disabled={saving}
                  outlineColor={AdminPalette.border}
                  activeOutlineColor={AdminPalette.primary}
                />
                <HelperText type="error" visible={!!errors.fullName}>
                  {errors.fullName}
                </HelperText>

                <TextInput
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text.toLowerCase() })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                  disabled={saving}
                  outlineColor={AdminPalette.border}
                  activeOutlineColor={AdminPalette.primary}
                />
                <HelperText type="error" visible={!!errors.email}>
                  {errors.email}
                </HelperText>

                <View style={styles.passwordContainer}>
                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    style={[styles.input, styles.passwordInput]}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    error={!!errors.password}
                    disabled={saving}
                    outlineColor={AdminPalette.border}
                    activeOutlineColor={AdminPalette.primary}
                    right={
                      <TextInput.Icon 
                        icon={showPassword ? 'eye-off' : 'eye'} 
                        onPress={() => setShowPassword(!showPassword)}
                        color={AdminPalette.textMuted}
                        disabled={saving}
                      />
                    }
                  />
                </View>
                <HelperText type="error" visible={!!errors.password}>
                  {errors.password}
                </HelperText>

                <Divider style={styles.sectionDivider} />

                {/* Role Selection */}
                <Text variant="titleSmall" style={styles.sectionTitle}>Role & Permissions</Text>

                <View style={styles.roleContainer}>
                  <Text variant="labelLarge" style={styles.fieldLabel}>User Role</Text>
                  <RadioButton.Group
                    onValueChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        role: value,
                        isAdmin: value === 'Teacher' ? formData.isAdmin : false,
                        grade: value === 'Teacher' ? '' : formData.grade
                      });
                    }}
                    value={formData.role}
                  >
                    <View style={styles.radioRow}>
                      <View style={styles.radioItem}>
                        <RadioButton.Item 
                          label="Student" 
                          value="Student" 
                          position="leading"
                          labelStyle={styles.radioLabel}
                          disabled={saving}
                          color={AdminPalette.primary}
                        />
                      </View>
                      <View style={styles.radioItem}>
                        <RadioButton.Item 
                          label="Teacher" 
                          value="Teacher" 
                          position="leading"
                          labelStyle={styles.radioLabel}
                          disabled={saving}
                          color={AdminPalette.primary}
                        />
                      </View>
                    </View>
                  </RadioButton.Group>
                </View>

                {formData.role === 'Teacher' && (
                  <View style={styles.adminContainer}>
                    <Text variant="labelLarge" style={styles.fieldLabel}>Admin Privileges</Text>
                    <View style={styles.switchRow}>
                      <Text variant="bodyMedium" style={styles.switchLabel}>Grant admin access</Text>
                      <Switch
                        value={formData.isAdmin}
                        onValueChange={(value) => setFormData({ ...formData, isAdmin: value })}
                        disabled={saving}
                        color={AdminPalette.primary}
                      />
                    </View>
                  </View>
                )}

                {formData.role === 'Student' && (
                  <>
                    <Text variant="labelLarge" style={styles.fieldLabel}>Grade/Class</Text>
                    <Surface style={styles.pickerSurface} elevation={1}>
                      <Picker
                        selectedValue={formData.grade}
                        onValueChange={(value) => setFormData({ ...formData, grade: value })}
                        style={styles.picker}
                        enabled={!saving}
                        dropdownIconColor={AdminPalette.textMuted}
                      >
                        <Picker.Item label="Select Grade" value="" />
                        {grades.map((grade) => (
                          <Picker.Item key={grade} label={`Class ${grade}`} value={grade} />
                        ))}
                      </Picker>
                    </Surface>
                    <HelperText type="error" visible={!!errors.grade}>
                      {errors.grade}
                    </HelperText>
                  </>
                )}

                <Divider style={styles.sectionDivider} />

                {/* Address Information */}
                <Text variant="titleSmall" style={styles.sectionTitle}>Address Information</Text>

                <TextInput
                  label="Street Address (Optional)"
                  value={formData.address.street}
                  onChangeText={(text) => 
                    setFormData({ 
                      ...formData, 
                      address: { ...formData.address, street: text } 
                    })
                  }
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  disabled={saving}
                  outlineColor={AdminPalette.border}
                  activeOutlineColor={AdminPalette.primary}
                />

                <TextInput
                  label="City"
                  value={formData.address.city}
                  onChangeText={(text) => 
                    setFormData({ 
                      ...formData, 
                      address: { ...formData.address, city: text } 
                    })
                  }
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.city}
                  disabled={saving}
                  outlineColor={AdminPalette.border}
                  activeOutlineColor={AdminPalette.primary}
                />
                <HelperText type="error" visible={!!errors.city}>
                  {errors.city}
                </HelperText>

                <View style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <Text variant="labelLarge" style={styles.fieldLabel}>State</Text>
                    <Surface style={styles.pickerSurface} elevation={1}>
                      <Picker
                        selectedValue={formData.address.state}
                        onValueChange={(value) => 
                          setFormData({ 
                            ...formData, 
                            address: { ...formData.address, state: value } 
                          })
                        }
                        style={styles.picker}
                        enabled={!saving}
                        dropdownIconColor={AdminPalette.textMuted}
                      >
                        <Picker.Item label="Select State" value="" />
                        {states.map((state) => (
                          <Picker.Item key={state} label={state} value={state} />
                        ))}
                      </Picker>
                    </Surface>
                    <HelperText type="error" visible={!!errors.state}>
                      {errors.state}
                    </HelperText>
                  </View>

                  <View style={styles.halfWidth}>
                    <TextInput
                      label="Pincode"
                      value={formData.address.pincode}
                      onChangeText={(text) => 
                        setFormData({ 
                          ...formData, 
                          address: { ...formData.address, pincode: text } 
                        })
                      }
                      style={styles.input}
                      mode="outlined"
                      keyboardType="numeric"
                      maxLength={6}
                      error={!!errors.pincode}
                      disabled={saving}
                      outlineColor={AdminPalette.border}
                      activeOutlineColor={AdminPalette.primary}
                    />
                    <HelperText type="error" visible={!!errors.pincode}>
                      {errors.pincode}
                    </HelperText>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    if (!saving) {
                      onDismiss();
                      resetForm();
                    }
                  }}
                  style={styles.actionButton}
                  disabled={saving}
                  textColor={AdminPalette.primary}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.actionButton, styles.submitButton]}
                  loading={saving}
                  disabled={saving}
                  buttonColor={AdminPalette.primary}
                  textColor={AdminPalette.textLight}
                >
                  {saving ? 'Creating User...' : 'Create User'}
                </Button>
              </View>
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    backgroundColor: AdminPalette.surface,
    overflow: 'hidden',
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: AdminPalette.surfaceVariant,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    marginLeft: 12,
    color: AdminPalette.text,
  },
  divider: {
    backgroundColor: AdminPalette.divider,
    height: 1,
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
    color: AdminPalette.text,
  },
  sectionDivider: {
    marginVertical: 24,
    backgroundColor: AdminPalette.divider,
    height: 1,
  },
  input: {
    marginBottom: 4,
    backgroundColor: AdminPalette.surfaceLight,
  },
  fieldLabel: {
    marginBottom: 8,
    color: AdminPalette.textMuted,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
  },
  roleContainer: {
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  radioItem: {
    flex: 1,
    maxWidth: '48%',
  },
  radioLabel: {
    textAlign: 'left',
    color: AdminPalette.text,
  },
  adminContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: AdminPalette.surfaceLight,
    borderRadius: 8,
  },
  switchLabel: {
    color: AdminPalette.text,
  },
  pickerSurface: {
    borderRadius: 4,
    backgroundColor: AdminPalette.surfaceLight,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AdminPalette.border,
  },
  picker: {
    height: 56,
    color: AdminPalette.text,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: AdminPalette.primary,
  },
  submitButton: {
    backgroundColor: AdminPalette.primary,
  },
});

export default AddUserModal;