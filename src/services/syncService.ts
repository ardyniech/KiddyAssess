import { db as localDb } from '../lib/db';
import { db as firestoreDb, auth } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { StudentAssessment, SchoolProfile, Student } from '../types';
import { toast } from 'react-hot-toast';

export const syncToCloud = async (
  students: Student[], 
  assessments: StudentAssessment, 
  profile: SchoolProfile
) => {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  const userDocRef = doc(firestoreDb, 'users', userId);
  
  try {
    await setDoc(userDocRef, {
      students,
      assessments,
      profile,
      lastSync: new Date().toISOString()
    }, { merge: true });
    console.log("Cloud sync successful");
    toast.success('Changes saved', {
        duration: 2000,
        position: 'bottom-right',
        style: {
            background: '#333',
            color: '#fff',
        },
    });
  } catch (error) {
    console.error("Cloud sync failed:", error);
    toast.error('Failed to sync changes');
  }
};

export const loadFromCloud = async () => {
    if (!auth.currentUser) return null;
    
    const userId = auth.currentUser.uid;
    const userDocRef = doc(firestoreDb, 'users', userId);
    
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
        return snapshot.data();
    }
    return null;
};
