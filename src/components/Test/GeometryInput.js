
// components/Test/GeometryInput.js
import { Image } from 'react-native';

const GeometryInput = ({ question, currentAnswer, onAnswerChange }) => {
  return (
    <View style={styles.geometryContainer}>
      {question.geometryImage && (
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.inputLabel}>Question Image:</Text>
          <Image
            source={{ uri: question.geometryImage }}
            style={{ 
              width: '100%', 
              height: 200, 
              borderRadius: 8, 
              resizeMode: 'contain', 
              backgroundColor: '#f5f5f5' 
            }}
          />
        </View>
      )}
      {question.geometryExpression?.trim() !== '' && (
        <View style={styles.expressionPreview}>
          <Text style={styles.expressionTitle}>Geometry Expression:</Text>
          <SmartLaTeXRenderer
            latex={question.geometryExpression}
            style={styles.geometryMathContainer}
          />
        </View>
      )}
      <Text style={styles.inputLabel}>Your Answer (Geometry)</Text>
      <RNTextInput
        style={styles.descriptiveInput}
        multiline
        value={currentAnswer}
        onChangeText={(text) => onAnswerChange(text)}
        placeholder="Input your own answer or derivation..."
        placeholderTextColor={Palette.textMuted}
      />
    </View>
  );
};
