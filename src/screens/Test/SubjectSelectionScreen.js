import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Text, Button, TouchableRipple } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { Palette } from '../../theme/colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BackgroundWrapper from '../../components/BackgroundWrapper';

const { width } = Dimensions.get('window');

const SubjectSelectionScreen = ({ route }) => {
  const styles = React.useMemo(() => makeStyles(Palette), []);
  const navigation = useNavigation();

  // Extract route params first
  const [boardId] = useState(route.params?.boardId || null);
  const [standardId] = useState(route.params?.standardId || null);
  const [boardName] = useState(route.params?.boardName || null);
  const [standardName] = useState(route.params?.standardName || null);

  // State
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [resolvedBoardId, setResolvedBoardId] = useState(boardId);
  const [resolvedStandardId, setResolvedStandardId] = useState(standardId);
  const [resolvedBoardName, setResolvedBoardName] = useState(boardName);
  const [resolvedStandardName, setResolvedStandardName] = useState(standardName);

  const scaleValue = new Animated.Value(1);

  // Subject icons & color mappings
  const subjectData = {
    Mathematics: { icon: 'calculator-variant', color: Palette.primary },
    Science:     { icon: 'flask',             color: Palette.success || Palette.primary },
    English:     { icon: 'book-alphabet',     color: Palette.accent || Palette.primaryLight },
    History:     { icon: 'history',           color: Palette.warning || Palette.primaryLight },
    Physics:     { icon: 'atom',              color: Palette.info || Palette.accent },
    Chemistry:   { icon: 'flask',             color: Palette.accentDark || Palette.success },
    Biology:     { icon: 'leaf',              color: Palette.success },
    Geography:   { icon: 'earth',             color: Palette.accentLight || Palette.accent },
    Economics:   { icon: 'finance',           color: Palette.warning || Palette.primaryLight },
    default:     { icon: 'book-open-variant', color: Palette.textFaded || '#999999' },
  };

  // useFocusEffect is often helpful if data needs to be re-fetched once screen is in focus
  // This approach also ensures when you navigate from or back to the screen, data stays consistent
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      
      const fetchAllData = async () => {
        try {
          setIsLoading(true);

          // If route didn't supply a board/standard, we’ll fetch from user doc
          let boardIdLocal = resolvedBoardId;
          let standardIdLocal = resolvedStandardId;
          let boardNameLocal = resolvedBoardName;
          let standardNameLocal = resolvedStandardName;

          const user = auth.currentUser;
          if (user && (!boardIdLocal || !standardIdLocal)) {
            // Firestore calls in parallel
            const [userDocSnapshot] = await Promise.all([
              getDoc(doc(db, 'users', user.uid)),
            ]);

            if (userDocSnapshot.exists()) {
              const data = userDocSnapshot.data();
              setUserData(data);

              // If we haven’t already got the boardId or standardId from route, fetch
              if (!boardIdLocal || !standardIdLocal) {
                // Let’s get boards and standards in parallel too
                const boardsQuery = query(collection(db, 'boards'), where('name', '==', data.schoolBoard));
                const boardsSnapshotPromise = getDocs(boardsQuery);
                
                // optional: we can keep fetching the userDoc in parallel with boards
                const boardsSnapshot = await boardsSnapshotPromise;
                if (!boardsSnapshot.empty) {
                  const boardDocRef = boardsSnapshot.docs[0];
                  boardIdLocal = boardDocRef.id;
                  boardNameLocal = boardDocRef.data().name;

                  // Now fetch standard doc
                  const gradeName = `Class ${data.grade}`; // Normalize to match Firestore
                  const standardsQuery = query(
                    collection(db, `boards/${boardIdLocal}/standards`),
                    where('name', '==', gradeName)
                  );
                  const standardsSnapshot = await getDocs(standardsQuery);

                  if (!standardsSnapshot.empty) {
                    const standardDocRef = standardsSnapshot.docs[0];
                    standardIdLocal = standardDocRef.id;
                    standardNameLocal = standardDocRef.data().name;
                  } else {
                    throw new Error(`No standard found for grade ${data.grade}`);
                  }
                } else {
                  throw new Error(`No board found with name ${data.schoolBoard}`);
                }
              }
            }
          }

          // Now we have board/standard, fetch subjects
          if (!boardIdLocal || !standardIdLocal) {
            throw new Error('Board or Standard is missing — please go back and select them.');
          }

          // Once we have updated values, set them in state
          setResolvedBoardId(boardIdLocal);
          setResolvedStandardId(standardIdLocal);
          setResolvedBoardName(boardNameLocal);
          setResolvedStandardName(standardNameLocal);

          const subjectsRef = collection(db, `boards/${boardIdLocal}/standards/${standardIdLocal}/subjects`);
          const subjectDocs = await getDocs(subjectsRef);
          const subjectsData = subjectDocs.docs.map(docSnap => ({
            id: docSnap.id,
            name: docSnap.data().name,
            chapterCount: docSnap.data().chapterCount || 0,
          }));

          if (mounted) {
            setSubjects(subjectsData);
            setError(null);
          }
        } catch (err) {
          console.log('Error fetching data:', err);
          setError(err.message || 'Failed to load data');
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

      fetchAllData();

      return () => {
        mounted = false;
      };
    }, [
      // We might watch route.params here if those can change
      route.params,
      resolvedBoardId,
      resolvedStandardId,
      resolvedBoardName,
      resolvedStandardName
    ])
  );

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

  const handleSelectSubject = (subject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedId(subject.id);
    setTimeout(() => {
      navigation.navigate('ChapterSelection', {
        boardId: resolvedBoardId,
        standardId: resolvedStandardId,
        subjectId: subject.id,
        subjectName: subject.name,
        boardName: resolvedBoardName || userData?.schoolBoard,
        standardName: resolvedStandardName || userData?.grade,
      });
    }, 200);
  };

  if (isLoading && (!resolvedBoardId || !resolvedStandardId)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading your curriculum...</Text>
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
        {userData && (
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('BoardSelection')}
            style={[styles.retryButton, { marginTop: 12 }]}
            labelStyle={styles.buttonLabel}
          >
            Select Manually
          </Button>
        )}
      </View>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.screenContainer}>
        <View style={styles.headerContainer}>
         

          <Text style={styles.header}>Select Subject</Text>
          <Text style={styles.subHeader}>
            {resolvedBoardName && resolvedStandardName 
              ? `Subjects for ${resolvedBoardName} - Class ${resolvedStandardName}` 
              : userData 
                ? `Subjects for ${userData.schoolBoard} - Class ${userData.grade}`
                : 'Choose a subject to view available chapters'
            }
          </Text>
        </View>

        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const subjectInfo = subjectData[item.name] || subjectData.default;
            return (
              <Animated.View style={[styles.subjectCard]}>
                <TouchableRipple
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => handleSelectSubject(item)}
                  rippleColor={`${subjectInfo.color}33`}
                  style={styles.touchable}
                >
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.avatarContainer,
                        { backgroundColor: subjectInfo.color },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={subjectInfo.icon}
                        size={24}
                        color={Palette.iconlight}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.subjectName}>{item.name}</Text>
                      <Text style={styles.chapterCount}>
                        {item.chapterCount}{' '}
                        {item.chapterCount === 1 ? 'chapter' : 'chapters'} available
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={subjectInfo.color}
                    />
                  </View>
                </TouchableRipple>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            !isLoading && (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="book-remove-outline"
                  size={48}
                  color={Palette.textFaded}
                />
                <Text style={styles.emptyText}>No subjects available</Text>
                <Text style={styles.emptySubtext}>
                  {resolvedBoardName && resolvedStandardName 
                    ? `No subjects found for ${resolvedBoardName} - Class ${resolvedStandardName}` 
                    : userData 
                      ? `No subjects found for ${userData.schoolBoard} - Class ${userData.grade}`
                      : 'Please check back later or contact your institution'
                  }
                </Text>
              </View>
            )
          }
        />
      </View>
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
      position: 'relative',
      marginTop: Platform.OS === 'ios' ? 0 : 20,
    },
    backButton: {
      position: 'absolute',
      left: 24,
      top: Platform.OS === 'ios' ? 0 : -10,
      padding: 8,
      zIndex: 1,
    },
    header: {
      fontSize: 26,
      fontWeight: '800',
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
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      paddingTop: 10,
    },
    subjectCard: {
      backgroundColor: Palette.surface,
      borderRadius: 16,
      marginBottom: 16,
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
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    subjectName: {
      fontSize: 18,
      fontWeight: '700',
      color: Palette.text,
      marginBottom: 4,
    },
    chapterCount: {
      fontSize: 14,
      color: Palette.textMuted,
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
      backgroundColor: Palette.primaryXXLight,
    },
    buttonLabel: {
      color: Palette.primary,
      fontWeight: '600',
    },
  });

export default SubjectSelectionScreen;
