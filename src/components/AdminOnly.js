import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { checkAdminStatus } from '../utils/auth';

const AdminOnly = ({ children }) => {
  const [status, setStatus] = useState('checking');
  const navigation = useNavigation();

  useEffect(() => {
    const verify = async () => {
      try {
        const isAdmin = await checkAdminStatus();
        setStatus(isAdmin ? 'approved' : 'denied');
        if (!isAdmin) {
          navigation.replace('Main'); // Use replace to prevent going back
        }
      } catch (error) {
        console.error('Admin verification failed:', error);
        setStatus('denied');
        navigation.replace('Main');
      }
    };

    verify();
  }, [navigation]);

  if (status === 'checking') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Verifying admin access...</Text>
      </View>
    );
  }

  if (status === 'approved') {
    return children;
  }

  return null; // For denied cases (already redirected)
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  loadingText: {
    fontSize: 16
  },
  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deniedText: {
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default AdminOnly;