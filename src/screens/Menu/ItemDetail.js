import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity
} from 'react-native';
import {
  Text,
  Button,
  RadioButton,
  Checkbox,
  TextInput,
  
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../context/CartContext';
import {ActivityIndicator} from 'react-native';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen({ navigation, route }) {
  const { addToCart } = useCart();
  const { itemId, cafeId } = route.params;  // Get both itemId and cafeId from params

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Instead of storing everything in one array, keep a map keyed by customizationId
  // For each customizationId -> if single_select, store a single optionId; if multi_select, store an array of optionIds
  const [selectedOptions, setSelectedOptions] = useState({});

  const [selectedSize, setSelectedSize] = useState(null);
  const [notes, setNotes] = useState('');

  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const itemRef = doc(db, 'menuItems', itemId);
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          setItem({ id: itemSnap.id, ...itemSnap.data() });
        } else {
          console.warn('Item not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    })();
  }, [itemId]);

  const incrementQuantity = () => {
    Haptics.selectionAsync();
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    Haptics.selectionAsync();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Helper for single_select vs multi_select
// Fixed handleOptionSelection function
const handleOptionSelection = (customization, option) => {
  Haptics.selectionAsync();
  setSelectedOptions(prev => {
    if (customization.type === 'single_select') {
      // Just store this one option ID
      return { 
        ...prev, 
        [customization.id]: option.id 
      };
    } else {
      // multi_select
      const existingForThisCustomization = prev[customization.id] || []; // Initialize as empty array if undefined
      
      // Check if the option is already selected
      const isSelected = existingForThisCustomization.includes(option.id);
      
      if (isSelected) {
        // Remove the option
        return {
          ...prev,
          [customization.id]: existingForThisCustomization.filter(id => id !== option.id)
        };
      } else {
        // Add the option
        return {
          ...prev,
          [customization.id]: [...existingForThisCustomization, option.id]
        };
      }
    }
  });
};

  const calculateTotalPrice = () => {
    if (!item) return 0;
    
    let total = item.pricing.basePrice;

    // Add selected size price
    if (selectedSize) {
      total += selectedSize.price;
    }

    // For each customization, add relevant option prices
    if (item.customizations?.length) {
      item.customizations.forEach(custom => {
        const selected = selectedOptions[custom.id];
        if (!selected) return;

        if (custom.type === 'single_select') {
          // selected is a single optionId
          const foundOption = custom.options.find(o => o.id === selected);
          if (foundOption?.price) {
            total += foundOption.price;
          }
        } else {
          // multi_select -> selected is an array of optionIds
          selected.forEach((optionId) => {
            const foundOption = custom.options.find(o => o.id === optionId);
            if (foundOption?.price) {
              total += foundOption.price;
            }
          });
        }
      });
    }

    return total * quantity;
  };

const handleAddToCart = () => {
  if (!item) return;

  const cartItem = {
    ...item,
    cafeId: cafeId,
    customizations: {
      size: selectedSize,
      selectedOptions,
      notes
    },
    quantity
  };

  addToCart(cartItem); // ✅ Use CartContext instead of callback
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  navigation.goBack();
};

  if (loading || !item) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
        <Text>Loading item details...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ITEM IMAGE */}
        <Image
          source={item.basicInfo.image ? { uri: item.basicInfo.image } : require('../../../assets/logo.png')}
          style={styles.itemImage}
          resizeMode="cover"
        />

        {/* ITEM INFO */}
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.basicInfo.name}</Text>
          <Text style={styles.itemPrice}>
            {item.pricing.basePrice} {item.pricing.currency}
          </Text>
        </View>

        <Text style={styles.itemDescription}>
          {item.basicInfo.description || 'No description available'}
        </Text>

        {/* QUANTITY SELECTOR */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity onPress={decrementQuantity} style={styles.quantityButton}>
              <Icon name="minus" size={24} color={Palette.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
              <Icon name="plus" size={24} color={Palette.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SIZE SELECTION */}
        {item.pricing.sizes?.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Size</Text>
            {item.pricing.sizes.map((size, index) => (
              <TouchableOpacity
                key={`size-${size.name}-${index}`}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedSize(size);
                }}
                style={styles.sizeOption}
              >
                <RadioButton
                  value={size.name}
                  status={selectedSize?.name === size.name ? 'checked' : 'unchecked'}
                  onPress={() => setSelectedSize(size)}
                  color={Palette.primary}
                />
                <View style={styles.sizeInfo}>
                  <Text style={styles.sizeName}>{size.name}</Text>
                  <Text style={styles.sizePrice}>+{size.price} {item.pricing.currency}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CUSTOMIZATIONS */}
        {item.customizations?.map((customization, customIndex) => (
          <View key={`customization-${customization.id}-${customIndex}`} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{customization.name}</Text>

            {customization.options.map((option, optionIndex) => {
              const isSelected = customization.type === 'single_select'
                ? selectedOptions[customization.id] === option.id
                : Array.isArray(selectedOptions[customization.id])
                  && selectedOptions[customization.id].includes(option.id);

              return (
                <TouchableOpacity
                  key={`option-${customization.id}-${option.id}-${optionIndex}`}
                  onPress={() => handleOptionSelection(customization, option)}
                  style={styles.optionItem}
                >
                  {customization.type === 'single_select' ? (
                    <RadioButton
                      value={option.id}
                      status={isSelected ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionSelection(customization, option)}
                      color={Palette.primary}
                    />
                  ) : (
                    <Checkbox
                      status={isSelected ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionSelection(customization, option)}
                      color={Palette.primary}
                    />
                  )}
                  <Text style={styles.optionText}>{option.name}</Text>
                  {!!option.price && (
                    <Text style={styles.optionPrice}>
                      +{option.price} {item.pricing.currency}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* SPECIAL INSTRUCTIONS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            mode="outlined"
            placeholder="Any special requests or dietary restrictions"
            value={notes}
            onChangeText={setNotes}
            style={styles.notesInput}
            multiline
          />
        </View>
      </ScrollView>

      {/* FIXED ADD TO CART BUTTON */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalPriceText}>
            {calculateTotalPrice().toFixed(2)} {item.pricing.currency}
          </Text>
          <Text style={styles.priceDescription}>
            {quantity} item{quantity > 1 ? 's' : ''}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleAddToCart}
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
          icon="cart-plus"
        >
          Add to Order
        </Button>
      </View>
    </Animated.View>
  );
}

// Example simplified styles (adapt as needed)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background
  },
  scrollContainer: {
    paddingBottom: 100
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemImage: {
    width: '100%',
    height: 200
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.primary
  },
  itemDescription: {
    fontSize: 15,
    color: Palette.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    padding: 8
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center'
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight
  },
  sizeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  sizeInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 8
  },
  sizeName: {
    fontSize: 16
  },
  sizePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.primary
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.primary,
    marginLeft: 8
  },
  notesInput: {
    backgroundColor: Palette.surface
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
    elevation: 4
  },
  priceContainer: {
    flex: 1
  },
  totalPriceText: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.primary
  },
  priceDescription: {
    fontSize: 14,
    color: Palette.textMuted
  },
  addButton: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: Palette.primary,
    borderRadius: 8,
    paddingVertical: 8
  },
  addButtonLabel: {
    color: Palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '700'
  }
});