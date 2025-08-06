import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from 'react-native';
import { 
  Title, 
  Text, 
  useTheme
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { auth } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const { width } = Dimensions.get('window');

const OnlineTestScreen = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('Fetched user data:', data); // Debug log
            setUserData(data);
          } else {
            setError('User data not found');
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const navigateToTestFlow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (userData) {
      console.log('Navigating with:', {
        board: userData.schoolBoard,
        standard: userData.grade
      });
      
      // Navigate directly to subject selection with user's board and standard
      navigation.navigate('SubjectSelection', {
        board: userData.schoolBoard,
        standard: userData.grade,
        boardName: userData.schoolBoard, // Added for display purposes
        standardName: userData.grade     // Added for display purposes
      });
    } else {
      // Fallback to board selection if user data isn't available
      navigation.navigate('BoardSelection');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading your test options...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="alert-circle" size={32} color="#FFFFFF" />
        <Text style={styles.loadingText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.navigate('BoardSelection')}
        >
          <Text style={styles.errorButtonText}>Continue with manual selection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.screenContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Online Test Portal</Text>
          <Text style={styles.subHeader}>
            Challenge yourself with personalized tests
          </Text>
          {userData && (
            <View style={styles.userInfoContainer}>
              <Text style={styles.userInfoText}>
                {userData.schoolBoard} - Class {userData.grade}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.mainContent}>
          {/* Start Test Button */}
          <TouchableOpacity 
            style={styles.startTestButton}
            onPress={navigateToTestFlow}
            activeOpacity={0.9}
          >
            <View style={styles.startTestContent}>
              <View style={styles.startTestIcon}>
                <Icon name="rocket-launch" size={36} color="#fff" />
              </View>
              <View style={styles.startTestText}>
                <Text style={styles.startTestTitle}>Start New Test</Text>
                <Text style={styles.startTestSubtitle}>
                  {userData ? 
                    `Tests for ${userData.schoolBoard} Class ${userData.grade}` : 
                    'Begin your learning journey'
                  }
                </Text>
              </View>
              <Icon name="chevron-right" size={28} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Quick Links */}
          <View style={styles.quickLinksContainer}>
            <TouchableOpacity 
              style={styles.quickLinkCard}
              onPress={() => navigation.navigate('TestHistory')}
              activeOpacity={0.8}
            >
              <View style={styles.quickLinkIcon}>
                <Icon name="history" size={28} color="#fff" />
              </View>
              <Text style={styles.quickLinkText}>Test History</Text>
              <Icon name="chevron-right" size={20} color="#fff" style={styles.chevron} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BackgroundWrapper>
  );
};


const makeStyles = (colors) => StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },

  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    zIndex: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.textLight,
    marginTop: 50,
    letterSpacing: 0.5,
    marginBottom: 8,
    
  },
  subHeader: {
    fontSize: 16,
    color: Palette.textLight,
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 24,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  startTestButton: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 6,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  startTestContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startTestIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  startTestText: {
    flex: 1,
  },
  startTestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  startTestSubtitle: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickLinkCard: {
    height: 80,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    elevation: 4,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    backgroundColor: Palette.surface,
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
  },
  chevron: {
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  optionCard: {
    width: '48%',
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  optionText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: Palette.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.onBackground,
    fontWeight: '500',
  },
  userInfoContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  userInfoText: {
    fontSize: 14,
    color: Palette.textLight,
    fontWeight: '600',
  },
  errorButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: Palette.text,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


export default OnlineTestScreen;