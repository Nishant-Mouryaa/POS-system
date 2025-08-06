import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';

const { width, height } = Dimensions.get('window');

const AboutUsScreen = () => {
  const openLink = async (url) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  };

  const handleContact = (type, value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (type) {
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'website':
        Linking.openURL(`https://${value}`);
        break;
      case 'address':
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`
        );
        break;
      default:
        break;
    }
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.heroContent}>
            <Text style={styles.header}>IYERS CLASSES</Text>
            <Text style={styles.subHeader}>Empowering young minds since 1990</Text>
            <Text style={styles.tagline}>Knowledge is Power.</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <FontAwesome5 name="chalkboard-teacher" size={32} color={Palette.primary} />
            <Text style={styles.statNumber}>30+</Text>
            <Text style={styles.statLabel}>Years Experience</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="school" size={32} color={Palette.primary} />
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>Students Taught</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="trophy" size={32} color={Palette.primary} />
            <Text style={styles.statNumber}>90%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Main Content Container */}
        <View style={styles.contentContainer}>
          {/* Why Choose Us Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="star"
                size={28}
                color={Palette.primary}
              />
              <Text style={styles.sectionTitle}>Why Choose Us?</Text>
            </View>
            <View style={styles.methodologyItem}>
              <View style={styles.methodologyIcon}>
                <MaterialCommunityIcons
                  name="history"
                  size={20}
                  color={Palette.bg}
                />
              </View>
              <Text style={styles.methodologyText}>
                Legacy of over three decades
              </Text>
            </View>
            <View style={styles.methodologyItem}>
              <View style={styles.methodologyIcon}>
                <MaterialCommunityIcons
                  name="account-tie"
                  size={20}
                  color={Palette.bg}
                />
              </View>
              <Text style={styles.methodologyText}>
                Experienced and qualified teachers
              </Text>
            </View>
            <View style={styles.methodologyItem}>
              <View style={styles.methodologyIcon}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color={Palette.bg}
                />
              </View>
              <Text style={styles.methodologyText}>
                Small batch sizes for personalized attention
              </Text>
            </View>
            <View style={styles.methodologyItem}>
              <View style={styles.methodologyIcon}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={20}
                  color={Palette.bg}
                />
              </View>
              <Text style={styles.methodologyText}>
                Regular tests and performance tracking
              </Text>
            </View>
            <View style={styles.methodologyItem}>
              <View style={styles.methodologyIcon}>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={20}
                  color={Palette.bg}
                />
              </View>
              <Text style={styles.methodologyText}>
                Modern teaching techniques
              </Text>
            </View>
            <View style={styles.methodologyItem}>
              <View style={styles.methodologyIcon}>
                <MaterialCommunityIcons
                  name="home-heart"
                  size={20}
                  color={Palette.bg}
                />
              </View>
              <Text style={styles.methodologyText}>
                Vibrant, nurturing environment
              </Text>
            </View>
            <View style={styles.methodologyItem}>
              <View style={styles.methodologyIcon}>
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
                  color={Palette.bg}
                />
              </View>
              <Text style={styles.methodologyText}>
                Lowest fees without compromising on quality
              </Text>
            </View>
          </View>

          {/* Courses Offered Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="book-education"
                size={28}
                color={Palette.primary}
              />
              <Text style={styles.sectionTitle}>Courses Offered</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Standards 1 to 10:</Text>
            <Text style={styles.sectionText}>All subjects for ICSE, CBSE & SSC</Text>
            <Text style={[styles.sectionText, {marginBottom: 15}]}>(English & Semi-English Medium)</Text>
            
            <Text style={styles.sectionSubtitle}>Standards 11 & 12:</Text>
            <View style={styles.courseRow}>
              <MaterialCommunityIcons name="flask" size={20} color={Palette.primary} />
              <Text style={styles.courseText}>Science</Text>
            </View>
            <View style={styles.courseRow}>
              <MaterialCommunityIcons name="calculator" size={20} color={Palette.primary} />
              <Text style={styles.courseText}>Commerce</Text>
            </View>
            <View style={styles.courseRow}>
              <MaterialCommunityIcons name="palette" size={20} color={Palette.primary} />
              <Text style={styles.courseText}>Arts</Text>
            </View>
          </View>

          {/* Our Toppers Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="trophy"
                size={28}
                color={Palette.primary}
              />
              <Text style={styles.sectionTitle}>Our Toppers</Text>
            </View>
            
            <Text style={styles.topperYear}>Top Performers (2024-25)</Text>
            <View style={styles.topperContainer}>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Tanvi Pawar</Text>
                <Text style={styles.topperDetails}>7th Std, CBSE – 1st in Treehouse – 95.7%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Ayush Jha</Text>
                <Text style={styles.topperDetails}>7th Std, CBSE – 91.1%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Kiyaansh Rathod</Text>
                <Text style={styles.topperDetails}>8th Std, CBSE – 93%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Anvi Pandey</Text>
                <Text style={styles.topperDetails}>8th Std, CBSE – 91%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Rudra Singh</Text>
                <Text style={styles.topperDetails}>5th Std, CBSE – 89.5%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Chaitree Vadera</Text>
                <Text style={styles.topperDetails}>8th Std, CBSE – 89%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Anjali Yadav</Text>
                <Text style={styles.topperDetails}>7th Std, State Board, MGM – 1st in MGM School – 92.66%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Eshwari Manjrekar</Text>
                <Text style={styles.topperDetails}>7th Std, State Board, MGM – 2nd in MGM School 90.33%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Ethan Dias</Text>
                <Text style={styles.topperDetails}>8th Std, State Board – 88%</Text>
              </View>
            </View>

            <Text style={styles.topperYear}>Top Performers (2023-24)</Text>
            <View style={styles.topperContainer}>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Vaishnavi Singh</Text>
                <Text style={styles.topperDetails}>10th CBSE, Treehouse – 93%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Shravani</Text>
                <Text style={styles.topperDetails}>10th State Board, National School – 92%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Twisha Barot</Text>
                <Text style={styles.topperDetails}>9th State Board – 92%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Rishabh Jain</Text>
                <Text style={styles.topperDetails}>10th State Board, Vidya Vihar – 88%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Aditya Gupta</Text>
                <Text style={styles.topperDetails}>10th State Board, Vidya Vihar – 87%</Text>
              </View>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Rakesh Yadav</Text>
                <Text style={styles.topperDetails}>10th State Board, Vidya Vihar – 86%</Text>
              </View>
            </View>

            <Text style={styles.topperYear}>Top Performer (2022-23)</Text>
            <View style={styles.topperContainer}>
              <View style={styles.topperItem}>
                <Text style={styles.topperName}>Vidhula Shanmuganathan</Text>
                <Text style={styles.topperDetails}>10th CBSE, Treehouse – 1st Rank – 96%</Text>
              </View>
            </View>
          </View>

          {/* Notable Alumni Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="account-group"
                size={28}
                color={Palette.primary}
              />
              <Text style={styles.sectionTitle}>Our Notable Alumni</Text>
            </View>
            <View style={styles.alumniContainer}>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="doctor" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Dr. Michael Kuruthukulangara (Gastroenterologist & Hepatologist)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="doctor" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Dr. Simin Khan Fraizer (Resident Physician, LSU Health Shreveport)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="doctor" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Dr. Vicky Jain (Orthopedic Surgeon, Virar)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="hard-hat" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Girish Madke (Computer Science Engineer, Sydney, Australia)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="account-tie" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Trupti Sharad Mamle (Mahila Morcha BJP Leader)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="home-city" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Jimmy Jitubhai Shah (Builder, Virar)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="airplane" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Urvashi Agrawal (Cabin Crew, Indigo Airlines)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="palette" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Anand Nair (Senior Architect)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="doctor" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Dr. Pranali Puradkar (MD Gynaecologist, KEM Hospital)</Text>
              </View>
              <View style={styles.alumniItem}>
                <MaterialCommunityIcons name="bank" size={20} color={Palette.primary} />
                <Text style={styles.alumniText}>Joyce Joseph (Btech, Manager at SBI Bank)</Text>
              </View>
            </View>
          </View>

          {/* Mission & Vision Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="bullseye-arrow"
                size={28}
                color={Palette.primary}
              />
              <Text style={styles.sectionTitle}>Our Mission</Text>
            </View>
            <Text style={styles.sectionText}>
              To impart quality education that transforms students into responsible achievers.
            </Text>

            <View style={[styles.sectionHeader, {marginTop: 20}]}>
              <MaterialCommunityIcons
                name="eye"
                size={28}
                color={Palette.primary}
              />
              <Text style={styles.sectionTitle}>Our Vision</Text>
            </View>
            <Text style={styles.sectionText}>
              To be recognized as the leading academic institution in Virar and beyond.
            </Text>
          </View>

          {/* Contact Section */}
          <View style={[styles.section, styles.contactSection]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="phone"
                size={28}
                color={Palette.primary}
              />
              <Text style={styles.sectionTitle}>Contact Us</Text>
            </View>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('phone', '7738073089')}
            >
              <MaterialCommunityIcons
                name="phone"
                size={24}
                color={Palette.primary}
              />
              <Text style={styles.contactText}>7738073089</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('phone', '8329669102')}
            >
              <MaterialCommunityIcons
                name="phone"
                size={24}
                color={Palette.primary}
              />
              <Text style={styles.contactText}>8329669102</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('phone', '9987013486')}
            >
              <MaterialCommunityIcons
                name="phone"
                size={24}
                color={Palette.primary}
              />
              <Text style={styles.contactText}>9987013486</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() =>
                handleContact('address', 'Shop no 3,4,16,18, Poonam Orchid, Yashwant Nagar, Virar West')
              }
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={24}
                color={Palette.primary}
              />
              <Text style={styles.contactText}>Shop no 3,4,16,18, Poonam Orchid, Yashwant Nagar, Virar West</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  // Hero Section
  heroContainer: {
    height: height * 0.32,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
  },
  heroIcon: {
    marginBottom: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.primary,
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: Palette.shadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subHeader: {
    fontSize: 18,
    color: Palette.textLight,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.primary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: Palette.bg,
    padding: 15,
    borderRadius: 15,
    width: '30%',
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.primary,
    marginVertical: 3,
  },
  statLabel: {
    fontSize: 12,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  // Main Content
  contentContainer: {
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: Palette.bg,
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    marginLeft: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.primary,
    marginTop: 10,
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 15,
    color: Palette.text,
    lineHeight: 22,
  },
  // Methodology Items
  methodologyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodologyIcon: {
    backgroundColor: Palette.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodologyText: {
    fontSize: 14,
    color: Palette.text,
    flex: 1,
  },
  // Courses
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseText: {
    fontSize: 15,
    color: Palette.text,
    marginLeft: 10,
  },
  // Toppers
  topperContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  topperYear: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.primary,
    marginTop: 15,
    marginBottom: 5,
  },
  topperItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.primaryXXLight,
  },
  topperName: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
  },
  topperDetails: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  // Alumni
  alumniContainer: {
    marginTop: 10,
  },
  alumniItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alumniText: {
    fontSize: 14,
    color: Palette.text,
    marginLeft: 10,
    flex: 1,
  },
  // Contact
  contactSection: {
    marginBottom: 0,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.primaryXXLight,
  },
  contactText: {
    fontSize: 15,
    color: Palette.text,
    marginLeft: 15,
    flex: 1,
  },
});

export default AboutUsScreen;