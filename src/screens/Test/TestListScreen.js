import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import {
  Text,
  Button,
  TouchableRipple,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { Palette } from '../../theme/colors';

const { width } = Dimensions.get('window');

const TestListScreen = ({ route }) => {
  const navigation = useNavigation();
  const styles = React.useMemo(() => makeStyles(Palette), []);

  const { boardId, standardId, subjectId, chapterId, chapterName } = route.params;
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // Animation for press feedback
  const scaleValue = new Animated.Value(1);
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const testsRef = collection(
          db,
          `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}/tests`
        );
        const querySnapshot = await getDocs(testsRef);

        const testsData = await Promise.all(
          querySnapshot.docs.map(async (testDoc) => {
            // Extract the new fields (createdAt, description, duration, title)
            // Firestore timestamps should be converted to a Date (or you can store them as a string)
            const {
              title,
              description,
              duration,
              createdAt,
            } = testDoc.data();

            // Get question count (or remove if it’s not needed)
            const questionsRef = collection(
              db,
              `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters/${chapterId}/tests/${testDoc.id}/questions`
            );
            const questionsSnapshot = await getDocs(questionsRef);
            const questionCount = questionsSnapshot.size;

            return {
              id: testDoc.id,
              // Fallbacks if fields are missing
              title: title || `Test ${testDoc.id}`,
              description: description || 'No description provided',
              duration: duration || 30,
              createdAt: createdAt ? createdAt.toDate().toString() : 'No date',
              questionCount,
            };
          })
        );

        // Optionally filter out tests that have no questions, etc.
        setTests(testsData.filter((test) => test.questionCount > 0));
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [boardId, standardId, subjectId, chapterId]);

  // Navigates to the actual test screen
  const startTest = (test) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedId(test.id);
    setTimeout(() => {
      navigation.navigate('TestScreen', {
        boardId,
        standardId,
        subjectId,
        chapterId,
        testId: test.id,
        duration: test.duration * 60, // Convert minutes to seconds
        testName: test.title,
      });
    }, 200);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading tests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={Palette.error}
        />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.retryButton}
          labelStyle={styles.buttonLabel}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <BackgroundWrapper>
      <ScrollView style={styles.screenContainer}>
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons
            name="clipboard-text"
            size={36}
            color={Palette.iconLight}
            style={styles.headerIcon}
          />
          <Text style={styles.header}>Chapter: {chapterName}</Text>
          <Text style={styles.subHeader}>Select a test to begin</Text>
        </View>

        <View style={styles.contentContainer}>
          {tests.length > 0 ? (
            tests.map((test) => (
              <Animated.View
                key={test.id}
                style={[
                  styles.testCard,
                  {
                    transform: [
                      { scale: selectedId === test.id ? scaleValue : 1 },
                    ],
                  },
                ]}
              >
                <TouchableRipple
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => startTest(test)}
                  rippleColor={Palette.primaryXXLight}
                  style={styles.touchable}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.testIcon}>
                      <MaterialCommunityIcons
                        name="clipboard-text-outline"
                        size={24}
                        color={Palette.primary}
                      />
                    </View>

                    {/* Main textual info */}
                    <View style={styles.textContainer}>
                      {/* Title */}
                      <Text style={styles.testName}>{test.title}</Text>
                      {/* Description */}
                      <Text style={styles.descText}>{test.description}</Text>
                      {/* Info row */}
                      <View style={styles.detailsContainer}>
                        <View style={styles.detailItem}>
                          <MaterialCommunityIcons
                            name="clock-outline"
                            size={16}
                            color={Palette.textMuted}
                          />
                          <Text style={styles.detailText}>
                            {test.duration} mins
                          </Text>
                        </View>
                        <View style={styles.detailItem}>
                          <MaterialCommunityIcons
                            name="help-circle-outline"
                            size={16}
                            color={Palette.textMuted}
                          />
                          <Text style={styles.detailText}>
                            {test.questionCount} Qs
                          </Text>
                        </View>
                      </View>
                      
                    </View>

                    {/* Chevron / Right arrow */}
                    <View style={styles.rightContent}>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={Palette.primary}
                      />
                    </View>
                  </View>
                </TouchableRipple>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="clipboard-remove-outline"
                size={48}
                color={Palette.textFaded}
              />
              <Text style={styles.emptyText}>No tests available</Text>
              <Text style={styles.emptySubtext}>
                Check back later or contact your instructor
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
};

const makeStyles = () =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      position: 'relative',
      paddingTop: 60,
    },
    headerContainer: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      alignItems: 'center',
    },
    headerIcon: {
      marginBottom: 15,
    },
    header: {
      fontSize: 24,
      fontWeight: '700',
      color: Palette.textLight,
      marginBottom: 8,
      textAlign: 'center',
    },
    subHeader: {
      fontSize: 16,
      color: Palette.textLight,
      textAlign: 'center',
      paddingHorizontal: 40,
      lineHeight: 22,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    testCard: {
      backgroundColor: Palette.surface,
      borderRadius: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Palette.border || Palette.primaryXXLight,
      overflow: 'hidden',
      elevation: 3,
    },
    touchable: {
      padding: 16,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    testIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Palette.primaryXLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    testName: {
      fontSize: 16,
      fontWeight: '600',
      color: Palette.text,
      marginBottom: 4,
    },
    descText: {
      fontSize: 14,
      color: Palette.textMuted,
      marginBottom: 8,
    },
    detailsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 4,
    },
    detailText: {
      fontSize: 12,
      color: Palette.textMuted,
      marginLeft: 4,
    },
    dateText: {
      marginTop: 4,
      fontSize: 12,
      color: Palette.textMuted,
    },
    rightContent: {
      flexDirection: 'row',
      alignItems: 'center',
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
      color: Palette.text,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 18,
      color: Palette.text,
      marginTop: 16,
      fontWeight: '500',
    },
    emptySubtext: {
      fontSize: 14,
      color: Palette.textMuted,
      marginTop: 8,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: Palette.bg,
    },
    errorText: {
      fontSize: 18,
      color: Palette.error,
      marginVertical: 16,
      fontWeight: '500',
    },
    retryButton: {
      marginTop: 12,
      backgroundColor: Palette.surfaceLight || Palette.primaryXXLight,
    },
    buttonLabel: {
      color: Palette.primary,
      fontWeight: '600',
    },
  });

export default TestListScreen;
