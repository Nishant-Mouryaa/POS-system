import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
  Animated
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from '../../config/firebase';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';

const { width } = Dimensions.get('window');

const StandardSelectionScreen = ({ navigation, route }) => {
  const { boardId } = route.params;
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  
  // Using useRef instead of direct Animated.Value
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Helper function to get appropriate icon for standard
  const getStandardIcon = (standardName, index) => {
    // Create a mapping of common class names to icons
    const iconMapping = {
      '1': 'numeric-1-circle',
      '2': 'numeric-2-circle',
      '3': 'numeric-3-circle',
      '4': 'numeric-4-circle',
      '5': 'numeric-5-circle',
      '6': 'numeric-6-circle',
      '7': 'numeric-7-circle',
      '8': 'numeric-8-circle',
      '9': 'numeric-9-circle',
      '10': 'numeric-10-circle',
      '11': 'numeric-11-circle',
      '12': 'numeric-12-circle',
      'I': 'numeric-1-circle',
      'II': 'numeric-2-circle',
      'III': 'numeric-3-circle',
      'IV': 'numeric-4-circle',
      'V': 'numeric-5-circle',
      'VI': 'numeric-6-circle',
      'VII': 'numeric-7-circle',
      'VIII': 'numeric-8-circle',
      'IX': 'numeric-9-circle',
      'X': 'numeric-10-circle',
      'XI': 'numeric-11-circle',
      'XII': 'numeric-12-circle',
    };

    // First try to match the standard name
    if (iconMapping[standardName]) {
      return iconMapping[standardName];
    }

    // If no match, try to extract number from name
    const numMatch = standardName.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0]);
      if (num >= 1 && num <= 12) {
        return `numeric-${num}-circle`;
      }
    }

    // Fallback to generic icons based on index
    const fallbackIcons = [
      'school',
      'book-open-variant',
      'pencil',
      'calculator',
      'flask',
      'atom',
      'chart-line',
      'globe-model',
      'dna',
      'function-variant',
      'chart-bell-curve',
      'rocket-launch'
    ];

    return fallbackIcons[index % fallbackIcons.length];
  };

  // Helper function to format class title
  const formatClassTitle = (name) => {
    // If the name already contains "Class", return it as is
    if (name.toLowerCase().includes('class')) {
      return name;
    }
    // Otherwise, add "Class" prefix
    return `Class ${name}`;
  };

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const standardsRef = collection(db, `boards/${boardId}/standards`);
        const querySnapshot = await getDocs(standardsRef);
        const standardsData = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          name: doc.data().name,
          icon: getStandardIcon(doc.data().name, index),
          subjectsCount: doc.data().subjectsCount || 0
        }));
        setStandards(standardsData);
      } catch (error) {
        console.error("Error fetching standards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandards();
  }, [boardId]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectStandard = (standard) => {
    setSelectedId(standard.id);
    navigation.navigate('SubjectSelection', { 
      boardId,
      standardId: standard.id,
      standardName: standard.name
    });
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.primary} />
          <Text style={styles.loadingText}>Loading classes...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.screenContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={Palette.iconLight} />
          </TouchableOpacity>
          
          <Text style={styles.header}>Select Your Class</Text>
          <Text style={styles.subHeader}>
            Choose your class/grade to continue
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {standards.map((standard) => (
            <TouchableOpacity
              key={standard.id}
              style={[
                styles.classCard,
                selectedId === standard.id && styles.selectedCard
              ]}
              activeOpacity={0.85}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => handleSelectStandard(standard)}
            >
              <View style={styles.classCardContent}>
                <View style={styles.classIconContainer}>
                  <Icon 
                    name={standard.icon} 
                    size={28} 
                    color={Palette.iconLight} 
                  />
                </View>
                <View style={styles.classInfo}>
                  {/* Use the formatClassTitle function instead of hardcoding "Class" */}
                  <Text style={styles.classTitle}>{formatClassTitle(standard.name)}</Text>
                  <Text style={styles.classSubtitle}>
                    {standard.subjectsCount} subjects available
                  </Text>
                </View>
                <Icon 
                  name="chevron-right" 
                  size={24} 
                  color={selectedId === standard.id ? Palette.primary : Palette.textMuted}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: Palette.iconLight,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.iconLight,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 16,
    color: Palette.iconLight,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
    paddingHorizontal: 30,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  classCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: Palette.primary,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  classCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  classInfo: {
    flex: 1,
  },
  classTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  classSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Palette.textMuted,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: Platform.OS === 'ios' ? 0 : -10,
    padding: 8,
    zIndex: 1,
  },
});

export default StandardSelectionScreen;