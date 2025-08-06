import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Linking, Platform } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  IconButton, 
  Surface, 
  RadioButton,
  HelperText,
  ProgressBar,
  Chip,
  Card
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase'; // Make sure you have storage configured

import { AdminPalette } from '../../theme/colors';

// LaTeX renderer component using WebView
const LaTeXRenderer = ({ latex, style }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      <script>
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\$', '\$']],
            displayMath: [['$$', '$$'], ['\
$$
', '\
$$']]
          },
          svg: {
            fontCache: 'global'
          }
        };
      </script>
      <style>
        body {
          margin: 0;
          padding: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: transparent;
          color: #333;
        }
        .math-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 40px;
        }
      </style>
    </head>
    <body>
      <div class="math-container">
        $${latex || ''}$
      </div>
    </body>
    </html>
  `;

  return (
    <WebView
      source={{ html: htmlContent }}
      style={style}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      javaScriptEnabled={true}
      domStorageEnabled={false}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: AdminPalette.textMuted }}>Loading...</Text>
        </View>
      )}
    />
  );
};

const QuestionForm = ({
  questions,
  currentQuestionIndex,
  onQuestionChange,
  onOptionChange,
  onCorrectAnswerChange,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionIndexChange,
  errors
}) => {
  const currentQ = questions[currentQuestionIndex];
  const [imageUploading, setImageUploading] = useState(false);




  const debugPermissions = async () => {
    try {
      console.log('Checking permissions...');
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('Current permission status:', status);
      
      if (status !== 'granted') {
        console.log('Requesting permissions...');
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('New permission status:', newStatus);
      }
      
      // Test Firebase Storage
      console.log('Testing Firebase Storage...');
      const testRef = ref(storage, 'test/test.txt');
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      await uploadBytes(testRef, testBlob);
      console.log('Firebase Storage test successful');
      
    } catch (error) {
      console.error('Debug error:', error);
    }
  };
  
  // Call this when component mounts or add a debug button
  useEffect(() => {
    debugPermissions();
  }, []);



  // Image upload function
  const uploadImageToFirebase = async (uri) => {
    try {
      setImageUploading(true);
      
      let blob;
      
      // Handle different URI formats for different platforms
      if (Platform.OS === 'ios') {
        const response = await fetch(uri);
        blob = await response.blob();
      } else {
        // For Android, we might need to handle file:// URIs differently
        const response = await fetch(uri);
        blob = await response.blob();
      }
      
      // Create a unique filename
      const filename = `geometry_images/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      // Create a reference to Firebase Storage
      const imageRef = ref(storage, filename);
      
      // Upload the image with metadata
      const metadata = {
        contentType: 'image/jpeg',
      };
      
      await uploadBytes(imageRef, blob, metadata);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Upload Failed', 
        `Failed to upload image: ${error.message}. Please try again.`
      );
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  // Delete image from Firebase Storage
  const deleteImageFromFirebase = async (imageUrl) => {
    try {
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't show error to user for deletion failures
    }
  };




// Add this temporary test function to your QuestionForm component
const testFirebaseStorage = async () => {
  try {
    console.log('Testing Firebase Storage...');
    console.log('Storage instance:', storage);
    
    // Test creating a reference
    const testRef = ref(storage, 'test/test.txt');
    console.log('Test reference created:', testRef);
    
    // Test uploading a simple blob
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const uploadResult = await uploadBytes(testRef, testBlob);
    console.log('Test upload successful:', uploadResult);
    
    // Test getting download URL
    const url = await getDownloadURL(testRef);
    console.log('Test download URL:', url);
    
    Alert.alert('Success', 'Firebase Storage is working correctly!');
  } catch (error) {
    console.error('Firebase Storage test failed:', error);
    Alert.alert('Storage Test Failed', error.message);
  }
};

// Helper to open device settings
const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

  // Handle image selection
  const handleImagePicker = async () => {
    try {
      // First check if we already have permission
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('Existing media permission:', existingStatus);
      
      let finalStatus = existingStatus;
      
      // If we don't have permission, ask for it
      if (existingStatus !== 'granted' && existingStatus !== 'limited') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Requested permission, new status:', status);
        finalStatus = status;
      }
      
      // If still no permission, show alert
      if (finalStatus !== 'granted' && finalStatus !== 'limited') {
        Alert.alert(
          'Permission Denied',
          'Sorry, we need camera roll permissions to upload images. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return;
      }
  
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false,
      });
  
      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Upload to Firebase
        const downloadURL = await uploadImageToFirebase(imageUri);
        
        if (downloadURL) {
          // Delete previous image if exists
          if (currentQ.geometryImage) {
            await deleteImageFromFirebase(currentQ.geometryImage);
          }
          
          // Update question with new image URL
          onQuestionChange(currentQuestionIndex, 'geometryImage', downloadURL);
        }
      }
    } catch (error) {
      console.error('Error in handleImagePicker:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Remove image
  const handleRemoveImage = async () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (currentQ.geometryImage) {
              await deleteImageFromFirebase(currentQ.geometryImage);
              onQuestionChange(currentQuestionIndex, 'geometryImage', '');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionsSectionHeader}>
        <Text style={styles.sectionTitle}>Questions ({questions.length})</Text>
        <Button 
          mode="contained-tonal" 
          onPress={onAddQuestion}
          icon="plus"
          compact
          style={styles.addQuestionButton}
        >
          Add
        </Button>
      </View>
      
      <View style={styles.questionProgress}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <ProgressBar 
          progress={
            questions.length > 0
              ? Math.min(1, Math.max(0, (currentQuestionIndex + 1) / questions.length))
              : 0
          }
          color={AdminPalette.primary}
          style={styles.progressBar}
        />
      </View>
      
      <ScrollView 
        horizontal 
        style={styles.questionsNavScroll}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.questionsNav}>
          {questions.map((_, index) => (
            <Chip
              key={index}
              style={[
                styles.questionChip,
                index === currentQuestionIndex && styles.questionChipActive
              ]}
              textStyle={[
                styles.questionChipText,
                index === currentQuestionIndex && styles.questionChipTextActive
              ]}
              onPress={() => onQuestionIndexChange(index)}
              mode="flat"
            >
              {index + 1}
            </Chip>
          ))}
        </View>
      </ScrollView>
      
      {currentQ ? (
        <View style={styles.questionContainer}>
          {/* Actions row */}
          <View style={styles.questionActions}>
            {currentQuestionIndex > 0 && (
              <IconButton 
                icon="chevron-left" 
                onPress={() => onQuestionIndexChange(currentQuestionIndex - 1)}
                mode="contained-tonal"
                textColor= {AdminPalette.text}
               
                
                size={20}
              />
            )}
            <View style={{ flex: 1 }} />
            {questions.length > 1 && (
              <Button 
                mode="text" 
                icon="delete" 
                onPress={() => onRemoveQuestion(currentQuestionIndex)}
                compact
                textColor={AdminPalette.error}
              >
                Remove
              </Button>
            )}
            {currentQuestionIndex < questions.length - 1 && (
              <IconButton 
                icon="chevron-right" 
                onPress={() => onQuestionIndexChange(currentQuestionIndex + 1)}
                mode="contained-tonal"
                size={20}
              />
            )}
          </View>

          {/* Question type selector */}
          <View style={styles.questionTypeContainer}>
            <Text style={styles.inputLabel}>Question Type</Text>
            <Surface style={styles.pickerSurface} elevation={1}>
              <Picker
                selectedValue={currentQ.questionType}
                onValueChange={(value) =>
                  onQuestionChange(currentQuestionIndex, 'questionType', value)
                }
                style={styles.picker}
              >
                <Picker.Item label="MCQ" value="mcq" />
                <Picker.Item label="Descriptive" value="descriptive" />
                <Picker.Item label="Geometry/Math" value="geometry" />
              </Picker>
            </Surface>
          </View>
          
          {/* Question text */}
          <TextInput
            label="Question"
            value={currentQ.questionText}
            onChangeText={(text) => onQuestionChange(currentQuestionIndex, 'questionText', text)}
            style={styles.input}
            mode="outlined"
            error={!!errors?.questions?.[currentQuestionIndex]?.questionText}
            multiline
            numberOfLines={3}
            outlineColor={AdminPalette.divider}
            activeOutlineColor={AdminPalette.primary}
          />
          {errors?.questions?.[currentQuestionIndex]?.questionText && (
            <HelperText type="error" visible>
              {errors.questions[currentQuestionIndex].questionText}
            </HelperText>
          )}

          {/* MCQ section */}
          {currentQ.questionType === 'mcq' && (
            <>
              <Text style={styles.optionsLabel}>Answer Options</Text>
              <View style={styles.optionsContainer}>
                {[0, 1, 2, 3].map(optIndex => (
                  <Surface key={optIndex} style={styles.optionSurface} elevation={1}>
                    <View style={styles.optionRow}>
                      <RadioButton
                        value={optIndex.toString()}
                        status={
                          currentQ.correctAnswer === optIndex.toString() 
                            ? 'checked' 
                            : 'unchecked'
                        }
                        color={AdminPalette.success}
                        onPress={() =>
                          onCorrectAnswerChange(currentQuestionIndex, optIndex.toString())
                        }
                      />
                      <TextInput
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        placeholderTextColor={AdminPalette.textMuted}
                        value={currentQ.options[optIndex]}
                        onChangeText={(text) => onOptionChange(currentQuestionIndex, optIndex, text)}
                        style={styles.optionInput}
                        mode="flat"
                        error={!!errors?.questions?.[currentQuestionIndex]?.options}
                        underlineColor="transparent"
                        activeUnderlineColor={AdminPalette.primary}
                      />
                    </View>
                  </Surface>
                ))}
              </View>
              {errors?.questions?.[currentQuestionIndex]?.options && (
                <HelperText type="error" visible>
                  {errors.questions[currentQuestionIndex].options}
                </HelperText>
              )}
              {errors?.questions?.[currentQuestionIndex]?.correctAnswer && (
                <HelperText type="error" visible>
                  {errors.questions[currentQuestionIndex].correctAnswer}
                </HelperText>
              )}
            </>
          )}

          {/* Descriptive */}
          {currentQ.questionType === 'descriptive' && (
            <TextInput
              label="Descriptive Answer (Optional)"
              value={currentQ.descriptiveAnswer || ''}
              onChangeText={(text) =>
                onQuestionChange(currentQuestionIndex, 'descriptiveAnswer', text)
              }
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              outlineColor={AdminPalette.divider}
              activeOutlineColor={AdminPalette.primary}
              left={<TextInput.Icon icon="text" color={AdminPalette.text} />}
            />
          )}

          {/* Geometry/Math: LaTeX-based input & preview + Image Upload */}
          {currentQ.questionType === 'geometry' && (
            <View style={styles.geometryContainer}>
              {/* Image Upload Section */}
              <View style={styles.imageUploadContainer}>
                <Text style={styles.inputLabel}>Question Image (Optional)</Text>
               
                {currentQ.geometryImage ? (
                  <Card style={styles.imageCard}>
                    <Card.Content style={styles.imageCardContent}>
                      <Image
                        source={{ uri: currentQ.geometryImage }}
                        style={styles.previewImage}
                        resizeMode="contain"
                      />
                      <View style={styles.imageActions}>
                        <Button
                          mode="outlined"
                          icon="camera"
                          onPress={handleImagePicker}
                          style={styles.imageButton}
                          disabled={imageUploading}
                        >
                          Change Image
                        </Button>
                        <Button
                          mode="text"
                          icon="delete"
                          onPress={handleRemoveImage}
                          textColor={AdminPalette.error}
                          style={styles.imageButton}
                          disabled={imageUploading}
                        >
                          Remove
                        </Button>
                        


                      </View>
                    </Card.Content>
                  </Card>
                ) : (
                  <Button
                    mode="outlined"
                    icon="camera"
                    onPress={handleImagePicker}
                    textColor= {AdminPalette.text}
                    style={styles.uploadButton}
                    disabled={imageUploading}
                    loading={imageUploading}
                  >
                    {imageUploading ? 'Uploading...' : 'Add Image'}
                  </Button>
                  
                )}
              </View>

              {/* LaTeX Expression Input */}
              <TextInput
                label="LaTeX Expression"
                placeholder="e.g. \frac{1}{2} \times b \times h"
                value={currentQ.geometryExpression || ''}
                onChangeText={(text) =>
                  onQuestionChange(currentQuestionIndex, 'geometryExpression', text)
                }
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                outlineColor={AdminPalette.divider}
                activeOutlineColor={AdminPalette.primary}
                left={<TextInput.Icon icon="cube" color={AdminPalette.text} />}
              />

              {/* LaTeX Preview */}
              <View style={styles.latexPreviewContainer}>
                <Text style={styles.previewLabel}>LaTeX Preview:</Text>
                <Surface style={styles.previewSurface} elevation={1}>
                  <LaTeXRenderer
                    latex={currentQ.geometryExpression || ''}
                    style={styles.mathPreview}
                  />
                </Surface>
              </View>
            </View>
          )}

          {/* Explanation (common) */}
          <TextInput
            label="Explanation (Optional)"
            value={currentQ.explanation}
            onChangeText={(text) => onQuestionChange(currentQuestionIndex, 'explanation', text)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={2}
            outlineColor={AdminPalette.divider}
            activeOutlineColor={AdminPalette.primary}
            left={<TextInput.Icon icon="information" color={AdminPalette.text} />}
          />
        </View>
      ) : (
        <View style={styles.questionContainer}>
          <Text>No question selected or available.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  questionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AdminPalette.text,
  },
  addQuestionButton: {
    borderRadius: 8,
    borderWidth: 0.1,
    borderColor: AdminPalette.text,
    backgroundColor: AdminPalette.bg,
    margin: 10,
    padding: 5
  },
  questionProgress: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: AdminPalette.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: `${AdminPalette.primary}20`,
  },
  questionsNavScroll: {
    marginBottom: 16,
    maxHeight: 48,
  },
  questionsNav: {
    flexDirection: 'row',
    paddingBottom: 8,
    gap: 8,
  },
  questionChip: {
    backgroundColor: AdminPalette.surfaceVariant,
    borderRadius: 20,
  },
  questionChipActive: {
    backgroundColor: AdminPalette.primary,
  },
  questionChipText: {
    color: AdminPalette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  questionChipTextActive: {
    color: AdminPalette.textLight,
  },
  questionContainer: {
    marginTop: 8,
  },
  questionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionTypeContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: AdminPalette.text,
    marginBottom: 4,
  },
  pickerSurface: {
    borderRadius: 8,
    backgroundColor: AdminPalette.surfaceVariant,
    borderWidth: 1,
    borderColor: AdminPalette.divider,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: AdminPalette.text,
  },
  input: {
    marginBottom: 16,
    backgroundColor: AdminPalette.surface,
    color: AdminPalette.text,
  },
  geometryContainer: {
    marginBottom: 16,
  },
  imageUploadContainer: {
    marginBottom: 16,
  },
  imageCard: {
    marginTop: 8,
    backgroundColor: AdminPalette.surface,
  },
  imageCardContent: {
    padding: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  imageButton: {
    flex: 1,
  },
  uploadButton: {
    marginTop: 8,
    borderRadius: 8,
    borderColor: AdminPalette.primary,
  },
  latexPreviewContainer: {
    marginTop: 8,
  },
  previewLabel: {
    fontWeight: '500',
    marginBottom: 4,
    color: AdminPalette.text,
  },
  previewSurface: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: AdminPalette.surfaceVariant,
    overflow: 'hidden',
    padding: 8,
  },
  mathPreview: {
    minHeight: 40,
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: AdminPalette.text,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  optionInput: {
    flex: 1,
    backgroundColor: AdminPalette.surface,
    fontSize: 16,
    color: AdminPalette.text,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionSurface: {
    borderRadius: 12,
  },
});

export default QuestionForm;