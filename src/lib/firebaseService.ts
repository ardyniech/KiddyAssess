import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Student, StudentAssessment, SchoolProfile, AssessmentScale } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const syncService = {
  // --- Students ---
  async getStudents(): Promise<Student[]> {
    if (!auth.currentUser) return [];
    const path = 'students';
    try {
      const q = query(collection(db, path), where('ownerId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data() } as Student));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveStudent(student: Student) {
    if (!auth.currentUser) return;
    const path = `students/${student.id}`;
    try {
      const now = Date.now();
      await setDoc(doc(db, 'students', student.id), {
        ...student,
        ownerId: auth.currentUser.uid,
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteStudent(studentId: string) {
    if (!auth.currentUser) return;
    const path = `students/${studentId}`;
    try {
      await deleteDoc(doc(db, 'students', studentId));
      // Also delete assessments
      await deleteDoc(doc(db, 'assessments', studentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Assessments ---
  async getAssessments(): Promise<StudentAssessment> {
    if (!auth.currentUser) return {};
    const path = 'assessments';
    try {
      const q = query(collection(db, path), where('ownerId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const data: StudentAssessment = {};
      snapshot.docs.forEach(d => {
        const docData = d.data();
        data[d.id] = docData.scores;
      });
      return data;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return {};
    }
  },

  async saveAssessment(studentId: string, scores: any) {
    if (!auth.currentUser) return;
    const path = `assessments/${studentId}`;
    try {
      const now = Date.now();
      await setDoc(doc(db, 'assessments', studentId), {
        studentId,
        scores,
        ownerId: auth.currentUser.uid,
        updatedAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- Settings ---
  async getSettings(): Promise<SchoolProfile | null> {
    if (!auth.currentUser) return null;
    const path = `settings/${auth.currentUser.uid}`;
    try {
      const d = await getDoc(doc(db, 'settings', auth.currentUser.uid));
      return d.exists() ? (d.data() as SchoolProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async saveSettings(settings: SchoolProfile) {
    if (!auth.currentUser) return;
    const path = `settings/${auth.currentUser.uid}`;
    try {
      await setDoc(doc(db, 'settings', auth.currentUser.uid), {
        ...settings,
        ownerId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
