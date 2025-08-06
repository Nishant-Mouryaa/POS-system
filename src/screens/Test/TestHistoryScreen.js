import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  ScrollView,
  Modal,
  ImageBackground
} from 'react-native';
import {
  Title,
  Text,
  useTheme,
  Card,
  Divider,
  Button,
  Chip,
  ProgressBar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../config/firebase';

const { width, height } = Dimensions.get('window');

/**
 * TestHistoryScreen
 * Displays a list of past tests the user has taken.
 * On click, shows details in a modal (score, stats, per-question review).
 */
const TestHistoryScreen = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [testHistory, setTestHistory] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser?.uid) {
          setError('User not authenticated. Please sign in.');
          setLoading(false);
          return;
        }

        const testsRef = collection(db, 'testResults');
        const q = query(testsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('No test history available');
          setTestHistory([]);
        } else {
          const historyData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // Sort by timestamp (newest first)
          historyData.sort((a, b) => {
            const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.completedAt);
            const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.completedAt);
            return bTime - aTime;
          });
          setTestHistory(historyData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching test history:', err);
        setError('Failed to load test history. Please try again later.');
        setTestHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, []);

  const fetchTestDetails = async (testId) => {
    setLoadingDetails(true);
    try {
      const testDoc = await getDoc(doc(db, 'testResults', testId));
      if (testDoc.exists()) {
        const testData = { id: testDoc.id, ...testDoc.data() };
        setSelectedTest(testData);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching test details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getAnswerStatus = (question, userAnswers, questionIndex) => {
    if (!userAnswers || !userAnswers[questionIndex]) return 'unanswered';
    const userAnswer = userAnswers[questionIndex];
    return userAnswer === question.correctAnswer ? 'correct' : 'incorrect';
  };

  const renderQuestionDetail = (question, index) => {
    const userAnswer = selectedTest?.userAnswers?.[index] || null;
    const status = getAnswerStatus(question, selectedTest?.userAnswers, index);
    const statusColor = status === 'correct' ? '#4CAF50' : status === 'incorrect' ? '#F44336' : '#757575';

    // MCQ options (typically 1, 2, 3, 4 for A, B, C, D)
    const mcqOptions = ['A', 'B', 'C', 'D'];

    return (
      <Card key={index} style={styles.questionCard}>
        <Card.Content>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Question {index + 1}</Text>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={{ color: statusColor, fontSize: 12 }}
            >
              {status === 'correct' ? 'Correct' : status === 'incorrect' ? 'Incorrect' : 'Unanswered'}
            </Chip>
          </View>
          
          <Text style={styles.questionText}>{question.questionText}</Text>
          
          {question.questionType === 'mcq' && (
            <View style={styles.optionsContainer}>
              {mcqOptions.map((optionLetter, optIndex) => {
                const optionNumber = (optIndex + 1).toString();
                const isCorrect = optionNumber === question.correctAnswer;
                const isUserAnswer = userAnswer === optionNumber;
                
                return (
                  <View
                    key={optIndex}
                    style={[
                      styles.optionItem,
                      isCorrect && styles.correctOption,
                      isUserAnswer && !isCorrect && styles.incorrectOption
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionLabel,
                          (isCorrect || isUserAnswer) && styles.highlightedOptionLabel
                        ]}
                      >
                        {optionLetter}
                      </Text>
                      <Text
                        style={[
                          styles.optionText,
                          (isCorrect || isUserAnswer) && styles.highlightedOptionText
                        ]}
                      >
                        {question[`option${optionNumber}`] || `Option ${optionLetter}`}
                      </Text>
                    </View>
                    {isCorrect && (
                      <Icon name="check-circle" size={20} color="#4CAF50" style={styles.optionIcon} />
                    )}
                    {isUserAnswer && !isCorrect && (
                      <Icon name="close-circle" size={20} color="#F44336" style={styles.optionIcon} />
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Show explanation only for incorrect answers */}
          {status === 'incorrect' && question.explanation && (
            <View style={styles.explanationContainer}>
              <View style={styles.explanationHeader}>
                <Icon name="lightbulb-outline" size={18} color={colors.primary} />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}

          {/* Show correct answer for incorrect responses */}
          {status === 'incorrect' && (
            <View style={styles.correctAnswerContainer}>
              <View style={styles.correctAnswerHeader}>
                <Icon name="check-circle" size={18} color="#4CAF50" />
                <Text style={styles.correctAnswerTitle}>Correct Answer</Text>
              </View>
              <Text style={styles.correctAnswerText}>
                Option {mcqOptions[parseInt(question.correctAnswer) - 1]}: {question[`option${question.correctAnswer}`]}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderTestDetailModal = () => {
    if (!selectedTest) return null;

    const correctCount = selectedTest.correctAnswers || 0;
    const totalQuestions = selectedTest.totalQuestions || 0;
    const percentage = selectedTest.percentage || 0;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowDetailModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={colors.onBackground} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedTest.testName || 'Test Details'}</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Test Summary */}
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryTitle}>Test Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Icon name="percent" size={24} color={colors.primary} />
                    <Text style={styles.summaryValue}>{percentage}%</Text>
                    <Text style={styles.summaryLabel}>Score</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                    <Text style={styles.summaryValue}>{correctCount}</Text>
                    <Text style={styles.summaryLabel}>Correct</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Icon name="close-circle" size={24} color="#F44336" />
                    <Text style={styles.summaryValue}>{totalQuestions - correctCount}</Text>
                    <Text style={styles.summaryLabel}>Incorrect</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Icon name="clock-outline" size={24} color={colors.primary} />
                    <Text style={styles.summaryValue}>{selectedTest.timeTaken || '0'}s</Text>
                    <Text style={styles.summaryLabel}>Time</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Questions Review */}
            <View style={styles.questionsSection}>
              <Text style={styles.sectionTitle}>Questions Review</Text>
              {selectedTest.questions?.map((question, index) => 
                renderQuestionDetail(question, index)
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderTestItem = ({ item }) => {
    const correctCount = item.correctAnswers || 0;
    const total = item.totalQuestions || 0;
    const percentage = item.percentage || 0;
    const progressValue = total > 0 ? correctCount / total : 0;

    return (
      <TouchableOpacity onPress={() => fetchTestDetails(item.id)}>
        <Card style={styles.testCard}>
          <Card.Content>
            <View style={styles.testHeader}>
              <Text style={styles.testTitle} numberOfLines={1} ellipsizeMode="tail">
                {item.testName || 'Unnamed Test'}
              </Text>
              <Text style={styles.testDate}>
                {item.timestamp?.toDate 
                  ? item.timestamp.toDate().toLocaleDateString()
                  : new Date(item.completedAt).toLocaleDateString()
                }
              </Text>
            </View>
            
            <View style={styles.scoreContainer}>
              <Chip
                style={[styles.scoreChip, { backgroundColor: colors.primary + '20' }]}
                textStyle={{ color: colors.primary, fontWeight: 'bold' }}
              >
                {percentage}% Score
              </Chip>

              <ProgressBar
                progress={progressValue}
                color={colors.primary}
                style={styles.progressBar}
              />
              
              <View style={styles.testStatsRow}>
                <View style={styles.statItem}>
                  <Icon name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.statText}>
                    {correctCount} Correct
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="close-circle" size={16} color="#F44336" />
                  <Text style={styles.statText}>
                    {total - correctCount} Incorrect
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="clock-outline" size={16} color={colors.primary} />
                  <Text style={styles.statText}>{item.timeTaken || 'N/A'}s</Text>
                </View>
              </View>
            </View>

            <View style={styles.viewDetailsContainer}>
              <Text style={styles.viewDetailsText}>Tap to view details</Text>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ImageBackground
        source={{ uri: 'https://via.placeholder.com/800x1200.png?text=Background+Image' }}
        style={styles.loadingContainer}
        blurRadius={2}
      >
        <ActivityIndicator size="large" color={colors.surface} />
        <Text style={styles.loadingText}>Loading your test history...</Text>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="history" size={60} color={colors.textMuted} />
        <Text style={styles.emptyText}>{error}</Text>
        <Text style={styles.emptySubtext}>
          {error.includes('authenticated') ? 'Please sign in to view your test history' : 'Take a test to see your history here'}
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: 'https://via.placeholder.com/800x1200.png?text=Subtle+Background' }}
      style={styles.screenContainer}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <View style={styles.headerContainer}>
          <Title style={styles.header}>Test History</Title>
          <Text style={styles.subHeader}>
            Review your past test performances
          </Text>
        </View>

        <FlatList
          data={testHistory}
          renderItem={renderTestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="history" size={60} color={colors.textMuted} />
              <Text style={styles.emptyText}>No test history available</Text>
              <Text style={styles.emptySubtext}>Take a test to see your history here</Text>
            </View>
          }
        />

        {loadingDetails && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {renderTestDetailModal()}
      </View>
    </ImageBackground>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  screenContainer: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.background + 'AA', // semi-transparent overlay
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onBackground,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  testCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    flex: 1,
    marginRight: 10,
  },
  testDate: {
    fontSize: 14,
    color: colors.textMuted,
    alignSelf: 'center'
  },
  scoreContainer: {
    marginBottom: 12,
  },
  scoreChip: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  testStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    color: colors.onSurface,
    fontSize: 14,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },  
  viewDetailsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onBackground,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.surface,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.onBackground,
    marginLeft: 16,
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  questionsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onBackground,
    marginBottom: 16,
  },
  questionCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  statusChip: {
    height: 28,
    borderRadius: 14,
  },
  
  questionText: {
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
  },
  correctOption: {
    backgroundColor: '#4CAF50' + '15',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#F44336' + '15',
    borderColor: '#F44336',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    width: 24,
    marginRight: 12,
  },
  highlightedOptionLabel: {
    color: colors.onSurface,
  },
  optionText: {
    fontSize: 14,
    color: colors.onSurface,
    flex: 1,
  },
  highlightedOptionText: {
    fontWeight: '500',
  },
  optionIcon: {
    marginLeft: 8,
  },
  explanationContainer: {
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  explanationText: {
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },
  correctAnswerContainer: {
    backgroundColor: '#4CAF50' + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  correctAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  correctAnswerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 6,
  },
  correctAnswerText: {
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },

});

export default TestHistoryScreen;