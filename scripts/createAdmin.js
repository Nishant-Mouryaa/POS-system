// scripts/createFirstAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('../src/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createFirstAdmin() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'admin@cafe.com',
      password: 'Password123!',
      displayName: 'System Admin'
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin',
      permissions: {
        manageStaff: true,
        manageMenu: true,
        viewReports: true,
        overrideOrders: true
      }
    });

    await admin.firestore().collection('staff').doc(userRecord.uid).set({
      uid: userRecord.uid,
      fullName: 'System Admin',
      email: 'admin@cafe.com',
      role: 'admin',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: {
        manageStaff: true,
        manageMenu: true,
        viewReports: true,
        overrideOrders: true
      }
    });

    console.log('Successfully created first admin user:', userRecord.uid);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createFirstAdmin();