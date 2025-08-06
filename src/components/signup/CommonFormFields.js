import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Palette } from '../../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const CommonFormFields = ({
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  secureTextEntry,
  setSecureTextEntry,
  colors,
  inputTheme,
  emailInput,
  passwordInput,
  onPasswordSubmit,
}) => {
  return (
    <>
      <TextInput
        label="Full Name"
        mode="flat"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        left={<TextInput.Icon icon="account-outline" color={Palette.primary} />}
        returnKeyType="next"
        onSubmitEditing={() => emailInput.current?.focus()}
        theme={inputTheme}
      />

      <TextInput
        label="Email"
        mode="flat"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        left={<TextInput.Icon icon="email-outline" color={colors.primary} />}
        ref={emailInput}
        returnKeyType="next"
        onSubmitEditing={() => passwordInput.current?.focus()}
        theme={inputTheme}
      />

      <TextInput
        label="Password"
        mode="flat"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        left={<TextInput.Icon icon="lock-outline" color={colors.primary} />}
        right={
          <TextInput.Icon
            name={secureTextEntry ? 'eye-off' : 'eye'}
            color={colors.primary}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          />
        }
        ref={passwordInput}
        returnKeyType="done"
        onSubmitEditing={onPasswordSubmit}
        theme={inputTheme}
      />
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    fontSize: 16,
    height: 60,
  },
});

export default CommonFormFields; 