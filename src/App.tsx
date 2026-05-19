import { useState, useEffect, useCallback } from "react";
import { Student, StudentAssessment, AssessmentScale, ScoreData, SchoolProfile } from "./types";
import { ASPECTS } from "./constants";
import { db, saveAssessments, loadAssessments } from "./lib/db";
import { auth, signInWithGoogle, logout, testConnection } from "./lib/firebase";
import { syncService } from "./lib/firebaseService";
import { onAuthStateChanged, User } from "firebase/auth";
import { OrganismHeader } from "./components/organisms/OrganismHeader";
import { OrganismIndikatorList } from "./components/organisms/OrganismIndikatorList";
import { OrganismStudentManager } from "./components/organisms/OrganismStudentManager";
import { OrganismPDFPreview } from "./components/organisms/OrganismPDFPreview";
import { OrganismAppSettings } from "./components/organisms/OrganismAppSettings";
import { ThemeProvider, useAppTheme } from "./context/ThemeContext";
import { AtomText, AtomBadge } from "./components/atoms/CommonAtoms";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, FileText, Settings, Users, ChevronLeft, ChevronRight, CheckCircle2, Plus, ArrowRight, School, Sparkles, LogIn, Github, LogOut } from "lucide-react";
import { cn } from "./lib/utils";
import { getSchoolProfile } from "./services/settingsService";

import { AuthProvider } from "./context/AuthContext";

export default function RootApp() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  );
}

function App() {
  const { theme: appTheme } = useAppTheme();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<StudentAssessment>({});
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeAspectIndex, setActiveAspectIndex] = useState(0);
  const [view, setView] = useState<"assessment" | "report">("assessment");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) testConnection();
    });
    return unsub;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem("kiddy_theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("kiddy_theme", theme);
  }, [theme]);


  // 1. Immediate Local Save (Robust Offline-First)
  useEffect(() => {
    if (!user || !isLoaded) return;
    if (students.length === 0 && Object.keys(assessments).length === 0) return;

    const saveLocal = async () => {
      try {
        await Promise.all([
          db.students.bulkPut(students),
          saveAssessments(assessments)
        ]);
        
        localStorage.setItem("kiddy_active_student_id", JSON.stringify(activeStudentId));
        localStorage.setItem("kiddy_active_aspect_index", JSON.stringify(activeAspectIndex));
        localStorage.setItem("kiddy_view", JSON.stringify(view));
        
        setLastSaved(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.error("Local save failed:", err);
      }
    };

    saveLocal();
  }, [students, assessments, activeStudentId, activeAspectIndex, view, user]);

  // 2. Debounced Cloud Sync
  useEffect(() => {
    if (!user || students.length === 0) return;

    const syncCloud = async () => {
      try {
        const settings = await getSchoolProfile();
        if (settings?.enableCloudSync) {
          setIsSyncing(true);
          const errors: string[] = [];
          
          // Sync Students
          for (const s of students) {
            try {
              await syncService.saveStudent(s);
            } catch (err) {
              errors.push(`Student ${s.name} failed`);
              console.error(err);
            }
          }

          // Sync Assessments
          for (const sid of Object.keys(assessments)) {
            try {
               await syncService.saveAssessment(sid, assessments[sid]);
            } catch (err) {
               errors.push(`Assessment failed`);
               console.error(err);
            }
          }
          
          setSyncErrors(errors);
          if (errors.length === 0) {
            setSyncStatus('Semua data tercadangkan');
            setTimeout(() => setSyncStatus(null), 2000);
          } else {
            setSyncStatus(`${errors.length} error sinkronisasi`);
          }
        }
      } catch (err) {
        setSyncStatus('Cloud Gagal');
        console.error("Cloud sync failed:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    const timer = setTimeout(syncCloud, 5000); // 5s debounce for cloud efficiency
    return () => clearTimeout(timer);
  }, [students, assessments, user]);

  // Initial Load with Cloud Sync
  useEffect(() => {
    async function initData() {
      if (!user) return;
      
      setSyncStatus('Memuat data...');
      try {
        // Parallel load: Cloud and Local
        const [cloudStudents, cloudAssessments, localStudents, localAssessments] = await Promise.all([
          syncService.getStudents(),
          syncService.getAssessments(),
          db.students.toArray(),
          loadAssessments()
        ]);

        console.log("Init Data: ", { cloudLen: cloudStudents.length, localLen: localStudents.length });

        // Logic: Local is primary for speed. Cloud is secondary for persistence.
        // We initialize with Local first, then potentially update with Cloud.
        let finalStudents = localStudents;
        let finalAssessments = localAssessments;

        // If Cloud exists, we evaluate if we should use it.
        // For simplicity: If local is empty, use cloud.
        // If both exist, we could compare timestamps, but for now let's just log.
        if (cloudStudents.length > 0) {
            if (localStudents.length === 0) {
                finalStudents = cloudStudents;
                finalAssessments = cloudAssessments;
            } else {
                // Determine which is newer. 
                // We'll compare the max updatedAt from cloud vs local.
                const cloudMax = Math.max(...cloudStudents.map(s => s.updatedAt || 0));
                const localMax = Math.max(...localStudents.map(s => s.updatedAt || 0));
                
                if (cloudMax > localMax) {
                    console.log("Cloud is newer. Updating local.");
                    finalStudents = cloudStudents;
                    finalAssessments = cloudAssessments;
                } else {
                    console.log("Local is newer or equal. Keeping local.");
                }
            }
        }

        setStudents(finalStudents);
        setAssessments(finalAssessments);

        // Background: Ensure Local DB is exactly what we have in state
        if (finalStudents.length > 0) {
            await db.students.clear();
            await db.students.bulkAdd(finalStudents);
            await saveAssessments(finalAssessments);
        }
        
        // Restore meta-state
        const savedActiveStudentId = localStorage.getItem("kiddy_active_student_id");
        const savedView = localStorage.getItem("kiddy_view");
        if (savedActiveStudentId) {
            const sid = JSON.parse(savedActiveStudentId);
            // Verify student still exists
            if (cloudStudents.some(s => s.id === sid) || localStudents.some(s => s.id === sid)) {
                setActiveStudentId(sid);
            }
        }
        if (savedView) setView(JSON.parse(savedView) as "assessment" | "report");
        
        setIsLoaded(true);
      } catch (err) {
        setSyncStatus('Gagal memuat data');
        console.error("Initialization failed:", err);
      } finally {
        setTimeout(() => setSyncStatus(null), 2000);
      }
    }
    
    if (!authLoading) initData();
  }, [user, authLoading]);

  const fillAllAssessments = () => {
    const newAssessments: StudentAssessment = { ...assessments };
    const scales: AssessmentScale[] = ["BB", "MB", "BSH", "BSB"];
    
    students.forEach(student => {
      if (!newAssessments[student.id]) newAssessments[student.id] = {};
      ASPECTS.forEach(aspect => {
        const aspectScores: ScoreData = {};
        aspect.indicators.forEach(indicator => {
          // Assign realistic variety: mostly BSH (2) and BSB (3), sometimes MB (1)
          const r = Math.random();
          const randomIdx = r > 0.9 ? 1 : (r > 0.4 ? 2 : 3);
          aspectScores[indicator.id] = scales[randomIdx];
        });
        newAssessments[student.id][aspect.id] = aspectScores;
      });
    });
    
    setAssessments(newAssessments);
  };

  const activeStudent = students.find(s => s.id === activeStudentId);
  const currentAspect = ASPECTS[activeAspectIndex];
  const currentScores = activeStudentId ? (assessments[activeStudentId]?.[currentAspect.id] || {}) : {};

  const handleAddStudent = (data: Omit<Student, "id">) => {
    const newStudent: Student = {
      ...data,
      id: crypto.randomUUID(),
      updatedAt: Date.now()
    };
    setStudents([...students, newStudent]);
    setActiveStudentId(newStudent.id);
  };

  const handleUpdateStudent = (student: Student) => {
    const updated = { ...student, updatedAt: Date.now() };
    setStudents(prev => prev.map(s => s.id === student.id ? updated : s));
    // If this is the active student, update local ref too
    if (activeStudentId === student.id) {
        // Active student derived from students array, so state update is enough
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Hapus data murid ini secara permanen? Data penilaian juga akan hilang.")) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      if (activeStudentId === studentId) setActiveStudentId(null);
      
      // Clean up assessments
      setAssessments(prev => {
        const newData = { ...prev };
        delete newData[studentId];
        return newData;
      });
    }
  };

  const handleScoreChange = (indicatorId: string, score: AssessmentScale) => {
    if (!activeStudentId) return;
    
    // Update timestamp on student for sync priority
    setStudents(prev => prev.map(s => s.id === activeStudentId ? { ...s, updatedAt: Date.now() } : s));

    setAssessments(prev => {
      const studentData = prev[activeStudentId] || {};
      const aspectData = studentData[currentAspect.id] || {};
      
      return {
        ...prev,
        [activeStudentId]: {
          ...studentData,
          [currentAspect.id]: {
            ...aspectData,
            [indicatorId]: score,
          }
        }
      };
    });
  };


  const TOTAL_INDICATORS = ASPECTS.reduce((acc, aspect) => acc + aspect.indicators.length, 0);

  const calculateGlobalProgress = (sid: string) => {
    const studentAssess = assessments[sid];
    if (!studentAssess) return 0;
    
    let filled = 0;
    ASPECTS.forEach(aspect => {
      filled += Object.keys(studentAssess[aspect.id] || {}).length;
    });
    
    return (filled / TOTAL_INDICATORS) * 100;
  };

  const activeGlobalProgress = activeStudentId ? calculateGlobalProgress(activeStudentId) : 0;

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-4 overflow-hidden relative">
         {/* Animated BG */}
         <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-md glass-card p-12 rounded-[3.5rem] dark:neon-cyan border-black/5 bg-white/5 backdrop-blur-xl relative z-10 flex flex-col items-center shadow-2xl"
         >
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center neon-cyan mb-8">
              <School className="w-10 h-10 text-cyan-400" />
            </div>
            
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2 text-center">
              Kiddy<span className="text-cyan-400">Assess</span>
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-[0.4em] font-black mb-12 text-center">Cloud Professional</p>

            <div className="w-full space-y-4">
               <button 
                 onClick={signInWithGoogle}
                 className="w-full py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95"
               >
                 <LogIn size={20} className="text-cyan-600" />
                 Masuk dengan Google
               </button>
               
               <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    Sinkronisasi otomatis ke cloud.<br />Akses dari mana saja, kapan saja.
                  </p>
               </div>
            </div>

            <p className="mt-12 text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">
              © 2024 Ardy Syafii & KiddyAssess Team
            </p>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full font-sans flex flex-col overflow-hidden relative text-main">
      <AnimatePresence>
        {(!isLoaded || showSplash) && (
          <motion.div
            key="loading-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent opacity-50" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center relative z-10"
            >
              <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center neon-cyan mb-8">
                <School className="w-12 h-12 text-cyan-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2 text-center">
                Kiddy<span className="text-cyan-400">Assess</span>
              </h1>
              <p className="text-[10px] md:text-sm text-cyan-400/50 uppercase tracking-[0.8em] font-black">
                {showSplash ? "Professional Edition" : "Menyiapkan Data..."}
              </p>
              
              <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphism Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-cyan-400/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>
      <div className="absolute top-[40%] left-[20%] w-64 h-64 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Student Manager Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex"
          >
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div 
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full shadow-2xl"
            >
              <OrganismStudentManager
                students={students}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onSelectStudent={(s) => {
                  setActiveStudentId(s.id);
                  setIsSidebarOpen(false);
                }}
                activeStudentId={activeStudentId || undefined}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OrganismHeader 
        studentName={activeStudent?.name || ""}
        studentClass={activeStudent?.class || ""}
        globalProgress={activeGlobalProgress}
        onMenuClick={() => setIsSidebarOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onBackToDashboard={activeStudentId ? () => setActiveStudentId(null) : undefined}
        theme={theme}
        onThemeToggle={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
      />

      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {!activeStudentId ? (
          <div className="flex-1 overflow-y-auto scaled-p-4 md:scaled-p-8 scaled-m-2 custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-5 md:scaled-gap-4"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-6">
                  {user?.photoURL && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg"
                    >
                      <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
                    </motion.div>
                  )}
                  <div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white mb-2">
                       {user?.displayName?.split(' ')[0] || "Guru"}
                    </h1>
                    <p className="text-sm text-slate-500 uppercase tracking-[0.2em] font-bold">KiddyAssess Dashboard</p>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-1">
                    <div className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                        {students.length}
                    </div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Murid Terdaftar</div>
                </div>
              </header>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Action Card: Add Student */}
                <div className="col-span-2 lg:col-span-1">
                   <button 
                     onClick={() => setIsSidebarOpen(true)}
                     className="w-full h-full min-h-[100px] md:min-h-[160px] rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-black/10 dark:border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex flex-col items-center justify-center gap-2 group p-2 md:p-3"
                   >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all">
                        <Plus className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="text-center">
                         <div className="text-sm md:text-lg font-bold text-slate-800 dark:text-white">Kelola Murid</div>
                         <div className="hidden md:block text-xs text-slate-500 dark:text-slate-400 mt-1">Daftarkan data baru</div>
                      </div>
                   </button>
                </div>
                
                {/* Student Selection Cards */}
                {students.map((student, idx) => {
                  const progress = calculateGlobalProgress(student.id);
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="h-full"
                    >
                      <div 
                        onClick={() => setActiveStudentId(student.id)}
                        className={cn(
                          "group glass-card p-2 md:p-3 rounded-2xl md:rounded-[2.5rem] hover:bg-white/10 transition-all cursor-pointer h-full flex flex-col justify-between overflow-hidden relative",
                          idx % 3 === 0 ? "dark:neon-cyan" : idx % 3 === 1 ? "dark:neon-pink" : "dark:neon-emerald"
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <div className="flex justify-between items-start mb-1.5 md:mb-2 relative z-10">
                          <div className={cn(
                            "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-3xl text-white font-black text-sm md:text-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform",
                            idx % 3 === 0 ? "bg-cyan-500 shadow-cyan-500/20" : idx % 3 === 1 ? "bg-pink-500 shadow-pink-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                          )}>
                            {student.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                          </div>
                          <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                             <ArrowRight className="w-3 h-3 md:w-5 md:h-5 text-slate-400 group-hover:text-inherit" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl md:text-3xl font-black truncate mb-0.5 group-hover:text-sky-400 transition-colors text-slate-800 dark:text-white">{student.name}</h3>
                          <div className="text-sm md:text-base font-bold text-slate-500 dark:text-white/30 tracking-tight mb-2 md:mb-3">{student.class}</div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs md:text-sm font-bold text-slate-500 dark:text-white/20 tracking-tight">Progress</span>
                              <span className={cn("text-xs md:text-base font-black", progress === 100 ? "text-emerald-500" : "text-sky-500")}>
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  progress === 100 ? "bg-emerald-400" : "bg-sky-400"
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Guide/Stats Footer Interaction */}
              <div className="glass-card p-2 md:p-3.5 rounded-2xl md:rounded-[3rem] border-sky-500/20 bg-gradient-to-r from-sky-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 overflow-hidden">
                <div className="flex-1 text-center md:text-left p-2">
                   <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 md:mb-2 text-color-primary">
                      <Sparkles className="w-4 h-4 md:w-6 md:h-6" />
                      <span className="text-sm md:text-base font-bold tracking-tight">Tips Profesional</span>
                   </div>
                   <h3 className="text-3xl md:text-5xl font-black mb-2 text-slate-900 dark:text-white leading-tight">
                     {appTheme.content.bannerTitle}
                   </h3>
                   <p className="text-base md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium tracking-tight">
                     {appTheme.content.bannerSubtitle}
                   </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto p-2">
                  <div className="flex-1 md:flex-none p-3 md:p-5 bg-black/5 dark:bg-white/5 rounded-2xl text-center md:px-10 border border-black/5">
                     <div className="text-xs md:text-sm font-bold text-slate-500 tracking-tight mb-1">Penyimpanan</div>
                     <div className="text-emerald-500 font-bold text-sm md:text-base">Status Online</div>
                  </div>
                  <div className="flex-1 md:flex-none p-3 md:p-4 bg-sky-500 rounded-2xl shadow-2xl shadow-sky-500/30 text-center md:px-8">
                     <div className="text-xs md:text-sm font-bold text-white/50 tracking-tight mb-1">Edisi Aplikasi</div>
                     <div className="text-white font-bold text-sm md:text-base">Guru Pro v2.0</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View Tabs */}
            <div className="px-4 py-2 flex flex-col md:flex-row justify-center items-center gap-3 bg-black/5 dark:bg-black/10 shrink-0">
              <nav className="flex gap-1 p-0.5 glass-panel rounded-lg">
                <button 
                  onClick={() => setView("assessment")}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-[11px] font-bold transition-all",
                    view === "assessment" ? "bg-sky-500/90 text-white shadow-md shadow-sky-500/20 backdrop-blur-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Assessment Grid
                </button>
                <button 
                  onClick={() => setView("report")}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-[11px] font-bold transition-all",
                    view === "report" ? "bg-sky-500/90 text-white shadow-md shadow-sky-500/20 backdrop-blur-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  Review Narasi
                </button>
              </nav>

              {view === "assessment" && (
                <div className="flex items-center gap-1 glass-panel p-0.5 rounded-lg ml-0 md:ml-4">
                  {ASPECTS.map((aspect, idx) => {
                     const isDone = Object.keys(assessments[activeStudentId]?.[aspect.id] || {}).length >= aspect.indicators.length;
                     return (
                      <button
                        key={aspect.id}
                        onClick={() => setActiveAspectIndex(idx)}
                        className={cn(
                          "relative px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                          activeAspectIndex === idx ? "bg-sky-500/20 text-sky-600 dark:text-sky-300" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        {aspect.name.split(' ')[0]}
                        {isDone && <CheckCircle2 className="w-2 h-2 text-emerald-500 absolute -top-0.5 -right-0.5" />}
                      </button>
                     );
                  })}
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-2 md:px-8 pb-24 md:pb-32">
              <AnimatePresence mode="wait" initial={false}>
                {view === "assessment" ? (
                  <motion.div
                    key={`assessment-${activeAspectIndex}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <OrganismIndikatorList 
                      studentId={activeStudentId!}
                      aspect={currentAspect}
                      scores={currentScores}
                      onScoreChange={handleScoreChange}
                      progress={Math.round((Object.keys(currentScores).length / currentAspect.indicators.length) * 100)}
                      lastSaved={lastSaved}
                      syncStatus={syncStatus}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <OrganismPDFPreview 
                      student={activeStudent!}
                      aspects={ASPECTS}
                      allScores={assessments[activeStudentId!] || {}}
                      globalProgress={activeGlobalProgress}
                      onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>



      <OrganismAppSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <footer className="fixed bottom-0 w-full px-4 md:px-8 py-2 md:py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-black/10 dark:border-white/5 flex items-center justify-between text-[9px] md:text-[10px] text-slate-600 dark:text-slate-400 font-bold tracking-tight z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px]",
              isSyncing ? "bg-amber-500 animate-bounce shadow-amber-500/50" : 
              syncErrors.length > 0 ? "bg-red-500 shadow-red-500/50" :
              "bg-emerald-500 animate-pulse shadow-emerald-500/50"
            )}></span>
            <span className={cn(
                "uppercase tracking-widest text-[8px] md:text-[10px]",
                syncErrors.length > 0 ? "text-red-500" : ""
            )}>
              {isSyncing ? "Sinkronisasi..." : syncStatus ? syncStatus : "Semua Data Terlindungi"}
            </span>
          </div>
          {lastSaved && !syncStatus && (
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-black/10 dark:border-white/10 uppercase tracking-widest opacity-60">
              <CheckCircle2 size={10} className="text-emerald-500" />
              Sesi Tersimpan: {lastSaved}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 uppercase tracking-[0.2em]">
          <div className="hidden md:block px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[8px]">Auto-Save: ON</div>
          <span>KiddyAssess Professional v2.5</span>
        </div>
      </footer>
    </div>
  );
}

