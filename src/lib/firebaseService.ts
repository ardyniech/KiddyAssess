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
import { Student, StudentAssessment, SchoolProfile, AssessmentScale, KanbanTask, UserRole, StaffMember } from '../types';

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

  async saveStudent(student: Student): Promise<Student | undefined> {
    if (!auth.currentUser) return;
    const path = `students/${student.id}`;
    console.log("DEBUG: Saving student to:", path, "Data:", student, "UID:", auth.currentUser.uid);
    try {
      const docRef = doc(db, 'students', student.id);
      const docSnap = await getDoc(docRef);
      let finalStudent = { ...student };
      
      if (docSnap.exists()) {
        const cloudStudent = docSnap.data() as Student;
        
        // Merge cloud fields with local fields
        finalStudent = {
          ...cloudStudent,
          ...student,
          id: student.id,
          updatedAt: Math.max(student.updatedAt || 0, cloudStudent.updatedAt || 0)
        };
      } else {
        finalStudent.updatedAt = student.updatedAt || Date.now();
      }
      
      await setDoc(docRef, {
        ...finalStudent,
        ownerId: auth.currentUser.uid
      });
      return finalStudent;
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
  async getAssessments(): Promise<{ 
    assessments: StudentAssessment; 
    narratives: Record<string, any>;
    kartikaScores?: Record<string, any>;
    kartikaComments?: Record<string, any>;
  }> {
    if (!auth.currentUser) return { assessments: {}, narratives: {}, kartikaScores: {}, kartikaComments: {} };
    const path = 'assessments';
    try {
      const q = query(collection(db, path), where('ownerId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const assessments: StudentAssessment = {};
      const narratives: Record<string, any> = {};
      const kartikaScores: Record<string, any> = {};
      const kartikaComments: Record<string, any> = {};
      snapshot.docs.forEach(d => {
        const docData = d.data();
        assessments[d.id] = docData.scores || {};
        if (docData.narratives) {
          narratives[d.id] = docData.narratives;
        }
        if (docData.kartikaScores) {
          kartikaScores[d.id] = docData.kartikaScores;
        }
        if (docData.kartikaComments) {
          kartikaComments[d.id] = docData.kartikaComments;
        }
      });
      return { assessments, narratives, kartikaScores, kartikaComments };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return { assessments: {}, narratives: {}, kartikaScores: {}, kartikaComments: {} };
    }
  },

  async saveAssessment(
    studentId: string, 
    scores: any, 
    narratives: any = null, 
    kartikaScores: any = null, 
    kartikaComments: any = null
  ): Promise<{ scores: any; narratives: any; kartikaScores: any; kartikaComments: any } | undefined> {
    if (!auth.currentUser) return;
    const path = `assessments/${studentId}`;
    try {
      const docRef = doc(db, 'assessments', studentId);
      const docSnap = await getDoc(docRef);
      
      let finalScores = scores || {};
      let finalNarratives = narratives || {};
      let finalKartikaScores = kartikaScores || {};
      let finalKartikaComments = kartikaComments || {};
      
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        const cloudScores = cloudData.scores || {};
        const cloudNarratives = cloudData.narratives || {};
        const cloudKartikaScores = cloudData.kartikaScores || {};
        const cloudKartikaComments = cloudData.kartikaComments || {};
        
        // Deep merge scores: scores format is { [aspectId]: { [indicatorId]: value } }
        const mergedScores = { ...cloudScores };
        for (const aspectId of Object.keys(finalScores)) {
          mergedScores[aspectId] = {
            ...(mergedScores[aspectId] || {}),
            ...(finalScores[aspectId] || {})
          };
        }
        finalScores = mergedScores;
        
        // Deep merge narratives: format is { [aspectId]: narrative_text }
        const mergedNarratives = { ...cloudNarratives };
        for (const aspectId of Object.keys(finalNarratives)) {
          if (finalNarratives[aspectId]) {
            mergedNarratives[aspectId] = finalNarratives[aspectId];
          }
        }
        finalNarratives = mergedNarratives;

        // Deep merge kartikaScores
        const mergedKartikaScores = { ...cloudKartikaScores };
        for (const aspectId of Object.keys(finalKartikaScores)) {
          mergedKartikaScores[aspectId] = {
            ...(mergedKartikaScores[aspectId] || {}),
            ...(finalKartikaScores[aspectId] || {})
          };
        }
        finalKartikaScores = mergedKartikaScores;

        // Deep merge kartikaComments
        const mergedKartikaComments = { ...cloudKartikaComments };
        for (const aspectId of Object.keys(finalKartikaComments)) {
          if (finalKartikaComments[aspectId]) {
            mergedKartikaComments[aspectId] = finalKartikaComments[aspectId];
          }
        }
        finalKartikaComments = mergedKartikaComments;
      }
      
      const now = Date.now();
      const payload: any = {
        studentId,
        scores: finalScores,
        ownerId: auth.currentUser.uid,
        updatedAt: now
      };
      if (Object.keys(finalNarratives).length > 0) {
        payload.narratives = finalNarratives;
      }
      if (Object.keys(finalKartikaScores).length > 0) {
        payload.kartikaScores = finalKartikaScores;
      }
      if (Object.keys(finalKartikaComments).length > 0) {
        payload.kartikaComments = finalKartikaComments;
      }
      
      await setDoc(docRef, payload, { merge: true });
      
      return {
        scores: finalScores,
        narratives: finalNarratives,
        kartikaScores: finalKartikaScores,
        kartikaComments: finalKartikaComments
      };
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
  },

  // --- Kanban Tasks ---
  async getKanbanTasks(): Promise<KanbanTask[]> {
    const path = 'kanban_tasks';
    try {
      const q = collection(db, path);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data() } as KanbanTask));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveKanbanTask(task: KanbanTask) {
    if (!auth.currentUser) return;
    const path = `kanban_tasks/${task.id}`;
    try {
      await setDoc(doc(db, 'kanban_tasks', task.id), {
        ...task,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteKanbanTask(taskId: string) {
    if (!auth.currentUser) return;
    const path = `kanban_tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, 'kanban_tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Staff ---
  async getStaff(): Promise<StaffMember[]> {
    if (!auth.currentUser) return [];
    const path = 'staff';
    try {
      const q = collection(db, path);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as StaffMember));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveStaff(staffMember: StaffMember) {
    if (!auth.currentUser) return;
    const path = `staff/${staffMember.id}`;
    try {
      await setDoc(doc(db, 'staff', staffMember.id), {
        ...staffMember,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Proactively sync role if this staff member is a user
      if (staffMember.email) {
        await this.saveAccountRole(staffMember.email, staffMember.role as UserRole);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteStaff(staffId: string) {
    if (!auth.currentUser) return;
    const path = `staff/${staffId}`;
    try {
      await deleteDoc(doc(db, 'staff', staffId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- User Discovery ---
  async recordUserLogin(email: string, displayName: string | null) {
    const path = `users/${email.replace(/\./g, '_')}`;
    try {
      await setDoc(doc(db, 'users', email.replace(/\./g, '_')), {
        email,
        displayName,
        lastLogin: Date.now()
      }, { merge: true });
    } catch (error) {
      console.error("Failed to record login:", error);
    }
  },

  async getAllUsers(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => (b.lastLogin || 0) - (a.lastLogin || 0));
    } catch (error) {
      console.error("Failed to get all users:", error);
      return [];
    }
  },
  async getAccountRoles(): Promise<Record<string, UserRole>> {
    const path = 'account_roles';
    try {
      const snapshot = await getDocs(collection(db, path));
      const roles: Record<string, UserRole> = {};
      snapshot.docs.forEach(doc => {
        roles[doc.id] = doc.data().role as UserRole;
      });
      return roles;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return {};
    }
  },

  async syncRoleToStaff(email: string, role: UserRole) {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, 'staff'), where('email', '==', email));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, { role: role });
      }
    } catch (e) {
      console.error("Failed to sync role to staff:", e);
    }
  },

  async saveAccountRole(email: string, role: UserRole) {
    if (!auth.currentUser) return;
    const path = `account_roles/${email.replace(/\./g, '_')}`; // Use encoded email as doc ID
    try {
      await setDoc(doc(db, 'account_roles', email.replace(/\./g, '_')), {
        email,
        role,
        updatedBy: auth.currentUser.email,
        updatedAt: Date.now()
      });
      await this.syncRoleToStaff(email, role);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteAccountRole(email: string) {
    if (!auth.currentUser) return;
    const path = `account_roles/${email.replace(/\./g, '_')}`;
    try {
      await deleteDoc(doc(db, 'account_roles', email.replace(/\./g, '_')));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
