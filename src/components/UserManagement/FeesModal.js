import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Portal, Modal, Surface, Text, TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const FeesModal = ({
  visible,
  onDismiss,
  selectedUser,
  feesAmount,
  setFeesAmount,
  feesStatus,
  setFeesStatus,
  feesSaving,
  onSave,
}) => {
  const styles = makeStyles(AdminPalette);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => !feesSaving && onDismiss()}
        contentContainerStyle={styles.modalContainer}
        dismissable={!feesSaving}
      >
        <Surface style={styles.modalSurface} elevation={5}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Icon 
                  name="cash" 
                  size={32} 
                  color={AdminPalette.primary} 
                />
              </View>
              <Text style={styles.modalTitle}>Edit Fees</Text>
              {selectedUser?.fullName && (
                <Text style={styles.modalSubtitle}>
                  For: <Text style={styles.userName}>{selectedUser.fullName}</Text>
                </Text>
              )}
            </View>

            <View style={styles.formSection}>
              <TextInput
                label="Fees Amount (₹)"
                value={feesAmount}
                onChangeText={setFeesAmount}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                outlineColor={AdminPalette.divider}
                activeOutlineColor={AdminPalette.primary}
                left={<TextInput.Icon icon="currency-inr" color={AdminPalette.textMuted} />}
              />

              <Text style={styles.sectionLabel}>Payment Status</Text>
              <View style={styles.statusButtonsContainer}>
                <Button
                  mode={feesStatus === 'paid' ? 'contained' : 'outlined'}
                  onPress={() => setFeesStatus('paid')}
                  style={[
                    styles.statusButton,
                    feesStatus === 'paid' && styles.statusButtonActive
                  ]}
                  textColor={feesStatus === 'paid' ? 'white' : AdminPalette.primary}
                  icon={feesStatus === 'paid' ? 'check-circle' : 'circle-outline'}
                >
                  Paid
                </Button>
                <Button
                  mode={feesStatus === 'pending' ? 'contained' : 'outlined'}
                  onPress={() => setFeesStatus('pending')}
                  style={[
                    styles.statusButton,
                    feesStatus === 'pending' && styles.statusButtonActive
                  ]}
                  textColor={feesStatus === 'pending' ? 'white' : AdminPalette.primary}
                  icon={feesStatus === 'pending' ? 'alert-circle' : 'circle-outline'}
                >
                  Pending
                </Button>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.cancelButton}
                textColor={AdminPalette.text}
                disabled={feesSaving}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={onSave}
                style={styles.saveButton}
                loading={feesSaving}
                disabled={feesSaving}
                icon="content-save"
                textColor="white"
              >
                Save Changes
              </Button>
            </View>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  modalSurface: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalScroll: {
    maxHeight: '80%',
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    backgroundColor: `${colors.primary}15`,
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
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  userName: {
    fontWeight: '600',
    color: colors.text,
  },
  formSection: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 12,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: colors.primary,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    marginRight: 12,
    borderColor: colors.divider,
  },
  saveButton: {
    backgroundColor: colors.primary,
    minWidth: 150,
  },
});

export default FeesModal;