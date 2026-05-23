import React, { useState, useEffect, useCallback } from "react";
import { Student, StudentAssessment, AssessmentScale, ScoreData, SchoolProfile } from "./types";
import { OrganismDashboard } from "./components/organisms/OrganismDashboard";
import { ASPECTS } from "./constants";
import { useCurriculum } from "./context/CurriculumContext";
import { db, saveAssessments, loadAssessments, saveNarrativesLocal, loadNarrativesLocal, StudentNarratives, SavedNarrative } from "./lib/db";
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
import { LayoutDashboard, FileText, Settings, Users, ChevronLeft, ChevronRight, CheckCircle2, Plus, ArrowRight, School, Sparkles, LogIn, Globe, LogOut } from "lucide-react";
import { cn } from "./lib/utils";
import { getSchoolProfile } from "./services/settingsService";

import { AuthProvider } from "./context/AuthContext";
import { CurriculumProvider } from "./context/CurriculumContext";

export default function RootApp() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CurriculumProvider>
          <App />
        </CurriculumProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function App() {
  const { aspects: curriculumAspects } = useCurriculum();
  const aspects = curriculumAspects.length > 0 ? curriculumAspects : ASPECTS;
  const { theme: appTheme } = useAppTheme();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<StudentAssessment>({});
  const [narratives, setNarratives] = useState<StudentNarratives>({});
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeAspectIndex, setActiveAspectIndex] = useState(0);
  const [view, setView] = useState<"dashboard" | "assessment" | "report">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
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


  // 1. Immediate Local Save (Robust Offline-First)
  useEffect(() => {
    if (!user || !isLoaded) return;
    if (students.length === 0 && Object.keys(assessments).length === 0 && Object.keys(narratives).length === 0) return;

    const saveLocal = async () => {
      try {
        await Promise.all([
          db.students.bulkPut(students),
          saveAssessments(assessments),
          saveNarrativesLocal(narratives)
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
  }, [students, assessments, narratives, activeStudentId, activeAspectIndex, view, user, isLoaded]);

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
               await syncService.saveAssessment(sid, assessments[sid], narratives[sid] || null);
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
        const [cloudStudents, cloudAssessmentsResult, localStudents, localAssessments, localNarratives] = await Promise.all([
          syncService.getStudents(),
          syncService.getAssessments(),
          db.students.toArray(),
          loadAssessments(),
          loadNarrativesLocal()
        ]);

        const cloudAssessments = cloudAssessmentsResult.assessments || {};
        const cloudNarratives = cloudAssessmentsResult.narratives || {};

        console.log("Init Data: ", { cloudLen: cloudStudents.length, localLen: localStudents.length });

        // Logic: Local is primary for speed. Cloud is secondary for persistence.
        // We initialize with Local first, then potentially update with Cloud.
        let finalStudents = localStudents;
        let finalAssessments = localAssessments;
        let finalNarratives = localNarratives;

        // If Cloud exists, we evaluate if we should use it.
        // For simplicity: If local is empty, use cloud.
        // If both exist, we could compare timestamps, but for now let's just log.
        if (cloudStudents.length > 0) {
            if (localStudents.length === 0) {
                finalStudents = cloudStudents;
                finalAssessments = cloudAssessments;
                finalNarratives = cloudNarratives;
            } else {
                // Determine which is newer. 
                // We'll compare the max updatedAt from cloud vs local.
                const cloudMax = Math.max(...cloudStudents.map(s => s.updatedAt || 0));
                const localMax = Math.max(...localStudents.map(s => s.updatedAt || 0));
                
                if (cloudMax > localMax) {
                    console.log("Cloud is newer. Updating local.");
                    finalStudents = cloudStudents;
                    finalAssessments = cloudAssessments;
                    finalNarratives = cloudNarratives;
                } else {
                    console.log("Local is newer or equal. Keeping local.");
                }
            }
        }

        setStudents(finalStudents);
        setAssessments(finalAssessments);
        setNarratives(finalNarratives);

        // Background: Ensure Local DB is exactly what we have in state
        if (finalStudents.length > 0) {
            await db.students.clear();
            await db.students.bulkAdd(finalStudents);
            await saveAssessments(finalAssessments);
            await saveNarrativesLocal(finalNarratives);
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
      aspects.forEach(aspect => {
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
  const currentAspect = aspects[activeAspectIndex];
  const currentScores = activeStudentId ? (assessments[activeStudentId]?.[currentAspect.id] || {}) : {};

  // Calculate actual progress for each student
  const getStudentProgress = useCallback((sid: string) => {
    const studentAssess = assessments[sid];
    if (!studentAssess) return 0;
    
    let filled = 0;
    const totalIndicators = aspects.reduce((acc, aspect) => acc + aspect.indicators.length, 0);
    
    aspects.forEach(aspect => {
      filled += Object.keys(studentAssess[aspect.id] || {}).length;
    });
    
    return totalIndicators > 0 ? (filled / totalIndicators) * 100 : 0;
  }, [assessments]);

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
                getStudentProgress={getStudentProgress}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onSelectStudent={(s) => {
                  setActiveStudentId(s.id);
                  setView("assessment");
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
        globalProgress={activeStudentId ? getStudentProgress(activeStudentId) : 0}
        onMenuClick={() => setIsSidebarOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onBackToDashboard={() => {
            setActiveStudentId(null);
            setView("dashboard");
        }}
      />

      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {!activeStudentId || view === "dashboard" ? (
          <OrganismDashboard 
             students={students}
             assessments={assessments}
             aspects={aspects}
             onSelectStudent={(sid) => {
               if (sid) {
                 setActiveStudentId(sid);
                 setView("assessment");
               }
             }}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Unified Control & Agile Navigation Panel */}
            <div className="w-full bg-white dark:bg-slate-950 border-b border-slate-250/20 dark:border-slate-800 shrink-0">
              {/* Row 1: View Mode Switcher + Student Quick Link */}
              <div className="px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      setActiveStudentId(null);
                      setView("dashboard");
                    }}
                    className="px-2 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
                  >
                    ← Beranda
                  </button>
                  <span className="text-[10px] font-black text-slate-350 dark:text-slate-700">|</span>
                  <span className="text-[11px] font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    Murid: <span className="text-sky-500 font-extrabold">{activeStudent?.name}</span> ({activeStudent?.class})
                  </span>
                </div>

                {/* Main Action View Switcher */}
                <div className="flex gap-1 p-0.5 bg-slate-200/60 dark:bg-slate-900/80 rounded-xl border border-black/5">
                  <button 
                    onClick={() => setView("assessment")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1",
                      view === "assessment" 
                        ? "bg-sky-500 text-white shadow-sm" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    )}
                  >
                    Grid Nilai
                  </button>
                  <button 
                    onClick={() => setView("report")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1",
                      view === "report" 
                        ? "bg-sky-500 text-white shadow-sm" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                    )}
                  >
                    Review Narasi
                  </button>
                </div>
              </div>

              {/* Row 2: Aspect Jumper Navigation Grid */}
              <div className="px-3 py-1.5 flex items-center gap-2 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-white dark:bg-slate-950">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded shrink-0">
                  Akses Cepat Aspek:
                </span>
                <div className="flex items-center gap-2 select-none shrink-0">
                  {aspects.map((aspect, idx) => {
                     const scoredIndicators = Object.keys(assessments[activeStudentId!]?.[aspect.id] || {}).length;
                     const totalIndicators = aspect.indicators.length;
                     const isDone = scoredIndicators >= totalIndicators;
                     
                     const studentNarrative = narratives[activeStudentId!]?.[aspect.id];
                     const hasNarrative = !!studentNarrative?.narrative?.trim();
                     const hasAdvice = !!studentNarrative?.advice?.trim();

                     const isSelected = view === "assessment" ? activeAspectIndex === idx : false;

                     let themeStyles = "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900";

                     if (isSelected) {
                       themeStyles = "border-sky-500 dark:border-sky-400 text-sky-700 dark:text-sky-350 bg-sky-500/10 font-bold ring-1 ring-sky-500/20";
                     } else if (isDone && hasNarrative && hasAdvice) {
                       themeStyles = "border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10";
                     } else if (isDone || hasNarrative || hasAdvice) {
                       themeStyles = "border-amber-200 dark:border-amber-500/20 text-amber-850 dark:text-amber-300 bg-amber-500/5 hover:bg-amber-500/10";
                     }

                     const shortAspectName = aspect.name.toLowerCase().includes("agama") ? "Agama & Moral" :
                                             aspect.name.toLowerCase().includes("motorik") ? "Fisik Motorik" : "Kognitif";

                     return (
                      <button
                        key={aspect.id}
                        onClick={() => {
                          if (view === "assessment") {
                            setActiveAspectIndex(idx);
                          } else {
                            // Smooth scroll inside report preview
                            const editorEl = document.getElementById(`aspect-editor-${aspect.id}`);
                            const previewEl = document.getElementById(`aspect-preview-${aspect.id}`);
                            const targetElement = editorEl || previewEl;
                            if (targetElement) {
                              targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }
                        }}
                        className={cn(
                          "px-2.5 py-1 text-xs font-bold leading-tight border transition-all duration-150 rounded-xl hover:scale-[1.01] active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer shadow-xs",
                          themeStyles
                        )}
                      >
                        <span className="font-extrabold truncate text-[11px]">{idx + 1}. {shortAspectName}</span>
                        <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800 text-[9px]">
                          <span className={cn("font-black", isDone ? "text-emerald-500" : "text-slate-500")}>
                            {scoredIndicators}/{totalIndicators}
                          </span>
                          {hasNarrative && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse ml-0.5" title="Narasi Terisi" />
                          )}
                        </div>
                      </button>
                     );
                  })}
                </div>
              </div>
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
                      aspects={aspects}
                      allScores={assessments[activeStudentId!] || {}}
                      globalProgress={getStudentProgress(activeStudentId!)}
                      onOpenSettings={() => setIsSettingsOpen(true)}
                      savedNarratives={narratives[activeStudentId!] || {}}
                      onNarrativesChange={(studentNarratives) => {
                        setNarratives(prev => ({
                          ...prev,
                          [activeStudentId!]: studentNarratives
                        }));
                      }}
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

