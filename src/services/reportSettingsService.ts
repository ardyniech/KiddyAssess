import { db } from '../lib/db';
import { ReportSettings } from '../types';

const DEFAULT_REPORT_SETTINGS: ReportSettings = {
  showSignature: true,
  showPhotos: true,
  useAINarrative: true,
  layoutMode: 'one-page-per-aspect',
  paperSize: 'A4',
  includeTeacherName: true,
  customReportNote: '',
};

export async function saveReportSettings(settings: ReportSettings) {
  return await db.settings.put({ key: 'report_settings', value: settings });
}

export async function getReportSettings(): Promise<ReportSettings> {
  const record = await db.settings.get('report_settings');
  return record?.value || DEFAULT_REPORT_SETTINGS;
}
