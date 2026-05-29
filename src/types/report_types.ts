export enum ReportType {
  ASPEK_PERKEMBANGAN = 'aspek-perkembangan',
  THIRD_REPORT = 'third-report',
}

export interface ReportTemplateProps {
  student: any; // Ideally import from types.ts, avoiding circular deps
  comments?: any;
}
