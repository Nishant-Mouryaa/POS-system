import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Portal, Modal, Surface, Text, Button, TextInput, Divider, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';
const RemindPaymentModal = ({
  visible,
  onDismiss,
  selectedUser,
  upiId,
  setUpiId,
  upiQrUrl,
  sending,
  onSend,
}) => {
  const [showQrCode, setShowQrCode] = useState(true);
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
                <Icon name="alert-circle-outline" size={32} color={AdminPalette.primary} />
              </View>
              <Text style={styles.modalTitle}>Send Fee Reminder</Text>
              <Text style={styles.modalSubtitle}>
                {selectedUser?.fullName ? `To: ${selectedUser.fullName}` : 'To: user'}
              </Text>
            </View>

            <Surface style={styles.formSection} elevation={1}>
              <Text style={styles.messageText}>
                This is a gentle reminder that your fee payment is pending. Please scan the attached QR code to pay via UPI.
              </Text>

              <Divider style={{ marginVertical: 16, backgroundColor: AdminPalette.divider }} />
              <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8, color: AdminPalette.text }}>
                Payment Info (UPI)
              </Text>

              <TextInput
                label="UPI ID"
                value={upiId}
                onChangeText={setUpiId} 
                style={styles.input}
                mode="outlined"
                outlineColor={AdminPalette.divider}
                activeOutlineColor={AdminPalette.primary}
                textColor={AdminPalette.text}
                labelStyle={styles.inputLabel}
                placeholder="e.g. username@okicici"
                placeholderTextColor={AdminPalette.textMuted}
                left={<TextInput.Icon icon="account-outline" color={AdminPalette.text} />}
              />

              <View style={styles.qrToggleContainer}>
                <Text style={styles.qrToggleText}>Include QR Code</Text>
                <Switch
                  value={showQrCode}
                  onValueChange={() => setShowQrCode(!showQrCode)}
                  color={AdminPalette.primary}
                />
              </View>

              {upiQrUrl && showQrCode ? (
                <View style={styles.qrContainer}>
                  <Image
                    source={{ uri: upiQrUrl }}
                    style={styles.qrCode}
                  />
                  <Text style={styles.qrLabel}>
                    UPI QR Code
                  </Text>
                </View>
              ) : null}
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
          onPress={() => onSend(showQrCode)}
          style={[styles.modalButton, styles.modalSubmitButton]}
          loading={sending}
          disabled={sending}
          icon="send"
        >
          Send Reminder
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
    messageText: {
      fontSize: 16,
      color: AdminPalette.text,
      lineHeight: 24,
      marginBottom: 16,
    },
    qrToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    qrToggleText: {
      fontSize: 14,
      color: AdminPalette.text,
    },
    qrContainer: {
      alignItems: 'center',
      marginTop: 16,
    },
    qrCode: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
    },
    qrLabel: {
      fontSize: 12,
      color: AdminPalette.text,
      marginTop: 4,
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
    input: {
      marginBottom: 16,
      backgroundColor: AdminPalette.surface,
    },
    inputLabel: {
      color: AdminPalette.text,
    },
  });

export default RemindPaymentModal;