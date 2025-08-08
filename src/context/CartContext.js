import React, { createContext, useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from AsyncStorage on app start
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage();
    }
  }, [cartItems]);

  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  // Debounced save to prevent too frequent storage writes
  const debouncedSave = useRef(null);
  
  useEffect(() => {
    if (!isLoading && cartItems.length >= 0) {
      // Clear existing timeout
      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current);
      }
      
      // Set new timeout to save after 500ms of no changes
      debouncedSave.current = setTimeout(() => {
        saveCartToStorage();
      }, 500);
    }
    
    return () => {
      if (debouncedSave.current) {
        clearTimeout(debouncedSave.current);
      }
    };
  }, [cartItems, isLoading]);

  // Generate unique ID for cart items including customizations
  const generateCartItemId = (item) => {
    const baseId = item.id || item.itemId;
    const customizations = item.customizations || {};
    const size = customizations.size?.id || customizations.size?.name || '';
    const options = (customizations.options || [])
      .map(opt => opt.id || opt.name)
      .sort()
      .join('-');
    const notes = item.notes || item.customizations?.notes || '';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    return `${baseId}-${size}-${options}-${notes}-${timestamp}-${random}`;
  };

  const addToCart = (item) => {
    const cartItemId = generateCartItemId(item);
    
    setCartItems(prev => {
      const newItem = {
        ...item,
        cartItemId,
        quantity: item.quantity || 1,
        addedAt: new Date().toISOString(),
        totalPrice: item.totalPrice || item.price || (item.pricing?.basePrice || 0)
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  // Add method to remove by index (for compatibility with existing code)
  const removeByIndex = (index) => {
    setCartItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const pricePerUnit = (item.totalPrice || item.price || 0) / (item.quantity || 1);
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: pricePerUnit * newQuantity
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Update item at specific index (for edit functionality)
  const updateItem = (index, updatedItem) => {
    setCartItems(prev => {
      const newItems = [...prev];
      if (index >= 0 && index < newItems.length) {
        newItems[index] = {
          ...updatedItem,
          cartItemId: newItems[index].cartItemId, // Keep the same cart ID
          addedAt: newItems[index].addedAt // Keep original add time
        };
      }
      return newItems;
    });
  };

  // Calculate cart totals - memoized for performance
  const getCartTotals = useCallback(() => {
    const subtotal = cartItems.reduce((total, item) => {
      // Calculate item total including customizations
      const basePrice = item.pricing?.basePrice || item.price || 0;
      const sizePrice = item.customizations?.size?.price || 0;
      const customizationsPrice = item.customizations?.options?.reduce((s, opt) => s + (opt.price || 0), 0) || 0;
      const itemTotal = (basePrice + sizePrice + customizationsPrice) * (item.quantity || 1);
      return total + itemTotal;
    }, 0);
    
    const itemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
    
    // You can customize these rates based on your business logic
    const taxRate = 0.18; // 18% GST
    const serviceChargeRate = 0.10; // 10% service charge
    
    const tax = subtotal * taxRate;
    const serviceCharge = subtotal * serviceChargeRate;
    const total = subtotal + tax + serviceCharge;

    return {
      subtotal,
      tax,
      serviceCharge,
      total,
      itemCount,
      taxRate,
      serviceChargeRate
    };
  }, [cartItems]);

  // Check if item is in cart (useful for UI states)
  const isItemInCart = (item) => {
    const cartItemId = generateCartItemId(item);
    return cartItems.some(cartItem => cartItem.cartItemId === cartItemId);
  };

  // Get item quantity in cart
  const getItemQuantity = (item) => {
    const cartItemId = generateCartItemId(item);
    const cartItem = cartItems.find(cartItem => cartItem.cartItemId === cartItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Validate cart before checkout
  const validateCart = () => {
    const errors = [];
    
    if (cartItems.length === 0) {
      errors.push('Cart is empty');
    }

    cartItems.forEach((item, index) => {
      if (!item.name && !item.basicInfo?.name) {
        errors.push(`Item at position ${index + 1} has no name`);
      }
      if (!item.price && !item.pricing?.basePrice && !item.totalPrice) {
        errors.push(`Item "${item.name || item.basicInfo?.name}" has no price`);
      }
      if ((item.quantity || 1) <= 0) {
        errors.push(`Item "${item.name || item.basicInfo?.name}" has invalid quantity`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    removeByIndex, // Add this method
    updateQuantity,
    updateItem, // Add this method for editing
    clearCart,
    getCartTotals,
    isItemInCart,
    getItemQuantity,
    validateCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper hook for cart totals (optional, for convenience)
export const useCartTotals = () => {
  const { getCartTotals } = useCart();
  return getCartTotals();
};