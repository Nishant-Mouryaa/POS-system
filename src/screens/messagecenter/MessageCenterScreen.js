// src/screens/messagecenter/MessageCenterScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
  Image,
  Clipboard,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Surface,
  Searchbar,
  Text,
  ActivityIndicator,
  Card,
  Divider,
  useTheme,
  IconButton,
  Portal,
  Modal,
  Button,
  Badge,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  writeBatch 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../config/firebase';
import { Palette } from '../../theme/colors';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageCenterHeader from '../../components/messagecenter/MessageCenterHeader';
import MessageSearchBar from '../../components/messagecenter/MessageSearchBar';
import MessageFilterBar from '../../components/messagecenter/MessageFilterBar';
import MessageList from '../../components/messagecenter/MessageList';
import MessageModal from '../../components/messagecenter/MessageModal';

const { width, height } = Dimensions.get('window');

const MessageCenterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
const [readMessages, setReadMessages] = useState(new Set());
  const [unreadCount, setUnreadCount] = useState(0);

  // Firebase user
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // For the modal
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Store the unsubscribe function
  const unsubscribeRef = useRef(null);

  // Animation values for new messages
  const animationValues = useRef({});
  const liveIndicatorAnim = useRef(new Animated.Value(1)).current;

  // Load read messages from AsyncStorage
  useEffect(() => {
    const loadReadMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem(`readMessages_${currentUser?.uid}`);
        if (stored) {
          setReadMessages(new Set(JSON.parse(stored)));
        }
      } catch (error) {
        console.error('Error loading read messages:', error);
      }
    };

    if (currentUser?.uid) {
      loadReadMessages();
    }
  }, [currentUser?.uid]);

  // Save read messages to AsyncStorage
  const saveReadMessages = async (readSet) => {
    try {
      await AsyncStorage.setItem(
        `readMessages_${currentUser?.uid}`,
        JSON.stringify(Array.from(readSet))
      );
    } catch (error) {
      console.error('Error saving read messages:', error);
    }
  };

  // Animate live indicator
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(liveIndicatorAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(liveIndicatorAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [liveIndicatorAnim]);

  // Set up real-time listener
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    // Set up real-time listener
    const messagesRef = collection(db, 'users', currentUser.uid, 'messages');
    const q = query(messagesRef, orderBy('sentAt', 'desc'));

    let isFirstLoad = true;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages = [];
        const newMessageIds = [];

        snapshot.forEach((docSnap) => {
          const messageData = { id: docSnap.id, ...docSnap.data() };
          newMessages.push(messageData);
          
          // Track new messages for animation
          if (!isFirstLoad && snapshot.docChanges().some(
            change => change.type === 'added' && change.doc.id === docSnap.id
          )) {
            newMessageIds.push(docSnap.id);
            // Initialize animation value for new messages
            if (!animationValues.current[docSnap.id]) {
              animationValues.current[docSnap.id] = new Animated.Value(0);
            }
          }
        });
        
        setMessages(newMessages);
        setLoading(false);

        // Calculate unread count
        const unread = newMessages.filter(msg => !readMessages.has(msg.id)).length;
        setUnreadCount(unread);

        // Animate new messages
        if (!isFirstLoad && newMessageIds.length > 0) {
          newMessageIds.forEach(id => {
            Animated.sequence([
              Animated.timing(animationValues.current[id], {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(animationValues.current[id], {
                toValue: 0,
                duration: 500,
                delay: 2000,
                useNativeDriver: true,
              }),
            ]).start();
          });
        }

        isFirstLoad = false;
      },
      (error) => {
        console.error('Error listening to messages:', error);
        Alert.alert('Error', 'Failed to load messages');
        setLoading(false);
      }
    );

    // Store unsubscribe function
    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [currentUser?.uid, readMessages]);

  // Mark message as read
  const markAsRead = async (messageId) => {
    if (!readMessages.has(messageId)) {
      const newReadMessages = new Set(readMessages);
      newReadMessages.add(messageId);
      setReadMessages(newReadMessages);
      saveReadMessages(newReadMessages);

      // Update unread count
      const unread = messages.filter(msg => !newReadMessages.has(msg.id)).length;
      setUnreadCount(unread);

      // Optional: Update read status in Firestore
      try {
        const messageRef = doc(db, 'users', currentUser.uid, 'messages', messageId);
        await updateDoc(messageRef, { isRead: true });
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const newReadMessages = new Set(messages.map(msg => msg.id));
    setReadMessages(newReadMessages);
    saveReadMessages(newReadMessages);
    setUnreadCount(0);

    // Optional: Update all messages in Firestore
    try {
      const batch = writeBatch(db);
      messages.forEach(msg => {
        if (!readMessages.has(msg.id)) {
          const messageRef = doc(db, 'users', currentUser.uid, 'messages', msg.id);
          batch.update(messageRef, { isRead: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Manual refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Filter for search and read/unread status
  const filteredMessages = messages.filter(({ title = '', body = '', id }) => {
    // First filter by read/unread status
    const isUnread = !readMessages.has(id);
    let passesFilter = true;
    
    switch (activeFilter) {
      case 'unread':
        passesFilter = isUnread;
        break;
      case 'read':
        passesFilter = !isUnread;
        break;
      case 'all':
      default:
        passesFilter = true;
        break;
    }
    
    if (!passesFilter) return false;
    
    // Then filter by search query
    const t = title.toLowerCase();
    const b = body.toLowerCase();
    const q = searchQuery.toLowerCase();
    return t.includes(q) || b.includes(q);
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Helper to copy UPI ID
  const copyToClipboard = (upiId) => {
    if (!upiId) return;
    Clipboard.setString(upiId);
    Alert.alert('UPI ID Copied', 'You can now paste the UPI ID in your UPI app.');
  };

  // Handle message press
  const handleMessagePress = (item) => {
    markAsRead(item.id);
    setSelectedMessage(item);
  };

  // Render each card
  const renderItem = ({ item, index }) => {
    const isUnread = !readMessages.has(item.id);
    const timeStamp = item.sentAt ? item.sentAt.toDate().toLocaleString() : '';
    
    // Get animation value for this message
    const animValue = animationValues.current[item.id] || new Animated.Value(0);
    
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
      <TouchableOpacity onPress={() => handleMessagePress(item)}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Surface style={styles.cardSurface} elevation={2}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={[
                  styles.iconContainer,
                  isUnread && styles.unreadIconContainer
                ]}>
                  <Icon 
                    name={isUnread ? "email" : "email-open-outline"} 
                    size={28} 
                    color={isUnread ? colors.primary : colors.primary} 
                  />
                  {isUnread && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.titleRow}>
                    <Text style={[
                      styles.cardTitle,
                      isUnread && styles.unreadTitle
                    ]}>
                      {item.title ?? 'Untitled'}
                    </Text>
                    {isUnread && (
                      <Badge style={styles.newBadge}>NEW</Badge>
                    )}
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

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

        {/* Header */}
        <MessageCenterHeader
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
          liveIndicatorAnim={liveIndicatorAnim}
          colors={colors}
          filteredCount={filteredMessages.length}
          totalCount={messages.length}
          activeFilter={activeFilter}
        />

        <View style={styles.content}>
          {/* Search bar */}
          <MessageSearchBar
            searchQuery={searchQuery}
            onChange={handleSearch}
            colors={colors}
            styles={styles}
          />

          {/* Filter bar */}
          <MessageFilterBar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            colors={colors}
            styles={styles}
          />

          {/* Main list */}
          <MessageList
            messages={filteredMessages}
            readMessages={readMessages}
            animationValues={animationValues}
            colors={colors}
            styles={styles}
            onMessagePress={handleMessagePress}
            copyToClipboard={copyToClipboard}
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
            loading={loading}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
          />
        </View>

        {/* Modal Overlay for the selected message */}
        <MessageModal
          selectedMessage={selectedMessage}
          visible={!!selectedMessage}
          onDismiss={() => setSelectedMessage(null)}
          styles={styles}
          colors={colors}
          copyToClipboard={copyToClipboard}
        />
      </View>
    </BackgroundWrapper>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
      position: 'relative',
    },
    headerContainer: {
      paddingBottom: 16,
      paddingTop: StatusBar.currentHeight || 0,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 16,
      marginTop: 30,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: Palette.textLight,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 14,
      color: Palette.textLight,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 24,
      lineHeight: 20,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    unreadCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
    },
    unreadCountText: {
      fontSize: 12,
      color: Palette.textLight,
      fontWeight: '600',
    },
    liveIndicatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    liveIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4CAF50',
      marginRight: 6,
    },
    liveText: {
      fontSize: 12,
      color: Palette.textLight,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    searchContainer: {
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 8,
    },
    searchbar: {
      backgroundColor: 'transparent',
      elevation: 0,
    },
    searchInput: {
      fontSize: 16,
    },
    filterContainer: {
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 8,
    },
    filterRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 8,
    },
    filterChip: {
      flex: 1,
      backgroundColor: 'transparent',
      borderColor: colors.outline,
    },
    activeFilterChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      color: colors.onSurface,
      fontSize: 12,
      fontWeight: '500',
    },
    activeFilterChipText: {
      color: colors.onPrimary,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      color: Palette.textLight,
      fontSize: 16,
    },
    listContent: {
      padding: 16,
      paddingBottom: 50,
    },
    card: {
      marginBottom: 12,
      borderRadius: 16,
      overflow: 'hidden',
    },
    cardSurface: {
      borderRadius: 16,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      // Shadow for iOS
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    cardContent: {
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: `${colors.primary}15`,
      position: 'relative',
    },
    unreadIconContainer: {
      backgroundColor: `${colors.primary}25`,
    },
    unreadDot: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.error,
    },
    cardInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Palette.textMuted,
      marginBottom: 2,
      flex: 1,
    },
    unreadTitle: {
      color: colors.onSurface,
      fontWeight: '700',
    },
    newBadge: {
      backgroundColor: colors.primary,
      fontSize: 10,
      paddingHorizontal: 8,
      height: 20,
    },
    cardTimestamp: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    cardDivider: {
      backgroundColor: colors.divider,
      marginVertical: 8,
    },
    cardBody: {
      fontSize: 14,
      color: colors.onSurface,
      lineHeight: 20,
    },
    unreadBody: {
      fontWeight: '500',
    },
    /* PAYMENT INFO SECTION */
    paymentInfoContainer: {
      marginTop: 8,
    },
    paymentLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: 4,
    },
    upiIdRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    upiIdText: {
      fontSize: 14,
      color: colors.onSurface,
      flex: 1,
    },
    copyButton: {
      marginLeft: 4,
      marginRight: -4,
    },
    qrContainer: {
      alignItems: 'center',
    },
    qrImage: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
      marginVertical: 8,
    },
    qrNote: {
      fontSize: 12,
      color: Palette.textMuted,
      textAlign: 'center',
    },
    /* EMPTY LIST */
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: `${colors.primary}10`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
      paddingHorizontal: 48,
    },
    /* MODAL STYLES */
    modalContainer: {
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
      color: colors.onBackground,
    },
    modalTimestamp: {
      fontSize: 12,
      color: Palette.textMuted,
      marginBottom: 12,
    },
    modalDivider: {
      backgroundColor: colors.divider,
      marginVertical: 8,
    },
    modalBody: {
      fontSize: 15,
      color: colors.onSurface,
      marginBottom: 12,
      lineHeight: 20,
    },
    closeButton: {
      marginTop: 16,
      alignSelf: 'flex-end',
    },
  });

export default MessageCenterScreen;