import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  TextInput as RNTextInput,
  Keyboard,
  BackHandler,
  AppState,
  Image,
} from 'react-native';
import {
  Title,
  ActivityIndicator,
  Card,
  RadioButton,
  Text,
  ProgressBar,
  useTheme,
  TouchableRipple,
} from 'react-native-paper';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../config/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import { Palette } from '../../theme/colors';

// Improved LaTeX renderer with better error handling and multiple fallbacks
const LaTeXRenderer = ({ latex, style }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Don't render if no LaTeX content
  if (!latex || latex.trim() === '') {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Palette.textMuted }}>No LaTeX content</Text>
      </View>
    );
  }

  // Clean and prepare LaTeX - remove outer $ signs if present
  const cleanLatex = latex.replace(/^\$+|\$+$/g, '').trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>LaTeX Renderer</title>
      
      <!-- Load MathJax from CDN -->
      <script>
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\$', '\\\$']],
            displayMath: [['$$', '$$'], ['\\\
$$
', '\\\
$$']],
            processEscapes: true,
            processEnvironments: true,
            tags: 'none'
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            ignoreHtmlClass: 'tex2jax_ignore'
          },
          startup: {
            pageReady: () => {
              return MathJax.startup.defaultPageReady().then(() => {
                console.log('MathJax initialization complete');
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage('mathjax-ready');
              });
            }
          }
        };
      </script>
      <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      
      <style>
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: transparent;
          color: #333;
          font-size: 16px;
          line-height: 1.5;
        }
        
        .math-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50px;
          width: 100%;
          padding: 8px;
        }
        
        .math-content {
          text-align: center;
          width: 100%;
        }
        
        .loading {
          color: #666;
          font-size: 14px;
          text-align: center;
        }
        
        .error {
          color: #d32f2f;
          font-size: 14px;
          text-align: center;
          padding: 8px;
          background: #ffebee;
          border-radius: 4px;
        }
        
        /* MathJax styling */
        .MathJax {
          font-size: 1.1em !important;
        }
        
        mjx-container {
          overflow-x: auto;
          overflow-y: hidden;
        }
      </style>
    </head>
    <body>
      <div class="math-container">
        <div class="math-content">
          <div class="loading" id="loading">Loading math...</div>
          <div id="math-display" style="display: none;">
            \
$$
${cleanLatex}\
$$
          </div>
        </div>
      </div>
      
      <script>
        let renderAttempts = 0;
        const maxAttempts = 10;
        
        function showError(message) {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('math-display').innerHTML = 
            '<div class="error">LaTeX Error: ' + message + '</div>';
          document.getElementById('math-display').style.display = 'block';
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage('error:' + message);
        }
        
        function showMath() {
          document.getElementById('loading').style.display = 'none';
          document.getElementById('math-display').style.display = 'block';
        }
        
        function attemptRender() {
          renderAttempts++;
          
          if (renderAttempts > maxAttempts) {
            showError('Max render attempts exceeded');
            return;
          }
          
          if (typeof MathJax === 'undefined' || !MathJax.typesetPromise) {
            setTimeout(attemptRender, 200);
            return;
          }
          
          try {
            MathJax.typesetPromise([document.getElementById('math-display')])
              .then(() => {
                console.log('MathJax render successful');
                showMath();
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage('render-success');
              })
              .catch((error) => {
                console.error('MathJax render error:', error);
                showError(error.message || 'Render failed');
              });
          } catch (error) {
            console.error('MathJax error:', error);
            showError(error.message || 'Unknown error');
          }
        }
        
        // Start rendering after a short delay
        setTimeout(attemptRender, 100);
        
        // Fallback timeout
        setTimeout(() => {
          if (document.getElementById('loading').style.display !== 'none') {
            showError('Render timeout');
          }
        }, 5000);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[style, { minHeight: 60 }]}>
      <WebView
        source={{ html: htmlContent }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="always"
        allowsInlineMediaPlaybook={true}
        mediaPlaybackRequiresUserAction={false}
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          console.log('WebView message:', message);
          
          if (message === 'render-success') {
            setIsLoading(false);
            setHasError(false);
          } else if (message === 'mathjax-ready') {
            setIsLoading(false);
          } else if (message.startsWith('error:')) {
            setIsLoading(false);
            setHasError(true);
          }
        }}
        onError={(syntheticEvent) => {
          console.error('WebView error:', syntheticEvent.nativeEvent);
          setHasError(true);
          setIsLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          console.error('WebView HTTP error:', syntheticEvent.nativeEvent);
          setHasError(true);
          setIsLoading(false);
        }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => {
          // Don't set loading to false here, wait for MathJax message
        }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.mathLoadingOverlay}>
          <ActivityIndicator size="small" color={Palette.primary} />
          <Text style={styles.mathLoadingText}>Rendering math...</Text>
        </View>
      )}
      
      {/* Error fallback */}
      {hasError && (
        <View style={styles.mathErrorContainer}>
          <Text style={styles.mathErrorText}>LaTeX: {cleanLatex}</Text>
        </View>
      )}
    </View>
  );
};

// Simplified fallback renderer using CodeCogs API
const SimpleLaTeXRenderer = ({ latex, style }) => {
  if (!latex || latex.trim() === '') {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Palette.textMuted }}>No LaTeX content</Text>
      </View>
    );
  }

  const cleanLatex = latex.replace(/^\$+|\$+$/g, '').trim();
  const encodedLatex = encodeURIComponent(cleanLatex);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: transparent;
          color: #333;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60px;
        }
        
        .math-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        
        .math-image {
          max-width: 100%;
          height: auto;
          vertical-align: middle;
        }
        
        .error-message {
          color: #d32f2f;
          font-size: 12px;
          text-align: center;
          padding: 8px;
          background: #ffebee;
          border-radius: 4px;
        }
        
        .loading {
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="math-container">
        <div class="loading" id="loading">Loading...</div>
        <img 
          src="https://latex.codecogs.com/svg.latex?\\dpi{120}&space;${encodedLatex}" 
          alt="LaTeX" 
          class="math-image"
          style="display: none;"
          onload="
            document.getElementById('loading').style.display = 'none';
            this.style.display = 'block';
          "
          onerror="
            document.getElementById('loading').style.display = 'none';
            this.parentElement.innerHTML = '<div class=\\'error-message\\'>LaTeX: ${cleanLatex}</div>';
          "
        >
      </div>
    </body>
    </html>
  `;

  return (
    <WebView
      source={{ html: htmlContent }}
      style={[style, { minHeight: 60 }]}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={false}
    />
  );
};

// Smart LaTeX renderer that tries multiple methods
const SmartLaTeXRenderer = ({ latex, style }) => {
  const [renderMethod, setRenderMethod] = useState('mathjax');
  const [hasError, setHasError] = useState(false);

  if (!latex || latex.trim() === '') {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Palette.textMuted }}>No LaTeX content</Text>
      </View>
    );
  }

  // If MathJax fails, fallback to CodeCogs
  if (renderMethod === 'mathjax' && !hasError) {
    return (
      <LaTeXRenderer 
        latex={latex} 
        style={style}
        onError={() => {
          setHasError(true);
          setRenderMethod('codecogs');
        }}
      />
    );
  }

  return <SimpleLaTeXRenderer latex={latex} style={style} />;
};

const TestScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const {
    boardId,
    standardId,
    subjectId,
    chapterId,
    testId,
    duration,
    testName,
  } = route.params;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // FIXED: New timer system based on actual timestamps
  const [testStartTime, setTestStartTime] = useState(null);
  const [testEndTime, setTestEndTime] = useState(null);
  const [displayTimeLeft, setDisplayTimeLeft] = useState(duration);
  const [testCompleted, setTestCompleted] = useState(false);
  
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  
  // Add state to store final time taken when test completes
  const [finalTimeTaken, setFinalTimeTaken] = useState(0);

  // For button animations - separate values for each button
  const nextButtonScale = new Animated.Value(1);
  const prevButtonScale = new Animated.Value(1);

  // Track app state to detect backgrounding
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef(0);
  
  // Keep all your existing navigation and back button effects...
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (testCompleted) return;
      
      e.preventDefault();
      Alert.alert(
        'Exit Test?',
        'You have not submitted yet! If you leave now, your progress will be lost.',
        [
          { text: "Stay", style: 'cancel', onPress: () => {} },
          {
            text: "Exit",
            style: 'destructive',
            onPress: () => {
              navigation.dispatch(e.data.action);
            },
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, testCompleted]);

  useEffect(() => {
    const onBackPress = () => {
      if (testCompleted) {
        return false; 
      }
      Alert.alert(
        'Exit Test?',
        'You have not submitted yet! Leaving will lose your progress.',
        [
          { text: 'Stay', style: 'cancel', onPress: () => {} },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
      return true; 
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [testCompleted, navigation]);

  // FIXED: Enhanced app state monitoring with timer continuation
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (!testCompleted && testStartTime) {
        if (
          appState.current.match(/active/) &&
          nextAppState.match(/inactive|background/)
        ) {
          // App is going to background - record the time
          backgroundTime.current = Date.now();
          
          Alert.alert(
            'Test Security Warning',
            'The test continues running in the background. Switching apps or leaving the test environment may result in automatic submission.',
            [{ text: 'Understood', style: 'default' }]
          );
        } else if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App is coming back to foreground
          if (backgroundTime.current > 0) {
            const timeInBackground = Date.now() - backgroundTime.current;
            
            // Show warning if they were away for more than 10 seconds
            if (timeInBackground > 10000) {
              Alert.alert(
                'Extended Background Activity Detected',
                `The app was in background for ${Math.round(timeInBackground / 1000)} seconds. The test timer continued running. This activity has been logged.`,
                [{ text: 'Continue Test', style: 'default' }]
              );
            }
            
            backgroundTime.current = 0;
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [testCompleted, testStartTime]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(
          db,
          `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}/tests/${testId}/questions`
        );
        const querySnapshot = await getDocs(questionsRef);

        const questionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setQuestions(questionsData);
        setUserAnswers(Array(questionsData.length).fill(''));
        setAnswered(Array(questionsData.length).fill(false));
        
        // FIXED: Initialize timer with actual start time
        const startTime = Date.now();
        setTestStartTime(startTime);
        setTestEndTime(startTime + (duration * 1000));
        
      } catch (error) {
        console.error('Error fetching questions:', error);
        Alert.alert('Error', 'Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [boardId, standardId, subjectId, chapterId, testId, duration]);

  // FIXED: New timer effect that works regardless of app state
  useEffect(() => {
    if (testCompleted || !testEndTime) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.ceil((testEndTime - now) / 1000));
      
      setDisplayTimeLeft(timeLeft);
      
      if (timeLeft <= 0) {
        completeTest();
      }
    };

    // Update immediately
    updateTimer();

    // Set up interval to update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [testEndTime, testCompleted]);

  const saveTestResults = async (actualTimeTaken) => {
    try {
      setIsRecording(true);
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser?.uid) {
        throw new Error("User not authenticated");
      }

      // Calculate final score
      let finalScore = 0;
      let finalCorrectAnswers = 0;

      questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const questionType = question.questionType || 'mcq';

        if (questionType === 'mcq' && userAnswer === question.correctAnswer) {
          finalScore += 1;
          finalCorrectAnswers += 1;
        }
      });

      const percentage = Math.round((finalScore / questions.length) * 100);

      // FIXED: Enhanced test results with security information
      const testResultsRef = collection(db, 'testResults');
      const testResultDoc = await addDoc(testResultsRef, {
        userId: currentUser.uid,
        testId,
        testName,
        boardId,
        standardId,
        subjectId,
        chapterId,
        score: finalScore,
        totalQuestions: questions.length,
        correctAnswers: finalCorrectAnswers,
        timeTaken: actualTimeTaken,
        timeAllowed: duration,
        percentage,
        userAnswers: userAnswers,
        questions: questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          questionType: q.questionType || 'mcq'
        })),
        // Security audit trail
        testStartTime: new Date(testStartTime).toISOString(),
        testEndTime: new Date().toISOString(),
        backgroundActivityDetected: backgroundTime.current > 0,
        backgroundDuration: backgroundTime.current > 0 ? Date.now() - backgroundTime.current : 0,
        timestamp: serverTimestamp(),
        completedAt: new Date().toISOString(),
      });

      // Update user statistics
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const prevCompletedTests = userData.completedTests || 0;
        const prevTotalScore = userData.totalScore || 0;

        const newTotalScore = prevTotalScore + percentage;
        const newAvgScore = Math.round(newTotalScore / (prevCompletedTests + 1));

        await updateDoc(userRef, {
          completedTests: prevCompletedTests + 1,
          totalScore: newTotalScore,
          avgScore: newAvgScore,
          lastTestDate: serverTimestamp(),
        });
      }

      // Store final calculated values
      setScore(finalScore);
      setCorrectAnswers(finalCorrectAnswers);

      console.log('Test results saved successfully with ID:', testResultDoc.id);
      return true;
    } catch (error) {
      console.error('Error saving test results:', error);
      Alert.alert(
        'Error',
        'Failed to save test results. Please check your connection and try again.'
      );
      return false;
    } finally {
      setIsRecording(false);
    }
  };

  // Helper functions for button animations
  const handleNextPressIn = () => {
    Animated.spring(nextButtonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handleNextPressOut = () => {
    Animated.spring(nextButtonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePrevPressIn = () => {
    Animated.spring(prevButtonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePrevPressOut = () => {
    Animated.spring(prevButtonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const completeTest = async () => {
    if (testCompleted) return; // Prevent multiple calls
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // FIXED: Calculate actual time taken based on real timestamps
    const actualTimeTaken = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : duration;
    setFinalTimeTaken(actualTimeTaken);
    
    // Mark test as completed (this will stop the timer)
    setTestCompleted(true);
    
    // Save test results with the actual time taken
    await saveTestResults(actualTimeTaken);
  };

  const handleNextQuestion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswered = [...answered];
    newAnswered[currentQuestionIndex] = true;
    setAnswered(newAnswered);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      Keyboard.dismiss();
    } else {
      completeTest();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      Keyboard.dismiss();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerChange = (answerValue) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = answerValue;
    setUserAnswers(updatedAnswers);
  };

  const progress =
    questions.length > 0
      ? (currentQuestionIndex + 1) / questions.length
      : 0;

  // Helper function to detect if text contains LaTeX
  const containsLatex = (text) => {
    if (!text) return false;
    return (
      text.includes('\\') ||
      text.includes('$') ||
      text.includes('frac') ||
      text.includes('sqrt')
    );
  };

  // Loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Preparing your test...</Text>
      </View>
    );
  }

  // FIXED: Test Completed - Use finalTimeTaken
  if (testCompleted) {
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
            <TouchableRipple
              onPress={() => navigation.goBack()}
              style={styles.resultButton}
              rippleColor={Palette.primaryXLight}
            >
              <Text style={styles.resultButtonText}>Back to Tests</Text>
            </TouchableRipple>
          )}
        </View>
      </View>
    );
  }

  // No Questions
  if (questions.length === 0) {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="book-remove-outline"
            size={48}
            color={Palette.textFaded}
          />
          <Title style={styles.emptyTitle}>No Questions Found</Title>
          <Text style={styles.emptyText}>
            This test doesn't contain any questions yet.
          </Text>

          <TouchableRipple
            onPress={() => navigation.goBack()}
            style={styles.emptyButton}
            rippleColor={Palette.primaryXLight}
          >
            <Text style={styles.emptyButtonText}>Go Back</Text>
          </TouchableRipple>
        </View>
      </View>
    );
  }

  // Active Test
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const questionType = currentQuestion.questionType || 'mcq';

  return (
    <View style={styles.screenContainer}>
      {/* Header with progress and timer */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={Palette.primary}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
        <View style={styles.timerContainer}>
          <MaterialCommunityIcons
            name="timer-outline"
            size={20}
            color={displayTimeLeft <= 60 ? Palette.error : Palette.primary}
          />
          <Text style={[
            styles.timerText, 
            displayTimeLeft <= 60 && styles.timerTextCritical
          ]}>
            {formatTime(displayTimeLeft)}
          </Text>
        </View>
      </View>

      {/* Question Card */}
      <Card style={styles.questionCard}>
        <Card.Content>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1}
          </Text>
          {/* Render question text (LaTeX-aware) */}
          {containsLatex(currentQuestion.questionText) ? (
            <View style={styles.questionTextContainer}>
              <SmartLaTeXRenderer
                latex={currentQuestion.questionText}
                style={styles.questionMathContainer}
              />
            </View>
          ) : (
            <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
          )}

          {/* MCQ Options */}
          {questionType === 'mcq' &&
            currentQuestion.options?.map((option, idx) => (
              <TouchableRipple
                key={idx}
                onPress={() => handleAnswerChange(option.toString())}
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

          {/* Descriptive */}
          {questionType === 'descriptive' && (
            <View style={styles.descriptiveContainer}>
              <Text style={styles.inputLabel}>Your Answer (Descriptive)</Text>
              <RNTextInput
                style={styles.descriptiveInput}
                multiline
                value={currentAnswer}
                onChangeText={(text) => handleAnswerChange(text)}
                placeholder="Type your descriptive answer..."
                placeholderTextColor={Palette.textMuted}
              />
            </View>
          )}

          {/* Geometry */}
          {questionType === 'geometry' && (
            <View style={styles.geometryContainer}>
              {/* Show image if present */}
              {currentQuestion.geometryImage ? (
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Text style={styles.inputLabel}>Question Image:</Text>
                  <Image
                    source={{ uri: currentQuestion.geometryImage }}
                    style={{ width: '100%', height: 200, borderRadius: 8, resizeMode: 'contain', backgroundColor: '#f5f5f5' }}
                  />
                </View>
              ) : null}
              {currentQuestion.geometryExpression?.trim() !== '' && (
                <View style={styles.expressionPreview}>
                  <Text style={styles.expressionTitle}>Geometry Expression:</Text>
                  <SmartLaTeXRenderer
                    latex={currentQuestion.geometryExpression}
                    style={styles.geometryMathContainer}
                  />
                </View>
              )}
              <Text style={styles.inputLabel}>Your Answer (Geometry)</Text>
              <RNTextInput
                style={styles.descriptiveInput}
                multiline
                value={currentAnswer}
                onChangeText={(text) => handleAnswerChange(text)}
                placeholder="Input your own answer or derivation..."
                placeholderTextColor={Palette.textMuted}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* FIXED Navigation Buttons */}
      <View style={styles.navButtonsContainer}>
        {/* Previous Button (only show if not on the first question) */}
        {currentQuestionIndex > 0 && (
          <Animated.View style={[{ transform: [{ scale: prevButtonScale }] }, styles.buttonContainer]}>
            <TouchableRipple
              onPressIn={handlePrevPressIn}
              onPressOut={handlePrevPressOut}
              onPress={handlePreviousQuestion}
              style={styles.prevButton}
              rippleColor={Palette.primaryXLight}
            >
              <Text style={styles.prevButtonText}>Previous</Text>
            </TouchableRipple>
          </Animated.View>
        )}

        {/* Next Button */}
        <Animated.View style={[{ transform: [{ scale: nextButtonScale }] }, styles.buttonContainer]}>
          <TouchableRipple
            onPressIn={handleNextPressIn}
            onPressOut={handleNextPressOut}
            onPress={handleNextQuestion}
            disabled={questionType === 'mcq' ? !currentAnswer : false}
            style={[
              styles.nextButton,
              questionType === 'mcq' && !currentAnswer && styles.disabledButton,
            ]}
            rippleColor="rgba(255,255,255,0.2)"
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < questions.length - 1
                ? 'Next'
                : 'Finish Test'}
            </Text>
          </TouchableRipple>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Palette.bg,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.bg,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.iconlight,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    color: Palette.textLight,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primaryXXLight,
  },
  progressText: {
    fontSize: 14,
    color: Palette.iconLight,
    marginLeft: 10,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211,47,47,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    color: Palette.error,
    fontWeight: '600',
    marginLeft: 6,
  },
  timerTextCritical: {
    color: '#FF0000',
    fontWeight: '800',
    fontSize: 16,
  },
  questionCard: {
    borderRadius: 16,
    backgroundColor: Palette.surface,
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    color: Palette.textMuted,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 20,
    lineHeight: 26,
  },
  questionTextContainer: {
    marginBottom: 20,
  },
  questionMathContainer: {
    minHeight: 60,
    width: '100%',
  },
  option: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  selectedOption: {
    backgroundColor: Palette.primaryXLight,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  optionText: {
    fontSize: 16,
    color: Palette.iconlight,
    marginLeft: 12,
    flex: 1,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionMathContainer: {
    minHeight: 40,
    width: '100%',
  },
  descriptiveContainer: {
    marginTop: 8,
  },
  descriptiveInput: {
    height: 100,
    backgroundColor: Palette.surface,
    borderColor: Palette.primaryLight,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: Palette.text,
    textAlignVertical: 'top',
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.text,
    marginBottom: 4,
  },
  
  // FIXED: Navigation button styles with proper text visibility
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  
  buttonContainer: {
    flex: 1,
  },
  
  prevButton: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 2,
    borderColor: Palette.primary,
  },
  
  prevButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.primary,
  },
  
  nextButton: {
    backgroundColor: Palette.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  
  disabledButton: {
    backgroundColor: Palette.primaryLight,
    opacity: 0.6,
  },
  
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.iconLight,
    marginVertical: 16,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 18,
    color: Palette.text,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultSubText: {
    fontSize: 16,
    color: Palette.textMuted,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  testInfoContainer: {
    width: '100%',
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    elevation: 1,
  },
  testInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testInfoText: {
    fontSize: 16,
    color: Palette.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  resultButton: {
    backgroundColor: Palette.primary,
    borderRadius: 12,
    padding: 16,
    width: 200,
    alignItems: 'center',
    elevation: 2,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.text,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Palette.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Palette.primary,
    borderRadius: 12,
    padding: 16,
    width: 200,
    alignItems: 'center',
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  geometryContainer: {
    marginTop: 8,
  },
  expressionPreview: {
    marginBottom: 16,
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.primaryLight,
  },
  expressionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 8,
  },
  geometryMathContainer: {
    minHeight: 60,
    width: '100%',
  },
  mathLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  mathLoadingText: {
    fontSize: 12,
    color: Palette.textMuted,
    marginLeft: 8,
  },
  mathErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  mathErrorText: {
    fontSize: 12,
    color: '#d32f2f',
    textAlign: 'center',
  },
});

export default TestScreen;