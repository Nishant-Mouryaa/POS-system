import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Surface, 
  Text, 
  TextInput, 
  HelperText,
  Button,
  Icon,
  Title
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { AdminPalette } from '../../theme/colors';

const TestForm = ({
  formData,
  onFormDataChange,
  errors,
  isEditing,
  saving,
  onSubmit,
  onCancel,
  getSubjectsByBoardAndStandard = () => []
}) => {
  const subjects = getSubjectsByBoardAndStandard(formData.board, formData.standard);
  const boards = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'];
  const standards = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <View style={styles.container}>
      <View style={styles.modalHeader}>
        <View style={[styles.modalIconContainer, { backgroundColor: `${AdminPalette.primary}15` }]}>
          <Icon 
            name={isEditing ? "clipboard-edit" : "clipboard-plus"} 
            size={32} 
            color={AdminPalette.primary}
          />
        </View>
        <Title style={styles.modalTitle}>
          {isEditing ? 'Edit Test' : 'Create New Test'}
        </Title>
        <Text style={styles.modalSubtitle}>
          Fill in the test details and questions
        </Text>
      </View>

      <Surface style={styles.formSection} elevation={1}>
        <Text style={styles.sectionTitle}>Test Information</Text>
        
        <View style={styles.formGrid}>
          <View style={styles.formColumn}>
            <Text style={styles.inputLabel}>Education Board</Text>
            <Surface style={styles.pickerSurface} elevation={1}>
              <Picker
                selectedValue={formData.board}
                onValueChange={(value) => onFormDataChange('board', value)}
                dropdownIconColor={AdminPalette.primary}
                style={styles.picker}
              >
                {boards.map(board => (
                  <Picker.Item 
                    key={board} 
                    label={board} 
                    value={board} 
                  />
                ))}
              </Picker>
            </Surface>
          </View>
          
          <View style={styles.formColumn}>
  <Text style={styles.inputLabel}>Class</Text>
  <Surface style={styles.pickerSurface} elevation={1}>
    <Picker
      selectedValue={formData.standard}
      onValueChange={(value) => onFormDataChange('standard', value)}
      dropdownIconColor={AdminPalette.primary}
      style={styles.picker}
    >
      <Picker.Item label="Select" value="" />
      {(formData.board === 'CBSE' || formData.board === 'State Board') ? (
        Array.from({ length: 10 }, (_, i) => i + 1).map(std => (
          <Picker.Item key={std} label={`Class ${std}`} value={std.toString()} />
        ))
      ) : (
        standards.map(std => (
          <Picker.Item key={std} label={`Class ${std}`} value={std.toString()} />
        ))
      )}
    </Picker>
  </Surface>
  {errors.standard && (
    <HelperText type="error" visible>
      {errors.standard}
    </HelperText>
  )}
</View>
        </View>
        
        <View style={styles.formFullWidth}>
  <Text style={styles.inputLabel}>Subject</Text>
  <Surface style={styles.pickerSurface} elevation={1}>
    <Picker
      selectedValue={formData.subject}
      onValueChange={(value) => onFormDataChange('subject', value)}
      dropdownIconColor={AdminPalette.primary}
      style={styles.picker}
    >
      <Picker.Item label="Select Subject" value="" />
      {subjects.map(subject => (
        <Picker.Item key={subject} label={subject} value={subject} />
      ))}
    </Picker>
  </Surface>
  {errors.subject && (
    <HelperText type="error" visible>
      {errors.subject}
    </HelperText>
  )}
</View>
        
        <TextInput
          label="Chapter Name"
          placeholder="Enter Chapter Name"
          placeholderTextColor={AdminPalette.textMuted}
          value={formData.chapter}
          onChangeText={(text) => onFormDataChange('chapter', text)}
          style={styles.input}
          mode="outlined"
          error={!!errors.chapter}
          outlineColor={AdminPalette.divider}
          activeOutlineColor={AdminPalette.primary}
          left={<TextInput.Icon icon="bookmark" color={AdminPalette.text} />}
        />
        {errors.chapter && (
          <HelperText type="error" visible>
            {errors.chapter}
          </HelperText>
        )}
        
<TextInput
  label="Duration (minutes)"
  placeholder="Enter test duration in minutes"
  placeholderTextColor={AdminPalette.textMuted}
  value={formData.duration ? formData.duration.toString() : ''}
  onChangeText={(text) => onFormDataChange('duration', text.replace(/[^0-9]/g, ''))}
  style={styles.input}
  mode="outlined"
  error={!!errors.duration}
  outlineColor={AdminPalette.divider}
  activeOutlineColor={AdminPalette.primary}
  keyboardType="numeric"
  left={<TextInput.Icon icon="timer" color={AdminPalette.text} />}
/>
{errors.duration && (
  <HelperText type="error" visible>
    {errors.duration}
  </HelperText>
)}
      </Surface>

      <View style={styles.modalActions}>
        <Button 
          mode="outlined" 
          onPress={onCancel}
          style={styles.modalButton}
          textColor= {AdminPalette.text}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={onSubmit}
          style={[styles.modalButton, styles.modalSubmitButton]}
          loading={saving}
          disabled={saving}
          icon={isEditing ? "content-save" : "plus"}
        >
          {isEditing ? 'Save Changes' : 'Create Test'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AdminPalette.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: AdminPalette.text,
  },
  formSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: AdminPalette.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AdminPalette.text,
    marginBottom: 16,
  },
  formGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formColumn: {
    flex: 1,
  },
  formFullWidth: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: AdminPalette.text,
    marginBottom: 8,
  },
  pickerSurface: {
    borderRadius: 8,
    backgroundColor: AdminPalette.surface,
    borderWidth: 1,
    borderColor: AdminPalette.divider,
    overflow: 'hidden',
  },
  picker: {
    height: 56,
    color: AdminPalette.text,
  },
  input: {
    marginBottom: 16,
    backgroundColor: AdminPalette.surface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    color: AdminPalette.text,
  },
  modalSubmitButton: {
    backgroundColor: AdminPalette.primary,
  },
});

export default TestForm;
