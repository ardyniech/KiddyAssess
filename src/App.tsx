import { useState, useEffect } from "react";
import { Student, StudentAssessment, AssessmentScale } from "./types";
import { ASPECTS } from "./constants";
import { OrganismHeader } from "./components/organisms/OrganismHeader";
import { OrganismIndikatorList } from "./components/organisms/OrganismIndikatorList";
import { OrganismStudentManager } from "./components/organisms/OrganismStudentManager";
import { OrganismPDFPreview } from "./components/organisms/OrganismPDFPreview";
import { AtomText, AtomBadge } from "./components/atoms/CommonAtoms";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, FileText, Settings, Users, ChevronLeft, ChevronRight, CheckCircle2, Plus, ArrowRight, School, Sparkles } from "lucide-react";
import { cn } from "./lib/utils";

export default function App() {
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
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    const savedStudents = localStorage.getItem("kiddy_students");
    const savedAssessments = localStorage.getItem("kiddy_assessments");
    const savedActiveStudentId = localStorage.getItem("kiddy_active_student_id");
    const savedActiveAspectIndex = localStorage.getItem("kiddy_active_aspect_index");
    const savedView = localStorage.getItem("kiddy_view");

    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedAssessments) setAssessments(JSON.parse(savedAssessments));
    if (savedActiveStudentId) setActiveStudentId(JSON.parse(savedActiveStudentId));
    if (savedActiveAspectIndex) setActiveAspectIndex(JSON.parse(savedActiveAspectIndex));
    if (savedView) setView(JSON.parse(savedView) as "assessment" | "report");
  }, []);

  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("kiddy_students", JSON.stringify(students));
    localStorage.setItem("kiddy_assessments", JSON.stringify(assessments));
    localStorage.setItem("kiddy_active_student_id", JSON.stringify(activeStudentId));
    localStorage.setItem("kiddy_active_aspect_index", JSON.stringify(activeAspectIndex));
    localStorage.setItem("kiddy_view", JSON.stringify(view));
    setLastSaved(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  }, [students, assessments, activeStudentId, activeAspectIndex, view]);

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
    <div className="h-screen w-full bg-gradient-to-br from-[#1e293b] via-[#312e81] to-[#1e1b4b] text-slate-50 font-sans flex flex-col overflow-hidden relative">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-sky-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-sky-400/20 mb-8 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                <School className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white mb-2">KiddyAssess <span className="text-sky-400">v2.0</span></h1>
              <p className="text-xs text-slate-500 uppercase tracking-[0.5em] font-medium">Digital Teacher Assistant</p>
              
              <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="h-full bg-sky-400"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphism Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
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
        onBackToDashboard={activeStudentId ? () => setActiveStudentId(null) : undefined}
      />

      <main className="flex-1 overflow-hidden flex flex-col relative z-10">
        {!activeStudentId ? (
          <div className="flex-1 overflow-y-auto px-8 py-12 custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-6 md:space-y-12"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-black font-display tracking-tight mb-1 md:mb-2">
                    Selamat Datang, <span className="text-sky-400">Guru!</span> 👋
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 font-medium italic">KiddyAssess Dashboard Assessment Digital</p>
                </div>
                <div className="flex gap-2 md:gap-4 w-full md:w-auto">
                  <div className="flex-1 md:flex-none glass-card px-3 py-2 md:px-6 md:py-4 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-sky-400/10 rounded-lg flex items-center justify-center">
                       <Users className="w-4 h-4 md:w-5 md:h-5 text-sky-400" />
                    </div>
                    <div>
                      <div className="text-sm md:text-xl font-bold">{students.length}</div>
                      <div className="text-[8px] md:text-[10px] uppercase font-black text-slate-500 tracking-widest">Murid</div>
                    </div>
                  </div>
                  <div className="flex-1 md:flex-none glass-card px-3 py-2 md:px-6 md:py-4 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-400/10 rounded-lg flex items-center justify-center">
                       <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm md:text-xl font-bold">Aktif</div>
                      <div className="text-[8px] md:text-[10px] uppercase font-black text-slate-500 tracking-widest">Sesi</div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {/* Action Card: Add Student */}
                <div className="col-span-1 lg:col-span-1">
                   <button 
                     onClick={() => setIsSidebarOpen(true)}
                     className="w-full h-full min-h-[140px] md:min-h-[180px] rounded-2xl md:rounded-[2rem] border-2 border-dashed border-white/10 hover:border-sky-500/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 group"
                   >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500 transition-all">
                        <Plus className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="text-center px-4">
                         <div className="text-[10px] md:text-sm font-black uppercase tracking-widest">Kelola Murid</div>
                         <div className="hidden md:block text-[10px] text-slate-500 mt-1">Daftarkan data baru</div>
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
                        className="group glass-card p-4 md:p-6 rounded-2xl md:rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-sky-400/30 h-full flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-sky-400 text-white font-black text-xs md:text-base flex items-center justify-center shadow-lg shadow-sky-400/20 group-hover:rotate-6 transition-transform">
                            {student.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                          </div>
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-sky-400 transition-colors">
                             <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-slate-400 group-hover:text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm md:text-lg font-bold truncate mb-0.5 group-hover:text-sky-300 transition-colors">{student.name}</h3>
                          <div className="text-[8px] md:text-[10px] uppercase font-black text-white/30 tracking-[0.2em] mb-4">{student.class}</div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[7px] md:text-[8px] uppercase font-black text-white/20 tracking-widest">Progress Assessment</span>
                              <span className={cn("text-[8px] md:text-[10px] font-bold", progress === 100 ? "text-emerald-400" : "text-sky-400")}>
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
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
              <div className="glass-card p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-sky-500/20 bg-gradient-to-r from-sky-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="flex-1 text-center md:text-left">
                   <div className="flex items-center justify-center md:justify-start gap-2 mb-2 md:mb-3">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-sky-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Tips Profesional</span>
                   </div>
                   <h3 className="text-xl md:text-2xl font-black mb-2">Assessment Digital Praktis</h3>
                   <p className="text-[11px] md:text-sm text-slate-400 leading-relaxed max-w-xl">
                     Pilih murid untuk mulai evaluasi. KiddyAssess AI membantu narasi otomatis berdasarkan skor yang diberikan.
                   </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="flex-1 md:flex-none p-3 md:p-5 bg-white/5 rounded-2xl border border-white/5 text-center md:px-10">
                     <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Storage</div>
                     <div className="text-emerald-400 font-bold text-xs md:text-sm">Online</div>
                  </div>
                  <div className="flex-1 md:flex-none p-3 md:p-5 bg-sky-500 rounded-2xl shadow-2xl shadow-sky-500/30 text-center md:px-10">
                     <div className="text-[8px] md:text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Versi</div>
                     <div className="text-white font-bold text-xs md:text-sm">v2.0</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View Tabs */}
            <div className="px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/10">
              <nav className="flex gap-2 p-1 bg-black/20 rounded-2xl self-start">
                <button 
                  onClick={() => setView("assessment")}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-semibold transition-all",
                    view === "assessment" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-400 hover:text-white"
                  )}
                >
                  Assessment Grid
                </button>
                <button 
                  onClick={() => setView("report")}
                  className={cn(
                    "px-6 py-2 rounded-xl text-sm font-semibold transition-all",
                    view === "report" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-400 hover:text-white"
                  )}
                >
                  Review Narasi
                </button>
              </nav>

              {view === "assessment" && (
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-2xl">
                  {ASPECTS.map((aspect, idx) => {
                     const isDone = Object.keys(assessments[activeStudentId]?.[aspect.id] || {}).length >= aspect.indicators.length;
                     return (
                      <button
                        key={aspect.id}
                        onClick={() => setActiveAspectIndex(idx)}
                        className={cn(
                          "relative px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          activeAspectIndex === idx ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {aspect.name.split(' ')[0]}
                        {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 absolute -top-0.5 -right-0.5" />}
                      </button>
                     );
                  })}
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-32">
              <AnimatePresence mode="wait" initial={false}>
                {view === "assessment" ? (
                  <motion.div
                    key={`assessment-${activeAspectIndex}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
                      <div className="lg:col-span-2 p-6 rounded-3xl glass-card flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-light mb-1">
                            {Object.keys(currentScores).length} <span className="text-lg opacity-40">/ {currentAspect.indicators.length}</span>
                          </div>
                          <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">Indikator Terisi ({currentAspect.name})</div>
                        </div>
                        <div className="w-1/2 h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(Object.keys(currentScores).length / currentAspect.indicators.length) * 100}%` }}
                            className="h-full bg-sky-400"
                          />
                        </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 flex flex-col items-center justify-center">
                        <div className="text-emerald-400 font-bold text-xl">{Math.round((Object.keys(currentScores).length / currentAspect.indicators.length) * 100)}%</div>
                        <div className="text-[10px] text-emerald-500/70 uppercase font-bold tracking-widest mt-1">
                          {lastSaved ? `Tersimpan ${lastSaved}` : "Auto-Saving..."}
                        </div>
                      </div>
                    </div>

                    <OrganismIndikatorList 
                      aspect={currentAspect}
                      scores={currentScores}
                      onScoreChange={handleScoreChange}
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
                      aspect={currentAspect}
                      scores={currentScores}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>



      {/* Footer Status Bar overlay */}
      <footer className="fixed bottom-0 w-full px-8 py-3 bg-black/10 backdrop-blur-sm border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest z-0 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistem Online: Cloud Sync v2.0
        </div>
        <div className="font-medium">KiddyAssess Guru TK Engine</div>
      </footer>
    </div>
  );
}

