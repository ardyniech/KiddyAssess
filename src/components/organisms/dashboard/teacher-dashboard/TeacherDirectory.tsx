import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Student } from '../../../../types';
import { cn } from '../../../../lib/utils';
import { EmptyState } from '../../../atoms/EmptyState';
import { Users } from 'lucide-react';

// Playful animal sticker tags for empty avatars
const CHILD_STICKERS = ["🦁", "🐼", "🐨", "🦊", "🐰", "🐯", "🐱", "🐶", "🐵", "🐸", "🐤", "🦄", "🐙", "🐢", "🐧", "🦉"];
const getStudentSticker = (name: string, index: number) => {
    const code = name.charCodeAt(0) + name.length + index;
    return CHILD_STICKERS[code % CHILD_STICKERS.length];
};

interface TeacherDirectoryProps {
    students: Student[];
    filteredStudentsLength: number;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    getStudentStats: (studentId: string) => { percent: number };
    itemsPerPage: number;
    handleSelectAction: (student: Student, targetView: string) => void;
}

export const TeacherDirectory = ({
    students,
    filteredStudentsLength,
    currentPage,
    totalPages,
    setCurrentPage,
    getStudentStats,
    itemsPerPage,
    handleSelectAction
}: TeacherDirectoryProps) => {
    return (
        <div className="text-left space-y-3">
            <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Direktori Anak Didik ({filteredStudentsLength} siswa terfilter)
                </span>
                {totalPages > 1 && (
                    <span className="text-[9.5px] font-semibold text-slate-400">Halaman {currentPage} dari {totalPages}</span>
                )}
            </div>

            {students.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="Anak Didik Tidak Ditemukan"
                    description="Cari dengan kata kunci nama lain, sesuaikan filter kelompok rombel, atau daftarkan murid didik baru di modul kesiswaan."
                    illustrationType="users"
                    size="normal"
                    className="bg-white rounded-3xl border border-slate-200/80 p-12 shadow-xs"
                />
            ) : (
                <div className="flex flex-col gap-1.5">
                    {students.map((student, studentIndex) => {
                        const { percent } = getStudentStats(student.id);
                        const currentRankIndex = (currentPage - 1) * itemsPerPage + studentIndex;
                        const babySticker = getStudentSticker(student.name, currentRankIndex);
                        
                        return (
                            <div 
                                key={student.id}
                                onClick={() => handleSelectAction(student, 'assessment')}
                                className="bg-white rounded-xl border border-slate-100 p-3 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {student.photoUrl ? (
                                        <img 
                                            src={student.photoUrl} 
                                            alt={student.name}
                                            referrerPolicy="no-referrer"
                                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-lg flex items-center justify-center shrink-0">
                                            {babySticker}
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <h3 className="text-xs font-bold text-slate-900 truncate">
                                            {student.name}
                                        </h3>
                                        <p className="text-[9px] text-slate-500 truncate">
                                            Kelompok {student.kelompok || "B1"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full"
                                            style={{ 
                                                width: `${percent}%`,
                                                backgroundColor: percent === 100 ? '#9EE493' : percent > 0 ? '#FFE699' : '#FFB3B3'
                                            }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-700 font-mono w-8 text-right">
                                        {percent}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pt-2 flex items-center justify-center gap-1.5">
                    <button
                        onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={cn(
                            "w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer",
                            currentPage === 1 ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 text-[#2F5270] hover:bg-slate-50"
                        )}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, rank) => {
                        const rankIndex = rank + 1;
                        return (
                            <button
                                key={rankIndex}
                                onClick={() => setCurrentPage(rankIndex)}
                                className={cn(
                                    "w-8 h-8 rounded-full text-[11px] font-extrabold transition-all cursor-pointer",
                                    currentPage === rankIndex 
                                        ? "bg-indigo-600 text-white shadow shadow-indigo-200 scale-105" 
                                        : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
                                )}
                            >
                                {rankIndex}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={cn(
                            "w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer",
                            currentPage === totalPages ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 text-[#2F5270] hover:bg-slate-50"
                        )}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};
