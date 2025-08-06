import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Modal, Portal, Button, Text, IconButton } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { AdminPalette } from '../../theme/colors';

const GroupMessageModal = ({ visible, onDismiss, onSend, sending }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        copyToCacheDirectory: true
      });

      if (result.type === 'success') {
        setAttachments((prev) => [
          ...prev,
          {
            name: result.name,
            uri: result.uri,
            mimeType: result.mimeType,
          },
        ]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendPress = () => {
    onSend({ title, body, attachments });
  };

  const handleDismiss = () => {
    if (!sending) {
      onDismiss();
      setTitle('');
      setBody('');
      setAttachments([]);
    }
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.container}>
          <Text style={styles.modalTitle}>New Group Message</Text>
          
          <ScrollView style={styles.scrollContainer}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={AdminPalette.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.bodyInput]}
              placeholder="Message content"
              placeholderTextColor={AdminPalette.textMuted}
              value={body}
              multiline
              onChangeText={setBody}
            />

            {attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                <Text style={styles.sectionTitle}>Attachments</Text>
                {attachments.map((attach, idx) => (
                  <View key={idx} style={styles.attachmentItem}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={20}
                      color={AdminPalette.primary}
                      style={styles.attachmentIcon}
                    />
                    <Text 
                      style={styles.attachmentText}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {attach.name}
                    </Text>
                    <IconButton
                      icon="close"
                      size={16}
                      onPress={() => removeAttachment(idx)}
                      style={styles.removeAttachment}
                    />
                  </View>
                ))}
              </View>
            )}

            <Button
              mode="outlined"
              onPress={handlePickDocument}
              style={styles.attachButton}
              labelStyle={styles.attachButtonLabel}
              icon="paperclip"
            >
              Add Attachment
            </Button>
          </ScrollView>

          <View style={styles.actions}>
            <Button
              mode="text"
              onPress={handleDismiss}
              disabled={sending}
              textColor={AdminPalette.textMuted}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSendPress}
              loading={sending}
              disabled={sending || !title || !body}
              style={styles.sendButton}
              labelStyle={styles.sendButtonLabel}
            >
              Send Message
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: AdminPalette.surfaceLight,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 24,
    elevation: 4,
    shadowColor: AdminPalette.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scrollContainer: {
    maxHeight: '70%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AdminPalette.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: AdminPalette.bg,
    borderWidth: 1,
    borderColor: AdminPalette.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
    color: AdminPalette.text,
  },
  bodyInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: AdminPalette.textMuted,
    marginBottom: 8,
    marginTop: 8,
  },
  attachmentsContainer: {
    marginBottom: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AdminPalette.surfaceVariant,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  attachmentIcon: {
    marginRight: 10,
  },
  attachmentText: {
    flex: 1,
    fontSize: 14,
    color: AdminPalette.text,
  },
  removeAttachment: {
    margin: 0,
    padding: 0,
  },
  attachButton: {
    borderColor: AdminPalette.primary,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachButtonLabel: {
    color: AdminPalette.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  sendButton: {
    backgroundColor: AdminPalette.primary,
    borderRadius: 8,
    marginLeft: 12,
  },
  sendButtonLabel: {
    color: AdminPalette.bg,
    fontWeight: '500',
  },
});

export default GroupMessageModal;