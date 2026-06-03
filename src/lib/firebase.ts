import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDocFromServer, 
  getDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { db as localDb } from './db';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust persistent multi-tab offline cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  })
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection: OK");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

export async function isAdmin(uid: string, email?: string | null): Promise<boolean> {
  if (email === 'ardy.syafii@gmail.com') return true;
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = async () => {
  try {
    // Clear all tables in Dexie database
    await localDb.students.clear();
    await localDb.assessments.clear();
    await localDb.photos.clear();
    await localDb.settings.clear();
    await localDb.narratives.clear();
    await localDb.events.clear();
    await localDb.tasks.clear();
  } catch (err) {
    console.error("Failed to clear local database:", err);
  }
  localStorage.clear();
  return signOut(auth);
};
