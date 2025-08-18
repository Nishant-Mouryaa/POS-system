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
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { Palette } from '../../theme/colors';

const InventoryManagementScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'ingredient',
    quantity: '',
    unit: 'kg',
    threshold: '',
    pricePerUnit: '',
    supplier: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadInventory();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterInventoryData();
  }, [inventory, searchQuery, filterCategory, lowStockFilter]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const inventoryQuery = query(
        collection(db, 'inventory'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(inventoryQuery);
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading inventory:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const filterInventoryData = () => {
    let filtered = inventory;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Filter by low stock
    if (lowStockFilter) {
      filtered = filtered.filter(item => item.quantity <= item.threshold);
    }

    setFilteredInventory(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.threshold) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      await addDoc(collection(db, 'inventory'), {
        name: newItem.name,
        category: newItem.category,
        quantity: parseFloat(newItem.quantity),
        unit: newItem.unit,
        threshold: parseFloat(newItem.threshold),
        pricePerUnit: parseFloat(newItem.pricePerUnit) || 0,
        supplier: newItem.supplier || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Reset form and close modal
      setNewItem({
        name: '',
        category: 'ingredient',
        quantity: '',
        unit: 'kg',
        threshold: '',
        pricePerUnit: '',
        supplier: '',
      });
      setShowAddModal(false);
      await loadInventory();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Inventory item added successfully');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      Alert.alert('Error', error.message || 'Failed to add inventory item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      const itemRef = doc(db, 'inventory', selectedItem.id);
      await updateDoc(itemRef, {
        ...selectedItem,
        updatedAt: new Date(),
      });

      setShowEditModal(false);
      setSelectedItem(null);
      await loadInventory();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Inventory item updated successfully');
    } catch (error) {
      console.error('Error updating inventory item:', error);
      Alert.alert('Error', 'Failed to update inventory item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Inventory Item',
      `Are you sure you want to delete ${item.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'inventory', item.id));
              await loadInventory();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting inventory item:', error);
              Alert.alert('Error', 'Failed to delete inventory item');
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'ingredient':
        return Palette.primary;
      case 'beverage':
        return Palette.secondary;
      case 'packaging':
        return Palette.accent;
      case 'cleaning':
        return Palette.warning;
      default:
        return Palette.textSecondary;
    }
  };

  const getStockStatusColor = (quantity, threshold) => {
    if (quantity <= 0) return Palette.error;
    if (quantity <= threshold) return Palette.warning;
    return Palette.success;
  };

  if (loading && inventory.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar 
          placeholder="Search inventory..." 
          onChangeText={setSearchQuery} 
          value={searchQuery} 
          style={styles.searchbar} 
        />
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'ingredient', 'beverage', 'packaging', 'cleaning'].map((category) => (
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
            <Chip
              mode={lowStockFilter ? 'flat' : 'outlined'}
              selected={lowStockFilter}
              onPress={() => setLowStockFilter(!lowStockFilter)}
              style={styles.filterChip}
              selectedColor={Palette.warning}
              icon={lowStockFilter ? 'alert-circle' : 'alert-circle-outline'}
            >
              Low Stock
            </Chip>
          </ScrollView>
        </View>
      </View>

      {/* Inventory List */}
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
          {filteredInventory.length > 0 ? (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Item</DataTable.Title>
                <DataTable.Title numeric>Qty</DataTable.Title>
                <DataTable.Title numeric>Status</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredInventory.map((item) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    {item.quantity} {item.unit}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Chip 
                      compact 
                      textStyle={{ fontSize: 10 }}
                      style={{ 
                        backgroundColor: getStockStatusColor(item.quantity, item.threshold),
                      }}
                    >
                      {item.quantity <= 0 ? 'OUT' : item.quantity <= item.threshold ? 'LOW' : 'OK'}
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
                        icon="delete"
                        size={18}
                        onPress={() => handleDeleteItem(item)}
                        iconColor={Palette.error}
                      />
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="package-variant-closed" size={64} color={Palette.textSecondary} />
              <Text style={styles.emptyText}>No inventory items found</Text>
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
          <Text style={styles.modalTitle}>Add New Inventory Item</Text>
          
          <TextInput
            label="Item Name *"
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            style={styles.input}
            mode="outlined"
          />
          
          <View style={styles.row}>
            <TextInput
              label="Quantity *"
              value={newItem.quantity}
              onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
              style={[styles.input, { flex: 0.6 }]}
              mode="outlined"
              keyboardType="numeric"
            />
            <TextInput
              label="Unit"
              value={newItem.unit}
              onChangeText={(text) => setNewItem({ ...newItem, unit: text })}
              style={[styles.input, { flex: 0.4 }]}
              mode="outlined"
            />
          </View>
          
          <TextInput
            label="Threshold *"
            value={newItem.threshold}
            onChangeText={(text) => setNewItem({ ...newItem, threshold: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          
          <TextInput
            label="Price Per Unit"
            value={newItem.pricePerUnit}
            onChangeText={(text) => setNewItem({ ...newItem, pricePerUnit: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          
          <TextInput
            label="Supplier"
            value={newItem.supplier}
            onChangeText={(text) => setNewItem({ ...newItem, supplier: text })}
            style={styles.input}
            mode="outlined"
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
          <Text style={styles.modalTitle}>Edit Inventory Item</Text>
          
          {selectedItem && (
            <>
              <TextInput
                label="Item Name"
                value={selectedItem.name}
                onChangeText={(text) => setSelectedItem({ ...selectedItem, name: text })}
                style={styles.input}
                mode="outlined"
              />
              
              <View style={styles.row}>
                <TextInput
                  label="Quantity"
                  value={selectedItem.quantity?.toString()}
                  onChangeText={(text) => setSelectedItem({ 
                    ...selectedItem, 
                    quantity: parseFloat(text) || 0 
                  })}
                  style={[styles.input, { flex: 0.6 }]}
                  mode="outlined"
                  keyboardType="numeric"
                />
                <TextInput
                  label="Unit"
                  value={selectedItem.unit}
                  onChangeText={(text) => setSelectedItem({ ...selectedItem, unit: text })}
                  style={[styles.input, { flex: 0.4 }]}
                  mode="outlined"
                />
              </View>
              
              <TextInput
                label="Threshold"
                value={selectedItem.threshold?.toString()}
                onChangeText={(text) => setSelectedItem({ 
                  ...selectedItem, 
                  threshold: parseFloat(text) || 0 
                })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
              
              <TextInput
                label="Price Per Unit"
                value={selectedItem.pricePerUnit?.toString()}
                onChangeText={(text) => setSelectedItem({ 
                  ...selectedItem, 
                  pricePerUnit: parseFloat(text) || 0 
                })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
              
              <TextInput
                label="Supplier"
                value={selectedItem.supplier || ''}
                onChangeText={(text) => setSelectedItem({ ...selectedItem, supplier: text })}
                style={styles.input}
                mode="outlined"
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default InventoryManagementScreen;