import { db } from '../lib/db';
import { SchoolProfile } from '../types';

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  name: "TK TUNAS HARAPAN BANGSA",
  address: "Jl. Pendidikan No. 123, Menteng, Jakarta Pusat",
  phone: "021-555-1234",
  email: "info@tunasharapan.sch.id",
  principalName: "Hj. Siti Aminah, S.Pd",
  teacherName: "Ardy Syafii, S.Pd"
};

export async function saveSchoolProfile(profile: SchoolProfile) {
  return await db.settings.put({ key: 'school_profile', value: profile });
}

export async function getSchoolProfile(): Promise<SchoolProfile> {
  const record = await db.settings.get('school_profile');
  return record?.value || DEFAULT_SCHOOL_PROFILE;
}

export async function saveThemeSettings(theme: any) {
  return await db.settings.put({ key: 'theme_settings', value: theme });
}

export async function getThemeSettings(): Promise<any | null> {
  const record = await db.settings.get('theme_settings');
  return record?.value || null;
}
