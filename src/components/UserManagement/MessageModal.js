import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Portal, Modal, Surface, Text, TextInput, Button, HelperText, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const MessageModal = ({
  visible,
  onDismiss,
  selectedUser,
  messageTitle,
  setMessageTitle,
  messageBody,
  setMessageBody,
  upiId,
  setUpiId,
  upiQrUrl,
  errors,
  sending,
  onSend,
}) => {
  const styles = makeStyles(AdminPalette);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => !sending && onDismiss()}
        contentContainerStyle={styles.modalContainer}
        dismissable={!sending}
      >
        <View style={styles.modalInner}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <View
                style={[styles.modalIconContainer, { backgroundColor: `${AdminPalette.primary}15` }]}
              >
                <Icon name="email-outline" size={32} color={AdminPalette.primary} />
              </View>
              <Text style={styles.modalTitle}>Send Message</Text>
              <Text style={styles.modalSubtitle}>
                {selectedUser?.fullName ? `To: ${selectedUser.fullName}` : 'To: user'}
              </Text>
            </View>

            <Surface style={styles.formSection} elevation={1}>
              <TextInput
                label="Message Title"
                value={messageTitle}
                onChangeText={setMessageTitle}
                style={styles.input}
                mode="outlined"
                error={!!errors.title}
                outlineColor={AdminPalette.divider}
                activeOutlineColor={AdminPalette.primary}
                textColor={AdminPalette.text}
                labelStyle={styles.inputLabel}
                left={<TextInput.Icon icon="format-title" color={AdminPalette.text} />}
              />
              {errors.title && (
                <HelperText type="error" visible>
                  {errors.title}
                </HelperText>
              )}

              <TextInput
                label="Message Body"
                value={messageBody}
                onChangeText={setMessageBody}
                style={styles.input}
                mode="outlined"
                error={!!errors.body}
                outlineColor={AdminPalette.divider}
                activeOutlineColor={AdminPalette.primary}
                textColor={AdminPalette.text}
                labelStyle={styles.inputLabel}
                multiline
                numberOfLines={3}
                left={<TextInput.Icon icon="message-text-outline" color={AdminPalette.text} />}
              />
              {errors.body && (
                <HelperText type="error" visible>
                  {errors.body}
                </HelperText>
              )}

              

              
            </Surface>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.modalButton}
                textColor={AdminPalette.text}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={onSend}
                style={[styles.modalButton, styles.modalSubmitButton]}
                loading={sending}
                disabled={sending}
                icon="send"
              >
                Send
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      margin: 0,
    },
    modalInner: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      padding: 24,
      paddingBottom: 40,
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
      fontSize: 22,
      fontWeight: '700',
      color: AdminPalette.text,
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 14,
      color: AdminPalette.text,
    },
    formSection: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      backgroundColor: colors.surface,
    },
    input: {
      marginBottom: 16,
      backgroundColor: AdminPalette.surface,
    },
    inputLabel: {
      color: AdminPalette.text,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    modalButton: {
      flex: 1,
      borderRadius: 12,
      color: AdminPalette.text,
    },
    modalSubmitButton: {
      backgroundColor: AdminPalette.primary,
    },
  });

export default MessageModal; 