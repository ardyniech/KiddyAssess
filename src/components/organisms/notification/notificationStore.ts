import { AppNotification } from './types';
import { Student } from '../../../types';

export function getInitialNotifications(students: Student[]): AppNotification[] {
  const list: AppNotification[] = [
    {
      id: 'd1',
      title: 'Batas Pengisian Nilai Rapor',
      description: 'Review akhir pengisian narasi rapor semester ganjil ditenggat maksimal 15 Juni 2026.',
      type: 'deadline',
      date: '15 Jun 2026',
      isRead: false,
      priority: 'high',
    },
    {
      id: 'd2',
      title: 'Submit Laporan Evaluasi Kokurikulum',
      description: 'Laporan mingguan pelaksanaan projek penguatan profil pelajar Pancasila (P5) wajib diunggah hari ini.',
      type: 'deadline',
      date: 'Hari ini',
      isRead: false,
      priority: 'normal',
    },
    {
      id: 's1',
      title: 'Pembaruan Engine AI Rapor',
      description: 'Layanan auto-fill ditenagai model Gemini 1.5 Pro tingkat lanjut untuk optimasi deskripsi karakter 5NK.',
      type: 'system',
      date: '4 Jun 2026',
      isRead: false,
      priority: 'high',
    },
    {
      id: 's2',
      title: 'Pemeliharaan Server Berkala',
      description: 'Sistem akan luring sementara untuk perawatan basis data pada 12 Juni 2026, pukul 01:00 - 03:00 WIB.',
      type: 'system',
      date: '12 Jun 2026',
      isRead: false,
      priority: 'normal',
    }
  ];

  // Dynamic baby birthday logic based on any students in the store
  if (students && students.length > 0) {
    const student1 = students[0];
    list.unshift({
      id: `b-${student1.id}`,
      title: `Ultah Ananda ${student1.name}`,
      description: `Hari ini adalah ulang tahun Ananda ${student1.name} (Rombel: ${student1.kelompok || 'A'}). Mari ucapkan selamat dan catat perkembangannya!`,
      type: 'birthday',
      date: 'Hari ini 🎉',
      isRead: false,
      priority: 'high',
    });

    if (students.length > 1) {
      const student2 = students[1];
      list.push({
        id: `b-${student2.id}`,
        title: `Mendatang: Ultah ${student2.name}`,
        description: `Persiapkan lilin & ucapan motivatif. Ananda ${student2.name} di kelas ${student2.kelompok || 'A'} berulang tahun pada 10 Juni mendatang!`,
        type: 'birthday',
        date: '10 Jun 2026',
        isRead: false,
        priority: 'normal',
      });
    }
  } else {
    // Fallback if zero students
    list.unshift({
      id: 'b-fallback',
      title: 'Hari Ini: Ulang Tahun Budi Santoso',
      description: 'Ulang tahun Ananda Budi Santoso dengah rombel A1. Jangan lupa untuk mengirimkan kartu ucapan digital dari sekolah!',
      type: 'birthday',
      date: 'Hari ini 🎉',
      isRead: false,
      priority: 'high',
    });
  }

  return list;
}

export function loadStoredNotifications(students: Student[]): AppNotification[] {
  try {
    const raw = localStorage.getItem('kiddy_notifications');
    if (raw) {
      const stored = JSON.parse(raw) as AppNotification[];
      // Keep state but merge new dynamic student context
      const freshList = getInitialNotifications(students);
      // Let's preserve isRead state for matching IDs
      return freshList.map(fresh => {
        const matching = stored.find(s => s.id === fresh.id);
        if (matching) {
          return { ...fresh, isRead: matching.isRead };
        }
        return fresh;
      });
    }
  } catch (e) {
    console.error('Error loading notifications', e);
  }
  return getInitialNotifications(students);
}

export function saveStoredNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem('kiddy_notifications', JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications', e);
  }
}
