import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Animated,
  ScrollView
} from 'react-native';
import {

  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../../config/firebase';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';

const { width } = Dimensions.get('window');
const boardInfo = {
  CBSE: {
    icon: 'book-education',
    tagline: 'Empowering Future Leaders',
  },
  ICSE: {
    icon: 'earth',
    tagline: 'Comprehensive Skill-Building',
  },
  'State Board': {
    icon: 'school-outline',
    tagline: 'Local Curriculum, Modern Approach',
  },
};

const BoardSelectionScreen = ({ navigation }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const scaleValue = new Animated.Value(1);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'boards'));
        const boardsData = querySnapshot.docs.map((doc) => {
          const boardName = doc.data().name;
          const info = boardInfo[boardName] || { 
            icon: 'school-outline', 
            tagline: 'Quality Education Resources' 
          };
          
          return {
            id: doc.id,
            name: boardName,
            icon: info.icon,
            tagline: info.tagline,
            color: Palette.iconlight,
          };
        });
        setBoards(boardsData);
      } catch (error) {
        console.error('Error fetching boards:', error);
        // Fallback to hardcoded boards if Firebase fails
        setBoards(Object.keys(boardInfo).map(boardName => ({
          id: boardName,
          name: boardName,
          ...boardInfo[boardName],
          color: Palette.iconlight,
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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


  const handleSelectBoard = (board) => {
    setSelectedId(board.id);
    setTimeout(() => {
      navigation.navigate('StandardSelection', { boardId: board.id, boardName: board.name });
    }, 300);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.iconLight} />
        <Text style={styles.loadingText}>Loading boards...</Text>
      </View>
    );
  }

  return (
     <BackgroundWrapper>
        <View style={styles.screenContainer}>
          <View style={styles.headerContainer}>
          
            
            <Text style={styles.header}>Select Your Board</Text>
            <Text style={styles.subHeader}>
              Choose your education board to continue
            </Text>
          </View>
  
          <ScrollView
            contentContainerStyle={styles.boardListContainer}
            showsVerticalScrollIndicator={false}
          >
            {boards.map((board) => (
              <TouchableOpacity
                key={board.id}
                style={[
                  styles.boardCard,
                  selectedId === board.id && styles.selectedCard
                ]}
                activeOpacity={0.85}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => handleSelectBoard(board)}
              >
                <View style={styles.boardCardContent}>
                  <View style={[styles.boardIconContainer, { backgroundColor: Palette.primary }]}>
                    <Icon name={board.icon} size={28} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boardTitle}>{board.name}</Text>
                    <Text style={styles.boardTagline}>{board.tagline}</Text>
                  </View>
                  <Icon 
                    name="chevron-right" 
                    size={24} 
                    color={selectedId === board.id ? Palette.primary : Palette.textMuted} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectionCard: {
    backgroundColor: Palette.bg,
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  boardListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  boardCard: {
    backgroundColor: Palette.bg,
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  boardCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  boardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  boardTagline: {
    marginTop: 2,
    fontSize: 13,
    color: Palette.textMuted,
  },
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.iconlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
  },
  selectedCardText: {
    color: Palette.primary,
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
    fontWeight: '500',
    color: Palette.text,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: Platform.OS === 'ios' ? 0 : -10,
    padding: 8,
    zIndex: 1,
  },
});

export default BoardSelectionScreen;