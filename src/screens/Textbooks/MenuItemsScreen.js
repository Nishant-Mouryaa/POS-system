import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  Animated
} from 'react-native';
import { Text, Button, Chip, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function MenuItemsScreen({ navigation, route }) {
  const { categoryId, categoryName, cafeId } = route.params;
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fetch menu items for the selected category
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'menuItems'),
          where('categoryId', '==', categoryId),
          where('cafeId', '==', cafeId),
          where('availability.isAvailable', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        const loadedItems = [];
        
        querySnapshot.forEach((doc) => {
          loadedItems.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setMenuItems(loadedItems);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
        // Fade in animation when data is loaded
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    };

    fetchMenuItems();
  }, [categoryId, cafeId]);

  // Set the screen title to the category name
  useEffect(() => {
    navigation.setOptions({
      title: categoryName,
      headerRight: () => (
        <View style={styles.cartIndicator}>
          <Icon name="cart" size={24} color={Palette.primary} />
          {selectedItems.length > 0 && (
            <Badge style={styles.badge}>{selectedItems.length}</Badge>
          )}
        </View>
      )
    });
  }, [categoryName, selectedItems]);

  const handleItemPress = (item) => {
    Haptics.selectionAsync();
    navigation.navigate('ItemDetail', { 
      itemId: item.id,
      onAddToCart: (customizations) => addToCart(item, customizations)
    });
  };

  const addToCart = (item, customizations = {}) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedItems(prev => [...prev, {
      ...item,
      customizations,
      timestamp: new Date()
    }]);
  };

  const viewCart = () => {
    if (selectedItems.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    navigation.navigate('Cart', { items: selectedItems });
  };

  const getItemImage = (item) => {
    if (item.basicInfo?.image) {
      return { uri: item.basicInfo.image };
    }
    return require('../../../assets/logo.png'); // Fallback image
  };

  const getPrice = (item) => {
    if (item.pricing?.sizes?.length > 0) {
      return `From ${item.pricing.sizes[0].price} ${item.pricing.currency}`;
    }
    return `${item.pricing?.basePrice || '0'} ${item.pricing?.currency || ''}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading menu items...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}
            >
              <Image
                source={getItemImage(item)}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.basicInfo.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.basicInfo.description || 'Delicious offering'}
                </Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>{getPrice(item)}</Text>
                  {item.tags?.includes('popular') && (
                    <Chip icon="star" style={styles.popularChip}>Popular</Chip>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="food-off" size={48} color={Palette.textMuted} />
            <Text style={styles.emptyText}>No items available in this category</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Button */}
      {menuItems.length > 0 && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={viewCart}
          activeOpacity={0.9}
        >
          <View style={styles.cartButtonContent}>
            <Icon name="cart" size={24} color="#fff" />
            <Text style={styles.cartButtonText}>
              {selectedItems.length > 0 ? 
                `View Cart (${selectedItems.length})` : 
                'View Cart'}
            </Text>
            {selectedItems.length > 0 && (
              <View style={styles.cartTotalBadge}>
                <Text style={styles.cartTotalText}>
                  {selectedItems.reduce((sum, item) => sum + (item.pricing?.basePrice || 0), 0)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
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
  },
  itemCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 120,
    elevation: 2,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 120,
    height: '100%',
    backgroundColor: Palette.surfaceVariant,
  },
  itemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: Palette.textMuted,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.primary,
  },
  popularChip: {
    backgroundColor: `${Palette.accent}20`,
    height: 24,
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
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Palette.primary,
    borderRadius: 12,
    paddingVertical: 14,
    elevation: 6,
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cartTotalBadge: {
    position: 'absolute',
    right: 16,
    backgroundColor: Palette.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cartTotalText: {
    color: Palette.textOnSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartIndicator: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Palette.secondary,
  },
});