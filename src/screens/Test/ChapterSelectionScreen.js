import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import { Platform } from 'react-native';

const ChapterSelectionScreen = ({ route, navigation }) => {
  const { boardId, standardId, subjectId, subjectName } = route.params;
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const scaleValue = new Animated.Value(1);

  // Match the color system from SubjectSelectionScreen
  const getChapterColor = () => Palette.primary; // Single color for all chapters

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        const chaptersRef = collection(
          db,
          `boards/${boardId}/standards/${standardId}/subjects/${subjectId}/chapters`
        );
        const querySnapshot = await getDocs(chaptersRef);
        
        const chaptersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || `Chapter ${doc.id}`,
          testCount: doc.data().testCount || 0,
        }));

        setChapters(chaptersData);
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [boardId, standardId, subjectId]);

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

  const handleSelectChapter = (chapter) => {
    setSelectedId(chapter.id);
    setTimeout(() => {
      navigation.navigate('TestList', {
        boardId,
        standardId,
        subjectId,
        chapterId: chapter.id,
        chapterName: chapter.name,
      });
    }, 200);
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loadingText}>Loading chapters...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  if (error) {
    return (
      <BackgroundWrapper>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={Palette.error}
          />
          <Text style={styles.errorText}>Couldn't load chapters</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonLabel}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.screenContainer}>
        <View style={styles.headerContainer}>
          {/* <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={Palette.text} />
          </TouchableOpacity> */}
          
          <Text style={styles.header}>{subjectName}</Text>
          <Text style={styles.subHeader}>Select a chapter to begin</Text>
        </View>

        <FlatList
          data={chapters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const chapterColor = getChapterColor();
            return (
              <Animated.View style={[styles.chapterCard]}>
                <TouchableRipple
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => handleSelectChapter(item)}
                  rippleColor={`${chapterColor}33`}
                  style={styles.touchable}
                >
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.avatarContainer,
                        { backgroundColor: chapterColor },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="book"
                        size={24}
                        color={Palette.iconLight}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.chapterName}>{item.name}</Text>
                      <Text style={styles.testCount}>
                        {item.testCount} {item.testCount === 1 ? 'test' : 'tests'} available
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={chapterColor}
                    />
                  </View>
                </TouchableRipple>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="book-remove-outline"
                size={48}
                color={Palette.textFaded}
              />
              <Text style={styles.emptyText}>No chapters available</Text>
              <Text style={styles.emptySubtext}>
                Check back later or contact your instructor
              </Text>
            </View>
          }
        />
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
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
  chapterCard: {
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
  chapterName: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  testCount: {
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
    padding: 12,
    borderRadius: 4,
  },
  buttonLabel: {
    color: Palette.primary,
    fontWeight: '600',
  },
});

export default ChapterSelectionScreen;