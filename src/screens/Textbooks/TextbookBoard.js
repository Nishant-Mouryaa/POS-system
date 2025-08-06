import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {  Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';

const { width } = Dimensions.get('window');

const availableBoards = ['CBSE', 'ICSE', 'State Board'];

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

export default function BoardSelectionScreen({ navigation }) {
  const [showIntro, setShowIntro] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  const handleContinue = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setShowIntro(false));
  };

  const handleBoardPress = (board) => {
    navigation.navigate('TextbookClass', { board });
  };

  if (showIntro) {
    return (
      <BackgroundWrapper>
        <Animated.View style={[styles.introContainer, { opacity: fadeAnim }]}>
          <View style={styles.introContent}>
            <Icon name="school" size={60} color={Palette.primary} style={styles.introIcon} />
            <Text style={styles.introTitle}>Welcome to Your Learning Journey</Text>
            <Text style={styles.introText}>
              We'll help you find the perfect study materials tailored to your education board.
              Let's get started by selecting your board from the next screen.
            </Text>
            <Button
              mode="contained"
              onPress={handleContinue}
              style={styles.continueButton}
              labelStyle={styles.continueButtonText}
            >
              Get Started
            </Button>
          </View>
        </Animated.View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.screenContainer}>
        <Text style={styles.selectionTitle}>Select Your Board</Text>
        <Text style={styles.selectionSubtitle}>
          We've curated boards to match your curriculum. Pick one to proceed!
        </Text>

        <ScrollView
          contentContainerStyle={styles.boardListContainer}
          showsVerticalScrollIndicator={false}
        >
          {availableBoards.map((board) => {
            const info = boardInfo[board] || { icon: 'school', tagline: '' };
            return (
              <TouchableOpacity
                key={board}
                style={styles.boardCard}
                activeOpacity={0.85}
                onPress={() => handleBoardPress(board)}
              >
                <View style={styles.boardCardContent}>
                  <View style={styles.boardIconContainer}>
                    <Icon name={info.icon} size={28} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boardTitle}>{board}</Text>
                    <Text style={styles.boardTagline}>{info.tagline}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={Palette.primary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  introContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  introIcon: {
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    color: Palette.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  continueButton: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: Palette.primary,
  },
  continueButtonText: {
    color: Palette.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  selectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.textLight,
    marginTop: 50,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  selectionSubtitle: {
    fontSize: 16,
    color: Palette.textLight,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 30,
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
});