import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Switch,
  TextInput,
  Divider,
  List,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

const AdminSettingsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const auth = getAuth();
  const user = auth.currentUser;

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    lowStockAlerts: true,
    newOrderAlerts: true,
    salesReports: true,
  });
  const [profile, setProfile] = useState({
     name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!profile.name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);
      
      // Update in Firestore
      if (user) {
        const userRef = doc(db, 'staff', user.uid);
        await updateDoc(userRef, {
          name: profile.name,
          phone: profile.phone,
          updatedAt: new Date(),
        });
      }

      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = (setting) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={24} 
              color={Palette.primary} 
            />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>

          {isEditing ? (
            <>
              <TextInput
                label="Full Name"
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Email"
                value={profile.email}
                style={styles.input}
                mode="outlined"
                disabled
              />
              
              <TextInput
                label="Phone Number"
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />

              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditing(false)}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  style={styles.button}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </View>
            </>
          ) : (
            <>
              <List.Item
                title="Name"
                description={profile.name || 'Not set'}
                left={() => <List.Icon icon="account" />}
              />
              <Divider />
              <List.Item
                title="Email"
                description={profile.email}
                left={() => <List.Icon icon="email" />}
              />
              <Divider />
              <List.Item
                title="Phone"
                description={profile.phone || 'Not set'}
                left={() => <List.Icon icon="phone" />}
              />

              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons 
              name="cog" 
              size={24} 
              color={Palette.primary} 
            />
            <Text style={styles.sectionTitle}>App Settings</Text>
          </View>

          <List.Item
            title="Notifications"
            description="Receive app notifications"
            left={() => <List.Icon icon="bell" />}
            right={() => (
              <Switch
                value={settings.notifications}
                onValueChange={() => handleToggleSetting('notifications')}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Dark Mode"
            description="Switch between light and dark theme"
            left={() => <List.Icon icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={() => handleToggleSetting('darkMode')}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Low Stock Alerts"
            description="Get alerts when inventory is low"
            left={() => <List.Icon icon="alert" />}
            right={() => (
              <Switch
                value={settings.lowStockAlerts}
                onValueChange={() => handleToggleSetting('lowStockAlerts')}
              />
            )}
          />
          <Divider />
          <List.Item
            title="New Order Alerts"
            description="Get alerts for new orders"
            left={() => <List.Icon icon="cart" />}
            right={() => (
              <Switch
                value={settings.newOrderAlerts}
                onValueChange={() => handleToggleSetting('newOrderAlerts')}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Daily Sales Reports"
            description="Receive daily sales reports"
            left={() => <List.Icon icon="chart-bar" />}
            right={() => (
              <Switch
                value={settings.salesReports}
                onValueChange={() => handleToggleSetting('salesReports')}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons 
              name="shield-account" 
              size={24} 
              color={Palette.primary} 
            />
            <Text style={styles.sectionTitle}>Account Actions</Text>
          </View>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('ChangePassword')}
            style={styles.actionButton}
            icon="lock"
          >
            Change Password
          </Button>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.actionButton}
            textColor={Palette.error}
            icon="logout"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      {/* About Section */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons 
              name="information" 
              size={24} 
              color={Palette.primary} 
            />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <List.Item
            title="Version"
            description="1.0.0"
            left={() => <List.Icon icon="tag" />}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={() => <List.Icon icon="shield" />}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={() => <List.Icon icon="file-document" />}
            onPress={() => navigation.navigate('TermsOfService')}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
    padding: 16,
  },
  sectionCard: {
    marginBottom: 16,
    backgroundColor: Palette.surface,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    marginLeft: 8,
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 0.48,
  },
  editButton: {
    marginTop: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default AdminSettingsScreen;