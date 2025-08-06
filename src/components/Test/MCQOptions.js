
// components/Test/MCQOptions.js
import { TouchableRipple, RadioButton } from 'react-native-paper';

const MCQOptions = ({ options, currentAnswer, onAnswerChange, containsLatex }) => {
  return (
    <>
      {options?.map((option, idx) => (
        <TouchableRipple
          key={idx}
          onPress={() => onAnswerChange(option.toString())}
          style={[
            styles.option,
            currentAnswer === option.toString() && styles.selectedOption,
          ]}
          rippleColor={Palette.primaryXLight}
        >
          <View style={styles.optionContent}>
            <RadioButton
              value={option.toString()}
              status={
                currentAnswer === option.toString() ? 'checked' : 'unchecked'
              }
              color={Palette.primary}
              uncheckedColor={Palette.primary}
            />
            {containsLatex(option.toString()) ? (
              <View style={styles.optionTextContainer}>
                <SmartLaTeXRenderer
                  latex={option.toString()}
                  style={styles.optionMathContainer}
                />
              </View>
            ) : (
              <Text style={styles.optionText}>{option}</Text>
            )}
          </View>
        </TouchableRipple>
      ))}
    </>
  );
};
    