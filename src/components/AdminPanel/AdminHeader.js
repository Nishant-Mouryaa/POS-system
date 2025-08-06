import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform, Alert } from 'react-native';
import { Title, Text, TouchableRipple, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { checkAdminStatus } from '../../utils/auth';
import { getAuth } from 'firebase/auth';

const AdminHeader = ({ onLogout, palette, styles, userName = 'Administrator', lastLogin }) => {
  const [adminStatus, setAdminStatus] = useState('checking');
  const auth = getAuth();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const isAdmin = await checkAdminStatus();
        setAdminStatus(isAdmin ? 'active' : 'inactive');
        
        if (!isAdmin) {
          Alert.alert(
            'Access Changed',
            'Your admin privileges have been revoked',
            [{ text: 'OK', onPress: onLogout }]
          );
        }
      } catch (error) {
        console.error('Admin verification error:', error);
        setAdminStatus('error');
      }
    };

    // Verify immediately and then every 5 minutes
    verifyAdmin();
    const interval = setInterval(verifyAdmin, 300000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.headerContainer}>
      <StatusBar backgroundColor={palette.primaryDark} barStyle="light-content" />
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back,</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Title style={styles.headerTitle}>{userName}</Title>
            <Badge 
              style={[
                styles.adminBadge,
                adminStatus === 'active' && { backgroundColor: palette.success },
                adminStatus === 'inactive' && { backgroundColor: palette.error },
                adminStatus === 'checking' && { backgroundColor: palette.warning },
              ]}
            >
              {adminStatus === 'active' ? 'ADMIN' : 
               adminStatus === 'inactive' ? 'INACTIVE' : 'VERIFYING'}
            </Badge>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableRipple
            onPress={onLogout}
            style={styles.headerIconButton}
            borderless
            centered
            rippleColor="rgba(255, 255, 255, 0.3)"
            disabled={adminStatus === 'checking'}
          >
            <Icon 
              name="logout" 
              size={24} 
              color={
                adminStatus === 'checking' ? palette.textDisabled : palette.primary
              } 
            />
          </TouchableRipple>
        </View>
      </View>
      <Text style={styles.headerSubtitle}>
        Last login: {lastLogin}
      </Text>
    </View>
  );
};

export default AdminHeader;