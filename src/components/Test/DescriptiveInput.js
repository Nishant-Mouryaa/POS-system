// components/Test/DescriptiveInput.js
import { TextInput as RNTextInput } from 'react-native';

const DescriptiveInput = ({ currentAnswer, onAnswerChange }) => {
  return (
    <View style={styles.descriptiveContainer}>
      <Text style={styles.inputLabel}>Your Answer (Descriptive)</Text>
      <RNTextInput
        style={styles.descriptiveInput}
        multiline
        value={currentAnswer}
        onChangeText={(text) => onAnswerChange(text)}
        placeholder="Type your descriptive answer..."
        placeholderTextColor={Palette.textMuted}
      />
    </View>
  );
};