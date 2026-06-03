import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { OrganismHeader } from './OrganismHeader';
import { BottomNavigation } from './BottomNavigation';
import { OrganismStudentManager } from './OrganismStudentManager';
import { ModuleShell } from './ModuleShell';
import { PermissionProvider } from '../../context/PermissionContext';
import { LoadingSplash } from './LoadingSplash';
import { useAuthenticatedApp } from './useAuthenticatedApp';
import { getModuleById } from '../../registry/appModules';

export const AuthenticatedApp = ({ appData, navigation, showSplash }: any) => {
  return (
    <PermissionProvider>
      <AuthenticatedAppContent appData={appData} navigation={navigation} showSplash={showSplash} />
    </PermissionProvider>
  );
};

const AuthenticatedAppContent = ({ appData, navigation, showSplash }: any) => {
  const {
      moduleProps,
      isLoaded,
      roleSplash,
      userRole,
      isSidebarOpen,
      setIsSidebarOpen,
      sidebarAddMode,
      setSidebarAddMode,
      students,
      setStudents,
      getProgress,
      navigateToStudent,
      activeStudentId,
      view,
      setView,
      navigateToModule,
      activeStudent,
      handleNext,
      handlePrev,
      activeModule,
      isSyncing,
      syncProgress,
      currentSyncItem,
      triggerSync,
      lastSaved,
      backToStudents,
      backToDashboard,
  } = useAuthenticatedApp(appData, navigation, showSplash);

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
                onOpenSettings={() => navigateToModule('settings', false)} 
                currentView={view} 
                initialIsAdding={sidebarAddMode}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="no-print w-full flex-shrink-0 z-50">
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
      </div>

      <main className="flex-1 flex flex-col relative transition-all duration-500 overflow-y-auto overflow-x-hidden scroll-smooth pb-16">
        {activeModule && (
            <ModuleShell 
                activeModule={activeModule} 
                moduleProps={moduleProps} 
                isLoading={!isLoaded}
            />
        )}
      </main>

      <div className="no-print w-full flex-shrink-0">
        <BottomNavigation 
          currentView={view} 
          activeStudentId={activeStudentId}
          onNavigate={v => {
            const mod = getModuleById(v);
            navigateToModule(v, mod?.requiresStudent);
          }} 
        />
      </div>

      {/* FAB */}
      {view === 'students' && (
        <button
            className="no-print fixed bottom-20 right-6 z-40 bg-indigo-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
            onClick={moduleProps.onAddStudent}
        >
            <Plus size={24} />
        </button>
      )}
    </div>
  );
};


