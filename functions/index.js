const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions/v2");

// Initialize Firebase Admin
initializeApp();

// Initialize services
const auth = getAuth();
const db = getFirestore();

/**
 * Create a new staff user with appropriate role
 */
exports.createStaffUser = onCall({ enforceAppCheck: true }, async (request) => {
  // Authentication check
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Request had no authentication context.'
    );
  }

  // Admin permission check
  if (!request.auth.token.admin) {
    throw new HttpsError(
      'permission-denied',
      'Only admins can create new staff users.'
    );
  }

  const { email, password, fullName, role } = request.data;

  try {
    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: fullName,
    });

    // Set custom claims based on role
    const customClaims = {
      admin: role === 'admin',
      manager: role === 'manager',
      staff: role === 'staff',
      role
    };

    await auth.setCustomUserClaims(userRecord.uid, customClaims);

    // Create user document in Firestore
    const userDoc = {
      uid: userRecord.uid,
      fullName,
      email,
      role,
      createdAt: FieldValue.serverTimestamp(),
      active: true,
      lastLogin: null,
      permissions: getDefaultPermissions(role)
    };

    await db.collection('staff').doc(userRecord.uid).set(userDoc);

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    logger.error('Error creating staff user:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Update user role and permissions
 */
exports.updateStaffRole = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth?.token.admin) {
    throw new HttpsError(
      'permission-denied',
      'Only admins can modify user roles.'
    );
  }

  try {
    const { uid, newRole } = request.data;
    
    // Set custom claims based on new role
    const customClaims = {
      admin: newRole === 'admin',
      manager: newRole === 'manager',
      staff: newRole === 'staff',
      role: newRole
    };

    await auth.setCustomUserClaims(uid, customClaims);

    // Update Firestore document
    await db.collection('staff').doc(uid).update({
      role: newRole,
      permissions: getDefaultPermissions(newRole),
      lastUpdated: FieldValue.serverTimestamp()
    });

    return { success: true, message: 'User role updated successfully' };
  } catch (error) {
    logger.error('Error updating staff role:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Toggle user active status
 */
exports.toggleStaffStatus = onCall({ enforceAppCheck: true }, async (request) => {
  if (!request.auth?.token.admin) {
    throw new HttpsError(
      'permission-denied',
      'Only admins can modify user status.'
    );
  }

  try {
    const { uid, active } = request.data;
    
    await auth.updateUser(uid, {
      disabled: !active
    });

    await db.collection('staff').doc(uid).update({
      active,
      statusUpdated: FieldValue.serverTimestamp()
    });

    return { 
      success: true, 
      message: `User ${active ? 'activated' : 'deactivated'} successfully` 
    };
  } catch (error) {
    logger.error('Error toggling staff status:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Helper function for default permissions
function getDefaultPermissions(role) {
  const basePermissions = {
    viewMenu: true,
    viewReports: false,
    manageInventory: false,
    manageStaff: false,
    processOrders: true,
    applyDiscounts: false,
    voidTransactions: false
  };

  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
        viewReports: true,
        manageInventory: true,
        manageStaff: true,
        applyDiscounts: true,
        voidTransactions: true
      };
    case 'manager':
      return {
        ...basePermissions,
        viewReports: true,
        manageInventory: true,
        applyDiscounts: true,
        voidTransactions: true
      };
    case 'staff':
    default:
      return basePermissions;
  }
}