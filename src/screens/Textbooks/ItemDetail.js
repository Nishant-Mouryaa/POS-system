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
  Chip,
  Divider,
  RadioButton,
  Checkbox,
  TextInput,
  useTheme
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen({ navigation, route }) {
  const { itemId, onAddToCart } = route.params;
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [customizations, setCustomizations] = useState({
    size: null,
    options: [],
    notes: ''
  });
  const [quantity, setQuantity] = useState(1);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const itemRef = doc(db, 'menuItems', itemId);
        const itemSnap = await getDoc(itemRef);
        
        if (itemSnap.exists()) {
          setItem({
            id: itemSnap.id,
            ...itemSnap.data()
          });
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
    };

    fetchItem();
  }, [itemId]);

  const handleSizeSelect = (size) => {
    Haptics.selectionAsync();
    setCustomizations(prev => ({
      ...prev,
      size
    }));
  };

  const handleOptionToggle = (option) => {
    Haptics.selectionAsync();
    setCustomizations(prev => {
      const existingIndex = prev.options.findIndex(opt => opt.id === option.id);
      let newOptions = [...prev.options];
      
      if (existingIndex >= 0) {
        newOptions.splice(existingIndex, 1);
      } else {
        newOptions.push(option);
      }
      
      return {
        ...prev,
        options: newOptions
      };
    });
  };

  const handleAddToCart = () => {
    if (!item) return;
    
    const itemWithCustomizations = {
      ...item,
      customizations: {
        size: customizations.size,
        options: customizations.options,
        notes: customizations.notes
      }
    };
    
    onAddToCart(itemWithCustomizations);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

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

  const calculateTotalPrice = () => {
    if (!item) return 0;
    
    let total = item.pricing.basePrice;
    
    // Add size price if selected
    if (customizations.size) {
      total += customizations.size.price;
    }
    
    // Add options prices
    customizations.options.forEach(opt => {
      total += opt.price;
    });
    
    return total * quantity;
  };

  if (loading || !item) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Item Image */}
        <Image
          source={item.basicInfo.image ? { uri: item.basicInfo.image } : require('../../../assets/logo.png')}
          style={styles.itemImage}
          resizeMode="cover"
        />

        {/* Item Info */}
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.basicInfo.name}</Text>
          <Text style={styles.itemPrice}>
            {item.pricing.basePrice} {item.pricing.currency}
          </Text>
        </View>

        <Text style={styles.itemDescription}>
          {item.basicInfo.description || 'No description available'}
        </Text>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity onPress={decrementQuantity} style={styles.quantityButton}>
              <Icon name="minus" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
              <Icon name="plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Size Selection */}
        {item.pricing.sizes?.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Size</Text>
            <View style={styles.sizeOptions}>
              {item.pricing.sizes.map(size => (
                <TouchableOpacity
                  key={size.name}
                  onPress={() => handleSizeSelect(size)}
                  style={[
                    styles.sizeOption,
                    customizations.size?.name === size.name && styles.sizeOptionSelected
                  ]}
                >
                  <RadioButton
                    value={size.name}
                    status={customizations.size?.name === size.name ? 'checked' : 'unchecked'}
                    onPress={() => handleSizeSelect(size)}
                    color={colors.primary}
                  />
                  <View style={styles.sizeInfo}>
                    <Text style={styles.sizeName}>{size.name}</Text>
                    <Text style={styles.sizePrice}>
                      +{size.price} {item.pricing.currency}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Customization Options */}
        {item.customizations?.length > 0 && item.customizations.map(customization => (
          <View key={customization.id} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{customization.name}</Text>
            {customization.type === 'single_select' ? (
              <View style={styles.optionContainer}>
                {customization.options.map(option => (
                  <TouchableOpacity
                    key={option.name}
                    onPress={() => handleOptionToggle(option)}
                    style={styles.optionItem}
                  >
                    <RadioButton
                      value={option.name}
                      status={
                        customizations.options.some(opt => opt.id === option.id) ? 
                        'checked' : 'unchecked'
                      }
                      onPress={() => handleOptionToggle(option)}
                      color={colors.primary}
                    />
                    <Text style={styles.optionText}>{option.name}</Text>
                    {option.price > 0 && (
                      <Text style={styles.optionPrice}>
                        +{option.price} {item.pricing.currency}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.optionContainer}>
                {customization.options.map(option => (
                  <TouchableOpacity
                    key={option.name}
                    onPress={() => handleOptionToggle(option)}
                    style={styles.optionItem}
                  >
                    <Checkbox
                      status={
                        customizations.options.some(opt => opt.id === option.id) ? 
                        'checked' : 'unchecked'
                      }
                      onPress={() => handleOptionToggle(option)}
                      color={colors.primary}
                    />
                    <Text style={styles.optionText}>{option.name}</Text>
                    {option.price > 0 && (
                      <Text style={styles.optionPrice}>
                        +{option.price} {item.pricing.currency}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Special Instructions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            mode="outlined"
            placeholder="Any special requests or dietary restrictions"
            value={customizations.notes}
            onChangeText={text => setCustomizations(prev => ({
              ...prev,
              notes: text
            }))}
            style={styles.notesInput}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Nutrition Info */}
        {item.nutrition && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Nutrition Information</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{item.nutrition.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{item.nutrition.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{item.nutrition.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{item.nutrition.fat}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
            {item.nutrition.allergens?.length > 0 && (
              <Text style={styles.allergenText}>
                Contains: {item.nutrition.allergens.join(', ')}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Fixed Add to Cart Button */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalPriceText}>
            {calculateTotalPrice()} {item.pricing.currency}
          </Text>
          <Text style={styles.priceDescription}>{quantity} item{quantity > 1 ? 's' : ''}</Text>
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

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContainer: {
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
  itemImage: {
    width: '100%',
    height: 200,
    backgroundColor: Palette.surfaceVariant,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.primary,
    marginLeft: 16,
  },
  itemDescription: {
    fontSize: 15,
    color: Palette.textMuted,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: Palette.text,
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderLight,
  },
  sizeOptions: {
    marginTop: 8,
  },
  sizeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sizeOptionSelected: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
  },
  sizeInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 8,
  },
  sizeName: {
    fontSize: 16,
    color: Palette.text,
  },
  sizePrice: {
    fontSize: 16,
    color: Palette.primary,
    fontWeight: '600',
  },
  optionContainer: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: Palette.text,
    flex: 1,
    marginLeft: 8,
  },
  optionPrice: {
    fontSize: 16,
    color: Palette.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  notesInput: {
    backgroundColor: Palette.surface,
    marginTop: 8,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  nutritionItem: {
    alignItems: 'center',
    padding: 8,
    minWidth: 80,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  nutritionLabel: {
    fontSize: 14,
    color: Palette.textMuted,
    marginTop: 4,
  },
  allergenText: {
    fontSize: 14,
    color: Palette.error,
    marginTop: 12,
    fontStyle: 'italic',
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
    elevation: 4,
  },
  priceContainer: {
    flex: 1,
  },
  totalPriceText: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.primary,
  },
  priceDescription: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  addButton: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: Palette.primary,
    borderRadius: 8,
    paddingVertical: 8,
  },
  addButtonLabel: {
    color: Palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});