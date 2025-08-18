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
  IconButton,
  Divider,
  Menu,
  ActivityIndicator,
  Searchbar,
  DataTable,
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
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

const MenuManagementScreen = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'main',
    description: '',
    price: '',
    ingredients: '',
    isAvailable: true,
    isVegetarian: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMenuItems();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterMenuData();
  }, [menuItems, searchQuery, filterCategory]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const menuQuery = query(
        collection(db, 'menu'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(menuQuery);
      const menuData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error loading menu items:', error);
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const filterMenuData = () => {
    let filtered = menuItems;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    setFilteredItems(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMenuItems();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      await addDoc(collection(db, 'menu'), {
        name: newItem.name,
        category: newItem.category,
        description: newItem.description || '',
        price: parseFloat(newItem.price),
        ingredients: newItem.ingredients || '',
        isAvailable: newItem.isAvailable,
        isVegetarian: newItem.isVegetarian,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Reset form and close modal
      setNewItem({
        name: '',
        category: 'main',
        description: '',
        price: '',
        ingredients: '',
        isAvailable: true,
        isVegetarian: false,
      });
      setShowAddModal(false);
      await loadMenuItems();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Menu item added successfully');
    } catch (error) {
      console.error('Error adding menu item:', error);
      Alert.alert('Error', error.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      const itemRef = doc(db, 'menu', selectedItem.id);
      await updateDoc(itemRef, {
        ...selectedItem,
        updatedAt: new Date(),
      });

      setShowEditModal(false);
      setSelectedItem(null);
      await loadMenuItems();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Menu item updated successfully');
    } catch (error) {
      console.error('Error updating menu item:', error);
      Alert.alert('Error', 'Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const itemRef = doc(db, 'menu', item.id);
      await updateDoc(itemRef, {
        isAvailable: !item.isAvailable,
        updatedAt: new Date(),
      });

      await loadMenuItems();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error toggling menu item status:', error);
      Alert.alert('Error', 'Failed to update menu item status');
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete ${item.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'menu', item.id));
              await loadMenuItems();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting menu item:', error);
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'main':
        return Palette.primary;
      case 'appetizer':
        return Palette.secondary;
      case 'dessert':
        return Palette.accent;
      case 'beverage':
        return Palette.warning;
      default:
        return Palette.textSecondary;
    }
  };

  if (loading && menuItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading menu items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar 
          placeholder="Search menu..." 
          onChangeText={setSearchQuery} 
          value={searchQuery} 
          style={styles.searchbar} 
        />
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'main', 'appetizer', 'dessert', 'beverage'].map((category) => (
              <Chip
                key={category}
                mode={filterCategory === category ? 'flat' : 'outlined'}
                selected={filterCategory === category}
                onPress={() => setFilterCategory(category)}
                style={styles.filterChip}
                selectedColor={Palette.primary}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Menu Items List */}
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
          {filteredItems.length > 0 ? (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Item</DataTable.Title>
                <DataTable.Title numeric>Price</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredItems.map((item) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    ₹{item.price.toFixed(2)}
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <Chip 
                      compact 
                      textStyle={{ fontSize: 10 }}
                      style={{ 
                        backgroundColor: item.isAvailable ? Palette.success : Palette.error,
                      }}
                    >
                      {item.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>
                    <View style={styles.actions}>
                      <IconButton
                        icon="pencil"
                        size={18}
                        onPress={() => {
                          setSelectedItem(item);
                          setShowEditModal(true);
                        }}
                      />
                      <IconButton
                        icon={item.isAvailable ? 'eye-off' : 'eye'}
                        size={18}
                        onPress={() => handleToggleAvailability(item)}
                      />
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="food" size={64} color={Palette.textSecondary} />
              <Text style={styles.emptyText}>No menu items found</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Add Item FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        color="white"
      />

      {/* Add Item Modal */}
      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Add New Menu Item</Text>
          
          <TextInput
            label="Item Name *"
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Description"
            value={newItem.description}
            onChangeText={(text) => setNewItem({ ...newItem, description: text })}
            style={styles.input}
            mode="outlined"
            multiline
          />
          
          <TextInput
            label="Price *"
            value={newItem.price}
            onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          
          <TextInput
            label="Ingredients"
            value={newItem.ingredients}
            onChangeText={(text) => setNewItem({ ...newItem, ingredients: text })}
            style={styles.input}
            mode="outlined"
            multiline
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Vegetarian</Text>
            <Switch
              value={newItem.isVegetarian}
              onValueChange={(value) => setNewItem({ ...newItem, isVegetarian: value })}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Available</Text>
            <Switch
              value={newItem.isAvailable}
              onValueChange={(value) => setNewItem({ ...newItem, isAvailable: value })}
            />
          </View>

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
              onPress={handleAddItem}
              style={styles.addButton}
              loading={loading}
            >
              Add Item
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Edit Item Modal */}
      <Portal>
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Edit Menu Item</Text>
          
          {selectedItem && (
            <>
              <TextInput
                label="Item Name"
                value={selectedItem.name}
                onChangeText={(text) => setSelectedItem({ ...selectedItem, name: text })}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Description"
                value={selectedItem.description || ''}
                onChangeText={(text) => setSelectedItem({ ...selectedItem, description: text })}
                style={styles.input}
                mode="outlined"
                multiline
              />
              
              <TextInput
                label="Price"
                value={selectedItem.price?.toString()}
                onChangeText={(text) => setSelectedItem({ 
                  ...selectedItem, 
                  price: parseFloat(text) || 0 
                })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
              
              <TextInput
                label="Ingredients"
                value={selectedItem.ingredients || ''}
                onChangeText={(text) => setSelectedItem({ ...selectedItem, ingredients: text })}
                style={styles.input}
                mode="outlined"
                multiline
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Vegetarian</Text>
                <Switch
                  value={selectedItem.isVegetarian || false}
                  onValueChange={(value) => setSelectedItem({ 
                    ...selectedItem, 
                    isVegetarian: value 
                  })}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Available</Text>
                <Switch
                  value={selectedItem.isAvailable}
                  onValueChange={(value) => setSelectedItem({ 
                    ...selectedItem, 
                    isAvailable: value 
                  })}
                />
              </View>
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
              onPress={handleUpdateItem}
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
    padding: 8,
  },
  itemInfo: {
    flexDirection: 'column',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  itemCategory: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  actions: {
    flexDirection: 'row',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: Palette.text,
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

export default MenuManagementScreen;