export type AssessmentScale = 'BB' | 'MB' | 'BSH' | 'BSB';

export interface Student {
  id: string;
  name: string;
  class: string;
  semester: string;
  photoUrl?: string; // Optional student photo
  updatedAt?: number; // Local timestamp
}

export interface SchoolProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  teacherName: string;
  logoUrl?: string;
  showSignature?: boolean;
  showPhotos?: boolean;
  useAINarrative?: boolean;
  enableCloudSync?: boolean;
  reportNote?: string;
  updatedAt?: number;
}

export interface Indicator {
  id: string;
  text: string;
}

export interface Aspect {
  id: string;
  name: string;
  indicators: Indicator[];
}

export type ScoreData = Record<string, AssessmentScale>; // indicatorId -> scale

export type StudentAssessment = Record<string, Record<string, ScoreData>>; // studentId -> aspectId -> ScoreData
