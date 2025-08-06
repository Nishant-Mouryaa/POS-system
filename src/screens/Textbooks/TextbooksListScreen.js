import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Text, Title, Button, Searchbar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';

const CARD_HEIGHT = 100;
const CARD_SPACING = 18;

export default function TextbookListScreen({ route, navigation }) {
  const { board, standard } = route.params || {};
  const [textbooks, setTextbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    loadTextbooks();
  }, [board, standard]);

  const loadTextbooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'textbook'),
        where('board', '==', board),
        where('standard', '==', standard),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setTextbooks([]);
        setLoading(false);
        return;
      }

      const textbookData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          let pdfUrl = data.pdfUrl;

          // Convert gs:// to HTTPS
          if (pdfUrl && pdfUrl.startsWith('gs://')) {
            try {
              pdfUrl = await getDownloadURL(ref(storage, pdfUrl));
            } catch (err) {
              console.error('Error converting URL:', err);
            }
          }
          return {
            id: doc.id,
            ...data,
            pdfUrl: pdfUrl || '',
            Description: data.description || '',
          };
        })
      );
      
      setTextbooks(textbookData);
      
      // Extract unique subjects for filter
      const subjects = [...new Set(textbookData.map(book => book.subject).filter(Boolean))];
      setAvailableSubjects(subjects);
    } catch (err) {
      console.error('Error loading textbooks:', err);
      setError('Failed to load textbooks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter textbooks based on search query and selected subjects
  const filteredTextbooks = useMemo(() => {
    return textbooks.filter(textbook => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        textbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        textbook.Description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (textbook.subject && textbook.subject.toLowerCase().includes(searchQuery.toLowerCase()));

      // Subject filter
      const matchesSubject = selectedSubjects.length === 0 || 
        (textbook.subject && selectedSubjects.includes(textbook.subject));

      return matchesSearch && matchesSubject;
    });
  }, [textbooks, searchQuery, selectedSubjects]);

  const handleCardPress = (item) => {
    navigation.navigate('PdfViewer', {
      pdfUrl: item.pdfUrl,
      title: item.title,
      disableDownload: true,
    });
  };

  const toggleSubjectFilter = (subject) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const clearFilters = () => {
    setSelectedSubjects([]);
    setSearchQuery('');
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilterModal}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter by Subject</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Icon name="close" size={24} color={Palette.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {availableSubjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.filterOption,
                  selectedSubjects.includes(subject) && styles.filterOptionSelected
                ]}
                onPress={() => toggleSubjectFilter(subject)}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedSubjects.includes(subject) && styles.filterOptionTextSelected
                ]}>
                  {subject}
                </Text>
                {selectedSubjects.includes(subject) && (
                  <Icon name="check" size={20} color={Palette.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setSelectedSubjects([])}
              style={styles.modalButton}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowFilterModal(false)}
              style={styles.modalButton}
            >
              Apply
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCard = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[
          styles.textbookCard,
          {
            marginTop: index === 0 ? 0 : -CARD_SPACING,
            zIndex: filteredTextbooks.length - index,
          },
        ]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Icon name="book-open-page-variant" size={28} color={Palette.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {!!item.subject && (
              <View style={[
                styles.subjectBadge,
                { backgroundColor: Palette.primaryLight }
              ]}>
                <Text style={styles.subjectText}>{item.subject}</Text>
              </View>
            )}
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.Description}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={Palette.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.text} />
          <Text style={styles.loadingText}>Loading textbooks...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color={Palette.text} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadTextbooks} style={{ marginTop: 16 }}>
            Try Again
          </Button>
        </View>
      </View>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Textbooks</Text>
          <Text style={styles.headerSubtitle}>
            {board} / Class {standard}
          </Text>
        </View>

        {/* Search and Filter Section */}
        <View style={styles.searchFilterContainer}>
          <Searchbar
            placeholder="Search textbooks..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={Palette.primary}
            inputStyle={styles.searchInput}
          />
          
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Icon name="filter-variant" size={20} color={Palette.primary} />
              <Text style={styles.filterButtonText}>Filter</Text>
              {selectedSubjects.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{selectedSubjects.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {(selectedSubjects.length > 0 || searchQuery) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Filters Chips */}
          {selectedSubjects.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.chipContainer}
            >
              {selectedSubjects.map((subject) => (
                <Chip
                  key={subject}
                  mode="flat"
                  style={styles.filterChip}
                  textStyle={styles.filterChipText}
                  onClose={() => toggleSubjectFilter(subject)}
                >
                  {subject}
                </Chip>
              ))}
            </ScrollView>
          )}
        </View>

        {filteredTextbooks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="book-search-outline" size={50} color={Palette.text} />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedSubjects.length > 0
                ? "Try adjusting your search or filters"
                : `There are currently no textbooks for ${board} (Class ${standard}).`}
            </Text>
            {(searchQuery || selectedSubjects.length > 0) && (
              <Button
                mode="contained"
                style={{ marginTop: 20 }}
                onPress={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </View>
        ) : (
          <View style={styles.cardListWrapper}>
            <FlatList
              data={filteredTextbooks}
              renderItem={renderCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardListContainer}
            />
          </View>
        )}

        {renderFilterModal()}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.textLight,
    marginTop: 30,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Palette.textLight,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Search and Filter Styles
  searchFilterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: Palette.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: Palette.primary,
    fontWeight: '600',
  },
  filterBadge: {
    marginLeft: 8,
    backgroundColor: Palette.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '700',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: Palette.primary,
    fontWeight: '600',
  },
  chipContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: Palette.primaryLight,
  },
  filterChipText: {
    fontSize: 12,
    color: Palette.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
  },
  modalBody: {
    paddingVertical: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
  },
  filterOptionSelected: {
    backgroundColor: Palette.primaryLight + '20',
  },
  filterOptionText: {
    fontSize: 16,
    color: Palette.text,
  },
  filterOptionTextSelected: {
    color: Palette.primary,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Palette.divider,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  // Existing styles...
  cardListWrapper: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  cardListContainer: {
    paddingBottom: 40,
  },
  textbookCard: {
    height: CARD_HEIGHT,
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    backgroundColor: Palette.surface,
    elevation: 2,
    shadowColor: Palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 4,
  },
  subjectBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.iconlight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardDescription: {
    fontSize: 13,
    color: Palette.text,
    marginTop: 2,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Palette.onBackground,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    color: Palette.onBackground,
    marginVertical: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: Palette.surface,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    color: Palette.onBackground,
    marginVertical: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    color: Palette.onSurface,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '80%',
  },
});