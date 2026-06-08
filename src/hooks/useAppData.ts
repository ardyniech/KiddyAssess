import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { db, saveAssessments, loadAssessments, saveNarrativesLocal, loadNarrativesLocal, StudentNarratives, Event, loadEvents, saveEvents, saveTasksLocal, loadTasksLocal } from '../lib/db';
import { syncService } from '../lib/firebaseService';
import { syncAnalyticsService } from '../services/syncAnalyticsService';
import { SyncManager } from '../lib/SyncManager';
import { Student, StudentAssessment, KanbanTask } from '../types';
import { getSchoolProfile } from '../services/settingsService';
import { scanConflicts, applyMergeResolutions } from '../lib/syncConflictEngine';
import { SyncConflict } from '../types/sync';

export function useAppData(user: User | null) {
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<StudentAssessment>({});
  const [narratives, setNarratives] = useState<StudentNarratives>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [activeConflicts, setActiveConflicts] = useState<SyncConflict[]>([]);
  const [pendingCloudData, setPendingCloudData] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [currentSyncItem, setCurrentSyncItem] = useState<string | null>(null);

  // Load Initial Data
  useEffect(() => {
    async function init() {
      if (!user) return;
      setSyncStatus('Memuat...');
      
      let cloud: Student[] = [];
      let cloudAssess: any = null;
      let localStudents: Student[] = [];
      let localAssess: any = {};
      let localNarratives: any = {};
      let localEvents: Event[] = [];
      let localTasks: KanbanTask[] = [];
      let cloudLoadError: any = null;

      // 1. Safe Cloud Fetch (Does not break the app if it fails)
      try {
        const [c, cA] = await Promise.all([
          syncService.getStudents().catch(err => { cloudLoadError = err; return []; }),
          syncService.getAssessments().catch(err => { cloudLoadError = err; return null; })
        ]);
        cloud = c || [];
        cloudAssess = cA;
      } catch (err) {
        cloudLoadError = err;
        console.warn("Could not query Firestore cloud collections:", err);
      }

      // 2. Local Database Fetch (Guaranteed to resolve offline)
      try {
        const [lS, lA, lN, lE, lT] = await Promise.all([
          db.students.toArray(),
          loadAssessments(),
          loadNarrativesLocal(),
          loadEvents(),
          loadTasksLocal()
        ]);
        localStudents = lS || [];
        localAssess = lA || {};
        localNarratives = lN || {};
        localEvents = lE || [];
        localTasks = lT || [];
      } catch (err) {
        console.error("IndexedDB error during boot:", err);
      }

      try {
        let finalS = localStudents;
        let finalA = localAssess;
        let finalN = localNarratives;
        let finalE = localEvents;
        let finalT = localTasks;
        
        if (cloud.length > 0) {
            const foundConflicts = scanConflicts(localStudents, cloud, localAssess, cloudAssess?.assessments || {});
            
            if (foundConflicts.length > 0) {
                // Hold conflicting state & raw data for resolution UI
                setPendingCloudData({ cloudStudents: cloud, cloudAssess: cloudAssess });
                setActiveConflicts(foundConflicts);

                // Auto-resolve non-conflicting components
                const { mergedS, mergedA, mergedN } = applyMergeResolutions(
                  localStudents,
                  cloud,
                  localAssess,
                  cloudAssess,
                  {}
                );
                finalS = mergedS;
                finalA = mergedA;
                finalN = mergedN;
            } else {
                // Safe automatic merge
                const { mergedS, mergedA, mergedN } = applyMergeResolutions(
                  localStudents,
                  cloud,
                  localAssess,
                  cloudAssess,
                  {}
                );
                finalS = mergedS;
                finalA = mergedA;
                finalN = mergedN;

                if (cloudAssess?.kartikaScores) {
                  const ksKeys = Object.keys(cloudAssess.kartikaScores);
                  for (const sid of ksKeys) {
                    await db.assessments.put({ id: `kartika_scores_${sid}`, data: cloudAssess.kartikaScores[sid] });
                  }
                }
                if (cloudAssess?.kartikaComments) {
                  const kcKeys = Object.keys(cloudAssess.kartikaComments);
                  for (const sid of kcKeys) {
                    await db.assessments.put({ id: `kartika_comments_${sid}`, data: cloudAssess.kartikaComments[sid] });
                  }
                }
            }
        }
        
        // Automatic seeder when database is empty
        if (finalS.length === 0 && cloud.length === 0) {
            finalS = [
                // SMP Branch Seed
                {
                    id: "student_smp_1",
                    name: "Andhika Pratama",
                    kelompok: "7A",
                    semester: "Semester 2",
                    semesterType: "Genap",
                    nisn: "0102938475",
                    updatedAt: Date.now()
                },
                {
                    id: "student_smp_2",
                    name: "Siti Aminah",
                    kelompok: "8B",
                    semester: "Semester 2",
                    semesterType: "Genap",
                    nisn: "0102938476",
                    updatedAt: Date.now()
                },
                {
                    id: "student_smp_3",
                    name: "Rizky Fauzi",
                    kelompok: "9C",
                    semester: "Semester 2",
                    semesterType: "Genap",
                    nisn: "0102938477",
                    updatedAt: Date.now()
                },
                // TK Branch Seed
                {
                    id: "student_1",
                    name: "Rani Wijaya",
                    kelompok: "B1",
                    semester: "Semester 1",
                    semesterType: "Ganjil",
                    nisn: "0182736451",
                    updatedAt: Date.now()
                },
                {
                    id: "student_2",
                    name: "Budi Hartono",
                    kelompok: "B1",
                    semester: "Semester 1",
                    semesterType: "Ganjil",
                    nisn: "0182736452",
                    updatedAt: Date.now()
                }
            ];

            finalA = {
                "student_smp_1": {
                    "religion_moral": { "rm_01": "BSB", "rm_02": "BSH" },
                    "cognitive": { "cg_01": "BSH", "cg_02": "BSB" }
                }
            };
        }

        // Seed Events if empty
        if (finalE.length === 0) {
            finalE = [
                { 
                    id: 'ev_1', 
                    title: 'Rapat Koordinasi SMP Cabang', 
                    date: new Date().toISOString().split('T')[0], 
                    startTime: '08:00', 
                    endTime: '10:00', 
                    location: 'R. Meeting Utama',
                    category: 'Academic',
                    description: 'Sinkronisasi kurikulum SMP Cabang.'
                },
                { 
                    id: 'ev_2', 
                    title: 'Ujian Akhir Semester', 
                    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
                    startTime: '07:30', 
                    endTime: '12:00', 
                    location: 'Kelas Masing-masing',
                    category: 'Academic',
                    description: 'Pelaksanaan UAS serentak.'
                }
            ];
        }

        // Seed Tasks if empty
        if (finalT.length === 0) {
            finalT = [
                {
                    id: 'task_1',
                    title: 'Validasi Data Raport SMP',
                    description: 'Cek ulang semua nilai masuk sebelum cetak massal.',
                    priority: 'HIGH',
                    category: 'Kurikulum',
                    status: 'IN_PROGRESS',
                    createdBy: 'Syafii',
                    creatorRole: 'MASTER',
                    creatorEmail: 'ardy.syafii@gmail.com',
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                },
                {
                    id: 'task_2',
                    title: 'Persiapan PPDB Cabang baru',
                    description: 'Siapkan leaflet dan banner pendaftaran.',
                    priority: 'MEDIUM',
                    category: 'Administrasi',
                    status: 'TODO',
                    createdBy: 'Admin',
                    creatorRole: 'ADMIN',
                    creatorEmail: '',
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
            ];
        }

        setStudents(finalS); 
        setAssessments(finalA); 
        setNarratives(finalN);
        setEvents(finalE);
        setTasks(finalT);
        
        const saveAllInitial = async () => {
            if (finalS.length > 0) {
                await db.students.bulkPut(finalS);
            }
            await Promise.all([
                saveAssessments(finalA), 
                saveNarrativesLocal(finalN),
                saveEvents(finalE),
                saveTasksLocal(finalT)
            ]);
        };
        saveAllInitial();
        
        if (cloud.length > 0) {
            await syncAnalyticsService.addLog({
                timestamp: Date.now(),
                status: 'success',
                message: 'Data dimuat dari Cloud Backup.',
                itemsCount: cloud.length,
                actions: [
                    { id: 'students', label: 'Sinkron Peserta Didik', status: 'success' },
                    { id: 'assessments', label: 'Sinkron Penilaian (Matrix)', status: 'success' },
                    { id: 'narratives', label: 'Sinkron Deskripsi Narasi', status: 'success' }
                ]
            });
        } else if (cloudLoadError) {
            await syncAnalyticsService.addLog({
                timestamp: Date.now(),
                status: 'failed',
                message: 'Gagal memuat awan, menggunakan data lokal offline.',
                actions: [
                    { id: 'download', label: 'Sinkronisasi Cloud', status: 'failed', error: String(cloudLoadError.message ?? cloudLoadError) }
                ]
            });
        }
      } catch (err) {
        console.error("Failed to set initialized app data state:", err);
      } finally {
        setIsLoaded(true);
        setTimeout(() => setSyncStatus(null), 1000);
      }
    }
    init();
  }, [user]);

  // Saving Logic (Auto save to Local)
  useEffect(() => {
    if (!user || !isLoaded) return;
    const save = async () => {
        if (students.length > 0) {
            await db.students.bulkPut(students);
        }
        await Promise.all([
            saveAssessments(assessments), 
            saveNarrativesLocal(narratives), 
            saveEvents(events),
            saveTasksLocal(tasks)
        ]);
        setLastSaved(new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }));
    };
    save();
  }, [students, assessments, narratives, events, tasks, user, isLoaded]);

  // Conflict Resolution Callback
  const resolveConflicts = useCallback(async (resolutions: Record<string, 'local' | 'cloud'>) => {
    if (!pendingCloudData) return;
    
    setIsLoaded(false);
    const { mergedS, mergedA, mergedN } = applyMergeResolutions(
      students.length > 0 ? students : [],
      pendingCloudData.cloudStudents,
      assessments,
      pendingCloudData.cloudAssess,
      resolutions
    );

    if (mergedS.length > 0) {
      await db.students.bulkPut(mergedS);
    }
    await Promise.all([
      saveAssessments(mergedA),
      saveNarrativesLocal(mergedN),
    ]);

    // Handle index seed of Kartika custom lists
    if (pendingCloudData.cloudAssess?.kartikaScores) {
      for (const sid of Object.keys(pendingCloudData.cloudAssess.kartikaScores)) {
        if (resolutions[sid] === 'cloud') {
          await db.assessments.put({
            id: `kartika_scores_${sid}`,
            data: pendingCloudData.cloudAssess.kartikaScores[sid],
          });
        }
      }
    }
    if (pendingCloudData.cloudAssess?.kartikaComments) {
      for (const sid of Object.keys(pendingCloudData.cloudAssess.kartikaComments)) {
        if (resolutions[sid] === 'cloud') {
          await db.assessments.put({
            id: `kartika_comments_${sid}`,
            data: pendingCloudData.cloudAssess.kartikaComments[sid],
          });
        }
      }
    }

    setStudents(mergedS);
    setAssessments(mergedA);
    setNarratives(mergedN);
    setActiveConflicts([]);
    setPendingCloudData(null);
    setIsLoaded(true);

    // Push resolutions to Cloud
    setTimeout(() => {
      triggerSync();
    }, 500);
  }, [students, assessments, narratives, pendingCloudData]);

  // Sync Logic
  const triggerSync = useCallback(async () => {
    if (isSyncing || !user || students.length === 0) return;
    const settings = await getSchoolProfile();
    if (!settings?.enableCloudSync) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    setCurrentSyncItem('Mencocokkan Versi Cloud...');

    try {
      const latestCloud = await syncService.getStudents();
      const latestCloudAssess = await syncService.getAssessments();
      const liveConflicts = scanConflicts(students, latestCloud, assessments, latestCloudAssess?.assessments || {});

      if (liveConflicts.length > 0) {
        setPendingCloudData({ cloudStudents: latestCloud, cloudAssess: latestCloudAssess });
        setActiveConflicts(liveConflicts);
        setSyncStatus('Konflik!');
        setCurrentSyncItem('Harap selesaikan konflik sebelum mencadangkan.');
        setIsSyncing(false);
        return;
      }
    } catch (e) {
      console.warn("Could not retrieve latest cloud data for safety pre-sync check.", e);
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setCurrentSyncItem('Menghubungkan ke Cloud...');
    
    const actions: any[] = [
        { id: 'profile', label: 'Profil Sekolah', status: 'pending' },
        { id: 'students', label: 'Data Peserta Didik', status: 'pending' },
        { id: 'assessments', label: 'Berkas Penilaian', status: 'pending' }
    ];

    try {
        let count = 0;
        const totalSteps = 1 + students.length + Object.keys(assessments).length;
        
        // 1. School Profile
        setCurrentSyncItem('Mengunggah Profil Sekolah...');
        await new Promise(r => setTimeout(r, 450));
        actions[0].status = 'success';
        count++;
        setSyncProgress(Math.round((count / totalSteps) * 100));

        // 2. Students + Assessments (Atomic Sync call)
        await SyncManager.triggerSync(
            { students, assessments, narratives },
            (item, count) => {
                const totalSteps = 1 + students.length + Object.keys(assessments).length;
                setCurrentSyncItem(item);
                setSyncProgress(Math.round((count / totalSteps) * 100));
            }
        );
        actions[1].status = 'success';
        actions[2].status = 'success';

        setSyncStatus('Sinkron Selesai');
        setCurrentSyncItem('Pencadangan Cloud Berhasil!');
        setSyncProgress(100);

        await syncAnalyticsService.addLog({
            timestamp: Date.now(),
            status: 'success',
            message: 'Pencadangan berhasil diunggah.',
            itemsCount: count,
            actions
        });

        // Notify options tab
        window.dispatchEvent(new CustomEvent('app-sync-completed'));
    } catch (err) { 
        setSyncStatus('Sinkron Gagal'); 
        setCurrentSyncItem('Gagal mencadangkan data.');
        
        const currentIdx = actions.findIndex(a => a.status === 'pending' || a.status === 'in_progress');
        if (currentIdx !== -1) {
            actions[currentIdx].status = 'failed';
            actions[currentIdx].error = 'Firebase Write Error';
        }

        await syncAnalyticsService.addLog({
            timestamp: Date.now(),
            status: 'failed',
            message: 'Gagal mengunggah cadangan data.',
            actions
        });
    }
    finally { 
        setIsSyncing(false); 
        setTimeout(() => {
            setSyncStatus(null);
            setCurrentSyncItem(null);
            setSyncProgress(0);
        }, 3000); 
    }
  }, [user, students, assessments, narratives]);

  useEffect(() => {
    if (!user || students.length === 0) return;
    const t = setTimeout(triggerSync, 15000);
    return () => clearTimeout(t);
  }, [students, assessments, triggerSync, user]);

  return { 
    students, 
    setStudents, 
    assessments, 
    setAssessments, 
    narratives, 
    setNarratives, 
    events,
    setEvents,
    tasks,
    setTasks,
    isLoaded,
    isSyncing,
    syncStatus,
    syncErrors,
    lastSaved,
    syncProgress,
    currentSyncItem,
    triggerSync,
    activeConflicts,
    resolveConflicts
  };
}
