import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Palette } from '../../theme/colors';

const StudentForm = ({
  schoolBoard,
  setSchoolBoard,
  grade,
  setGrade,
  mobileNumber,
  setMobileNumber,
  colors,
  inputTheme,
  mobileInput,
}) => {
  return (
    <>
      {/* School Board Picker */}
      <View style={[styles.pickerContainer, { borderColor: Palette.primaryXXLight }]}>
        <Text style={[styles.label, { color: Palette.textMuted }]}>School Board</Text>
        <Picker
          selectedValue={schoolBoard}
          style={[styles.picker, { color: Palette.text }]}
          onValueChange={(itemValue) => setSchoolBoard(itemValue)}
        >
          <Picker.Item label="Select School Board" value="" />
          <Picker.Item label="CBSE" value="CBSE" />
          <Picker.Item label="ICSE" value="ICSE" />
          <Picker.Item label="State Board" value="State Board" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      {/* Class/Grade Picker */}
      <View style={[styles.pickerContainer, { borderColor: Palette.primaryXXLight }]}>
        <Text style={[styles.label, { color: Palette.textMuted }]}>Class/Grade</Text>
        <Picker
          selectedValue={grade}
          style={[styles.picker, { color: Palette.text }]}
          onValueChange={(itemValue) => setGrade(itemValue)}
        >
          <Picker.Item label="Select Class" value="" />
          {[...Array(12)].map((_, i) => (
            <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
          ))}
        </Picker>
      </View>

      {/* Mobile Number (required) */}
      <TextInput
        label="Mobile Number"
        mode="flat"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="phone-pad"
        style={styles.input}
        left={<TextInput.Icon icon="phone-outline" color={colors.primary} />}
        ref={mobileInput}
        returnKeyType="done"
        theme={inputTheme}
      />
    </>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginLeft: 12,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    fontSize: 16,
    height: 60,
  },
});

export default StudentForm;
