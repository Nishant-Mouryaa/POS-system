import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, Dimensions, StatusBar, Animated } from 'react-native';
import {
  Appbar,
  Searchbar,
  Button,
  Modal,
  Portal,
  TextInput,
  HelperText,
  Chip,
  ActivityIndicator,
  Text,
  Card,
  IconButton,
  RadioButton,
  Badge,
  Avatar,
  Title,
  Surface,
  FAB,
  Divider,
  ProgressBar,
} from 'react-native-paper';
import { 
  collection, 
  query, 
  getDocs, 
  setDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  limit
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';
import { checkAdminStatus } from '../../utils/auth';
import { useNavigation } from '@react-navigation/native';


// Import components
import Header from '../../components/TestManagement/Header';
import TestCard from '../../components/TestManagement/TestCard';
import TestForm from '../../components/TestManagement/TestForm';
import QuestionForm from '../../components/TestManagement/QuestionForm';
import EmptyState from '../../components/TestManagement/EmptyState';

const { width } = Dimensions.get('window');

const TestManagementScreen = () => {
  const styles = makeStyles(AdminPalette);
  const navigation = useNavigation();

  useEffect(() => {
    const verifyAdmin = async () => {
      const isAdmin = await checkAdminStatus();
      if (!isAdmin) {
        navigation.navigate('Main');
      }
    };
    
    verifyAdmin();
  }, [navigation]);

  // 1) Helper function: Update subject's chapterCount (unchanged)
  const updateSubjectChapterCount = async (boardId, standardId, subjectId) => {
    const chaptersRef = collection(
      db,
      `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters`
    );
    const chaptersSnap = await getDocs(chaptersRef);
    const chapterCount = chaptersSnap.size;

    const subjectRef = doc(
      db,
      `boards/${boardId}/standards/${standardId}/subjects/${subjectId}`
    );
    await updateDoc(subjectRef, { chapterCount });
    console.log(`Updated subject ${subjectId} with chapterCount = ${chapterCount}`);
  };

  // 2) Helper function: Update chapter's testCount
  const updateChapterTestCount = async (boardId, standardId, subjectId, chapterId) => {
    const testsRef = collection(
      db,
      `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}/tests`
    );
    const testsSnap = await getDocs(testsRef);
    const testCount = testsSnap.size;

    const chapterRef = doc(
      db,
      `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters`,
      chapterId
    );
    await updateDoc(chapterRef, { testCount });
    console.log(`Updated chapter ${chapterId} with testCount = ${testCount}`);
  };

  // Helper: get or create a doc by a name field
  const getOrCreateDocByName = async (colRef, nameField, nameValue, extraFields = {}) => {
    const snapshot = await getDocs(query(colRef));
    let foundDoc = null;
    snapshot.forEach((docSnap) => {
      if (docSnap.data()[nameField] === nameValue) {
        foundDoc = docSnap;
      }
    });
    if (foundDoc) {
      return foundDoc.ref;
    } else {
      const newDocRef = doc(colRef);
      await setDoc(newDocRef, {
        [nameField]: nameValue,
        createdAt: new Date(),
        ...extraFields,
      });
      return newDocRef;
    }
  };

  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const scrollY = new Animated.Value(0);

  // Remove pagination state
  // const [page, setPage] = useState(1);
  // const [loadingMore, setLoadingMore] = useState(false);
  // const [hasMore, setHasMore] = useState(true);
  // const PAGE_SIZE = 10; // Number of tests to load per page

  const [formData, setFormData] = useState({
    board: 'CBSE',
    standard: '',
    subject: '',
    chapter: '',
    duration: 30, // default duration of 30 minutes
  });

  // question objects now have "questionType"
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      questionType: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      // geometryExpression or descriptiveAnswer can be included if you wish
    },
  ]);

  const [errors, setErrors] = useState({});
  const getSubjectsByBoardAndStandard = (board, standard) => {
    const standardNum = parseInt(standard);
    
    if (board === 'CBSE' && standardNum >= 1 && standardNum <= 10) {
      return [
        'English',
        'Hindi',
        'Sanskrit',
        'Marathi',
        'Science',
        'Maths',
        'History PS',
        'Geography'
      ];
    } else if (board === 'State Board' && standardNum >= 1 && standardNum <= 10) {
      return [
        'English',
        'Hindi Full',
        'Sanskrit Full',
        'Hindi Half',
        'Sanskrit Half',
        'Marathi',
        'Science 1',
        'Science 2',
        'History PS',
        'Geography',
        'Economics'
      ];
    }
    
    // Default subjects for other boards/standards
    return [
      'Mathematics', 
      'Physics', 
      'Chemistry', 
      'Biology', 
      'Science', 
      'English', 
      'History',
      'Geography',
      'Sanskrit',
      'Hindi'
    ];
  };
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science', 'English', 'History'];
  const boards = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'];
  const standards = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  useEffect(() => {
    // Reset subject when board or standard changes
    if (formData.subject && !getSubjectsByBoardAndStandard(formData.board, formData.standard).includes(formData.subject)) {
      handleFormDataChange('subject', '');
    }
  }, [formData.board, formData.standard]);
  // Update loadTests to fetch all tests at once
  const loadTests = useCallback(async () => {
    try {
      setLoading(true);
      const allTests = [];

      // fetch all boards
      const boardsSnapshot = await getDocs(collection(db, 'boards'));
      const boardsArray = boardsSnapshot.docs;
      
      for (let i = 0; i < boardsArray.length; i++) {
        const boardDoc = boardsArray[i];
        const boardData = boardDoc.data();

        // fetch all standards
        const standardsSnapshot = await getDocs(collection(db, `boards/${boardDoc.id}/standards`));
        const standardsArray = standardsSnapshot.docs;
        
        for (let j = 0; j < standardsArray.length; j++) {
          const standardDoc = standardsArray[j];
          const standardData = standardDoc.data();

          // fetch all subjects
          const subjectsSnapshot = await getDocs(
            collection(db, `boards/${boardDoc.id}/standards/${standardDoc.id}/subjects`)
          );
          const subjectsArray = subjectsSnapshot.docs;
          
          for (let k = 0; k < subjectsArray.length; k++) {
            const subjectDoc = subjectsArray[k];
            const subjectData = subjectDoc.data();

            // fetch all chapters
            const chaptersSnapshot = await getDocs(
              collection(
                db,
                `boards/${boardDoc.id}/standards/${standardDoc.id}/subjects/${subjectDoc.id}/chapters`
              )
            );
            const chaptersArray = chaptersSnapshot.docs;
            
            for (let l = 0; l < chaptersArray.length; l++) {
              const chapterDoc = chaptersArray[l];
              const chapterData = chapterDoc.data();

              // fetch all tests for this chapter
              const testsSnapshot = await getDocs(
                collection(
                  db,
                  `boards/${boardDoc.id}/standards/${standardDoc.id}/subjects/${subjectDoc.id}/chapters/${chapterDoc.id}/tests`
                )
              );
              const testsArray = testsSnapshot.docs;
              
              for (let m = 0; m < testsArray.length; m++) {
                const testDoc = testsArray[m];
                const testData = testDoc.data();

                // Only load questions if the test is being viewed
                const questions = [];
                
                allTests.push({
                  id: testDoc.id,
                  title: testData.title,
                  description: testData.description,
                  duration: testData.duration,
                  board: boardData.name,
                  standard: parseInt(standardData.name.replace('Class ', '')),
                  subject: subjectData.name,
                  chapter: chapterData.name,
                  questions: questions, // Empty array - will load when needed
                  createdAt: testData.createdAt,
                  updatedAt: testData.updatedAt,
                  path: {
                    boardId: boardDoc.id,
                    standardId: standardDoc.id,
                    subjectId: subjectDoc.id,
                    chapterId: chapterDoc.id,
                    testId: testDoc.id,
                  },
                });
              }
            }
          }
        }
      }

      setTests(allTests);
    } catch (err) {
      console.error('Error loading tests:', err);
      Alert.alert('Error', 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to load questions for a specific test
  const loadQuestions = async (testId) => {
    try {
      const testToUpdate = tests.find(t => t.id === testId);
      if (!testToUpdate || testToUpdate.questions.length > 0) return;

      const { boardId, standardId, subjectId, chapterId, testId: pathTestId } = testToUpdate.path;
      
      const questionsSnapshot = await getDocs(
        collection(
          db,
          `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}/tests/${pathTestId}/questions`
        )
      );

      const questions = questionsSnapshot.docs.map(qDoc => ({
        id: qDoc.id,
        ...qDoc.data(),
      }));

      setTests(prevTests => 
        prevTests.map(test => 
          test.id === testId ? { ...test, questions } : test
        )
      );
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  // Remove useEffect dependency on page
  useEffect(() => {
    loadTests();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredTests = tests.filter((test) => {
    const subject = test.subject?.toLowerCase() || '';
    const chapter = test.chapter?.toLowerCase() || '';
    const board = test.board?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();

    return subject.includes(q) || chapter.includes(q) || board.includes(q);
  });

  const resetForm = () => {
    setFormData({
      board: 'CBSE',
      standard: '',
      subject: '',
      chapter: '',
    });
    setQuestions([
      {
        questionText: '',
        questionType: 'mcq',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        geometryExpression: '',
        geometryImage: '', // Add this line
        descriptiveAnswer: '',
      },
    ]);
    setCurrentQuestionIndex(0);
    setErrors({});
  };

  const handleAddTest = () => {
    setIsEditing(false);
    setCurrentTest(null);
    resetForm();
    setVisible(true);
  };

  const handleEditTest = async (test) => {
    setIsEditing(true);
    setCurrentTest(test);
    setFormData({
      board: test.board,
      standard: test.standard.toString(),
      subject: test.subject,
      chapter: test.chapter,
      duration: test.duration || 30,
    });
    // Fetch questions from Firestore
    let loadedQuestions = [];
    try {
      const { boardId, standardId, subjectId, chapterId, testId } = test.path;
      const questionsSnapshot = await getDocs(
        collection(
          db,
          `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}/tests/${testId}/questions`
        )
      );
      loadedQuestions = questionsSnapshot.docs.map(qDoc => ({
        id: qDoc.id,
        ...qDoc.data(),
      }));
    } catch (err) {
      console.error('Error loading questions for edit:', err);
    }
    setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [
      {
        questionText: '',
        questionType: 'mcq',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        geometryExpression: '',
        geometryImage: '',
        descriptiveAnswer: '',
      },
    ]);
    setCurrentQuestionIndex(0);
    setErrors({});
    setVisible(true);
  };

  // Validate test form + questions
  const validateForm = () => {
    const newErrors = {};

    if (!formData.board) newErrors.board = 'Board is required';
    if (!formData.standard) newErrors.standard = 'Standard is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.chapter.trim()) newErrors.chapter = 'Chapter is required';
    if (!formData.duration || isNaN(formData.duration) || formData.duration <= 0) {
      newErrors.duration = 'Please enter a valid duration (in minutes)';
    }

    const questionErrors = [];
    questions.forEach((q, index) => {
      const qErrors = {};
      if (!q.questionText.trim()) {
        qErrors.questionText = 'Question text is required';
      }

      if (q.questionType === 'mcq') {
        if (q.options.some((opt) => !opt.trim())) {
          qErrors.options = 'All options are required';
        }
        if (!q.correctAnswer) {
          qErrors.correctAnswer = 'Please select the correct answer';
        }
      }

      if (Object.keys(qErrors).length > 0) {
        questionErrors[index] = qErrors;
      }
    });

    if (Object.keys(questionErrors).length > 0) {
      newErrors.questions = questionErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CREATE or UPDATE test doc -> update testCount in chapter doc
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // 1) Board doc
      const boardRef = await getOrCreateDocByName(collection(db, 'boards'), 'name', formData.board);

      // 2) Standard doc
      const standardRef = await getOrCreateDocByName(
        collection(db, `boards/${boardRef.id}/standards`),
        'name',
        `Class ${formData.standard}`
      );

      // 3) Subject doc
      const subjectRef = await getOrCreateDocByName(
        collection(db, `boards/${boardRef.id}/standards/${standardRef.id}/subjects`),
        'name',
        formData.subject
      );

      // 4) Chapter doc
      const chapterRef = await getOrCreateDocByName(
        collection(db, `boards/${boardRef.id}/standards/${standardRef.id}/subjects/${subjectRef.id}/chapters`),
        'name',
        formData.chapter.trim(),
        { description: `Chapter for ${formData.chapter}` }
      );

      // Also update the subject doc's chapterCount
      await updateSubjectChapterCount(boardRef.id, standardRef.id, subjectRef.id);

      const testData = {
        title: `${formData.subject} - ${formData.chapter} Test`,
        description: `Test on ${formData.chapter} concepts`,
        duration: parseInt(formData.duration) || 30, // ensure it's a number
        updatedAt: new Date(),
      };

      if (!isEditing) {
        testData.createdAt = new Date();
      }

      let testRef;

      if (isEditing && currentTest) {
        // update existing test
        testRef = doc(
          db,
          `boards/${boardRef.id}/standards/${standardRef.id}/subjects/${subjectRef.id}/chapters/${chapterRef.id}/tests/${currentTest.id}`
        );
        await updateDoc(testRef, testData);

        // replace the existing questions by deleting all first
        const questionsCol = collection(testRef, 'questions');
        const existingQuestions = await getDocs(questionsCol);
        for (const qDoc of existingQuestions.docs) {
          await deleteDoc(qDoc.ref);
        }

      // now add the new questions
      for (const question of questions) {
        const questionRef = doc(questionsCol);
        await setDoc(questionRef, {
          questionText: question.questionText.trim(),
          questionType: question.questionType,
          options: question.options?.map((opt) => opt.trim()),
          correctAnswer: question.correctAnswer,
          explanation: question.explanation.trim(),
          geometryExpression: question.geometryExpression || '',
          geometryImage: question.geometryImage || '', // Add this line
          descriptiveAnswer: question.descriptiveAnswer || '',
          createdAt: new Date(),
        });
      }

        Alert.alert('Success', 'Test updated successfully');
      } else {
        // create new test
        testRef = doc(
          collection(
            db,
            `boards/${boardRef.id}/standards/${standardRef.id}/subjects/${subjectRef.id}/chapters/${chapterRef.id}/tests`
          )
        );
        await setDoc(testRef, testData);

         // add questions
      const questionsCol = collection(testRef, 'questions');
      for (const question of questions) {
        const questionRef = doc(questionsCol);
        await setDoc(questionRef, {
          questionText: question.questionText.trim(),
          questionType: question.questionType,
          options: question.options?.map((opt) => opt.trim()),
          correctAnswer: question.correctAnswer,
          explanation: question.explanation.trim(),
          geometryExpression: question.geometryExpression || '',
          geometryImage: question.geometryImage || '', // Add this line
          descriptiveAnswer: question.descriptiveAnswer || '',
          createdAt: new Date(),
        });
      }

        Alert.alert('Success', 'Test created successfully');
      }

      // 5) Update testCount in the chapter doc
      await updateChapterTestCount(boardRef.id, standardRef.id, subjectRef.id, chapterRef.id);

      loadTests(); // Reset and reload
      setVisible(false);
    } catch (err) {
      console.error('Error saving test:', err);
      Alert.alert('Error', 'Failed to save test');
    } finally {
      setSaving(false);
    }
  };

  // DELETE a test doc -> update testCount in chapter doc
  const handleDelete = async (id, testInfo) => {
    Alert.alert(
      'Delete Test',
      `Are you sure you want to delete the test for "${testInfo.subject} - ${testInfo.chapter}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const testToDelete = tests.find((t) => t.id === id);
              if (!testToDelete || !testToDelete.path) {
                Alert.alert('Error', 'Test path not found');
                return;
              }
              const { boardId, standardId, subjectId, chapterId, testId } = testToDelete.path;

              // delete all questions first
              const questionsCol = collection(
                db,
                `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}/tests/${testId}/questions`
              );
              const questionsSnapshot = await getDocs(questionsCol);
              for (const qDoc of questionsSnapshot.docs) {
                await deleteDoc(qDoc.ref);
              }

              // delete the test
              await deleteDoc(
                doc(
                  db,
                  `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}/tests/${testId}`
                )
              );

              // recalc testCount
              await updateChapterTestCount(boardId, standardId, subjectId, chapterId);

              loadTests(); // Reset and reload
              Alert.alert('Success', 'Test deleted successfully');
            } catch (err) {
              console.error('Error deleting test:', err);
              Alert.alert('Error', 'Failed to delete test');
            }
          },
        },
      ]
    );
  };

  const handleFormDataChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // question editing
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options[optionIndex] = value;
    }
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        questionType: 'mcq',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        geometryExpression: '',
        geometryImage: '', // Add this line
        descriptiveAnswer: '',
      },
    ]);
    setCurrentQuestionIndex(questions.length);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) {
      Alert.alert('Cannot Remove', 'A test must have at least one question');
      return;
    }
    Alert.alert('Remove Question', 'Are you sure you want to remove this question?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const newQuestions = [...questions];
          newQuestions.splice(index, 1);
          setQuestions(newQuestions);
          if (currentQuestionIndex >= newQuestions.length) {
            setCurrentQuestionIndex(newQuestions.length - 1);
          }
        },
      },
    ]);
  };

  // Update TestCard component to load questions when previewing
  const handlePreview = async (test) => {
    if (test.questions.length === 0) {
      await loadQuestions(test.id);
    }
    navigation.navigate('TestPreview', { test });
  };

  // optional icon styling
  const getSubjectIcon = (subject) => {
    const icons = {
      Mathematics: 'calculator',
      Physics: 'atom',
      Chemistry: 'flask',
      Biology: 'leaf',
      Science: 'microscope',
      English: 'alphabetical',
      History: 'history',
    };
    return icons[subject] || 'book';
  };

  const getSubjectColor = (subject) => {
    const colors = {
      Mathematics: AdminPalette.primary,
      Physics: AdminPalette.accent,
      Chemistry: AdminPalette.warning,
      Biology: AdminPalette.success,
      Science: AdminPalette.info,
      English: AdminPalette.secondary,
      History: AdminPalette.tertiary,
    };
    return colors[subject] || AdminPalette.textSecondary;
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={AdminPalette.primary} barStyle="light-content" />

      <Header navigation={navigation} tests={tests} scrollY={scrollY} onRefresh={() => loadTests()} />

      <View style={styles.content}>
        <Surface style={styles.searchContainer} elevation={1}>
          <Searchbar
            placeholder="Search by subject, chapter, or board..."
            placeholderTextColor={AdminPalette.textMuted}
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            icon="magnify"
            iconColor={AdminPalette.text}
            clearIcon="close"
          />
        </Surface>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AdminPalette.primary} />
            <Text style={styles.loadingText}>Loading tests...</Text>
          </View>
        ) : (
          <Animated.FlatList
            data={filteredTests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            // Removed onEndReached and onEndReachedThreshold
            // Removed ListFooterComponent
            renderItem={({ item, index }) => (
              <TestCard
                test={item}
                onEdit={handleEditTest}
                onDelete={handleDelete}
                onPreview={handlePreview}
                scrollY={scrollY}
                index={index}
              />
            )}
            ListEmptyComponent={
              <EmptyState searchQuery={searchQuery} onCreateTest={handleAddTest} />
            }
          />
        )}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddTest}
        label="Create Test"
        color={AdminPalette.textLight}
        extended
      />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => !saving && setVisible(false)}
          contentContainerStyle={styles.modalContainer}
          dismissable={!saving}
        >
          <View style={styles.modalInner}>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
             <TestForm
  formData={formData}
  onFormDataChange={handleFormDataChange}
  errors={errors}
  isEditing={isEditing}
  saving={saving}
  onSubmit={handleSubmit}
  onCancel={() => setVisible(false)}
  getSubjectsByBoardAndStandard={getSubjectsByBoardAndStandard} // Add this line
/>

              <QuestionForm
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                onQuestionChange={handleQuestionChange}
                onOptionChange={handleOptionChange}
                onCorrectAnswerChange={handleCorrectAnswerChange}
                onAddQuestion={handleAddQuestion}
                onRemoveQuestion={handleRemoveQuestion}
                onQuestionIndexChange={setCurrentQuestionIndex}
                errors={errors}
              />
            </ScrollView>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      flex: 1,
    },
    searchContainer: {
      margin: 16,
    
      marginBottom: 8,
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 8,
    },
    searchbar: {
      backgroundColor: 'transparent',
      elevation: 0,
    },
    searchInput: {
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      color: colors.textMuted,
      fontSize: 16,
    },
    loadingMoreContainer: {
      padding: 16,
      alignItems: 'center',
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      backgroundColor: AdminPalette.primary,
      borderRadius: 16,
    },
    modalContainer: {
      flex: 1,
      margin: 0,
    },
    modalInner: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      padding: 24,
      paddingBottom: 40,
    },
  });

export default TestManagementScreen;
