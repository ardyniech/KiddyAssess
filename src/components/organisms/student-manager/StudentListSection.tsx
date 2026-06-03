import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Edit2, Trash2, Users } from 'lucide-react';
import { MoleculeStudentCard } from '../../molecules/Molecules';
import { AtomText } from '../../atoms/CommonAtoms';
import { EmptyState } from '../../atoms/EmptyState';
import { Student } from '../../../types';
import { usePermissions } from '../../../context/PermissionContext';
import { cn } from '../../../lib/utils';

interface StudentListSectionProps {
    search: string;
    setSearch: (s: string) => void;
    rombelFilter: string;
    setRombelFilter: (r: string) => void;
    availableRombels: string[];
    filteredStudents: Student[];
    getStudentProgress: (sid: string) => number;
    activeStudentId?: string;
    onSelectStudent: (student: Student) => void;
    onEditStudent: (student: Student, e: React.MouseEvent) => void;
    onDeleteRequest: (student: Student) => void;
}

export const StudentListSection: React.FC<StudentListSectionProps> = ({ 
    search, 
    setSearch, 
    rombelFilter,
    setRombelFilter,
    availableRombels,
    filteredStudents, 
    getStudentProgress, 
    activeStudentId, 
    onSelectStudent, 
    onEditStudent, 
    onDeleteRequest 
}) => {
    const { canPerformAction } = usePermissions();
    const canEditStudent = canPerformAction('edit_student');
    const canDeleteStudent = canPerformAction('delete_student');
    const isReadOnly = !canEditStudent; // If they cannot edit, they are read-only

    return (
        <div className="flex-1 flex flex-col overflow-hidden p-3">
            <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 px-1">Daftar Induk</div>
            
            {isReadOnly && (
                <div className="mx-1 px-3 py-2 mb-2 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-xl flex items-center gap-1.5 leading-relaxed">
                    <span>🔒 Baca-Saja: Perubahan data siswa dibatasi.</span>
                </div>
            )}
            
            {availableRombels.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none px-1 shrink-0">
                    <button 
                        onClick={() => setRombelFilter('ALL')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 outline-none cursor-pointer",
                            rombelFilter === 'ALL' 
                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                        )}
                    >
                        Semua Kelas
                    </button>
                    {availableRombels.map(r => (
                        <button 
                            key={r}
                            onClick={() => setRombelFilter(r)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 outline-none cursor-pointer",
                                rombelFilter === r 
                                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                            )}
                        >
                            Kelas {r}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative mb-2 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari Entri..."
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-[11px] font-black text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-600 transition-all"
                />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                <AnimatePresence mode="popLayout">
                    {filteredStudents.map((student) => (
                        <motion.div key={student.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.15 }}>
                            <div className="relative group/card overflow-hidden rounded-xl border border-slate-100 bg-white">
                                <motion.div
                                    drag={isReadOnly ? false : "x"}
                                    dragConstraints={{ left: -100, right: 0 }}
                                    className={cn("flex", isReadOnly ? "w-full" : "w-[calc(100%+100px)]")}
                                >
                                    <div className="w-full flex-shrink-0" onClick={() => onSelectStudent(student)}>
                                        <MoleculeStudentCard
                                            name={student.name} studentClass={student.kelompok} semester={student.semester}
                                            photoUrl={student.photoUrl} progress={getStudentProgress(student.id)}
                                            active={activeStudentId === student.id} onClick={() => onSelectStudent(student)}
                                        />
                                    </div>
                                    {!isReadOnly && (
                                        <div className="w-[110px] flex-shrink-0 flex items-stretch bg-slate-50 border-l border-slate-200">
                                            {canEditStudent && (
                                                <button 
                                                    onClick={(e) => onEditStudent(student, e)} 
                                                    className="flex-1 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-105 transition-colors cursor-pointer outline-none min-h-[44px]"
                                                    title="Ubah data"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                            )}
                                            {canDeleteStudent && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onDeleteRequest(student); }} 
                                                    className="flex-1 flex items-center justify-center text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer outline-none min-h-[44px]"
                                                    title="Hapus data"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredStudents.length === 0 && (
                    <EmptyState
                        icon={Users}
                        title="Daftar murid kosong"
                        description={search ? "Tidak ada murid yang sesuai dengan kata kunci pencarian Anda." : "Belum ada murid yang terdaftar dalam rombel ini."}
                        illustrationType="users"
                        size="compact"
                        className="py-12"
                    />
                )}
            </div>
        </div>
    );
};
