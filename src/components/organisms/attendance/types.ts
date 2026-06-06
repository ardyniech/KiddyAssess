export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceStats {
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalExcused: number;
  percentage: number;
}

export interface MonthlyTrendPoint {
  date: string; // "YYYY-MM-DD" or short dynamic label "05 Jun"
  presentRate: number; // percentage
  absentRate: number;
  lateRate: number;
  excusedRate: number;
}
