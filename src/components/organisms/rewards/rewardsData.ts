import { Badge, RewardActivity } from './types';
import { Student, StudentAssessment } from '../../../types';

export const POINT_RULES = {
  STREAK_LOGIN: 5,
  STUDENT_CREATED: 10,
  ATTENDANCE_MARKED: 15,
  ASSESSMENT_COMPLETED: 25,
  AI_NARRATIVE_GENERATED: 30,
};

export function getInitialBadges(): Badge[] {
  return [
    {
      id: 'b1',
      title: 'Pencatat Setia',
      description: 'Lakukan pengisian absensi harian rombel secara penuh selaras kalender akademik.',
      iconName: 'ClipboardList',
      isUnlocked: true,
      unlockedAt: '03 Jun 2026',
      pointsRequired: 0,
    },
    {
      id: 'b2',
      title: 'Maestro Asesmen',
      description: 'Mengisi lengkap penilaian asesmen harian untuk minimal 1 rombel.',
      iconName: 'FileText',
      isUnlocked: true,
      unlockedAt: '04 Jun 2026',
      pointsRequired: 30,
    },
    {
      id: 'b3',
      title: 'Pakar Bahasa AI',
      description: 'Berhasil generate deskripsi rapor narasi AI ditenagai model Gemini.',
      iconName: 'Sparkles',
      isUnlocked: false,
      pointsRequired: 150,
    },
    {
      id: 'b4',
      title: 'Pahlawan Rombel',
      description: 'Memanajemen lebih dari 10 murid terdaftar secara aktif.',
      iconName: 'Users',
      isUnlocked: false,
      pointsRequired: 250,
    },
    {
      id: 'b5',
      title: 'Rapor Paripurna',
      description: 'Mencapai status pengisian rapor 100% tuntas sebelum tenggat waktu.',
      iconName: 'Award',
      isUnlocked: false,
      pointsRequired: 400,
    }
  ];
}

export function calculateTeacherEngagementState(
  students: Student[],
  assessments: StudentAssessment | undefined
) {
  let earnedPoints = 120; // Default base points for existing logins/setup

  // Track achievements dynamically based on student count
  const studentCount = students.length;
  earnedPoints += studentCount * POINT_RULES.STUDENT_CREATED;

  // Track attendance entries
  let totalAttendanceDays = 0;
  students.forEach(s => {
    if (s.attendanceLogs) {
      totalAttendanceDays += Object.keys(s.attendanceLogs).length;
    }
  });
  earnedPoints += Math.min(totalAttendanceDays * 2, 100); // capped max

  // Track progress updates in assessments
  let assessedCount = 0;
  if (assessments) {
    Object.values(assessments).forEach(studentMap => {
      Object.values(studentMap).forEach(aspectMap => {
        if (Object.keys(aspectMap).length > 0) {
          assessedCount += 1;
        }
      });
    });
  }
  earnedPoints += assessedCount * POINT_RULES.ASSESSMENT_COMPLETED;

  // Calculate Level and Experience
  const pointsPerLevel = 100;
  const currentLevel = Math.max(1, Math.floor(earnedPoints / pointsPerLevel));
  const remainderPoints = earnedPoints % pointsPerLevel;
  const progressPercentage = Math.min(100, Math.round((remainderPoints / pointsPerLevel) * 100));

  return {
    points: earnedPoints,
    level: currentLevel,
    experienceToNextLevel: pointsPerLevel - remainderPoints,
    progressPercentage,
  };
}

export function getDynamicActivities(
  students: Student[],
  assessments: StudentAssessment | undefined
): RewardActivity[] {
  const activities: RewardActivity[] = [
    {
      id: 'a1',
      title: 'Absensi Terhitung',
      description: 'Telah menandai presensi harian siswa secara berkala.',
      points: 15,
      date: 'Hari ini',
      iconType: 'attendance',
    },
    {
      id: 'a2',
      title: 'Konsistensi Absensi Rombel',
      description: 'Mempertahankan rekam kehadiran kelas mingguan.',
      points: 20,
      date: 'Kemarin',
      iconType: 'attendance',
    }
  ];

  if (students.length > 0) {
    activities.unshift({
      id: 'a3',
      title: 'Pendaftaran Siswa Baru',
      description: `Mendaftarkan total ${students.length} murid baru ke dalam rombel.`,
      points: students.length * POINT_RULES.STUDENT_CREATED,
      date: '04 Jun 2026',
      iconType: 'progress',
    });
  }

  let assessedCount = 0;
  if (assessments) {
    Object.values(assessments).forEach(studentMap => {
      Object.values(studentMap).forEach(aspectMap => {
        if (Object.keys(aspectMap).length > 0) {
          assessedCount += 1;
        }
      });
    });
  }

  if (assessedCount > 0) {
    activities.unshift({
      id: 'a4',
      title: 'Input Penilaian Asesmen',
      description: `Berhasil menginput ${assessedCount} aspek indikator tumbuh kembang siswa.`,
      points: assessedCount * POINT_RULES.ASSESSMENT_COMPLETED,
      date: 'Hari ini',
      iconType: 'narrative',
    });
  }

  return activities;
}
