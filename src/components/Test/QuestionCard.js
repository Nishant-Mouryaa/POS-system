// components/Test/QuestionCard.js
import { Card } from 'react-native-paper';

const QuestionCard = ({ 
  currentQuestion, 
  currentQuestionIndex, 
  currentAnswer, 
  onAnswerChange, 
  containsLatex 
}) => {
  const questionType = currentQuestion?.questionType || 'mcq';

  return (
    <Card style={styles.questionCard}>
      <Card.Content>
        <Text style={styles.questionNumber}>
          Question {currentQuestionIndex + 1}
        </Text>
        
        {/* Question Text */}
        {containsLatex(currentQuestion.questionText) ? (
          <View style={styles.questionTextContainer}>
            <SmartLaTeXRenderer
              latex={currentQuestion.questionText}
              style={styles.questionMathContainer}
            />
          </View>
        ) : (
          <Text style={styles.questionText}>
            {currentQuestion.questionText}
          </Text>
        )}

        {/* Question Type Specific Components */}
        {questionType === 'mcq' && (
          <MCQOptions
            options={currentQuestion.options}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            containsLatex={containsLatex}
          />
        )}

        {questionType === 'descriptive' && (
          <DescriptiveInput
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
          />
        )}

        {questionType === 'geometry' && (
          <GeometryInput
            question={currentQuestion}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
          />
        )}
      </Card.Content>
    </Card>
  );
};

