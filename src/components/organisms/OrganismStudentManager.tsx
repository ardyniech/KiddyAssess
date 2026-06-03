import React from "react";
import { Student } from "../../types";
import { X, ChevronLeft } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { StudentUpsertForm } from "./student-manager/StudentUpsertForm";
import { DeleteConfirmationDialog } from "./student-manager/DeleteConfirmationDialog";
import { usePermissions } from "../../context/PermissionContext";
import { StudentTabContent } from "./student-manager/StudentTabContent";
import { useStudentManager } from "./student-manager/useStudentManager";

interface OrganismStudentManagerProps {
  students: Student[];
  getStudentProgress: (sid: string) => number;
  onAddStudent: (student: Omit<Student, "id">) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onSelectStudent: (student: Student) => void;
  activeStudentId?: string;
  onClose: () => void;
  setView: (view: any) => void;
  onOpenSettings: () => void;
  currentView: any;
  initialIsAdding?: boolean;
}

export function OrganismStudentManager({ 
  students, 
  getStudentProgress, 
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent, 
  onSelectStudent, 
  activeStudentId, 
  onClose, 
  setView, 
  onOpenSettings, 
  currentView, 
  initialIsAdding = false 
}: OrganismStudentManagerProps) {
  const { userRole } = usePermissions();
  const isReadOnly = userRole === 'SUPER_USER'; 

  const {
      isAdding, setIsAdding,
      activeTab, setActiveTab,
      editingStudent, setEditingStudent,
      search, setSearch,
      rombelFilter, setRombelFilter,
      studentToDelete, setStudentToDelete,
      formData, setFormData,
      filteredStudents, availableRombels,
      startEdit, handleSubmit
  } = useStudentManager(initialIsAdding, students, onUpdateStudent, onAddStudent);

  React.useEffect(() => {
    setIsAdding(initialIsAdding);
  }, [initialIsAdding, setIsAdding]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-[var(--border-subtle)] w-full overflow-hidden shadow-2xl relative">
      <header className="p-3.5 border-b border-black/5 flex justify-between items-center bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 w-2.5 h-2.5 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Workspace Control</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer"><X size={14} className="text-slate-500" /></button>
      </header>

      {isAdding ? (
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-slate-50/40">
           <button 
             onClick={() => { setIsAdding(false); setEditingStudent(null); }}
             className="flex items-center gap-2 p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-black transition-colors text-left"
           >
             <ChevronLeft size={14} /> Back to Drawer
           </button>
           <StudentUpsertForm 
             editingStudent={editingStudent} 
             formData={formData} 
             setFormData={setFormData} 
             onSubmit={handleSubmit} 
             onCancel={() => { setIsAdding(false); setEditingStudent(null); }} 
           />
        </div>
      ) : (
        <StudentTabContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentView={currentView}
            setView={setView}
            onClose={onClose}
            onOpenSettings={onOpenSettings}
            search={search}
            setSearch={setSearch}
            rombelFilter={rombelFilter}
            setRombelFilter={setRombelFilter}
            availableRombels={availableRombels}
            filteredStudents={filteredStudents}
            getStudentProgress={getStudentProgress}
            activeStudentId={activeStudentId}
            onSelectStudent={(s) => {
              onSelectStudent(s);
              onClose();
            }}
            startEdit={startEdit}
            setStudentToDelete={(s) => setStudentToDelete(s)}
            isReadOnly={isReadOnly}
            setEditingStudent={setEditingStudent}
            setFormData={setFormData}
            setIsAdding={setIsAdding}
        />
      )}
      
      <footer className="p-3.5 bg-slate-50 border-t border-black/5 shrink-0">
        <div className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
          Professional Report Management System
        </div>
      </footer>

      <AnimatePresence>
        {studentToDelete && (
          <DeleteConfirmationDialog 
            student={studentToDelete}
            onConfirm={() => {
              onDeleteStudent(studentToDelete.id);
              setStudentToDelete(null);
            }}
            onCancel={() => setStudentToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
