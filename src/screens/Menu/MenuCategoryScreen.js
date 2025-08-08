import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
const { width } = Dimensions.get('window');
export default function MenuCategoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [cafeId, setCafeId] = useState(null);

  // Fetch user data and cafeId
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;

        if (!user) {
          setError('User not authenticated');
          return;
        }

        console.log('Fetching user data for UID:', user.uid);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log('User data found, cafeId:', userData.cafeId);
          setCafeId(userData.cafeId);
        } else {
          console.warn('User document not found');
          setError('User data not found');
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch menu categories when cafeId is available
  useEffect(() => {
    if (!cafeId) return;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('Fetching categories for cafeId:', cafeId);
        const q = query(
          collection(db, 'menuCategories'),
          where('cafeId', '==', cafeId),
          where('isAvailable', '==', true)
        );

        const querySnapshot = await getDocs(q);
        const loadedCategories = [];

        querySnapshot.forEach((doc) => {
          loadedCategories.push({
            id: doc.id,
            ...doc.data()
          });
        });

        console.log(`Found ${loadedCategories.length} categories`);
        setCategories(loadedCategories);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [cafeId]);

  const handleCategoryPress = (category) => {
    navigation.navigate('MenuItems', {
      categoryId: category.id,
      categoryName: category.name,
      cafeId: cafeId
    });
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('hot')) return 'coffee';
    if (name.includes('cold')) return 'cup-water';
    if (name.includes('breakfast')) return 'food-croissant';
    if (name.includes('lunch')) return 'food-turkey';
    if (name.includes('dessert')) return 'cupcake';
    if (name.includes('snack')) return 'food-variant';
    return 'food-fork-drink';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>
          {!cafeId ? 'Loading user data...' : 'Loading menu categories...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={Palette.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.selectionTitle}>Menu Categories</Text>
      <Text style={styles.selectionSubtitle}>
        Select a category to view available items
      </Text>

      <ScrollView
        contentContainerStyle={[
          styles.categoryListContainer,
          categories.length === 0 && { flexGrow: 1 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {categories.length > 0 ? (
          categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.85}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryCardContent}>
                <View
                  style={[
                    styles.categoryIconContainer,
                    { backgroundColor: Palette.primary }
                  ]}
                >
                  <Icon
                    name={getCategoryIcon(category.name)}
                    size={28}
                    color="#fff"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <Text style={styles.categoryDescription} numberOfLines={2}>
                    {category.description || 'Browse our delicious offerings'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={Palette.primary} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="tray-remove" size={48} color={Palette.textMuted} />
            <Text style={styles.emptyText}>No categories available</Text>
            {cafeId && (
              <Button
                mode="outlined"
                onPress={() => setLoading(true)}
                style={styles.retryButton}
                color={Palette.primary}
              >
                Retry
              </Button>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Palette.text,
  },
  selectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.text,
    marginTop: 50,
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  selectionSubtitle: {
    fontSize: 16,
    color: Palette.text,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 30,
  },
  categoryListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  categoryCard: {
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  categoryDescription: {
    marginTop: 2,
    fontSize: 13,
    color: Palette.textMuted,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: Palette.primary,
    width: '100%',
    maxWidth: 200,
  },
  retryButton: {
    marginTop: 20,
    borderColor: Palette.primary,
  }
});