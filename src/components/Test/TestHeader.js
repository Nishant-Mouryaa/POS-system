// components/Test/TestHeader.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';

const TestHeader = ({ progress, currentQuestionIndex, totalQuestions, timeLeft }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.header}>
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={progress}
          color={Palette.primary}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1}/{totalQuestions}
        </Text>
      </View>
      <View style={styles.timerContainer}>
        <MaterialCommunityIcons
          name="timer-outline"
          size={20}
          color={Palette.error}
        />
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>
    </View>
  );
};
