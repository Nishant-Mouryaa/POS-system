import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Surface,
  Text,
  IconButton,
  Button,
  Divider,
  Portal,
  Modal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

function hexToRgba(hex, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const DetailedFilter = ({ 
  filters, 
  onFiltersChange, 
  boards, 
  standards, 
  textbooks,
  style 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);
  
  // Calculate active filter count
  const activeFilterCount = filters.boards.length + filters.standards.length + filters.subjects.length;
  
  // Get unique subjects from actual textbooks data
  const availableSubjects = useMemo(() => {
    const subjectsSet = new Set();
    textbooks.forEach(book => {
      if (book.subject) {
        subjectsSet.add(book.subject);
      }
    });
    return Array.from(subjectsSet).sort();
  }, [textbooks]);

  const toggleBoard = (board) => {
    setTempFilters(prev => ({
      ...prev,
      boards: prev.boards.includes(board)
        ? prev.boards.filter(b => b !== board)
        : [...prev.boards, board]
    }));
  };

  const toggleStandard = (standard) => {
    setTempFilters(prev => ({
      ...prev,
      standards: prev.standards.includes(standard)
        ? prev.standards.filter(s => s !== standard)
        : [...prev.standards, standard]
    }));
  };

  const toggleSubject = (subject) => {
    setTempFilters(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setExpanded(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      boards: [],
      standards: [],
      subjects: []
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getCountForFilter = (type, value) => {
    return textbooks.filter(book => {
      switch(type) {
        case 'board':
          return book.board === value;
        case 'standard':
          return book.standard?.toString() === value;
        case 'subject':
          return book.subject === value;
        default:
          return false;
      }
    }).length;
  };

  // Reset temp filters when modal opens
  const handleModalOpen = () => {
    setTempFilters(filters);
    setExpanded(true);
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.filterButton, style]}
        onPress={handleModalOpen}
      >
        <Icon 
          name="filter-variant" 
          size={20} 
          color={activeFilterCount > 0 ? AdminPalette.primary : AdminPalette.text} 
        />
        {activeFilterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={expanded}
          onDismiss={() => setExpanded(false)}
          contentContainerStyle={styles.filterModal}
        >
          <Surface style={styles.modalSurface}>
            <View style={styles.filterModalHeader}>
              <Text variant="titleLarge" style={styles.filterModalTitle}>Filter Textbooks</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setExpanded(false)}
                iconColor={AdminPalette.textMuted}
              />
            </View>

            <Divider style={styles.modalDivider} />

            <ScrollView style={styles.filterScrollContent}>
              {/* Board Filter */}
              <View style={styles.filterSection}>
                <Text variant="titleSmall" style={styles.filterSectionTitle}>Board</Text>
                <View style={styles.filterOptions}>
                  {boards.map(board => {
                    const count = getCountForFilter('board', board);
                    const isSelected = tempFilters.boards.includes(board);
                    
                    // Only show boards that have textbooks
                    if (count === 0) return null;
                    
                    return (
                      <TouchableOpacity
                        key={board}
                        style={[
                          styles.filterOption,
                          isSelected && styles.filterOptionSelected
                        ]}
                        onPress={() => toggleBoard(board)}
                        activeOpacity={0.7}
                      >
                        <Text variant="bodyMedium" style={[
                          styles.filterOptionText,
                          isSelected && styles.filterOptionTextSelected
                        ]}>
                          {board}
                        </Text>
                        <Text variant="labelSmall" style={[
                          styles.filterOptionCount,
                          isSelected && styles.filterOptionCountSelected
                        ]}>
                          ({count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <Divider style={styles.sectionDivider} />

              {/* Standard Filter */}
              <View style={styles.filterSection}>
                <Text variant="titleSmall" style={styles.filterSectionTitle}>Class/Standard</Text>
                <View style={styles.filterOptionsGrid}>
                  {standards.map(standard => {
                    const count = getCountForFilter('standard', standard);
                    const isSelected = tempFilters.standards.includes(standard);
                    
                    // Only show standards that have textbooks
                    if (count === 0) return null;
                    
                    return (
                      <TouchableOpacity
                        key={standard}
                        style={[
                          styles.filterOptionGrid,
                          isSelected && styles.filterOptionSelected
                        ]}
                        onPress={() => toggleStandard(standard)}
                        activeOpacity={0.7}
                      >
                        <Text variant="bodyMedium" style={[
                          styles.filterOptionText,
                          isSelected && styles.filterOptionTextSelected
                        ]}>
                          {standard}
                        </Text>
                        <Text variant="labelSmall" style={[
                          styles.filterOptionCount,
                          isSelected && styles.filterOptionCountSelected
                        ]}>
                          ({count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <Divider style={styles.sectionDivider} />

              {/* Subject Filter */}
              <View style={styles.filterSection}>
                <Text variant="titleSmall" style={styles.filterSectionTitle}>Subject</Text>
                <View style={styles.filterOptions}>
                  {availableSubjects.map(subject => {
                    const count = getCountForFilter('subject', subject);
                    const isSelected = tempFilters.subjects.includes(subject);
                    return (
                      <TouchableOpacity
                        key={subject}
                        style={[
                          styles.filterOption,
                          isSelected && styles.filterOptionSelected
                        ]}
                        onPress={() => toggleSubject(subject)}
                        activeOpacity={0.7}
                      >
                        <Text variant="bodyMedium" style={[
                          styles.filterOptionText,
                          isSelected && styles.filterOptionTextSelected
                        ]}>
                          {subject}
                        </Text>
                        <Text variant="labelSmall" style={[
                          styles.filterOptionCount,
                          isSelected && styles.filterOptionCountSelected
                        ]}>
                          ({count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <Divider style={styles.modalDivider} />

            <View style={styles.filterModalActions}>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.filterModalButton}
                textColor={AdminPalette.text}
                labelStyle={styles.filterButtonLabel}
              >
                Reset
              </Button>
              <Button
                mode="contained"
                onPress={applyFilters}
                style={styles.filterModalApplyButton}
                labelStyle={styles.filterButtonLabel}
                buttonColor={AdminPalette.primary}
                textColor={AdminPalette.textLight}
              >
                Apply Filters ({Object.values(tempFilters).flat().length})
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    width: 40,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: AdminPalette.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: AdminPalette.textLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterModal: {
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalSurface: {
    borderRadius: 16,
    backgroundColor: AdminPalette.surfaceLight,
    overflow: 'hidden',
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterModalTitle: {
    color: AdminPalette.text,
  },
  modalDivider: {
    backgroundColor: AdminPalette.divider,
    height: 1,
  },
  filterScrollContent: {
    maxHeight: '70%',
  },
  filterSection: {
    padding: 20,
  },
  filterSectionTitle: {
    color: AdminPalette.text,
    marginBottom: 12,
  },
  sectionDivider: {
    backgroundColor: AdminPalette.divider,
    height: 1,
    marginHorizontal: 20,
  },
  filterOptions: {
    flexDirection: 'column',
    gap: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: AdminPalette.surface,
    borderWidth: 1,
    borderColor: AdminPalette.divider,
  },
  filterOptionGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: AdminPalette.surface,
    borderWidth: 1,
    borderColor: AdminPalette.divider,
    minWidth: 80,
  },
  filterOptionSelected: {
    backgroundColor: hexToRgba(AdminPalette.primary, 0.1),
    borderColor: AdminPalette.primary,
  },
  filterOptionText: {
    color: AdminPalette.text,
    marginRight: 8,
  },
  filterOptionTextSelected: {
    color: AdminPalette.primary,
    fontWeight: '500',
  },
  filterOptionCount: {
    color: AdminPalette.textMuted,
  },
  filterOptionCountSelected: {
    color: AdminPalette.primary,
  },
  filterModalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  filterModalButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: AdminPalette.divider,
  },
  filterModalApplyButton: {
    flex: 1,
    borderRadius: 8,
  },
  filterButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DetailedFilter;