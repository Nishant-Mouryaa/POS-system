import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Check if current user is admin
export const checkAdminStatus = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) return false;
  
  try {
    // Force token refresh to get latest claims
    const idTokenResult = await user.getIdTokenResult(true);
    
    // Check both claim and Firestore during transition
    if (idTokenResult.claims.admin) return true;
    
    // Fallback to Firestore check
    const firestore = getFirestore();
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    return userDoc.exists() && userDoc.data().isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Refresh auth token (call after role changes)
export const refreshAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    await user.getIdToken(true);
  }
};