import React from 'react';
import { View, Image } from 'react-native';
import { Portal, Modal, Text, Divider, Button, IconButton } from 'react-native-paper';

const MessageModal = ({ selectedMessage, visible, onDismiss, styles, colors, copyToClipboard }) => (
  <Portal>
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
    >
      {selectedMessage && (
        <View style={styles.modalContent}>
          {/* Title & Timestamp */}
          <Text style={styles.modalTitle}>
            {selectedMessage.title ?? 'Untitled'}
          </Text>
          {selectedMessage.sentAt && (
            <Text style={styles.modalTimestamp}>
              {selectedMessage.sentAt.toDate().toLocaleString()}
            </Text>
          )}
          <Divider style={styles.modalDivider} />
          {/* Message body */}
          <Text style={styles.modalBody}>{selectedMessage.body}</Text>
          {/* If payment reminder, replicate payment details */}
          {selectedMessage.isPaymentReminder && (
            <>
              <Divider style={[styles.modalDivider, { marginTop: 8 }]} />
              <Text style={styles.paymentLabel}>Payment Details:</Text>
              {/* UPI ID */}
              {selectedMessage.upiId && (
                <View style={styles.upiIdRow}>
                  <Text style={styles.upiIdText}>
                    UPI ID: {selectedMessage.upiId}
                  </Text>
                  <IconButton
                    icon="content-copy"
                    size={18}
                    onPress={() => copyToClipboard(selectedMessage.upiId)}
                    style={styles.copyButton}
                  />
                </View>
              )}
              {/* UPI QR */}
              {selectedMessage.upiQrUrl && (
                <View style={styles.qrContainer}>
                  <Image
                    source={{ uri: selectedMessage.upiQrUrl }}
                    style={styles.qrImage}
                  />
                  <Text style={styles.qrNote}>
                    Scan this QR code in your UPI app to pay
                  </Text>
                </View>
              )}
            </>
          )}
          {/* Close button */}
          <Button
            mode="contained"
            style={styles.closeButton}
            onPress={onDismiss}
          >
            Close
          </Button>
        </View>
      )}
    </Modal>
  </Portal>
);

export default MessageModal; 