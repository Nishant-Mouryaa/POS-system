import React from 'react';
import { View, TouchableOpacity, Animated, Image } from 'react-native';
import { Surface, Card, Divider, Text, IconButton, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Palette } from '../../theme/colors';

const MessageCard = ({ item, isUnread, animValue, colors, styles, onPress, copyToClipboard }) => {
  const timeStamp = item.sentAt ? item.sentAt.toDate().toLocaleString() : '';
  const animatedStyle = {
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
    backgroundColor: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.surface, `${colors.primary}15`],
    }),
  };
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Surface style={styles.cardSurface} elevation={2}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={[
                styles.iconContainer,
                isUnread && styles.unreadIconContainer
              ]}>
                <Icon 
                  name={isUnread ? 'email' : 'email-open-outline'} 
                  size={28} 
                  color={isUnread ? colors.primary : colors.primary} 
                />
                {isUnread && <View style={styles.unreadDot} />}
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.titleRow}>
                  <Text style={[
                    styles.cardTitle,
                    isUnread && styles.unreadTitle
                  ]}>
                    {item.title ?? 'Untitled'}
                  </Text>
                  {isUnread && <Badge style={styles.newBadge}>NEW</Badge>}
                </View>
                {timeStamp ? (
                  <Text style={styles.cardTimestamp}>{timeStamp}</Text>
                ) : null}
              </View>
            </View>
            <Divider style={styles.cardDivider} />
            <Text style={[
              styles.cardBody,
              isUnread && styles.unreadBody
            ]} numberOfLines={3}>
              {item.body ?? 'No body text.'}
            </Text>
            {/* Payment Details Section - Only show for payment reminders */}
            {item.isPaymentReminder && (item.upiId || item.upiQrUrl) && (
              <>
                <Divider style={[styles.cardDivider, { marginTop: 8 }]} />
                <View style={styles.paymentInfoContainer}>
                  <Text style={styles.paymentLabel}>Payment Details:</Text>
                  {/* UPI ID */}
                  {item.upiId ? (
                    <View style={styles.upiIdRow}>
                      <Text style={styles.upiIdText}>UPI ID: {item.upiId}</Text>
                      <IconButton
                        icon="content-copy"
                        size={18}
                        onPress={() => copyToClipboard(item.upiId)}
                        style={styles.copyButton}
                      />
                    </View>
                  ) : null}
                  {/* UPI QR */}
                  {item.upiQrUrl ? (
                    <View style={styles.qrContainer}>
                      <Image
                        source={{ uri: item.upiQrUrl }}
                        style={styles.qrImage}
                      />
                      <Text style={styles.qrNote}>
                        Scan this QR code in your UPI app to pay
                      </Text>
                    </View>
                  ) : null}
                </View>
              </>
            )}
          </Card.Content>
        </Surface>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default MessageCard; 