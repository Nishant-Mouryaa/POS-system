import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

import { db } from '../../config/firebase';
import { AdminPalette } from '../../theme/colors';
import { checkAdminStatus } from '../../utils/auth';

// Components
import Header from '../../components/UserManagement/Header';
import FilterBar from '../../components/UserManagement/FilterBar';
import UserCard from '../../components/UserManagement/UserCard';
import MessageModal from '../../components/UserManagement/MessageModal';
import FeesModal from '../../components/UserManagement/FeesModal';
import RemindPaymentModal from '../../components/UserManagement/RemindPaymentModal';
import GroupMessageModal from '../../components/UserManagement/GroupMessageModal';
import UserGroupsList from '../../components/UserManagement/UserGroupsList';

////////////////////////////////////////////////////////////////////////////////
// Helper function to send push notification via Expo
////////////////////////////////////////////////////////////////////////////////
async function sendPushNotification(expoPushToken, title, body) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title,
      body,
    }),
  });
}

////////////////////////////////////////////////////////////////////////////////
// Main Screen Component
////////////////////////////////////////////////////////////////////////////////
const UserManagementScreen = () => {
  const styles = makeStyles(AdminPalette);
  const navigation = useNavigation();
  const auth = getAuth();

  // State for user list
  const [users, setUsers] = useState([]);
  // For searching/filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'students', 'teachers'
  const [activeBoard, setActiveBoard] = useState('all');
  const [availableBoards, setAvailableBoards] = useState([]);

  // Grouped user data
  const [groupedUsers, setGroupedUsers] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Loading indicator
  const [loading, setLoading] = useState(true);

  // Single-user modals
  const [visible, setVisible] = useState(false);      // Single-user message modal
  const [feesModalVisible, setFeesModalVisible] = useState(false);
  const [remindPaymentVisible, setRemindPaymentVisible] = useState(false);

  // Group message modal
  const [groupMessageVisible, setGroupMessageVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Selected user for various actions
  const [selectedUser, setSelectedUser] = useState(null);

  // Single-user message form
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [upiQrUrl, setUpiQrUrl] = useState('');
  const [upiId, setUpiId] = useState('');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  // Fees form
  const [feesAmount, setFeesAmount] = useState('');
  const [feesStatus, setFeesStatus] = useState('pending');
  const [feesSaving, setFeesSaving] = useState(false);

  // Animation reference for the header
  const scrollY = new Animated.Value(0);

  ////////////////////////////////////////////////////////////////////////////
  // Verify admin on mount
  ////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const verifyAdmin = async () => {
      const isAdmin = await checkAdminStatus();
      if (!isAdmin) {
        navigation.navigate('Main');
      }
    };
    verifyAdmin();
  }, [navigation]);

  ////////////////////////////////////////////////////////////////////////////
  // Fetch users on mount
  ////////////////////////////////////////////////////////////////////////////
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const userData = [];
      const boards = new Set(['all']); // Initialize with 'all' option

      snapshot.forEach((docSnap) => {
        const user = { id: docSnap.id, ...docSnap.data() };
        userData.push(user);
        if (user.schoolBoard) {
          boards.add(user.schoolBoard);
        }
      });

      setUsers(userData);
      setAvailableBoards(Array.from(boards));

      //
      // Group users by grade
      //
      const grouped = userData.reduce((acc, user) => {
        const standard = user.grade || 'Other';
        acc[standard] = acc[standard] || [];
        acc[standard].push(user);
        return acc;
      }, {});

      //
      // Convert grouped object to array for easier listing
      //
      const sections = Object.keys(grouped)
        .sort((a, b) => {
          // Put "Other" at the end
          if (a === 'Other') return 1;
          if (b === 'Other') return -1;
          return parseInt(a, 10) - parseInt(b, 10);
        })
        .map((standard) => ({
          title: `Grade ${standard}`,
          standard,
          data: grouped[standard],
        }));

      setGroupedUsers(sections);

      //
      // Initialize all groups as collapsed
      //
      const initialExpanded = {};
      Object.keys(grouped).forEach((standard) => {
        initialExpanded[standard] = false;
      });
      setExpandedGroups(initialExpanded);
    } catch (err) {
      console.error('Error loading users:', err);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  ////////////////////////////////////////////////////////////////////////////
  // Memoized filtered groups for the list (based on role, board, search)
  ////////////////////////////////////////////////////////////////////////////
  const filteredGroups = useMemo(() => {
    return groupedUsers
      .map((group) => {
        const filteredUsers = group.data.filter((user) => {
          //
          // Filter by role (tab)
          //
          const tabFilter =
            activeTab === 'all' ||
            (activeTab === 'students' && user.role === 'Student') ||
            (activeTab === 'teachers' && user.role === 'Teacher');

          //
          // Filter by board
          //
          const boardFilter =
            activeBoard === 'all' || user.schoolBoard === activeBoard;

          //
          // Filter by search query
          //
          const lowerSearch = searchQuery.toLowerCase();
          const userName = (user.fullName || '').toLowerCase();
          const userEmail = (user.email || '').toLowerCase();
          const userRole = (user.role || '').toLowerCase();
          const searchFilter =
            !searchQuery ||
            userName.includes(lowerSearch) ||
            userEmail.includes(lowerSearch) ||
            userRole.includes(lowerSearch);

          return tabFilter && boardFilter && searchFilter;
        });

        return { ...group, data: filteredUsers };
      })
      .filter((group) => group.data.length > 0);
  }, [groupedUsers, activeTab, activeBoard, searchQuery]);

  ////////////////////////////////////////////////////////////////////////////
  // Expand/Collapse Groups
  ////////////////////////////////////////////////////////////////////////////
  const toggleGroup = (standard) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [standard]: !prev[standard],
    }));
  };
  const expandAllGroups = () => {
    const allExpanded = {};
    Object.keys(expandedGroups).forEach((standard) => {
      allExpanded[standard] = true;
    });
    setExpandedGroups(allExpanded);
  };
  const collapseAllGroups = () => {
    const allCollapsed = {};
    Object.keys(expandedGroups).forEach((standard) => {
      allCollapsed[standard] = false;
    });
    setExpandedGroups(allCollapsed);
  };

  ////////////////////////////////////////////////////////////////////////////
  // Create a new user (if you have an AddUserModal or similar)
  ////////////////////////////////////////////////////////////////////////////
  const handleCreateUser = async (userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        isAdmin: userData.isAdmin,
        grade: userData.grade || null,
        address: userData.address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        'Success',
        `User ${userData.fullName} created successfully!\n\nEmail: ${userData.email}\nPassword: ${userData.password}`,
        [
          {
            text: 'OK',
            onPress: loadUsers,
          },
        ]
      );
    } catch (error) {
      console.error('Error creating user:', error);
      let errorMessage = 'Failed to create user';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // Group notifications
  ////////////////////////////////////////////////////////////////////////////
  const notifyGroup = (group) => {
    setSelectedGroup(group);
    setGroupMessageVisible(true);
  };

  const handleSendGroupNotification = async ({ title, body, attachments }) => {
    if (!selectedGroup) return;
    try {
      setSending(true);

      //
      // 1) Upload attachments to Firebase Storage (if any)
      //
      const storage = getStorage();
      const attachmentUrls = [];

      for (const file of attachments) {
        const response = await fetch(file.uri);
        const blob = await response.blob();

        const storageRef = ref(storage, `attachments/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, blob);

        const downloadUrl = await getDownloadURL(storageRef);
        attachmentUrls.push({
          name: file.name,
          url: downloadUrl,
          mimeType: file.mimeType,
        });
      }

      //
      // 2) Save messages and send notifications to each user in the group
      //
      const savePromises = [];
      const pushPromises = [];

      for (const user of selectedGroup.data) {
        const messageRef = collection(db, 'users', user.id, 'messages');
        savePromises.push(
          addDoc(messageRef, {
            title: title || 'Group Notification',
            body: body || 'This is a group notification',
            sentAt: new Date(),
            attachments: attachmentUrls,
          })
        );

        pushPromises.push(
          (async () => {
            const userDocSnap = await getDoc(doc(db, 'users', user.id));
            const expoPushToken = userDocSnap.data()?.expoPushToken;
            if (expoPushToken) {
              await sendPushNotification(
                expoPushToken,
                title || 'Group Notification',
                body || 'This is a group notification'
              );
            }
          })()
        );
      }

      await Promise.all([...savePromises, ...pushPromises]);
      Alert.alert('Success', `Notification sent to ${selectedGroup.data.length} users.`);
    } catch (err) {
      console.error('Error sending group notification:', err);
      Alert.alert('Error', 'Failed to send group notification');
    } finally {
      setSending(false);
      setGroupMessageVisible(false);
      setSelectedGroup(null);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // Search filter
  ////////////////////////////////////////////////////////////////////////////
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  ////////////////////////////////////////////////////////////////////////////
  // Summary stats
  ////////////////////////////////////////////////////////////////////////////
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === 'Student').length;
  const totalTeachers = users.filter((u) => u.role === 'Teacher').length;

  ////////////////////////////////////////////////////////////////////////////
  // Single-user message handlers
  ////////////////////////////////////////////////////////////////////////////
  const handleSendMessageTo = async (user) => {
    setSelectedUser(user);
    setMessageTitle('');
    setMessageBody('');
    setErrors({});

    // Example: fetch a UPI QR from Firebase Storage
    try {
      const storage = getStorage();
      const upiRef = ref(storage, 'gs://iyers-78791.firebasestorage.app/upi.jpg');
      const httpsUrl = await getDownloadURL(upiRef);
      setUpiQrUrl(httpsUrl);
    } catch {
      setUpiQrUrl('');
    }

    setUpiId('');
    setVisible(true);
  };

  const handleSendMessage = async () => {
    if (!selectedUser) return;
    try {
      setSending(true);
      const messageRef = collection(db, 'users', selectedUser.id, 'messages');
      await addDoc(messageRef, {
        title: messageTitle,
        body: messageBody,
        sentAt: new Date(),
      });

      const userDocSnap = await getDoc(doc(db, 'users', selectedUser.id));
      const expoPushToken = userDocSnap.data()?.expoPushToken;
      if (expoPushToken) {
        await sendPushNotification(expoPushToken, messageTitle, messageBody);
      }

      Alert.alert(
        'Success',
        `Message sent to ${selectedUser.fullName || 'the user'}.`
      );
      setVisible(false);
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // Payment reminders
  ////////////////////////////////////////////////////////////////////////////
  const handleRemindPayment = async (user) => {
    setSelectedUser(user);

    // Example UPI retrieval
    try {
      const storage = getStorage();
      const upiRef = ref(storage, 'gs://iyers-78791.firebasestorage.app/upi.jpg');
      const httpsUrl = await getDownloadURL(upiRef);
      setUpiQrUrl(httpsUrl);
    } catch {
      setUpiQrUrl('');
    }

    setRemindPaymentVisible(true);
  };

  const handleSendReminder = async (showQrCode) => {
    if (!selectedUser) return;
    try {
      setSending(true);
      const messageRef = collection(db, 'users', selectedUser.id, 'messages');
      await addDoc(messageRef, {
        title: 'Fee Payment Reminder',
        body:
          'This is a gentle reminder that your fee payment is pending.' +
          (showQrCode ? ' Please scan the attached QR code to pay via UPI.' : ''),
        sentAt: new Date(),
        upiQrUrl: showQrCode ? upiQrUrl : null,
        upiId,
        isPaymentReminder: true,
      });

      const userDocSnap = await getDoc(doc(db, 'users', selectedUser.id));
      const expoPushToken = userDocSnap.data()?.expoPushToken;
      if (expoPushToken) {
        await sendPushNotification(
          expoPushToken,
          'Fee Payment Reminder',
          'This is a gentle reminder that your fee payment is pending.' +
            (showQrCode ? ' Please scan the attached QR code to pay via UPI.' : '')
        );
      }

      Alert.alert('Success', `Reminder sent to ${selectedUser.fullName || 'the user'}.`);
      setRemindPaymentVisible(false);
    } catch (err) {
      console.error('Error sending reminder:', err);
      Alert.alert('Error', 'Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // Fees management
  ////////////////////////////////////////////////////////////////////////////
  const handleEditFees = (user) => {
    setSelectedUser(user);
    setFeesSaving(false);
    setFeesAmount(user.fees?.amount?.toString() || '');
    setFeesStatus(user.fees?.status || 'pending');
    setFeesModalVisible(true);
  };

  const handleSaveFees = async () => {
    if (!selectedUser) return;
    if (!feesAmount || Number.isNaN(parseFloat(feesAmount))) {
      Alert.alert('Error', 'Please enter a valid fees amount.');
      return;
    }
    try {
      setFeesSaving(true);
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        fees: {
          amount: parseFloat(feesAmount),
          status: feesStatus,
        },
      });
      Alert.alert('Success', 'Fees updated successfully!');
      setFeesModalVisible(false);
      loadUsers();
    } catch (err) {
      console.error('Error updating fees:', err);
      Alert.alert('Error', 'Failed to save fees data.');
    } finally {
      setFeesSaving(false);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // Screen Render
  ////////////////////////////////////////////////////////////////////////////
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={AdminPalette.primaryDark} barStyle="light-content" />

      {/* Header */}
      <Header
        navigation={navigation}
        totalUsers={totalUsers}
        totalStudents={totalStudents}
        totalTeachers={totalTeachers}
        scrollY={scrollY}
        onRefresh={loadUsers}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Filter Bar */}
        <FilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeBoard={activeBoard}
          setActiveBoard={setActiveBoard}
          availableBoards={availableBoards}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />

     

        {/* Body Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AdminPalette.primary} />
            <Text style={styles.loadingText}>Loading users…</Text>
          </View>
        ) : (
          <UserGroupsList
            filteredGroups={filteredGroups}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            notifyGroup={notifyGroup}
            UserCard={UserCard}
            scrollY={scrollY}
            handleSendMessageTo={handleSendMessageTo}
            handleEditFees={handleEditFees}
            handleRemindPayment={handleRemindPayment}
            searchQuery={searchQuery}
          />
        )}
      </View>

      {/* Single-user message modal */}
      <MessageModal
        visible={visible}
        onDismiss={() => !sending && setVisible(false)}
        selectedUser={selectedUser}
        messageTitle={messageTitle}
        setMessageTitle={setMessageTitle}
        messageBody={messageBody}
        setMessageBody={setMessageBody}
        upiId={upiId}
        setUpiId={setUpiId}
        upiQrUrl={upiQrUrl}
        errors={errors}
        sending={sending}
        onSend={handleSendMessage}
      />

      {/* Remind payment modal */}
      <RemindPaymentModal
        visible={remindPaymentVisible}
        onDismiss={() => !sending && setRemindPaymentVisible(false)}
        selectedUser={selectedUser}
        upiQrUrl={upiQrUrl}
        sending={sending}
        onSend={(showQrCode) => handleSendReminder(showQrCode)}
        upiId={upiId}
        setUpiId={setUpiId}
      />

      {/* Fees modal */}
      <FeesModal
        visible={feesModalVisible}
        onDismiss={() => !feesSaving && setFeesModalVisible(false)}
        selectedUser={selectedUser}
        feesAmount={feesAmount}
        setFeesAmount={setFeesAmount}
        feesStatus={feesStatus}
        setFeesStatus={setFeesStatus}
        feesSaving={feesSaving}
        onSave={handleSaveFees}
      />

      {/* Group message modal */}
      <GroupMessageModal
        visible={groupMessageVisible}
        onDismiss={() => !sending && setGroupMessageVisible(false)}
        onSend={handleSendGroupNotification}
        sending={sending}
      />
    </View>
  );
};

////////////////////////////////////////////////////////////////////////////////
// Styles
////////////////////////////////////////////////////////////////////////////////
const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      color: colors.textMuted,
      fontSize: 16,
    },
  });

export default UserManagementScreen;
