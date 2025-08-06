import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import {
  Avatar,
  Button,
  Paragraph,
  List,
  ProgressBar,
  Switch,
  Divider,
  useTheme,
  Text,
  Surface,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { Palette } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const [userData, setUserData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'No user is currently logged in!');
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        Alert.alert('No Data', 'User document not found.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No user data found.</Text>
      </View>
    );
  }

  const computedProgress = userData.avgScore && userData.avgScore > 0 ? userData.avgScore / 100 : 0;

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

        {/* Header with back button */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
          </View>
        </View>

        <View style={styles.content}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Header */}
            <Surface style={styles.profileHeader} elevation={2}>
              <View style={styles.avatarContainer}>
                <Avatar.Icon 
                  size={120} 
                  icon="account" 
                  color={colors.primary}
                  style={{ 
                    backgroundColor: `${colors.primary}20`,
                    borderWidth: 2,
                    borderColor: colors.primary
                  }}
                />
                <View style={styles.editIcon}>
                  <Icon name="pencil" size={18} color={colors.onPrimary} />
                </View>
              </View>
              <Text style={styles.name}>{userData.fullName || userData.name}</Text>
              <Paragraph style={styles.email}>{userData.email}</Paragraph>
              
              {userData.grade && userData.schoolBoard && (
                <View style={styles.detailsContainer}>
                  <Chip icon="school" style={styles.detailChip}>
                    Grade {userData.grade}
                  </Chip>
                  <Chip icon="book-education" style={styles.detailChip}>
                    {userData.schoolBoard}
                  </Chip>
                </View>
              )}
            </Surface>

            {/* Stats Overview */}
            <View style={styles.statsContainer}>
              <Surface style={styles.statCard} elevation={2}>
                <Icon name="calendar-check" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{userData.completedTests || 0}</Text>
                <Text style={styles.statLabel}>Tests Taken</Text>
              </Surface>
              
              <Surface style={styles.statCard} elevation={2}>
                <Icon name="chart-bar" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{userData.avgScore || 0}%</Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </Surface>
              
              <Surface style={styles.statCard} elevation={2}>
                <Icon name="trophy" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{userData.rank || '--'}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </Surface>
            </View>

            {/* Performance Section */}
            <Surface style={styles.sectionCard} elevation={2}>
              <View style={styles.sectionHeader}>
                <Icon name="chart-line" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Performance Overview</Text>
              </View>
              
              <Divider style={styles.cardDivider} />
              
              <View style={styles.sectionContent}>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Overall Progress</Text>
                  <Text style={styles.progressValue}>{userData.avgScore || 0}%</Text>
                </View>
                <ProgressBar
                  progress={computedProgress}
                  color={colors.primary}
                  style={styles.progressBar}
                />
                
                <View style={styles.improvementTip}>
                  <Icon name="lightbulb-on" size={18} color={colors.warning} />
                  <Text style={styles.tipText}>Focus on weak areas to improve your score</Text>
                </View>
              </View>
            </Surface>

            {/* Personal Information */}
            <Surface style={styles.sectionCard} elevation={2}>
              <View style={styles.sectionHeader}>
                <Icon name="account-details" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              <Divider style={styles.cardDivider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
              
              {userData.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>{userData.phone}</Text>
                </View>
              )}
              
              {userData.address && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>
                      {userData.address.street}, {userData.address.city}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}></Text>
                    <Text style={styles.infoValue}>
                      {userData.address.state}, {userData.address.pincode}
                    </Text>
                  </View>
                </>
              )}
            </Surface>

            {/* Fees Status */}
            {userData.fees && (
              <Surface style={styles.sectionCard} elevation={2}>
                <View style={styles.sectionHeader}>
                  <Icon name="cash" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Payment Status</Text>
                </View>
                
                <Divider style={styles.cardDivider} />
                
                <View style={styles.feeStatusContainer}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Amount:</Text>
                    <Text style={styles.infoValue}>₹{userData.fees.amount}</Text>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status:</Text>
                    <View style={[
                      styles.statusBadge, 
                      userData.fees.status === 'Paid' ? styles.statusPaid : styles.statusPending
                    ]}>
                      <Text style={styles.statusText}>{userData.fees.status}</Text>
                    </View>
                  </View>
                  
                  {userData.fees.dueDate && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Due Date:</Text>
                      <Text style={styles.infoValue}>{userData.fees.dueDate}</Text>
                    </View>
                  )}
                </View>
              </Surface>
            )}

            {/* Settings Section */}
            <Surface style={styles.sectionCard} elevation={2}>
              <View style={styles.sectionHeader}>
                <Icon name="cog" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Settings</Text>
              </View>
              
              <Divider style={styles.cardDivider} />
              
              <List.Section>
                {/* <List.Item
                  title="Edit Profile"
                  description="Update your personal information"
                  left={(props) => <List.Icon {...props} icon="account-edit" color={colors.primary} />}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => console.log('Edit Profile pressed')}
                  style={styles.listItem}
                />
                <Divider style={styles.listDivider} />
                <List.Item
                  title="Dark Mode"
                  description="Toggle dark theme"
                  left={(props) => <List.Icon {...props} icon="theme-light-dark" color={colors.primary} />}
                  right={() => <Switch value={isDarkMode} onValueChange={toggleDarkMode} />}
                  style={styles.listItem}
                />
                <Divider style={styles.listDivider} />
                <List.Item
                  title="Notification Settings"
                  description="Manage your notifications"
                  left={(props) => <List.Icon {...props} icon="bell" color={colors.primary} />}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  style={styles.listItem}
                /> */}
                {/* <Divider style={styles.listDivider} /> */}
                <List.Item
                  title="Logout"
                  
                  left={(props) => <List.Icon {...props} icon="logout" color={colors.error} />}
                  onPress={() => console.log('Logout pressed')}
                  style={[styles.listItem, styles.logoutItem]}
                  titleStyle={styles.logoutText}
                />
              </List.Section>
            </Surface>
          </ScrollView>
        </View>
      </View>
    </BackgroundWrapper>
  );
};

const makeStyles = (Pallete) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    headerContainer: {
      paddingHorizontal: 24,
      paddingTop: StatusBar.currentHeight + 16 || 32,
      paddingBottom: 16,
    },
    headerContent: {
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: Palette.textLight,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: Palette.textLight,
      lineHeight: 20,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileHeader: {
      alignItems: 'center',
      padding: 24,
      borderRadius: 20,
      marginBottom: 20,
      backgroundColor: Pallete.surface,
    },
    avatarContainer: {
      marginBottom: 16,
      position: 'relative',
    },
    editIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: Pallete.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: Pallete.onSurface,
      marginBottom: 4,
      textAlign: 'center',
    },
    email: {
      fontSize: 14,
      color: Pallete.textSecondary,
      marginBottom: 12,
      textAlign: 'center',
    },
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    detailChip: {
      marginHorizontal: 4,
      marginVertical: 4,
      backgroundColor: `${Pallete.primary}10`,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 4,
      backgroundColor: Pallete.surface,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: Pallete.onSurface,
      marginVertical: 8,
    },
    statLabel: {
      fontSize: 12,
      color: Pallete.textSecondary,
      textAlign: 'center',
    },
    sectionCard: {
      borderRadius: 16,
      marginBottom: 20,
      backgroundColor: Pallete.surface,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Pallete.onSurface,
      marginLeft: 12,
    },
    sectionContent: {
      padding: 16,
      paddingTop: 8,
    },
    cardDivider: {
      backgroundColor: Pallete.divider,
      marginHorizontal: 16,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 14,
      color: Pallete.textSecondary,
    },
    progressValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: Pallete.primary,
    },
    progressBar: {
      marginTop: 8,
      height: 8,
      borderRadius: 4,
    },
    improvementTip: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: `${Pallete.warning}15`,
    },
    tipText: {
      fontSize: 13,
      color: Pallete.onSurface,
      marginLeft: 8,
      flex: 1,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: Pallete.textSecondary,
      width: 80,
      marginLeft: 14,
    },
    infoValue: {
      fontSize: 14,
      color: Pallete.onSurface,
      flex: 1,
    },
    feeStatusContainer: {
      paddingVertical: 8,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusPaid: {
      backgroundColor: `${Pallete.success}20`,
     
    },
    statusPending: {
      backgroundColor: `${Pallete.error}20`,
      
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: Pallete.surface,
    },
    listItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    listDivider: {
      marginHorizontal: 16,
    },
    logoutItem: {
      backgroundColor: `${Pallete.error}10`,
      borderRadius: 8,
      margin: 8,
    },
    logoutText: {
      color: Palette.bg,
      fontWeight: 'bold',
    },
  });

export default ProfileScreen;