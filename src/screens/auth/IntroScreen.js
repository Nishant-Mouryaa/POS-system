import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';

const { width: screenWidth } = Dimensions.get('window');

const IntroScreen = ({ navigation }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const slides = [
    {
      id: 1,
      title: "Welcome to IYERS CLASSES",
      content: "A trusted name in academic excellence since 1990. Located in Virar West, we are dedicated to nurturing young minds through personalized coaching for students from 1st to 12th grade, spanning ICSE, CBSE, and SSC boards.",
      highlight: "Empowering Students Since 1990"
    },
    {
      id: 2,
      title: "Our Legacy",
      content: "With over three decades of experience, IYERS emphasizes personalized attention, experienced faculty, modern teaching techniques, and affordable fees. We offer comprehensive coaching for Science, Commerce, and Arts streams.",
      highlight: "30+ Years of Excellence"
    },
    {
      id: 3,
      title: "Academic Achievements",
      content: "Our students consistently achieve top ranks in their respective schools and boards. We take pride in our track record of producing high achievers who excel in their academic pursuits.",
      highlight: "Proven Results"
    },
    {
      id: 4,
      title: "Notable Alumni",
      content: "Our alumni have made remarkable contributions in diverse fields such as medicine, engineering, politics, and aviation. They are testament to the quality education and foundation provided at IYERS CLASSES.",
      highlight: "Success Stories"
    },
    {
      id: 5,
      title: "Our Mission & Vision",
      content: "We are committed to transforming students into confident, responsible achievers. Our mission is to provide quality education that fosters excellence, with a vision to become the leading academic center in Virar and beyond.",
      highlight: "Join Us Today!"
    }
  ];

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveSlide(slideIndex);
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              activeSlide === index && styles.paginationDotActive
            ]}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: index * screenWidth,
                animated: true
              });
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        
        {/* Header with logo and text */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/institute-logo.jpg')} 
              style={styles.logo} 
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>IYERS CLASSES</Text>
            <Text style={styles.taglineText}>Excellence in Education Since 1990</Text>
          </View>
        </View>

        {/* Sliding cards area */}
        <View style={styles.cardsContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {slides.map((slide) => (
              <View key={slide.id} style={[styles.slideCard, { width: screenWidth - 40 }]}>
                <View style={styles.cardContent}>
                  <Text style={styles.highlightText}>{slide.highlight}</Text>
                  <Text style={styles.cardTitle}>{slide.title}</Text>
                  <Text style={styles.cardDescription}>{slide.content}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination dots */}
          {renderPagination()}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInButtonText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
  },

  // Header styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.primaryXLight,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    padding: 5,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    color: Palette.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taglineText: {
    fontSize: 14,
    color: Palette.textLight,
    fontWeight: '500',
  },

  // Cards container
  cardsContainer: {
    flex: 1,
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  slideCard: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  verticalScroll: {
    flex: 1,
  },
  verticalScrollContent: {
    flexGrow: 1,
  },

  // Card itself
  cardContent: {
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: Palette.primaryXLight,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: '#FFFFFF',
    // Remove fixed height and let content determine height
    minHeight: 200, // Minimum height for cards
  },

  highlightText: {
    fontSize: 14,
    color: Palette.primary,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 30,
  },
  cardDescription: {
    fontSize: 16,
    color: Palette.textMuted,
    lineHeight: 26,
    textAlign: 'justify',
    fontWeight: '400',
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.textFaded,
    marginHorizontal: 6,
  },
  paginationDotActive: {
    backgroundColor: Palette.primary,
    width: 30,
    height: 10,
    borderRadius: 5,
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.3,
    elevation: 5,
    minWidth: 120,
  },
  signInButton: {
    backgroundColor: Palette.primary,
  },
  registerButton: {
    backgroundColor: Palette.surface,
  },
  signInButtonText: {
    color: Palette.textLight,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  registerButtonText: {
    color: Palette.primary,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});