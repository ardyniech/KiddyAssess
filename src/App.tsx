import { useState, useEffect, useCallback } from "react";
import { Student, StudentAssessment, AssessmentScale, ScoreData } from "./types";
import { ASPECTS } from "./constants";
import { db, saveAssessments, loadAssessments } from "./lib/db";
import { OrganismHeader } from "./components/organisms/OrganismHeader";
import { OrganismIndikatorList } from "./components/organisms/OrganismIndikatorList";
import { OrganismStudentManager } from "./components/organisms/OrganismStudentManager";
import { OrganismPDFPreview } from "./components/organisms/OrganismPDFPreview";
import { OrganismAppSettings } from "./components/organisms/OrganismAppSettings";
import { ThemeProvider, useAppTheme } from "./context/ThemeContext";
import { AtomText, AtomBadge } from "./components/atoms/CommonAtoms";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, FileText, Settings, Users, ChevronLeft, ChevronRight, CheckCircle2, Plus, ArrowRight, School, Sparkles } from "lucide-react";
import { cn } from "./lib/utils";
import { getSchoolProfile } from "./services/settingsService";
import { syncToCloud } from "./services/syncService";

export default function RootApp() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

function App() {
  const { theme: appTheme } = useAppTheme();
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Ahmad Fauzi", class: "Kelompok A (TK-A)", semester: "1 (Ganjil)" },
    { id: "2", name: "Siti Aminah", class: "Kelompok A (TK-A)", semester: "1 (Ganjil)" },
    { id: "3", name: "Budi Santoso", class: "Kelompok B (TK-B)", semester: "1 (Ganjil)" },
    { id: "4", name: "Laila Sari", class: "Kelompok B (TK-B)", semester: "2 (Genap)" },
    { id: "5", name: "Rizky Ramadhan", class: "Kelompok A (TK-A)", semester: "1 (Ganjil)" }
  ]);
  const [assessments, setAssessments] = useState<StudentAssessment>({});
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeAspectIndex, setActiveAspectIndex] = useState(0);
  const [view, setView] = useState<"assessment" | "report">("assessment");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem("kiddy_theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("kiddy_theme", theme);
  }, [theme]);

  const [isSaving, setIsSaving] = useState(false);

  // Initial Load from IndexedDB
  useEffect(() => {
    async function initData() {
      const savedStudents = await db.students.toArray();
      const savedAssessments = await loadAssessments();
      
      const savedActiveStudentId = localStorage.getItem("kiddy_active_student_id");
      const savedActiveAspectIndex = localStorage.getItem("kiddy_active_aspect_index");
      const savedView = localStorage.getItem("kiddy_view");

      if (savedStudents.length > 0) setStudents(savedStudents);
      setAssessments(savedAssessments);
      
      if (savedActiveStudentId) setActiveStudentId(JSON.parse(savedActiveStudentId));
      if (savedActiveAspectIndex) setActiveAspectIndex(JSON.parse(savedActiveAspectIndex));
      if (savedView) setView(JSON.parse(savedView) as "assessment" | "report");
    }
    
    initData();
  }, []);

  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Robust Auto-Save logic
  useEffect(() => {
    const saveToDB = async () => {
      setIsSaving(true);
      try {
        await Promise.all([
          db.students.clear().then(() => db.students.bulkAdd(students)),
          saveAssessments(assessments)
        ]);
        
        localStorage.setItem("kiddy_active_student_id", JSON.stringify(activeStudentId));
        localStorage.setItem("kiddy_active_aspect_index", JSON.stringify(activeAspectIndex));
        localStorage.setItem("kiddy_view", JSON.stringify(view));
        
        // Cloud Sync if enabled
        const profile = await getSchoolProfile();
        if (profile?.enableCloudSync) {
            await syncToCloud(students, assessments, profile);
        }

        setLastSaved(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        // Small delay to prevent flickering
        setTimeout(() => setIsSaving(false), 800);
      }
    };

    const timer = setTimeout(saveToDB, 1500); // Debounced save
    return () => clearTimeout(timer);
  }, [students, assessments, activeStudentId, activeAspectIndex, view]);

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
    };
    setStudents([...students, newStudent]);
    setActiveStudentId(newStudent.id);
  };

  const handleScoreChange = (indicatorId: string, score: AssessmentScale) => {
    if (!activeStudentId) return;
    
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

  const handleBulkScoreChange = (aspectId: string, indicatorId: string, score: AssessmentScale) => {
    setAssessments(prev => {
      const newAssessments = { ...prev };
      students.forEach(student => {
        if (!newAssessments[student.id]) newAssessments[student.id] = {};
        if (!newAssessments[student.id][aspectId]) newAssessments[student.id][aspectId] = {};
        newAssessments[student.id][aspectId][indicatorId] = score;
      });
      return newAssessments;
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

  return (
    <div className="h-screen w-full font-sans flex flex-col overflow-hidden relative text-main">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent opacity-50" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center relative z-10"
            >
              <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center neon-cyan mb-8 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-transparent" />
                <School className="w-12 h-12 text-cyan-400" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-2 text-center">
                Kiddy<span className="text-cyan-400">Assess</span>
              </h1>
              <p className="text-[10px] md:text-sm text-cyan-400/50 uppercase tracking-[0.8em] font-black">Professional Edition</p>
              
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
            className="fixed inset-0 z-50 flex"
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
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight mb-1 md:mb-2 text-slate-900 dark:text-white leading-tight">
                    Selamat Datang, <span className="text-cyan-500 dark:text-cyan-400">Guru!</span> 👋
                  </h1>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium italic">KiddyAssess Dashboard Assessment Digital</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="flex-1 md:flex-none glass-card px-3 py-2 md:px-5 md:py-3.5 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 border-black/5 dark:neon-cyan bg-white/50 dark:bg-slate-900/40">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 md:w-14 md:h-14 bg-cyan-400/10 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 md:w-8 md:h-8 text-cyan-400" />
                       </div>
                       <button 
                         onClick={fillAllAssessments}
                         className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white text-[9px] md:text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-2"
                       >
                         <Sparkles size={12} />
                         Simulasi
                       </button>
                    </div>
                    <div>
                      <div className="text-xl md:text-4xl font-black text-slate-800 dark:text-white leading-none mb-1">{students.length}</div>
                      <div className="text-[10px] md:text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight">Murid Terdaftar</div>
                    </div>
                  </div>
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
                      onBulkScoreChange={(indicatorId, score) => handleBulkScoreChange(currentAspect.id, indicatorId, score)}
                      progress={Math.round((Object.keys(currentScores).length / currentAspect.indicators.length) * 100)}
                      lastSaved={lastSaved}
                      isSaving={isSaving}
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
              isSaving ? "bg-amber-500 animate-bounce shadow-amber-500/50" : "bg-emerald-500 animate-pulse shadow-emerald-500/50"
            )}></span>
            <span className="uppercase tracking-widest">
              {isSaving ? "Sinkronisasi ke LocalDB..." : "Penyimpanan Lokal Aktif (IndexedDB)"}
            </span>
          </div>
          {lastSaved && !isSaving && (
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

