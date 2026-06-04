import React from 'react';
import { ReportType } from './types/report_types';

export type AssessmentScale = 'BB' | 'MB' | 'BSH' | 'BSB';

export interface Student {
  id: string;
  name: string;
  kelompok: string;
  class?: string;
  semester: string;
  semesterType: 'Ganjil' | 'Genap';
  nisn?: string;
  height?: number;
  weight?: number;
  growthHistory?: {
    date: string;
    weight: number;
    height: number;
  }[];
  photoUrl?: string; // Optional student photo
  updatedAt?: number; // Local timestamp
  attendanceLogs?: Record<string, 'present' | 'absent' | 'late' | 'excused'>;
}

export interface UserSettings {
  language: 'id' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  defaultReportType: ReportType;
}

export interface ReportSettings {
  showSignature: boolean;
  showPhotos: boolean;
  useAINarrative: boolean;
  layoutMode: 'one-page-per-aspect' | 'compact' | 'detailed';
  paperSize: 'A4' | 'F4';
  includeTeacherName: boolean;
  customReportNote: string;
  logoPosition?: 'left' | 'center' | 'right';
  headerAlignment?: 'left' | 'center';
  showWatermark?: boolean;
  contentFontSize?: number;
  lineHeight?: number;
  themeColor?: string;
  contentPadding?: number;
  showBorders?: boolean;
  // Structural Customization
  kopAlignment?: 'left' | 'center' | 'right';
  identityAlignment?: 'left' | 'center' | 'right';
  signatureAlignment?: 'left' | 'center' | 'split';
  customHeaderLabel?: string;
  customFooterLabel?: string;
  identityJustify?: 'start' | 'center' | 'end';
}

export interface SchoolProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  principalTitle?: string;
  teacherName: string;
  logoUrl?: string;
  identityNumber?: string;
  updatedAt?: number;
  showSignature?: boolean;
  showPhotos?: boolean;
  useAINarrative?: boolean;
  layoutMode?: 'one-page-per-aspect' | 'compact' | 'detailed';
  enableCloudSync?: boolean;
  reportNote?: string;
  aiTone?: string;
  aiSensitivity?: string;
  autoCorrect?: boolean;
  // Digital signatures and stamp settings
  enableDigitalSignature?: boolean;
  enableDigitalStamp?: boolean;
  teacherSignatureUrl?: string;
  principalSignatureUrl?: string;
  schoolStampUrl?: string;
  // New Atomic UI Settings
  accentColor?: string;
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  fontSizeBase?: 'small' | 'standard' | 'large';
  cardGlassmorphism?: boolean;
  cardBackgroundColor?: string;
  // Assessment Logic Customization
  scaleLabels?: {
    BB: string;
    MB: string;
    BSH: string;
    BSB: string;
  };
  scaleColors?: {
    BB: string;
    MB: string;
    BSH: string;
    BSB: string;
  };
  showQrCode?: boolean;
}

export interface Settings {
  schoolProfile: SchoolProfile;
  userSettings: UserSettings;
  reportSettings: ReportSettings;
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

export interface DocumentBlock {
  id: string;
  type: 'kop' | 'identity' | 'header_title' | 'aspect_narrative' | 'aspect_table' | 'photo_gallery' | 'signatures' | 'page_break' | 'custom_text';
  title?: string;
  content?: string;
  aspectId?: string;
  alignment?: 'left' | 'center' | 'right' | 'split';
  fontSize?: number;
  bold?: boolean;
  gridSystem?: {
    enabled: boolean;
    cols: number;
    gap: number;
    items: Array<{
      id: string;
      label: string;
      value: string;
      colSpan: number;
      align: "left" | "center" | "right";
      isLabel: boolean;
    }>;
  };
}

export type UserRole = 'MASTER' | 'SUPER_USER' | 'ADMIN' | 'TEACHER' | 'OPERATOR';

export interface AppModule {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
  category: 'core' | 'assessment' | 'reporting' | 'utility' | 'admin';
  component: React.ComponentType<any>;
  showInSidebar?: boolean;
  requiresStudent?: boolean;
  order?: number;
  permissions?: string[];
  requiredRoles?: UserRole[];
  config?: Record<string, any>;
}

export interface ModuleManifest {
    version: string;
    modules: AppModule[];
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  createdBy: string;
  creatorRole: string;
  creatorEmail: string;
  assignedTo?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  subject?: string;
  classroom?: string;
  status: 'active' | 'inactive';
  joinedAt?: number;
  updatedAt?: number;
}


