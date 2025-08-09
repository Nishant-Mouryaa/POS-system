import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Modal, Portal, TextInput, HelperText, Text, Button, Title, Surface } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const PDF_URL_PREFIX = 'gs://iyers-78791.firebasestorage.app/';

function hexToRgba(hex, alpha = 1) {
  const color = hex.replace(/^#/, '');
  const bigint = parseInt(color, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Update your TextbookModal component props
const TextbookModal = ({
  visible,
  onDismiss,
  onSubmit,
  formData,
  setFormData,
  pdfUrl, 
  setPdfUrl, 
  uploading,
  isEditing,
  errors,
  boards,
  standards,
  subjects,
  navigation,
  getSubjectsByBoardAndStandard,
  onFormDataChange // Add this prop
}) => {
  const styles = makeStyles(AdminPalette);

  // Add safety check for getSubjectsByBoardAndStandard
  const getSafeSubjects = (board, standard) => {
    if (typeof getSubjectsByBoardAndStandard !== 'function') {
      console.warn('getSubjectsByBoardAndStandard is not a function');
      return [];
    }
    return getSubjectsByBoardAndStandard(board, standard) || [];
  };

  // Add default onFormDataChange if not provided
  const handleFormDataChange = onFormDataChange || ((field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  });

  // Helper to get the full URL
  const fullPdfUrl = pdfUrl ? PDF_URL_PREFIX + pdfUrl : '';

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={() => !uploading && onDismiss()}
        contentContainerStyle={styles.modalContainer}
        dismissable={!uploading}
      >
        <ScrollView 
          style={styles.modalScroll}
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Your existing modal header */}
          <View style={styles.modalHeader}>
            <View style={[
              styles.modalIconContainer,
              { backgroundColor: hexToRgba(AdminPalette.primary, 0.15) }
            ]}>
              <Icon 
                name={isEditing ? "book-edit" : "book-plus"} 
                size={32} 
                color={AdminPalette.primary}
              />
            </View>
            <Title style={styles.modalTitle}>
              {isEditing ? 'Edit Textbook' : 'Add New Textbook'}
            </Title>
            <Text style={styles.modalSubtitle}>
              Fill in the details below
            </Text>
          </View>
          
          {/* Title Input */}
          <TextInput
            label="Textbook Title"
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            style={styles.input}
            mode="outlined"
            error={!!errors.title}
            outlineColor={AdminPalette.divider}
            activeOutlineColor={AdminPalette.primary}
            left={
              <TextInput.Icon 
                icon="format-title" 
                color={AdminPalette.textSecondary} 
              />
            }
          />
          {errors.title && <HelperText type="error">{errors.title}</HelperText>}
          
          {/* Description Input */}
          <TextInput
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            outlineColor={AdminPalette.divider}
            activeOutlineColor={AdminPalette.primary}
            left={
              <TextInput.Icon 
                icon="text" 
                color={AdminPalette.textSecondary} 
              />
            }
          />
          
          {/* Board and Standard Pickers */}
          <View style={styles.formGrid}>
            <View style={styles.formColumn}>
              <Text style={styles.inputLabel}>Education Board</Text>
              <Surface style={styles.pickerSurface} elevation={1}>
                <Picker
                  selectedValue={formData.board}
                  onValueChange={(value) => handleFormDataChange('board', value)}
                  dropdownIconColor={AdminPalette.primary}
                  style={styles.picker}
                >
                  {boards.map(board => (
                    <Picker.Item key={board} label={board} value={board} />
                  ))}
                </Picker>
              </Surface>
              {errors.board && <HelperText type="error">{errors.board}</HelperText>}
            </View>
            
            <View style={styles.formColumn}>
              <Text style={styles.inputLabel}>Class</Text>
              <Surface style={styles.pickerSurface} elevation={1}>
                <Picker
                  selectedValue={formData.standard}
                  onValueChange={(value) => handleFormDataChange('standard', value)}
                  dropdownIconColor={AdminPalette.primary}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Class" value="" />
                  {formData.board === 'CBSE' || formData.board === 'State Board' ? (
                    Array.from({ length: 12 }, (_, i) => i + 1).map(std => (
                      <Picker.Item key={std} label={`Class ${std}`} value={std.toString()} />
                    ))
                  ) : (
                    Array.from({ length: 12 }, (_, i) => i + 1).map(std => (
                      <Picker.Item key={std} label={`Class ${std}`} value={std.toString()} />
                    ))
                  )}
                </Picker>
              </Surface>
              {errors.standard && (
                <HelperText type="error" visible>
                  {errors.standard}
                </HelperText>
              )}
            </View>
          </View>
          
        
          {/* Subject Input */}
<TextInput
  label="Subject"
  value={formData.subject}
  onChangeText={(text) => handleFormDataChange('subject', text)}
  style={styles.input}
  mode="outlined"
  error={!!errors.subject}
  outlineColor={AdminPalette.divider}
  activeOutlineColor={AdminPalette.primary}
  left={
    <TextInput.Icon 
      icon="book-education" 
      color={AdminPalette.textSecondary} 
    />
  }
/>
{errors.subject && (
  <HelperText type="error" visible>
    {errors.subject}
  </HelperText>
)}
          
     
        {/* PDF Section */}
<View style={styles.pdfSection}>
  <Text style={styles.inputLabel}>PDF Document</Text>
  <TextInput
    label="PDF Filename (e.g. cbse science class 10.pdf)"
    value={pdfUrl}
    onChangeText={setPdfUrl}
    style={styles.input}
    mode="outlined"
    error={!!errors.pdfUrl}
    outlineColor={AdminPalette.divider}
    activeOutlineColor={AdminPalette.primary}
    left={
      <TextInput.Icon 
        icon="file-pdf-box" 
        color={AdminPalette.textSecondary} 
      />
    }
    right={
      pdfUrl ? (
        <TextInput.Icon 
          icon="eye" 
          color={AdminPalette.primary}
          onPress={() => navigation.navigate('PdfViewer', { 
            pdfUrl: PDF_URL_PREFIX + pdfUrl, 
            title: 'Preview' 
          })}
        />
      ) : null
    }
    placeholder="e.g. cbse science class 10.pdf"
  />
  {/* Show the full URL as a preview below the input */}
  {pdfUrl && !errors.pdfUrl && (
    <View style={styles.pdfPreview}>
      <Icon name="check-circle" size={16} color={AdminPalette.success} />
      <Text style={styles.pdfPreviewText}>{PDF_URL_PREFIX + pdfUrl}</Text>
    </View>
  )}
  {errors.pdfUrl && (
    <HelperText type="error">
      {errors.pdfUrl}
    </HelperText>
  )}
</View>
          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={onDismiss}
              style={styles.modalButton}
              disabled={uploading}
              textColor={AdminPalette.text}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={() => onSubmit({ ...formData, pdfUrl: fullPdfUrl })}
              style={[styles.modalButton, styles.modalSubmitButton]}
              loading={uploading}
              disabled={uploading}
              icon={isEditing ? "content-save" : "plus"}
            >
              {isEditing ? 'Save Changes' : 'Add Textbook'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};
const makeStyles = (colors) => StyleSheet.create({
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

export default TextbookModal; 