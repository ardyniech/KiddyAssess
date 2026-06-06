import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical,
  CalendarCheck,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { Student, StudentAssessment, Aspect } from '../../../types';
import { cn } from '../../../lib/utils';
import { StudentEditModal } from './StudentEditModal';
import { StudentDeleteModal } from './StudentDeleteModal';
import { StudentListCard } from './StudentListCard';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentAttendanceModal } from './StudentAttendanceModal';
import { StudentCsvImportModal } from './StudentCsvImportModal';
import { usePermissions } from '../../../context/PermissionContext';
import { EmptyState } from '../../atoms/EmptyState';

interface OrganismStudentPageProps {
  key?: React.Key;
  students: Student[];
  setStudents?: React.Dispatch<React.SetStateAction<Student[]>>;
  assessments?: StudentAssessment;
  aspects?: Aspect[];
  getStudentProgress: (sid: string) => number;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSelectStudent: (id: string) => void;
}

export function OrganismStudentPage({
  students,
  setStudents,
  getStudentProgress,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onSelectStudent
}: OrganismStudentPageProps) {
  const { canPerformAction } = usePermissions();
  const isReadOnly = !canPerformAction('edit_student');

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [isManageMode, setIsManageMode] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentToView, setStudentToView] = useState<Student | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);

  const classes = Array.from(new Set(students.map(s => s.kelompok).filter(Boolean)));

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === 'all' || s.kelompok === filterClass;
    return matchesSearch && matchesClass;
  });

  const handleAddStudentsBatch = (batch: Omit<Student, 'id'>[]) => {
    if (isReadOnly) return;
    const newStudents = batch.map((s: any) => ({
      ...s,
      id: crypto.randomUUID(),
      updatedAt: Date.now()
    }));
    if (setStudents) {
      setStudents(prev => [...prev, ...newStudents]);
      setToastMessage(`✓ Berhasil mengimpor ${batch.length} data siswa secara massal!`);
      setTimeout(() => {
        setToastMessage(null);
      }, 4500);
    }
  };

  const handleEditSubmit = (updatedStudent: Student) => {
    if (isReadOnly) {
      console.warn("Unauthorised edit student block on page level");
      return;
    }
    onEditStudent(updatedStudent);
    setStudentToEdit(null);
  };

  const handleAttendanceSave = (updatedStudents: Student[]) => {
      if (isReadOnly) {
          console.warn("Unauthorised attendance save block on page level");
          return;
      }
      updatedStudents.forEach(s => {
          onEditStudent(s);
      });
      setShowAttendance(false);
  };

  const handleDeleteConfirm = () => {
    if (!canPerformAction('delete_student')) {
      console.warn("Unauthorised delete student block on page level");
      return;
    }
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const handleGoToAssessment = (id: string) => {
    setStudentToView(null);
    onSelectStudent(id);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-main)] p-3 md:p-4 custom-scrollbar relative">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Action Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
                    <Users size={20} />
                 </div>
                 <div>
                    <h1 className="text-sm font-black text-slate-950 tracking-tight leading-none mb-0.5">Siswa</h1>
                    <p className="text-[9px] uppercase font-black tracking-widest text-[#2e2e33]">{students.length} Terdaftar</p>
                 </div>
              </div>

               {!isReadOnly ? (
                 <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                  <button 
                    onClick={() => setShowAttendance(true)}
                    className="flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg"
                  >
                    <CalendarCheck size={18} />
                  </button>
                   <button 
                    onClick={() => setIsManageMode(!isManageMode)}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg",
                      isManageMode ? "bg-amber-500 text-white shadow-sm" : "bg-white text-slate-400 hover:text-indigo-600 border border-slate-100"
                    )}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
               ) : (
                <div className="px-2.5 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200">
                  🔒 Baca Saja
                </div>
               )}
          </div>

          {isReadOnly && (
            <div className="bg-slate-100 text-slate-700 p-3 rounded-xl text-[10px] font-bold leading-normal border border-slate-200 flex items-center gap-2">
              <span className="text-sm">🔒</span>
              <span>Hak ubah data dibatasi untuk Guru Kelas & Tata Usaha.</span>
            </div>
          )}

          <div className="flex items-center gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari siswa..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-4 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-indigo-600 transition-all"
                />
             </div>
             
              {!isReadOnly && (
                <div className="flex items-center gap-2">
                  <button 
                     onClick={() => setShowCsvImport(true)}
                     title="Impor Massal Rombel (CSV)"
                     className="flex items-center justify-center w-10 h-10 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                     <UploadCloud size={16} />
                  </button>
                  <button 
                     onClick={onAddStudent}
                     className="flex items-center justify-center w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-100 border border-indigo-700 cursor-pointer"
                  >
                     <UserPlus size={16} />
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Filters and Layout Actions */}
        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none px-1 shrink-0">
                {['all', ...classes].map(cls => (
                    <button 
                        key={cls || 'default'}
                        onClick={() => setFilterClass(cls)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 outline-none cursor-pointer",
                            filterClass === cls 
                                ? "bg-indigo-600 border-indigo-700 text-white shadow-sm" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50"
                        )}
                    >
                        {cls === 'all' ? 'Semua Kelas' : `Kelas ${cls}`}
                    </button>
                ))}
            </div>
        </div>

        {/* Student Grid */}
        <motion.div 
          key={`student-grid-${filterClass}`}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.03
              }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"
        >
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student, idx) => (
              <StudentListCard 
                key={student.id}
                student={student}
                idx={idx}
                progress={getStudentProgress(student.id)}
                isManageMode={isManageMode}
                onEdit={() => setStudentToEdit(student)}
                onDelete={() => setStudentToDelete(student)}
                onClick={() => onSelectStudent(student.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredStudents.length === 0 && (
          <EmptyState
            key="empty-state"
            icon={Users}
            title="Tidak Ada Siswa Terdaftar"
            description={search ? "Kombinasi filter dan pencarian Anda tidak menemukan siswa." : "Belum ada siswa yang ditambahkan ke pangkalan data sekolah Anda untuk rombel ini."}
            actionLabel={!isReadOnly ? "Tambah Siswa Baru" : undefined}
            onActionClick={!isReadOnly ? onAddStudent : undefined}
            illustrationType="users"
            className="py-16 bg-slate-50/55 rounded-3xl border border-dashed border-slate-200/80 my-4"
          />
        )}
      </div>

      {/* Modals Popups */}
      <AnimatePresence>
        {showAttendance && (
            <StudentAttendanceModal
                students={students}
                selectedClass={filterClass}
                onClose={() => setShowAttendance(false)}
                onSave={handleAttendanceSave}
            />
        )}

        {studentToView && (
          <StudentDetailModal 
            student={studentToView}
            progress={getStudentProgress(studentToView.id)}
            onClose={() => setStudentToView(null)}
            onGoToAssessment={handleGoToAssessment}
          />
        )}
        
        {studentToEdit && (
          <StudentEditModal 
            student={studentToEdit} 
            onClose={() => setStudentToEdit(null)} 
            onSubmit={handleEditSubmit}
          />
        )}
        
        {studentToDelete && (
          <StudentDeleteModal 
            student={studentToDelete}
            onClose={() => setStudentToDelete(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}

        {showCsvImport && (
          <StudentCsvImportModal 
            onClose={() => setShowCsvImport(false)}
            onAddStudentsBatch={handleAddStudentsBatch}
          />
        )}
      </AnimatePresence>

      {/* High contrast animated toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-750 text-white text-[11px] font-black uppercase tracking-wider py-3.5 px-5 rounded-2xl shadow-2xl flex items-center gap-3 select-none"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse animate-duration-1000" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

