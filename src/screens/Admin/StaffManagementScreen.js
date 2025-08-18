import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Menu,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  where
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

const StaffManagementScreen = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Form states
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: '',
    salary: '',
    active: true,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStaff();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterStaffData();
  }, [staff, searchQuery, filterRole]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const staffQuery = query(
        collection(db, 'staff'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(staffQuery);
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      Alert.alert('Error', 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const filterStaffData = () => {
    let filtered = staff;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(member => member.role === filterRole);
    }

    setFilteredStaff(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStaff();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Create Firebase Auth user
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newStaff.email, 
        newStaff.password
      );

      // Add staff document
      await addDoc(collection(db, 'staff'), {
        uid: userCredential.user.uid,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        phone: newStaff.phone,
        salary: parseFloat(newStaff.salary) || 0,
        active: newStaff.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Reset form and close modal
      setNewStaff({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        phone: '',
        salary: '',
        active: true,
      });
      setShowAddModal(false);
      await loadStaff();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Staff member added successfully');
    } catch (error) {
      console.error('Error adding staff:', error);
      Alert.alert('Error', error.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;

    try {
      setLoading(true);
      const staffRef = doc(db, 'staff', selectedStaff.id);
      await updateDoc(staffRef, {
        ...selectedStaff,
        updatedAt: new Date(),
      });

      setShowEditModal(false);
      setSelectedStaff(null);
      await loadStaff();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Staff member updated successfully');
    } catch (error) {
      console.error('Error updating staff:', error);
      Alert.alert('Error', 'Failed to update staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (staffMember) => {
    try {
      const staffRef = doc(db, 'staff', staffMember.id);
      await updateDoc(staffRef, {
        active: !staffMember.active,
        updatedAt: new Date(),
      });

      await loadStaff();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error toggling staff status:', error);
      Alert.alert('Error', 'Failed to update staff status');
    }
  };

  const handleDeleteStaff = (staffMember) => {
    Alert.alert(
      'Delete Staff Member',
      `Are you sure you want to delete ${staffMember.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'staff', staffMember.id));
              await loadStaff();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting staff:', error);
              Alert.alert('Error', 'Failed to delete staff member');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return Palette.error;
      case 'manager':
        return Palette.warning;
      case 'staff':
        return Palette.primary;
      default:
        return Palette.textSecondary;
    }
  };

  const StaffCard = ({ member }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
      <Card style={styles.staffCard}>
        <Card.Content>
          <View style={styles.staffHeader}>
            <View style={styles.staffInfo}>
              <Avatar.Text 
                size={48} 
                label={member.name.substring(0, 2).toUpperCase()}
                backgroundColor={getRoleColor(member.role)}
                color="white"
              />
              <View style={styles.staffDetails}>
                <Text style={styles.staffName}>{member.name}</Text>
                <Text style={styles.staffEmail}>{member.email}</Text>
                <View style={styles.staffMeta}>
                  <Chip 
                    mode="outlined" 
                    compact 
                    textStyle={{ fontSize: 10 }}
                    style={[styles.roleChip, { borderColor: getRoleColor(member.role) }]}
                  >
                    {member.role.toUpperCase()}
                  </Chip>
                  <Chip 
                    mode="outlined" 
                    compact 
                    textStyle={{ fontSize: 10, color: member.active ? Palette.success : Palette.error }}
                    style={[styles.statusChip, { 
                      borderColor: member.active ? Palette.success : Palette.error 
                    }]}
                  >
                    {member.active ? 'ACTIVE' : 'INACTIVE'}
                  </Chip>
                </View>
              </View>
            </View>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setSelectedStaff(member);
                  setShowEditModal(true);
                  setMenuVisible(false);
                }}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => {
                  handleToggleActive(member);
                  setMenuVisible(false);
                }}
                title={member.active ? 'Deactivate' : 'Activate'}
                leadingIcon={member.active ? 'account-off' : 'account-check'}
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  handleDeleteStaff(member);
                  setMenuVisible(false);
                }}
                title="Delete"
                leadingIcon="delete"
                titleStyle={{ color: Palette.error }}
              />
            </Menu>
          </View>
          
          {member.phone && (
            <View style={styles.contactInfo}>
              <MaterialCommunityIcons name="phone" size={16} color={Palette.textSecondary} />
              <Text style={styles.contactText}>{member.phone}</Text>
            </View>
          )}
          
          {member.salary > 0 && (
            <View style={styles.contactInfo}>
              <MaterialCommunityIcons name="currency-rupee" size={16} color={Palette.textSecondary} />
              <Text style={styles.contactText}>₹{member.salary.toLocaleString()}/month</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading && staff.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading staff...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search staff..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'admin', 'manager', 'staff'].map((role) => (
              <Chip
                key={role}
                mode={filterRole === role ? 'flat' : 'outlined'}
                selected={filterRole === role}
                onPress={() => setFilterRole(role)}
                style={styles.filterChip}
                selectedColor={Palette.primary}
              >
                {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Staff List */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Palette.primary]}
              tintColor={Palette.primary}
            />
          }
        >
          {filteredStaff.map((member) => (
            <StaffCard key={member.id} member={member} />
          ))}
          
          {filteredStaff.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-search" size={64} color={Palette.textSecondary} />
              <Text style={styles.emptyText}>No staff members found</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Add Staff FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        color="white"
      />

      {/* Add Staff Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Add New Staff Member</Text>
          
          <TextInput
            label="Full Name *"
            value={newStaff.name}
            onChangeText={(text) => setNewStaff({ ...newStaff, name: text })}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Email *"
            value={newStaff.email}
            onChangeText={(text) => setNewStaff({ ...newStaff, email: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Password *"
            value={newStaff.password}
            onChangeText={(text) => setNewStaff({ ...newStaff, password: text })}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />
          
          <TextInput
            label="Phone"
            value={newStaff.phone}
            onChangeText={(text) => setNewStaff({ ...newStaff, phone: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Monthly Salary"
            value={newStaff.salary}
            onChangeText={(text) => setNewStaff({ ...newStaff, salary: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddStaff}
              style={styles.addButton}
              loading={loading}
            >
              Add Staff
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Edit Staff Modal */}
      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Edit Staff Member</Text>
          
          {selectedStaff && (
            <>
              <TextInput
                label="Full Name"
                value={selectedStaff.name}
                onChangeText={(text) => setSelectedStaff({ ...selectedStaff, name: text })}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Phone"
                value={selectedStaff.phone || ''}
                onChangeText={(text) => setSelectedStaff({ ...selectedStaff, phone: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              
              <TextInput
                label="Monthly Salary"
                value={selectedStaff.salary?.toString() || ''}
                onChangeText={(text) => setSelectedStaff({ ...selectedStaff, salary: parseFloat(text) || 0 })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
            </>
          )}

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowEditModal(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateStaff}
              style={styles.addButton}
              loading={loading}
            >
              Update
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Palette.textSecondary,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  searchbar: {
    marginBottom: 12,
    elevation: 1,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  staffCard: {
    marginBottom: 12,
    backgroundColor: Palette.surface,
    elevation: 2,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  staffInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  staffDetails: {
    marginLeft: 12,
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 4,
  },
  staffEmail: {
    fontSize: 14,
    color: Palette.textSecondary,
    marginBottom: 8,
  },
  staffMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 13,
    color: Palette.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Palette.primary,
  },
  modal: {
    backgroundColor: Palette.surface,
    padding: 24,
    margin: 24,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 0.45,
  },
  addButton: {
    flex: 0.45,
    backgroundColor: Palette.primary,
  },
});

export default StaffManagementScreen;