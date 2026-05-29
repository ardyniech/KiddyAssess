import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { School, CheckCircle2, Fingerprint, ShieldCheck, Key, Settings2, Plus } from 'lucide-react';
import { AssessmentScale } from '../../types';
import { OrganismHeader } from './OrganismHeader';
import { OnboardingWizard } from './OnboardingWizard';
import { BottomNavigation } from './BottomNavigation';
import { OrganismDashboard } from './OrganismDashboard';
import { OrganismStudentManager } from './OrganismStudentManager';
import { OrganismAssessmentHub } from './OrganismAssessmentHub';
import { OrganismReportGenerator } from './reports/OrganismReportGenerator';
import { OrganismStudentPage } from './student-manager/OrganismStudentPage';
import { OrganismAppSettings } from './OrganismAppSettings';
import { useCurriculum } from '../../context/CurriculumContext';
import { ASPECTS } from '../../constants';
import { APP_MODULES, getModuleById } from '../../registry/appModules';
import { ModuleShell } from './ModuleShell';
import { StaffModule } from './admin/StaffModule';
import { FinanceModule } from './admin/FinanceModule';
import { InventoryModule } from './admin/InventoryModule';
import { cn } from '../../lib/utils';
import { PermissionProvider, usePermissions } from '../../context/PermissionContext';

export const AuthenticatedApp = ({ appData, navigation, showSplash }: any) => {
  return (
    <PermissionProvider>
      <AuthenticatedAppContent appData={appData} navigation={navigation} showSplash={showSplash} />
    </PermissionProvider>
  );
};

const AuthenticatedAppContent = ({ appData, navigation, showSplash }: any) => {
  const { aspects: curr } = useCurriculum();
  const aspects = curr.length > 0 ? curr : ASPECTS;
  const { students, setStudents, assessments, setAssessments, narratives, setNarratives, events, setEvents, tasks, setTasks, isLoaded, isSyncing, syncStatus, syncErrors, lastSaved, syncProgress, currentSyncItem, triggerSync } = appData;
  const { userRole } = usePermissions();
  const { view, setView, activeStudentId, setActiveStudentId, activeAspectIndex, setActiveAspectIndex, isSidebarOpen, setIsSidebarOpen, isSettingsOpen, setIsSettingsOpen, navigateToStudent, navigateToModule, backToDashboard, backToStudents, onNarrativesChange } = navigation;
  const [sidebarAddMode, setSidebarAddMode] = React.useState(false);

  // High contrast role-switching transition screen handler
  const [roleSplash, setRoleSplash] = React.useState(false);
  const lastRoleRef = React.useRef(userRole);

  React.useEffect(() => {
    if (userRole && lastRoleRef.current !== userRole) {
      lastRoleRef.current = userRole;
      setRoleSplash(true);
      setView("dashboard");
      setActiveStudentId(null);
      const timer = setTimeout(() => {
        setRoleSplash(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userRole]);

  const activeStudent = React.useMemo(() => 
    students.find((s: any) => s.id === activeStudentId),
  [students, activeStudentId]);
  
  // Dynamic process flow based on modules that require student
  const studentModules = APP_MODULES.filter(m => m.requiresStudent).sort((a, b) => (a.order || 0) - (b.order || 0));
  const processFlow: string[] = studentModules.map(m => m.id);
  
  const handleNext = () => {
    const currentIndex = processFlow.indexOf(view);
    if (currentIndex < processFlow.length - 1) {
      setView(processFlow[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const currentIndex = processFlow.indexOf(view);
    if (currentIndex > 0) {
      setView(processFlow[currentIndex - 1]);
    } else if (currentIndex === 0) {
      backToStudents();
    }
  };

  const getProgress = (sid: string) => {
    const studentAssess = assessments[sid]; if (!studentAssess) return 0;
    let filled = 0, total = 0;
    aspects.forEach(a => {
        total += a.indicators.length;
        const indicatorsInAspect = a.indicators.map(i => i.id);
        const scoredInAspect = Object.keys(studentAssess[a.id] || {}).filter(key => indicatorsInAspect.includes(key));
        filled += scoredInAspect.length;
    });
    const progress = total > 0 ? (filled / total) * 100 : 0;
    return Math.min(100, progress);
  };

  const activeModule = getModuleById(view);

  const handleScoreChange = (indicatorId: string, score: AssessmentScale, aspectId?: string) => {
      if (!activeStudentId || !aspectId) return;
      setAssessments((prev: any) => ({
          ...prev,
          [activeStudentId]: {
              ...(prev[activeStudentId] || {}),
              [aspectId]: {
                  ...(prev[activeStudentId]?.[aspectId] || {}),
                  [indicatorId]: score
              }
          }
      }));
  };

  // Modularize Props Injection
  const moduleProps: any = {
      students,
      setStudents,
      assessments,
      setAssessments,
      narratives,
      setNarratives,
      aspects,
      activeStudentId,
      activeStudent,
      student: activeStudent,
      onSelectStudent: navigateToStudent,
      onViewStudents: () => navigateToModule("students", false),
      getStudentProgress: getProgress,
      onAddStudent: () => {
          setSidebarAddMode(true);
          setIsSidebarOpen(true);
      },
      onEditStudent: (s: any) => {
          setStudents((prev: any) => prev.map((old: any) => old.id === s.id ? s : old));
      },
      onDeleteStudent: (id: any) => setStudents((prev: any) => prev.filter((s: any) => s.id !== id)),
      setView: (v: string) => {
        const mod = getModuleById(v);
        navigateToModule(v, mod?.requiresStudent);
      },
      onOpenSettings: () => navigateToModule('settings', false),
      activeAspectIndex,
      onAspectChange: setActiveAspectIndex,
      scores: assessments[activeStudentId] || {},
      allScores: assessments[activeStudentId] || {},
      onScoreChange: handleScoreChange,
      savedNarratives: narratives[activeStudentId] || {},
      onNarrativesChange: (n: any) => setNarratives({...narratives, [activeStudentId]: n}),
      globalProgress: activeStudentId ? getProgress(activeStudentId) : 0,
      events,
      setEvents,
      tasks,
      setTasks,
  };

  return (
    <div className="min-h-[100dvh] w-full font-sans flex flex-col relative bg-slate-50">
      <AnimatePresence>{(!isLoaded || showSplash || roleSplash) && <LoadingSplash splashOnly={showSplash} userRole={userRole} />}</AnimatePresence>
      
      
      {/* Sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[70] flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => {
              setIsSidebarOpen(false);
              setSidebarAddMode(false);
            }} />
            <motion.div initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} className="relative w-full max-w-sm h-full shadow-2xl bg-white">
              <OrganismStudentManager 
                students={students} 
                getStudentProgress={getProgress} 
                onAddStudent={s => {
                  setStudents([...students, {...s, id: crypto.randomUUID(), updatedAt: Date.now()}]);
                  setSidebarAddMode(false);
                }} 
                onUpdateStudent={s => {
                  setStudents((prev: any) => prev.map((old: any) => old.id === s.id ? s : old));
                  setSidebarAddMode(false);
                }} 
                onDeleteStudent={id => setStudents((prev: any) => prev.filter((s: any) => s.id !== id))} 
                onSelectStudent={navigateToStudent} 
                activeStudentId={activeStudentId} 
                onClose={() => {
                  setIsSidebarOpen(false);
                  setSidebarAddMode(false);
                }} 
                setView={setView} 
                onOpenSettings={() => {
                  navigateToModule('settings', false);
                }} 
                currentView={view} 
                initialIsAdding={sidebarAddMode}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OrganismHeader 
        studentName={activeStudent?.name} 
        studentClass={activeStudent?.kelompok} 
        globalProgress={activeStudentId ? getProgress(activeStudentId) : 0} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        onSettingsClick={() => navigateToModule('settings', false)} 
        onNavigate={v => {
          const mod = getModuleById(v);
          navigateToModule(v, mod?.requiresStudent);
        }}
        onBackToDashboard={activeStudentId ? backToStudents : backToDashboard} 
        onNext={handleNext}
        onPrev={handlePrev}
        view={view} 
        activeModule={activeModule}
        isSyncing={isSyncing}
        syncProgress={syncProgress}
        currentSyncItem={currentSyncItem}
        triggerSync={triggerSync}
        lastSaved={lastSaved}
      />

      <main className="flex-1 flex flex-col relative transition-all duration-500 overflow-y-auto overflow-x-hidden scroll-smooth pb-16">
        {activeModule && (
            <ModuleShell 
                activeModule={activeModule} 
                moduleProps={moduleProps} 
                isLoading={!isLoaded}
            />
        )}
      </main>

      <BottomNavigation 
        currentView={view} 
        activeStudentId={activeStudentId}
        onNavigate={v => {
          const mod = getModuleById(v);
          navigateToModule(v, mod?.requiresStudent);
        }} 
      />

      {/* FAB */}
      {view === 'students' && (
        <button
            className="fixed bottom-20 right-6 z-40 bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
            onClick={moduleProps.onAddStudent}
        >
            <Plus size={24} />
        </button>
      )}
    </div>
  );
};

const LoadingSplash = ({ splashOnly, userRole }: any) => {
    let title = "Kiddy";
    let highlight = "Apps";
    let subtitle = "MEMULAI SISTEM INTI";
    let icon = School;
    let colorClass = "text-indigo-600";
    let bgBlurColorClass = "bg-indigo-50/50";
    let iconBgClass = "bg-indigo-600";
    
    if (userRole === 'MASTER') {
        title = "Master";
        highlight = "Kiddy";
        subtitle = "PENGENDALI UTAMA SISTEM";
        icon = Fingerprint;
        colorClass = "text-red-600";
        bgBlurColorClass = "bg-red-50/50";
        iconBgClass = "bg-red-600";
    } else if (userRole === 'SUPER_USER') {
        title = "Kiddy";
        highlight = "Yayasan";
        subtitle = "PANTAUAN STRATEGIK";
        icon = ShieldCheck;
        colorClass = "text-amber-600";
        bgBlurColorClass = "bg-amber-50/50";
        iconBgClass = "bg-amber-600";
    } else if (userRole === 'ADMIN') {
        title = "TK Ceria";
        highlight = "Bahagia";
        subtitle = "DASHBOARD KEPALA SEKOLAH";
        icon = Key;
        colorClass = "text-emerald-600";
        bgBlurColorClass = "bg-emerald-50/50";
        iconBgClass = "bg-emerald-600";
    } else if (userRole === 'TEACHER') {
        title = "Kiddy";
        highlight = "Apps";
        subtitle = "BELAJAR TERBANTU AI";
        icon = School;
        colorClass = "text-indigo-600";
        bgBlurColorClass = "bg-indigo-50/50";
        iconBgClass = "bg-indigo-600";
    } else if (userRole === 'OPERATOR') {
        title = "TU Kiddy";
        highlight = "Apps";
        subtitle = "TERMINAL OPERATOR DATA";
        icon = Settings2;
        colorClass = "text-purple-600";
        bgBlurColorClass = "bg-purple-50/50";
        iconBgClass = "bg-[#7E5CAD]";
    }

    if (splashOnly) subtitle = "KiddyApps v3.0";

    const IconComponent = icon;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        },
        exit: { 
            opacity: 0,
            scale: 1.05,
            filter: "blur(10px)",
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0, scale: 0.95 },
        visible: { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            transition: { type: "spring", stiffness: 200, damping: 20 }
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
        >
            {/* Soft Ambient Contrast-safe Background Spot */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className={cn("absolute inset-0 w-full h-full blur-[80px] pointer-events-none", bgBlurColorClass)} 
            />
            
            <motion.div className="flex flex-col items-center max-w-sm w-full relative z-10 px-4">
                {/* Modern High-contrast Rounded Launcher Icon Iconography */}
                <motion.div 
                    variants={itemVariants}
                    className={cn("w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg mb-8 relative overflow-hidden text-white", iconBgClass)}
                >
                    <IconComponent className="w-9 h-9 text-white relative z-10" />
                    <motion.div 
                        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.35, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-white"
                    />
                </motion.div>
                
                {/* Compact, ultra-legible, centered title */}
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 w-full">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase flex flex-wrap items-center justify-center gap-1.5 w-full">
                        <span>{title}</span>
                        <span className={colorClass}>{highlight}</span>
                    </h1>
                    
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex items-center gap-3 w-full mt-1"
                    >
                        <div className="h-[1.5px] flex-1 bg-slate-200" />
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider whitespace-nowrap px-1">
                            {subtitle}
                        </span>
                        <div className="h-[1.5px] flex-1 bg-slate-200" />
                    </motion.div>
                </motion.div>

                {/* Micro active progress sequence indicator */}
                <motion.div 
                    variants={itemVariants}
                    className="mt-10 flex items-center gap-1.5"
                >
                    {[0, 1, 2].map(i => (
                        <motion.div 
                            key={i}
                            animate={{ 
                                scale: [1, 1.4, 1],
                                opacity: [0.3, 1, 0.3] 
                            }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                            className={cn("w-2 h-2 rounded-full", iconBgClass)}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};


