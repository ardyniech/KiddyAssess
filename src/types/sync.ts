import { Student } from '../types';

export interface SyncConflict {
  studentId: string;
  studentName: string;
  localStudent: Student;
  cloudStudent: Student;
  localAssessCount: number;
  cloudAssessCount: number;
  localTimestamp: number;
  cloudTimestamp: number;
  localSummary: string;
  cloudSummary: string;
}

export type SyncResolutionStrategy = 'auto' | 'local' | 'cloud' | 'manual';
