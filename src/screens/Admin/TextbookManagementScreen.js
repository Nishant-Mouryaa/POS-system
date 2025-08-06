import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Alert, 
  Dimensions, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { 
  Appbar, 
  Searchbar, 
  Button, 
  Modal, 
  Portal, 
  TextInput, 
  HelperText, 
  Text, 
  ActivityIndicator,
  Card,
  IconButton,
  Chip,
  Title,
  Surface,
  FAB,
  Divider,
} from 'react-native-paper';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';
import TextbookHeader from '../../components/TextbookManagement/TextbookHeader';
import TextbookSearchBar from '../../components/TextbookManagement/TextbookSearchBar';
import TextbookList from '../../components/TextbookManagement/TextbookList';
import TextbookModal from '../../components/TextbookManagement/TextbookModal';
import TextbookItem from '../../components/TextbookManagement/TextbookItem'; // Import the separated component
import DetailedFilter from '../../components/TextbookManagement/filter';
import { checkAdminStatus } from '../../utils/auth';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const PDF_URL_PREFIX = 'gs://iyers-78791.firebasestorage.app/';

/**
 * Helper to convert a #RRGGBB hex color to an rgba() string.
 */
function hexToRgba(hex, alpha = 1) {
  const color = hex.replace(/^#/, '');
  const bigint = parseInt(color, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const TextbookManagementScreen = () => {
  const styles = makeStyles(AdminPalette);
    const navigation = useNavigation();
  
    useEffect(() => {
      const verifyAdmin = async () => {
        const isAdmin = await checkAdminStatus();
        if (!isAdmin) {
          navigation.navigate('Main');
        }
      };
      
      verifyAdmin();
    }, [navigation]);

  const [textbooks, setTextbooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTextbook, setCurrentTextbook] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [filters, setFilters] = useState({
    boards: [],
    standards: [],
    subjects: []
  });
  const [formData, setFormData] = useState({
    title: '',
    board: 'CBSE',
    standard: '1',
    subject: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const getSubjectsByBoardAndStandard = (board, standard) => {
    const standardNum = parseInt(standard);
    
    if (board === 'CBSE' && standardNum >= 1 && standardNum <= 10) {
      return [
        'English',
        'Hindi',
        'Sanskrit',
        'Marathi',
        'Science',
        'Maths',
        'History PS',
        'Geography'
      ];
    } else if (board === 'State Board' && standardNum >= 1 && standardNum <= 10) {
      return [
        'English',
        'Hindi Full',
        'Sanskrit Full',
        'Hindi Half',
        'Sanskrit Half',
        'Marathi',
        'Science 1',
        'Science 2',
        'History PS',
        'Geography',
        'Economics'
      ];
    }
    
    // Default subjects for other boards/standards
    return [
      'Mathematics', 
      'Physics', 
      'Chemistry', 
      'Biology', 
      'Science', 
      'English', 
      'History',
      'Geography',
      'Sanskrit',
      'Hindi'
    ];
  };

  const boards = [
    'CBSE', 
    'ICSE', 
    'State Board', 
    'IB', 
    'IGCSE'
  ];
  const standards = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  useEffect(() => {
    loadTextbooks();
  }, []);

  const onFormDataChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  useEffect(() => {
    // Reset subject when board or standard changes
    if (formData.subject && !getSubjectsByBoardAndStandard(formData.board, formData.standard).includes(formData.subject)) {
      onFormDataChange('subject', '');
    }
  }, [formData.board, formData.standard]);

  const loadTextbooks = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'textbook'));
      const snapshot = await getDocs(q);
      
      const textbookData = [];
      snapshot.forEach(docSnap => {
        textbookData.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      setTextbooks(textbookData);
    } catch (err) {
      console.error("Error loading textbooks:", err);
      Alert.alert("Error", "Failed to load textbooks");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredTextbooks = textbooks.filter((textbook) => {
    // First apply search filter
    const title = textbook.title || '';
    const subject = textbook.subject || '';
    const board = textbook.board || '';
    const q = searchQuery.toLowerCase();
    
    const matchesSearch = 
      title.toLowerCase().includes(q) || 
      subject.toLowerCase().includes(q) ||
      board.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Then apply detailed filters
    const matchesBoard = filters.boards.length === 0 || 
      filters.boards.includes(textbook.board);
    
    const matchesStandard = filters.standards.length === 0 || 
      filters.standards.includes(textbook.standard?.toString());
    
    const matchesSubject = filters.subjects.length === 0 || 
      filters.subjects.includes(textbook.subject);

    return matchesBoard && matchesStandard && matchesSubject;
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddTextbook = () => {
    setIsEditing(false);
    setCurrentTextbook(null);
    setFormData({
      title: '',
      board: 'CBSE',
      standard: '',
      subject: '',
      description: '',
    });
    setPdfUrl('');
    setErrors({});
    setVisible(true);
  };

  const handleEditTextbook = (textbook) => {
    setIsEditing(true);
    setCurrentTextbook(textbook);
    
    // Strip the prefix if it exists in the URL
    const pdfUrlWithoutPrefix = textbook.pdfUrl?.replace(PDF_URL_PREFIX, '') || '';
    
    setFormData({
      title: textbook.title,
      board: textbook.board,
      standard: textbook.standard?.toString() || '',
      subject: textbook.subject,
      description: textbook.description || '',
    });
    setPdfUrl(pdfUrlWithoutPrefix);
    setErrors({});
    setVisible(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.board) newErrors.board = 'Board is required';
    if (!formData.standard) newErrors.standard = 'Standard is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!pdfUrl.trim()) newErrors.pdfUrl = 'PDF URL is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (modalFormData) => {
    if (!validateForm()) return;
  
    try {
      setUploading(true);
      
      const textbookData = {
        title: formData.title.trim(),
        board: formData.board,
        standard: Number(formData.standard),
        subject: formData.subject,
        description: formData.description.trim(),
        pdfUrl: PDF_URL_PREFIX + pdfUrl.trim(), // Add prefix here
        updatedAt: new Date(),
      };
  
      if (!isEditing) {
        textbookData.createdAt = new Date();
      }
  
      if (isEditing && currentTextbook) {
        await updateDoc(doc(db, 'textbook', currentTextbook.id), textbookData);
        Alert.alert("Success", "Textbook updated successfully");
      } else {
        await addDoc(collection(db, 'textbook'), textbookData);
        Alert.alert("Success", "Textbook added successfully");
      }
  
      loadTextbooks();
      setVisible(false);
    } catch (err) {
      console.error("Error saving textbook:", err);
      Alert.alert("Error", "Failed to save textbook");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    Alert.alert(
      "Delete Textbook",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'textbook', id));
              loadTextbooks();
              Alert.alert("Success", "Textbook deleted successfully");
            } catch (err) {
              console.error("Error deleting textbook:", err);
              Alert.alert("Error", "Failed to delete textbook");
            }
          }
        }
      ]
    );
  };

  const getBoardColor = (board) => {
    const colorMap = {
      'CBSE': AdminPalette.primary,
      'ICSE': AdminPalette.accent,
      'State Board': AdminPalette.warning,
      'IB': AdminPalette.success,
      'IGCSE': AdminPalette.info,
    };
    return colorMap[board] || AdminPalette.textSecondary;
  };

  return (
    <View style={styles.container}>
      <TextbookHeader 
        textbooks={filteredTextbooks}
        onBack={navigation.goBack} 
        onRefresh={loadTextbooks} 
      />
  
      <View style={styles.content}>
        {/* Compact search and filter row */}
        <View style={styles.searchFilterRow}>
          <TextbookSearchBar 
            searchQuery={searchQuery} 
            onSearch={handleSearch} 
            style={styles.searchBar}
          />
         <DetailedFilter
  filters={filters}
  onFiltersChange={handleFiltersChange}
  boards={boards}
  standards={standards}
  textbooks={textbooks}  // Pass the actual textbooks data
  style={styles.filterButton}
/>
        </View>
  
        {/* Textbook list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AdminPalette.primary} />
            <Text style={styles.loadingText}>Loading textbooks...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTextbooks}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <TextbookItem
                item={item}
                navigation={navigation}
                handleEditTextbook={handleEditTextbook}
                handleDelete={handleDelete}
                getBoardColor={getBoardColor}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Icon name="book-remove" size={48} color={AdminPalette.primary} />
                </View>
                <Title style={styles.emptyTitle}>No Textbooks Found</Title>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Try a different search' : 'Add a textbook to get started'}
                </Text>
              </View>
            }
          />
        )}
      </View>
  
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddTextbook}
        color={AdminPalette.textLight}
      />
      
      {/* Modal remains the same */}
      <TextbookModal
        visible={visible}
        onDismiss={() => !uploading && setVisible(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        pdfUrl={pdfUrl}
        setPdfUrl={setPdfUrl}
        uploading={uploading}
        isEditing={isEditing}
        errors={errors}
        boards={boards}
        standards={standards}
        navigation={navigation}
        onFormDataChange={onFormDataChange}
        getSubjectsByBoardAndStandard={getSubjectsByBoardAndStandard}
      />
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerSurface: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContainer: {
    backgroundColor: 'transparent',
    paddingBottom: 16,
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
    marginTop: StatusBar.currentHeight || 0,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: `${colors.onPrimary}90`,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: `${colors.textMuted}80`,
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: `${colors.text}20`,
  },
  content: {
    flex: 1,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  searchBar: {
    flex: 1,
  },
  searchContainer: {
    margin: 16,
    marginTop: 54,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 8,
  },
  searchInput: {
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: hexToRgba(colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: AdminPalette.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted, 
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
  emptyButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    margin: 20,
    maxHeight: '90%',
  },
  modalScroll: {
    width: '100%',
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMuted, 
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textMuted, 
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted, 
    marginBottom: 8,
  },
  formGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formColumn: {
    flex: 1,
  },
  formFullWidth: {
    marginBottom: 16,
  },
  pickerSurface: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
  },
  picker: {
    height: 56,
    color: colors.textMuted, 
  },
  pdfSection: {
    marginBottom: 24,
  },
  pdfPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  pdfPreviewText: {
    color: colors.success,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  modalSubmitButton: {
    backgroundColor: colors.primary,
  },
});

export default TextbookManagementScreen;