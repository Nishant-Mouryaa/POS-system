import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { indianStates, cityDataByState } from './indianStatesCities';
import { Palette } from '../../theme/colors';

const AddressForm = ({
  address,
  setAddress,
  city,
  setCity,
  state,
  setState,
  pincode,
  setPincode,
  colors,
  inputTheme,
  onSubmit,
}) => {
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    if (state && cityDataByState[state]) {
      setCityList(cityDataByState[state]);
    } else {
      setCityList([]);
      setCity('');
    }
  }, [state, setCity]);

  return (
    <>
      {/* Address Input */}
      <TextInput
        label="Full Address"
        mode="flat"
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
        style={styles.input}
        left={<TextInput.Icon icon="home-outline" color={colors.primary} />}
        theme={inputTheme}
      />

      {/* State Picker */}
      <View style={[styles.pickerContainer, { borderColor: Palette.primaryXXLight }]}>
        <Text style={[styles.label, { color: Palette.textMuted }]}>State</Text>
        <Picker
          selectedValue={state}
          style={[styles.picker, { color: Palette.text }]}
          onValueChange={(itemValue) => setState(itemValue)}
          dropdownIconColor={colors.primary}
        >
          <Picker.Item label="Select State" value="" />
          {indianStates.map((st) => (
            <Picker.Item key={st.value} label={st.label} value={st.value} />
          ))}
        </Picker>
      </View>

      {/* City Picker */}
      <View style={[styles.pickerContainer, { borderColor: Palette.primaryXXLight }]}>
        <Text style={[styles.label, { color: Palette.textMuted }]}>City</Text>
        <Picker
          selectedValue={city}
          style={[styles.picker, { color: Palette.text }]}
          onValueChange={(itemValue) => setCity(itemValue)}
          enabled={cityList.length > 0}
          dropdownIconColor={colors.primary}
        >
          <Picker.Item label="Select City" value="" />
          {cityList.map((ct) => (
            <Picker.Item key={ct.value} label={ct.label} value={ct.value} />
          ))}
        </Picker>
      </View>

      {/* Pincode Input */}
      <TextInput
        label="PIN Code"
        mode="flat"
        value={pincode}
        onChangeText={setPincode}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
        left={<TextInput.Icon icon="map-marker-outline" color={colors.primary} />}
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

export default AddressForm;