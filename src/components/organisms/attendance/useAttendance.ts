import { useState, useEffect, useMemo } from 'react';
import { Student } from '../../../types';
import { AttendanceStatus, AttendanceStats, MonthlyTrendPoint } from './types';

export function useAttendance(students: Student[], onEditStudent: (s: Student) => void) {
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [filterClass, setFilterClass] = useState<string>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Auto-seed historical logs for last 30 days if empty
  useEffect(() => {
    let modified = false;
    students.forEach(s => {
      if (!s.attendanceLogs || Object.keys(s.attendanceLogs).length < 5) {
        const logs: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
        // Seed past 30 school days
        const base = new Date();
        for (let i = 0; i < 30; i++) {
          const d = new Date(base.getTime() - i * 24 * 60 * 60 * 1000);
          const dayOfWeek = d.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // skip weekends
            const iso = d.toISOString().split('T')[0];
            // Random high-presence distribution
            const rand = Math.random();
            logs[iso] = rand > 0.85 ? (rand > 0.95 ? 'absent' : rand > 0.90 ? 'late' : 'excused') : 'present';
          }
        }
        onEditStudent({ ...s, attendanceLogs: logs });
        modified = true;
      }
    });
    if (modified) console.log('Seeded historical attendance logs');
  }, [students, onEditStudent]);

  const classes = useMemo(() => {
    return Array.from(new Set(students.map(s => s.kelompok).filter(Boolean)));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return filterClass === 'all' ? students : students.filter(s => s.kelompok === filterClass);
  }, [students, filterClass]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const currentLogs = student.attendanceLogs || {};
    onEditStudent({
      ...student,
      attendanceLogs: {
        ...currentLogs,
        [date]: status,
      },
    });

    setFeedback('Presensi terbarui otomatis!');
    const timeout = setTimeout(() => setFeedback(null), 1800);
    return () => clearTimeout(timeout);
  };

  const dayStats = useMemo<AttendanceStats>(() => {
    if (filteredStudents.length === 0) {
      return { totalPresent: 0, totalLate: 0, totalAbsent: 0, totalExcused: 0, percentage: 100 };
    }
    let p = 0, l = 0, a = 0, e = 0;
    filteredStudents.forEach(s => {
      const status = s.attendanceLogs?.[date] || 'present';
      if (status === 'present') p++;
      else if (status === 'late') l++;
      else if (status === 'absent') a++;
      else if (status === 'excused') e++;
    });
    const pct = Math.round((p / filteredStudents.length) * 100);
    return { totalPresent: p, totalLate: l, totalAbsent: a, totalExcused: e, percentage: pct };
  }, [filteredStudents, date]);

  return {
    date,
    setDate,
    filterClass,
    setFilterClass,
    classes,
    filteredStudents,
    handleStatusChange,
    dayStats,
    feedback,
  };
}
