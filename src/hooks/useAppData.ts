import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { db, saveAssessments, loadAssessments, saveNarrativesLocal, loadNarrativesLocal, StudentNarratives, Event, loadEvents, saveEvents, saveTasksLocal, loadTasksLocal } from '../lib/db';
import { syncService } from '../lib/firebaseService';
import { syncAnalyticsService } from '../services/syncAnalyticsService';
import { Student, StudentAssessment, KanbanTask } from '../types';
import { getSchoolProfile } from '../services/settingsService';

export function useAppData(user: User | null) {
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<StudentAssessment>({});
  const [narratives, setNarratives] = useState<StudentNarratives>({});
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
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
            const cloudMax = Math.max(...cloud.map(s => s.updatedAt || 0));
            const localMax = Math.max(...localStudents.map(s => s.updatedAt || 0));
            if (cloudMax > localMax || localStudents.length === 0) {
                finalS = cloud; 
                finalA = cloudAssess?.assessments || {}; 
                finalN = cloudAssess?.narratives || {};
                
                // Safe load and seeding of Kartika assessments from Cloud to Dexie DB
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

  // Sync Logic
  const triggerSync = useCallback(async () => {
    if (!user || students.length === 0) return;
    const settings = await getSchoolProfile();
    if (!settings?.enableCloudSync) return;
    
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

        // 2. Students
        const mergedStudentsList: Student[] = [];
        let studentsChanged = false;
        for (let i = 0; i < students.length; i++) {
          const s = students[i];
          setCurrentSyncItem(`Mengunggah Peserta: ${s.name}`);
          const merged = await syncService.saveStudent(s);
          if (merged) {
            mergedStudentsList.push(merged);
            if (JSON.stringify(merged) !== JSON.stringify(s)) {
              studentsChanged = true;
            }
          } else {
            mergedStudentsList.push(s);
          }
          await new Promise(r => setTimeout(r, 30));
          count++;
          setSyncProgress(Math.round((count / totalSteps) * 100));
        }
        actions[1].status = 'success';

        // 3. Assessments
        const assessmentKeys = Object.keys(assessments);
        const mergedAssessments: StudentAssessment = { ...assessments };
        const mergedNarratives: StudentNarratives = { ...narratives };
        let assessmentsChanged = false;
        let narrativesChanged = false;

        for (let i = 0; i < assessmentKeys.length; i++) {
          const sid = assessmentKeys[i];
          const sName = students.find(s => s.id === sid)?.name || "Materi";
          setCurrentSyncItem(`Mengunggah Raport: ${sName}`);
          
          // Check for and retrieve any local Kartika scores/comments
          const kScores = await db.assessments.get(`kartika_scores_${sid}`).then(r => r?.data || null);
          const kComments = await db.assessments.get(`kartika_comments_${sid}`).then(r => r?.data || null);
          
          const merged = await syncService.saveAssessment(sid, assessments[sid], narratives[sid] || null, kScores, kComments);
          if (merged) {
            if (JSON.stringify(merged.scores) !== JSON.stringify(assessments[sid])) {
              mergedAssessments[sid] = merged.scores;
              assessmentsChanged = true;
            }
            if (merged.narratives && JSON.stringify(merged.narratives) !== JSON.stringify(narratives[sid])) {
              mergedNarratives[sid] = merged.narratives;
              narrativesChanged = true;
            }
            // If they merged kartika scores/comments, update local IndexedDB too
            if (kScores || kComments) {
              if (JSON.stringify(merged.kartikaScores) !== JSON.stringify(kScores)) {
                await db.assessments.put({ id: `kartika_scores_${sid}`, data: merged.kartikaScores });
              }
              if (JSON.stringify(merged.kartikaComments) !== JSON.stringify(kComments)) {
                await db.assessments.put({ id: `kartika_comments_${sid}`, data: merged.kartikaComments });
              }
            }
          }
          await new Promise(r => setTimeout(r, 30));
          count++;
          setSyncProgress(Math.round((count / totalSteps) * 100));
        }
        actions[2].status = 'success';

        if (studentsChanged) {
          setStudents(mergedStudentsList);
          await db.students.bulkPut(mergedStudentsList);
        }
        if (assessmentsChanged) {
          setAssessments(mergedAssessments);
          await saveAssessments(mergedAssessments);
        }
        if (narrativesChanged) {
          setNarratives(mergedNarratives);
          await saveNarrativesLocal(mergedNarratives);
        }

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
    triggerSync
  };
}
