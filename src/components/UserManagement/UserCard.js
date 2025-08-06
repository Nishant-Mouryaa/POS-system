import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Surface, Text, Button, Badge, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminPalette } from '../../theme/colors';

const UserCard = ({ 
  user, 
  index, 
  scrollY, 
  onMessage, 
  onEditFees, 
  onRemindPayment 
}) => {
  const styles = makeStyles(AdminPalette);
  
  const userName = user.fullName || '(No Name)';
  const userEmail = user.email || 'N/A';
  const userRole = user.role || 'Student';
  const userFees = user.fees;
  const isStudent = userRole.toLowerCase() === 'student';
  const feesStatus = userFees?.status || 'pending';
  const feesAmount = userFees?.amount || 0;

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: scrollY.interpolate({
            inputRange: [-1, 0, 100 * index, 100 * (index + 2)],
            outputRange: [1, 1, 1, 0],
          }),
          transform: [
            {
              scale: scrollY.interpolate({
                inputRange: [-1, 0, 100 * index, 100 * (index + 3)],
                outputRange: [1, 1, 1, 0.9],
              }),
            },
          ],
        }
      ]}
    >
      <Surface style={styles.card} elevation={2}>
        {/* User Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon
              name="account-circle"
              size={36}
              color={AdminPalette.primary}
            />
          </View>
          
          <View style={styles.userInfo}>
            <Text variant="titleMedium" style={styles.userName}>
              {userName}
            </Text>
            <Text variant="bodySmall" style={styles.userEmail}>
              {userEmail}
            </Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Icon
                  name={isStudent ? "school" : "teach"}
                  size={14}
                  color={AdminPalette.textSecondary}
                />
                <Text variant="labelSmall" style={styles.metaText}>
                  {userRole}
                </Text>
              </View>
              
              {user.schoolBoard && (
                <View style={styles.metaItem}>
                  <Icon
                    name="book-education"
                    size={14}
                    color={AdminPalette.textSecondary}
                  />
                  <Text variant="labelSmall" style={styles.metaText}>
                    {user.schoolBoard}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <Badge
            size={24}
            style={[
              styles.roleBadge,
              { 
                backgroundColor: isStudent 
                  ? AdminPalette.primaryContainer 
                  : AdminPalette.secondaryContainer
              }
            ]}
          >
            {userRole.charAt(0)}
          </Badge>
        </View>

        {/* Fees Section (Students only) */}
        {isStudent && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.feesSection}>
              <View style={styles.feesRow}>
                <Text variant="labelMedium" style={styles.feesLabel}>
                  Fees Amount:
                </Text>
                <Text variant="bodyMedium" style={styles.feesValue}>
                  {feesAmount ? `₹${feesAmount}` : 'Not set'}
                </Text>
              </View>
              
              <View style={styles.feesRow}>
                <Text variant="labelMedium" style={styles.feesLabel}>
                  Status:
                </Text>
                <View style={[
                  styles.statusBadge,
                  feesStatus === 'paid' 
                    ? styles.statusPaid 
                    : styles.statusPending
                ]}>
                  <Text variant="labelSmall" style={styles.statusText}>
                    {feesStatus === 'paid' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Action Buttons */}
        <Divider style={styles.divider} />
        <View style={styles.actions}>
          <Button
            mode="text"
            icon="email-outline"
            onPress={() => onMessage(user)}
            compact
            labelStyle={styles.buttonLabel}
            style={styles.button}
          >
            Message
          </Button>
          
          {isStudent && (
            <>
              <Button
                mode="text"
                icon="currency-inr"
                onPress={() => onEditFees(user)}
                compact
                labelStyle={styles.buttonLabel}
                style={styles.button}
              >
                Edit Fees
              </Button>
              
              {feesStatus === 'pending' && (
                <Button
                  mode="text"
                  icon="bell-outline"
                  onPress={() => onRemindPayment(user)}
                  compact
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
                >
                  Remind
                </Button>
              )}
            </>
          )}
        </View>
      </Surface>
    </Animated.View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginHorizontal: 16,
    backgroundColor: colors.outlineVariant,
  },
  feesSection: {
    padding: 16,
    paddingVertical: 12,
    gap: 8,
  },
  feesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feesLabel: {
    color: colors.textSecondary,
  },
  feesValue: {
    fontWeight: '500',
    color: colors.text,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPaid: {
    backgroundColor: colors.successContainer,
  },
  statusPending: {
    backgroundColor: colors.errorContainer,
  },
  statusText: {
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  button: {
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});

export default UserCard;