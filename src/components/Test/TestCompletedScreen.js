// components/Test/TestCompletedScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Title, ActivityIndicator, TouchableRipple } from 'react-native-paper';

const TestCompletedScreen = ({ 
  isRecording, 
  testName, 
  questions, 
  finalTimeTaken, 
  onBackToTests,
  scaleValue,
  handlePressIn,
  handlePressOut
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.resultContainer}>
        {isRecording ? (
          <>
            <ActivityIndicator size={60} color={Palette.primary} />
            <Title style={styles.resultTitle}>Recording Test...</Title>
            <Text style={styles.resultText}>
              Please wait while we save your test results
            </Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={60}
              color={Palette.success || Palette.primary}
            />
            <Title style={styles.resultTitle}>Test Recorded Successfully!</Title>
            <Text style={styles.resultText}>
              Your test "{testName}" has been recorded and saved.
            </Text>
            <Text style={styles.resultSubText}>
              You can view your detailed results in the Test History section.
            </Text>

            <View style={styles.testInfoContainer}>
              <View style={styles.testInfoItem}>
                <MaterialCommunityIcons
                  name="book-outline"
                  size={20}
                  color={Palette.textMuted}
                />
                <Text style={styles.testInfoText}>
                  {questions.length} Questions
                </Text>
              </View>
              <View style={styles.testInfoItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color={Palette.textMuted}
                />
                <Text style={styles.testInfoText}>
                  {formatTime(finalTimeTaken)} Taken
                </Text>
              </View>
              <View style={styles.testInfoItem}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={20}
                  color={Palette.textMuted}
                />
                <Text style={styles.testInfoText}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </>
        )}

        {!isRecording && (
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableRipple
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={onBackToTests}
              style={styles.resultButton}
              rippleColor={Palette.primaryXLight}
            >
              <Text style={styles.resultButtonText}>Back to Tests</Text>
            </TouchableRipple>
          </Animated.View>
        )}
      </View>
    </View>
  );
};
