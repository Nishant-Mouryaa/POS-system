import React, { useLayoutEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { Title, Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';

const availableStandards = [6, 7, 8, 9, 10];
const standardInfo = {
  6: { icon: 'numeric-6-box', tagline: 'Building Strong Foundations' },
  7: { icon: 'numeric-7-box', tagline: 'Stepping Up Your Skills' },
  8: { icon: 'numeric-8-box', tagline: 'Exploring Bigger Ideas' },
  9: { icon: 'numeric-9-box', tagline: 'Broadening Perspectives' },
  10: { icon: 'numeric-10-box', tagline: 'Focusing on Key Goals' },
  
};

export default function StandardSelectionScreen({ route, navigation }) {
  const { board } = route.params || {};

  // Optionally, set header title or back button, etc.
  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${board} - Select Class`,
    });
  }, [navigation, board]);

  const handleStandardPress = (std) => {
    // Navigate to the textbooks list screen
    navigation.navigate('TextbooksList', { board, standard: std });
  };

  return (
    <BackgroundWrapper>
    <View style={styles.screenContainer}>
     
      <Title style={styles.selectionTitle}>Select Your Class</Title>
      <Text style={styles.selectionSubtitle}>
        Each class is designed to build on your progress. Pick your level!
      </Text>

      <ScrollView
        contentContainerStyle={styles.boardListContainer}
        showsVerticalScrollIndicator={false}
      >
        {availableStandards.map((std) => {
          const info = standardInfo[std] || {
            icon: 'school',
            tagline: 'Explore Our Resources',
          };

          return (
            <TouchableOpacity
              key={std}
              style={styles.boardCard}
              activeOpacity={0.85}
              onPress={() => handleStandardPress(std)}
            >
              <View style={styles.boardCardContent}>
                <View style={styles.boardIconContainer}>
                  <Icon name={info.icon} size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.boardTitle}>Class {std}</Text>
                  <Text style={styles.boardTagline}>{info.tagline}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#fff" />
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
  screenContainer: {
    flex: 1,
    backgroundColor: Palette.primaryDark,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    position: 'relative',
  },

  selectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.textLight,
    marginTop: 30,
    marginBottom: 8,
    textAlign: 'center',
  },
  selectionSubtitle: {
    fontSize: 14,
    color: Palette.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
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
    color: '#333',
  },
  boardTagline: {
    marginTop: 2,
    fontSize: 13,
    color: '#777',
  },
});

