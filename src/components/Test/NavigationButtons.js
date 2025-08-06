// components/Test/NavigationButtons.js
import { Animated } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

const NavigationButtons = ({ 
  currentQuestionIndex, 
  totalQuestions, 
  currentAnswer, 
  questionType, 
  onPrevious, 
  onNext,
  scaleValue,
  handlePressIn,
  handlePressOut
}) => {
  return (
    <View style={styles.navigationContainer}>
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableRipple
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPrevious}
          disabled={currentQuestionIndex === 0}
          style={[
            styles.navButton,
            styles.prevButton,
            currentQuestionIndex === 0 && styles.disabledButton
          ]}
          rippleColor={Palette.primaryXLight}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableRipple>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableRipple
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onNext}
          disabled={questionType === 'mcq' ? !currentAnswer : false}
          style={[
            styles.navButton,
            styles.nextButton,
            questionType === 'mcq' && !currentAnswer && styles.disabledButton,
          ]}
          rippleColor={Palette.primaryXLight}
        >
          <Text style={styles.navButtonText}>
            {currentQuestionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
          </Text>
        </TouchableRipple>
      </Animated.View>
    </View>
  );
};
