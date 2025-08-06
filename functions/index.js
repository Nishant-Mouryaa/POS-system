const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const functions = require('firebase-functions');
admin.initializeApp();

// Create a new Expo SDK client with useFcmV1 set to true
let expo = new Expo({ 
  accessToken: process.env.EXPO_ACCESS_TOKEN, // Optional but recommended
  useFcmV1: true // This is now required!
});


exports.createUserByAdmin = functions.https.onCall(async (data, context) => {
  // 1. Ensure the caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Request had no authentication context.'
    );
  }

  try {
    // 2. Check admin status using custom claims (more secure than Firestore)
    if (!context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can create new users.'
      );
    }

    const { email, password, fullName, role, grade, address, isAdmin } = data;

    // 3. Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    // 4. Set custom claims if user should be admin
    if (isAdmin) {
      await admin.auth().setCustomUserClaims(userRecord.uid, { 
        admin: true,
        role: 'admin' // You can add more granular roles here
      });
    }

    // 5. Create user document in Firestore
    const userDoc = {
      uid: userRecord.uid,
      fullName,
      name: fullName,
      email,
      role,
      isAdmin, // Still store in Firestore for easy querying
      grade: role === 'Student' ? parseInt(grade) : null,
      address,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: false,
      activeCourses: 0,
      avgScore: 0,
      completedTests: 0,
      deviceInfo: {
        platform: 'web',
        deviceName: 'Admin Created',
        modelName: 'N/A',
        osVersion: 'N/A',
      },
      ...(role === 'Student' && {
        fees: {
          amount: 0,
          status: 'pending',
        },
      }),
    };

    await admin.firestore().collection('users').doc(userRecord.uid).set(userDoc);

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    throw new functions.https.HttpsError('unknown', error.message, error);
  }
});

// Promote user to admin
exports.promoteToAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can promote users.'
    );
  }

  try {
    const { uid } = data;
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { 
      admin: true,
      role: 'admin'
    });

    // Update Firestore for easy querying
    await admin.firestore().collection('users').doc(uid).update({
      isAdmin: true,
      lastAdminUpdate: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: 'User promoted to admin successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('unknown', error.message);
  }
});

// Demote admin
exports.demoteAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.superAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can demote admins.'
    );
  }

  try {
    const { uid } = data;
    
    // Remove admin claims
    await admin.auth().setCustomUserClaims(uid, { 
      admin: false,
      role: null
    });

    // Update Firestore
    await admin.firestore().collection('users').doc(uid).update({
      isAdmin: false,
      lastAdminUpdate: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: 'User demoted successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('unknown', error.message);
  }
});

exports.migrateAdmins = functions.https.onRequest(async (req, res) => {
  // Add a secret key for security
  if (req.query.secret !== process.env.MIGRATION_SECRET) {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    // Get all admin users from Firestore
    const snapshot = await admin.firestore().collection('users')
      .where('isAdmin', '==', true).get();
    
    let count = 0;
    const batchSize = 100;
    
    for (const doc of snapshot.docs) {
      await admin.auth().setCustomUserClaims(doc.id, { 
        admin: true,
        role: 'admin'
      });
      count++;
      
      if (count % batchSize === 0) {
        console.log(`Processed ${count} admins`);
      }
    }
    
    res.send(`Successfully migrated ${count} admins`);
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).send('Migration failed');
  }
});

exports.sendPushNotification = onDocumentCreated('users/{userId}/messages/{messageId}', async (event) => {
  const snap = event.data;
  const message = snap.data();
  const userId = event.params.userId;

  try {
    // Get the user's push token
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    
    if (!userDoc.exists) {
      console.log('User not found');
      return null;
    }

    const userData = userDoc.data();
    const pushToken = userData.expoPushToken;

    if (!pushToken) {
      console.log('No push token for user');
      return null;
    }

    // Validate the token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return null;
    }

    // Create the messages that you want to send to clients
    let messages = [{
      to: pushToken,
      sound: 'default',
      title: message.title || 'New Message',
      body: message.body || 'You have a new message',
      data: { 
        messageId: event.params.messageId,
        userId: userId,
        type: 'message'
      },
      priority: 'high',
      channelId: 'default',
    }];

    // The Expo push notification service accepts batches of notifications
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('Tickets:', ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }

    // Check receipts after a delay (optional but recommended)
    setTimeout(async () => {
      let receiptIds = [];
      for (let ticket of tickets) {
        if (ticket.id) {
          receiptIds.push(ticket.id);
        }
      }

      let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
      for (let chunk of receiptIdChunks) {
        try {
          let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
          console.log('Receipts:', receipts);

          for (let receiptId in receipts) {
            let { status, message, details } = receipts[receiptId];
            if (status === 'error') {
              console.error(`There was an error sending a notification: ${message}`);
              if (details && details.error) {
                console.error(`The error code is ${details.error}`);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching receipts:', error);
        }
      }
    }, 30000); // Wait 30 seconds

    console.log('Notification sent successfully to:', pushToken);
    return { success: true, tickets };

  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, error: error.message };
  }
});


