import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical,
  CalendarCheck
} from 'lucide-react';
import { Student, StudentAssessment, Aspect } from '../../../types';
import { cn } from '../../../lib/utils';
import { StudentEditModal } from './StudentEditModal';
import { StudentDeleteModal } from './StudentDeleteModal';
import { StudentListCard } from './StudentListCard';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentAttendanceModal } from './StudentAttendanceModal';
import { usePermissions } from '../../../context/PermissionContext';

interface OrganismStudentPageProps {
  key?: React.Key;
  students: Student[];
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
  getStudentProgress,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onSelectStudent
}: OrganismStudentPageProps) {
  const { userRole } = usePermissions();
  const isReadOnly = userRole === 'SUPER_USER' || userRole === 'ADMIN';

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [isManageMode, setIsManageMode] = useState(false);
  
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

  const handleEditSubmit = (updatedStudent: Student) => {
    onEditStudent(updatedStudent);
    setStudentToEdit(null);
  };

  const handleAttendanceSave = (updatedStudents: Student[]) => {
      updatedStudents.forEach(s => {
          onEditStudent(s);
      });
      setShowAttendance(false);
  };

  const handleDeleteConfirm = () => {
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
                 <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
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
                      isManageMode ? "bg-amber-500 text-white shadow-sm" : "bg-white text-slate-400 hover:text-black border border-slate-100"
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
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-4 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all"
                />
             </div>
             
             {!isReadOnly && (
               <button 
                  onClick={onAddStudent}
                  className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all outline-none cursor-pointer"
               >
                  <UserPlus size={16} />
               </button>
             )}
          </div>
        </div>

        {/* Filters and Layout Actions */}
        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['all', ...classes].map(cls => (
                    <button 
                        key={cls || 'default'}
                        onClick={() => setFilterClass(cls)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                            filterClass === cls ? "bg-black text-white" : "bg-white text-slate-400 border border-slate-100 shadow-sm"
                        )}
                    >
                        {cls === 'all' ? 'Semua Kelas' : cls}
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
          <div key="empty-state" className="py-20 flex flex-col items-center justify-center opacity-20">
             <Users size={48} className="mb-4" />
             <p className="text-sm font-black uppercase tracking-widest">Tidak Ada Siswa</p>
          </div>
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
      </AnimatePresence>
    </div>
  );
}

