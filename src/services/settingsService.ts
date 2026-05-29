import { db } from '../lib/db';
import { SchoolProfile, UserSettings } from '../types';
import { ReportType } from '../types/report_types';

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  name: "TK TUNAS HARAPAN BANGSA",
  address: "Jl. Pendidikan No. 123, Menteng, Jakarta Pusat",
  phone: "021-555-1234",
  email: "info@tunasharapan.sch.id",
  principalName: "Hj. Siti Aminah, S.Pd",
  teacherName: "Ardy Syafii, S.Pd",
  aiTone: "Formal & Profesional",
  aiSensitivity: "Standard Balanced",
  useAINarrative: true,
  autoCorrect: true,
  showPhotos: true,
  showSignature: true,
  layoutMode: "one-page-per-aspect",
  accentColor: "#0ea5e9", // Sky 500
  borderRadius: "large",
  fontSizeBase: "standard",
  cardGlassmorphism: true,
  cardBackgroundColor: "#ffffff",
  scaleLabels: {
    BB: "Belum Berkembang",
    MB: "Mulai Berkembang",
    BSH: "Berkembang Sesuai Harapan",
    BSB: "Berkembang Sangat Baik"
  },
  scaleColors: {
    BB: "bg-red-500",
    MB: "bg-amber-500",
    BSH: "bg-emerald-500",
    BSB: "bg-blue-500"
  },
  showQrCode: true
};

const DEFAULT_USER_SETTINGS: UserSettings = {
  language: 'id',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  defaultReportType: ReportType.ASPEK_PERKEMBANGAN
};

export async function saveSchoolProfile(profile: SchoolProfile) {
  return await db.settings.put({ key: 'school_profile', value: profile });
}

export async function getSchoolProfile(): Promise<SchoolProfile> {
  const record = await db.settings.get('school_profile');
  return record?.value || DEFAULT_SCHOOL_PROFILE;
}

export async function saveUserSettings(settings: UserSettings) {
  return await db.settings.put({ key: 'user_settings', value: settings });
}

export async function getUserSettings(): Promise<UserSettings> {
  const record = await db.settings.get('user_settings');
  return record?.value || DEFAULT_USER_SETTINGS;
}
