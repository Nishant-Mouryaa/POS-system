import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert
} from 'react-native';
import {
  Text,
  IconButton,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  Badge,
  useTheme
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette } from '../../theme/colors';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const CustomerManagementScreen = () => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const navigation = useNavigation();
  
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserCafeId, setCurrentUserCafeId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [isEditingPoints, setIsEditingPoints] = useState(false);

  // Animation values
  const headerScale = useRef(new Animated.Value(1)).current;
  const customerCardScale = useRef(new Animated.Value(1)).current;

  // Get current user's cafeId
  useEffect(() => {
    const fetchUserCafeId = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUserCafeId(userDoc.data().cafeId);
          }
        }
      } catch (error) {
        console.error("Error fetching user cafeId:", error);
      }
    };

    fetchUserCafeId();
  }, []);

  // Fetch customers from Firestore
  useEffect(() => {
    if (!currentUserCafeId) return;

    setLoading(true);
    
    const q = query(
      collection(db, 'customers'),
      where('cafeId', '==', currentUserCafeId),
      orderBy('loyalty.lastVisit', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const customersData = [];
      querySnapshot.forEach((doc) => {
        const customerData = doc.data();
        customersData.push({
          id: doc.id,
          ...customerData,
          loyalty: {
            ...customerData.loyalty,
            lastVisit: customerData.loyalty?.lastVisit?.toDate(),
            formattedLastVisit: format(customerData.loyalty?.lastVisit?.toDate(), 'MMM dd, yyyy'),
          },
          personalInfo: {
            ...customerData.personalInfo,
            dateOfBirth: customerData.personalInfo?.dateOfBirth?.toDate(),
            formattedDOB: customerData.personalInfo?.dateOfBirth ? 
              format(customerData.personalInfo.dateOfBirth.toDate(), 'MMM dd') : 'N/A',
            anniversary: customerData.personalInfo?.anniversary?.toDate(),
            formattedAnniversary: customerData.personalInfo?.anniversary ? 
              format(customerData.personalInfo.anniversary.toDate(), 'MMM dd') : 'N/A',
          },
          createdAt: customerData.createdAt?.toDate(),
          formattedMemberSince: format(customerData.createdAt?.toDate(), 'MMM yyyy')
        });
      });
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Error fetching customers:", error);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [currentUserCafeId]);

  // Filter customers based on search and selected filter
  useEffect(() => {
    let results = customers;
    
    // Apply search filter
    if (searchQuery) {
      results = results.filter(customer => 
        `${customer.personalInfo?.firstName} ${customer.personalInfo?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.personalInfo?.phone?.includes(searchQuery) ||
        customer.personalInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.loyalty?.loyaltyNumber?.includes(searchQuery)
      );
    }
    
    // Apply status filter
    switch (selectedFilter) {
      case 'active':
        results = results.filter(customer => customer.loyalty?.visitCount > 0);
        break;
      case 'loyal':
        results = results.filter(customer => customer.loyalty?.tier === 'gold' || customer.loyalty?.tier === 'platinum');
        break;
      case 'birthday':
        const today = new Date();
        results = results.filter(customer => {
          if (!customer.personalInfo?.dateOfBirth) return false;
          const dob = customer.personalInfo.dateOfBirth;
          return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
        });
        break;
      default:
        // 'all' - no additional filtering
        break;
    }
    
    setFilteredCustomers(results);
  }, [searchQuery, selectedFilter, customers]);

  const handleRefresh = () => {
    Haptics.selectionAsync();
    setRefreshing(true);
  };

  const handleCustomerPress = (customer) => {
    Haptics.selectionAsync();
    setSelectedCustomer(customer);
  };

  const handleAddPoints = async () => {
    if (!pointsToAdd || isNaN(pointsToAdd)) {
      Alert.alert("Invalid Input", "Please enter a valid number of points");
      return;
    }

    try {
      const pointsToAddNum = parseInt(pointsToAdd, 10);
      const newPoints = (selectedCustomer.loyalty.points || 0) + pointsToAddNum;
      
      await updateDoc(doc(db, 'customers', selectedCustomer.id), {
        'loyalty.points': newPoints,
        'loyalty.totalSpent': selectedCustomer.loyalty.totalSpent + (pointsToAddNum * 10), // Assuming 1 point = ₹10 spent
        'loyalty.lastVisit': new Date()
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", `${pointsToAddNum} points added to ${selectedCustomer.personalInfo.firstName}'s account`);
      setPointsToAdd('');
      setIsEditingPoints(false);
    } catch (error) {
      console.error("Error updating points:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to update reward points");
    }
  };

  const handleRedeemPoints = async (pointsToRedeem) => {
    try {
      if ((selectedCustomer.loyalty.points || 0) < pointsToRedeem) {
        Alert.alert("Insufficient Points", "Customer doesn't have enough points to redeem");
        return;
      }

      const newPoints = (selectedCustomer.loyalty.points || 0) - pointsToRedeem;
      
      await updateDoc(doc(db, 'customers', selectedCustomer.id), {
        'loyalty.points': newPoints,
        'loyalty.lastVisit': new Date()
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", `${pointsToRedeem} points redeemed for ${selectedCustomer.personalInfo.firstName}`);
    } catch (error) {
      console.error("Error redeeming points:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to redeem points");
    }
  };

const getTierColor = (tier) => {
  switch (tier) {
    case 'gold': return '#FFD700';      // Gold color
    case 'silver': return '#C0C0C0';    // Silver color  
    case 'platinum': return '#E5E4E2';  // Platinum color
    case 'bronze': return '#CD7F32';    // Bronze color
    default: return Palette.primary || '#007AFF';  // Fallback color
  }
};

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCustomerPress(item)}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.customerCard, { transform: [{ scale: customerCardScale }] }]}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.personalInfo?.firstName} {item.personalInfo?.lastName}
          </Text>
          {item.loyalty?.tier && (
            <Chip 
              mode="outlined"
              style={[
                styles.tierChip,
                { 
                  backgroundColor: `${getTierColor(item.loyalty.tier)}20`,
                  borderColor: getTierColor(item.loyalty.tier)
                }
              ]}
              textStyle={[
                styles.tierText,
                { color: getTierColor(item.loyalty.tier) }
              ]}
            >
              {item.loyalty.tier}
            </Chip>
          )}
        </View>
        
        <View style={styles.customerDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="phone" 
              size={16} 
              color={Palette.textMuted} 
            />
            <Text style={styles.detailText}>{item.personalInfo?.phone}</Text>
          </View>
          
          {item.personalInfo?.email && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons 
                name="email" 
                size={16} 
                color={Palette.textMuted} 
              />
              <Text style={styles.detailText}>{item.personalInfo.email}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="card-account-details" 
              size={16} 
              color={Palette.textMuted} 
            />
            <Text style={styles.detailText}>{item.loyalty?.loyaltyNumber}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="calendar" 
              size={16} 
              color={Palette.textMuted} 
            />
            <Text style={styles.detailText}>
              Visited {item.loyalty?.visitCount || 0} times • Last: {item.loyalty?.formattedLastVisit || 'Never'}
            </Text>
          </View>
        </View>
        
        <View style={styles.customerFooter}>
          <Text style={styles.memberSince}>
            Member since {item.formattedMemberSince || 'N/A'}
          </Text>
          <Badge style={styles.pointsBadge}>
            {item.loyalty?.points || 0} pts
          </Badge>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  if (loading && customers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customer Management</Text>
        <IconButton 
          icon={() => <MaterialCommunityIcons name="account-plus" size={24} color={Palette.primary} />}
          size={32}
          onPress={() => navigation.navigate('AddCustomer')}
          style={styles.headerButton}
        />
      </View>

      {/* Search and Filter Section */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, email or loyalty number..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Palette.textMuted}
        />
        
        <View style={styles.filterRow}>
          <Button
            mode={selectedFilter === 'all' ? 'contained' : 'outlined'}
            onPress={() => setSelectedFilter('all')}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
          >
            All
          </Button>
          <Button
            mode={selectedFilter === 'active' ? 'contained' : 'outlined'}
            onPress={() => setSelectedFilter('active')}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
          >
            Active
          </Button>
          <Button
            mode={selectedFilter === 'loyal' ? 'contained' : 'outlined'}
            onPress={() => setSelectedFilter('loyal')}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
          >
            Loyal
          </Button>
          <Button
            mode={selectedFilter === 'birthday' ? 'contained' : 'outlined'}
            onPress={() => setSelectedFilter('birthday')}
            style={styles.filterButton}
            labelStyle={styles.filterButtonLabel}
          >
            Birthday
          </Button>
        </View>
      </View>

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Palette.primary]}
            tintColor={Palette.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="account-search" 
              size={48} 
              color={Palette.textMuted} 
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching customers found' : 'No customers yet'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Details</Text>
              <IconButton 
                icon="close" 
                size={24} 
                onPress={() => {
                  setSelectedCustomer(null);
                  setIsEditingPoints(false);
                }} 
              />
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.customerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.customerNameLarge}>
                    {selectedCustomer.personalInfo?.firstName} {selectedCustomer.personalInfo?.lastName}
                  </Text>
                  {selectedCustomer.loyalty?.tier && (
                    <Chip 
                      style={[
                        styles.tierChipLarge,
                        { backgroundColor: `${getTierColor(selectedCustomer.loyalty.tier)}20` }
                      ]}
                      textStyle={{ color: getTierColor(selectedCustomer.loyalty.tier) }}
                    >
                      {selectedCustomer.loyalty.tier.toUpperCase()}
                    </Chip>
                  )}
                </View>
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="card-account-details" size={20} color={Palette.primary} />
                  <Text style={styles.infoText}>{selectedCustomer.loyalty?.loyaltyNumber}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={20} color={Palette.primary} />
                  <Text style={styles.infoText}>{selectedCustomer.personalInfo?.phone}</Text>
                </View>
                
                {selectedCustomer.personalInfo?.email && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="email" size={20} color={Palette.primary} />
                    <Text style={styles.infoText}>{selectedCustomer.personalInfo.email}</Text>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="calendar" size={20} color={Palette.primary} />
                  <Text style={styles.infoText}>
                    Member since {selectedCustomer.formattedMemberSince || 'N/A'}
                  </Text>
                </View>
                
                {selectedCustomer.personalInfo?.dateOfBirth && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="cake" size={20} color={Palette.primary} />
                    <Text style={styles.infoText}>
                      Birthday: {selectedCustomer.personalInfo.formattedDOB}
                    </Text>
                  </View>
                )}
                
                {selectedCustomer.personalInfo?.anniversary && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="heart" size={20} color={Palette.primary} />
                    <Text style={styles.infoText}>
                      Anniversary: {selectedCustomer.personalInfo.formattedAnniversary}
                    </Text>
                  </View>
                )}
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Loyalty Program Section */}
              <View style={styles.loyaltySection}>
                <Text style={styles.sectionTitle}>Loyalty Program</Text>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Points</Text>
                    <Text style={styles.statValue}>{selectedCustomer.loyalty?.points || 0}</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Spent</Text>
                    <Text style={styles.statValue}>₹{selectedCustomer.loyalty?.totalSpent?.toLocaleString() || 0}</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Visits</Text>
                    <Text style={styles.statValue}>{selectedCustomer.loyalty?.visitCount || 0}</Text>
                  </View>
                </View>
                
                {isEditingPoints ? (
                  <View style={styles.pointsInputContainer}>
                    <TextInput
                      style={styles.pointsInput}
                      placeholder="Points to add"
                      value={pointsToAdd}
                      onChangeText={setPointsToAdd}
                      keyboardType="numeric"
                      placeholderTextColor={Palette.textMuted}
                    />
                    <Button
                      mode="contained"
                      onPress={handleAddPoints}
                      style={styles.pointsActionButton}
                      labelStyle={styles.pointsActionButtonLabel}
                    >
                      Add
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => setIsEditingPoints(false)}
                      style={styles.pointsCancelButton}
                      labelStyle={styles.pointsCancelButtonLabel}
                    >
                      Cancel
                    </Button>
                  </View>
                ) : (
                  <View style={styles.pointsActions}>
                    <Button
                      mode="contained"
                      onPress={() => setIsEditingPoints(true)}
                      style={styles.pointsActionButton}
                      labelStyle={styles.pointsActionButtonLabel}
                      icon="plus"
                    >
                      Add Points
                    </Button>
                    
                    <View style={styles.redeemButtons}>
                      <Button
                        mode="outlined"
                        onPress={() => handleRedeemPoints(100)}
                        style={styles.redeemButton}
                        labelStyle={styles.redeemButtonLabel}
                        disabled={(selectedCustomer.loyalty?.points || 0) < 100}
                      >
                        Redeem 100
                      </Button>
                      <Button
                        mode="outlined"
                        onPress={() => handleRedeemPoints(250)}
                        style={styles.redeemButton}
                        labelStyle={styles.redeemButtonLabel}
                        disabled={(selectedCustomer.loyalty?.points || 0) < 250}
                      >
                        Redeem 250
                      </Button>
                    </View>
                  </View>
                )}
              </View>
              
              <Divider style={styles.divider} />
              
              {/* Preferences Section */}
              {selectedCustomer.preferences && (
                <View style={styles.preferencesSection}>
                  <Text style={styles.sectionTitle}>Preferences</Text>
                  
                  {selectedCustomer.preferences.dietaryRestrictions?.length > 0 && (
                    <View style={styles.preferenceItem}>
                      <Text style={styles.preferenceLabel}>Dietary Restrictions:</Text>
                      <View style={styles.tagsContainer}>
                        {selectedCustomer.preferences.dietaryRestrictions.map((restriction, index) => (
                          <Chip key={index} style={styles.tagChip}>
                            {restriction.replace('_', ' ')}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {selectedCustomer.preferences.notes && (
                    <View style={styles.preferenceItem}>
                      <Text style={styles.preferenceLabel}>Notes:</Text>
                      <Text style={styles.preferenceText}>{selectedCustomer.preferences.notes}</Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Marketing Preferences */}
              <View style={styles.marketingSection}>
                <Text style={styles.sectionTitle}>Marketing Preferences</Text>
                
                <View style={styles.marketingRow}>
                  <MaterialCommunityIcons 
                    name={selectedCustomer.marketing?.emailOptIn ? 'email-check' : 'email-remove'} 
                    size={20} 
                    color={selectedCustomer.marketing?.emailOptIn ? Palette.success : Palette.error} 
                  />
                  <Text style={styles.marketingText}>
                    Email: {selectedCustomer.marketing?.emailOptIn ? 'Subscribed' : 'Unsubscribed'}
                  </Text>
                </View>
                
                <View style={styles.marketingRow}>
                  <MaterialCommunityIcons 
                    name={selectedCustomer.marketing?.smsOptIn ? 'message-text-check' : 'message-text-remove'} 
                    size={20} 
                    color={selectedCustomer.marketing?.smsOptIn ? Palette.success : Palette.error} 
                  />
                  <Text style={styles.marketingText}>
                    SMS: {selectedCustomer.marketing?.smsOptIn ? 'Subscribed' : 'Unsubscribed'}
                  </Text>
                </View>
                
                <View style={styles.marketingRow}>
                  <MaterialCommunityIcons 
                    name={selectedCustomer.marketing?.promotionalOffers ? 'tag-check' : 'tag-remove'} 
                    size={20} 
                    color={selectedCustomer.marketing?.promotionalOffers ? Palette.success : Palette.error} 
                  />
                  <Text style={styles.marketingText}>
                    Promotions: {selectedCustomer.marketing?.promotionalOffers ? 'Subscribed' : 'Unsubscribed'}
                  </Text>
                </View>
                
                <View style={styles.marketingRow}>
                  <MaterialCommunityIcons 
                    name={selectedCustomer.marketing?.birthdayOffers ? 'cake-variant' : 'cake-off'} 
                    size={20} 
                    color={selectedCustomer.marketing?.birthdayOffers ? Palette.success : Palette.error} 
                  />
                  <Text style={styles.marketingText}>
                    Birthday Offers: {selectedCustomer.marketing?.birthdayOffers ? 'Subscribed' : 'Unsubscribed'}
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={() => {
                  navigation.navigate('CreateOrder', { customer: selectedCustomer });
                  setSelectedCustomer(null);
                }}
                style={styles.createOrderButton}
                labelStyle={styles.createOrderButtonLabel}
                icon="plus"
              >
                Create New Order
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    marginTop: 16,
    color: Palette.text,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Palette.surface,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
  },
  headerButton: {
    margin: 0,
  },
  filterSection: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: Palette.surface,
  },
  searchInput: {
    backgroundColor: Palette.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Palette.text,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  filterButtonLabel: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.textMuted,
    textAlign: 'center',
  },
  customerCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    flex: 1,
    marginRight: 8,
  },
  tierChip: {
    borderRadius: 12,
    height: 24,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: Palette.textMuted,
    marginLeft: 8,
  },
  customerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberSince: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  pointsBadge: {
    backgroundColor: Palette.primary,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Palette.background,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
  },
  modalScroll: {
    padding: 16,
  },
  customerInfo: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerNameLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    marginRight: 12,
  },
  tierChipLarge: {
    borderRadius: 16,
    height: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Palette.text,
    marginLeft: 12,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: Palette.borderLight,
  },
  loyaltySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.primary,
    marginTop: 4,
  },
  pointsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  pointsInput: {
    flex: 1,
    backgroundColor: Palette.surfaceVariant,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    color: Palette.text,
  },
  pointsActionButton: {
    marginRight: 8,
    borderRadius: 8,
  },
  pointsActionButtonLabel: {
    color: Palette.textOnPrimary,
  },
  pointsCancelButton: {
    borderRadius: 8,
    borderColor: Palette.error,
  },
  pointsCancelButtonLabel: {
    color: Palette.error,
  },
  pointsActions: {
    marginTop: 16,
  },
  redeemButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  redeemButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    borderColor: Palette.accent,
  },
  redeemButtonLabel: {
    color: Palette.accent,
  },
  preferencesSection: {
    marginBottom: 16,
  },
  preferenceItem: {
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 8,
  },
  preferenceText: {
    fontSize: 16,
    color: Palette.textMuted,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: Palette.surfaceVariant,
  },
  marketingSection: {
    marginBottom: 16,
  },
  marketingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketingText: {
    fontSize: 16,
    color: Palette.text,
    marginLeft: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  createOrderButton: {
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: Palette.primary,
  },
  createOrderButtonLabel: {
    color: Palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
export default CustomerManagementScreen;