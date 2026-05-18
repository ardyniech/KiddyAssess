import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logout = () => signOut(auth);

// Helper to check if user is admin (example logic: specific UID or flag in Firestore)
export const isAdmin = async (uid: string) => {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    return adminDoc.exists();
};
