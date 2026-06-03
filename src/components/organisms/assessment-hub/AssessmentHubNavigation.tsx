import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Student } from '../../../types';
import { cn } from '../../../lib/utils';
import { AssessmentType } from '../OrganismAssessmentHub';

interface AssessmentHubNavigationProps {
    student: Student;
    students: Student[];
    currentIdx: number;
    onSelectStudent?: (id: string) => void;
    tabs: { id: AssessmentType; label: string; icon: React.ReactNode; desc: string }[];
    activeType: AssessmentType;
    setActiveType: (type: AssessmentType) => void;
}

export const AssessmentHubNavigation = ({
    student,
    students,
    currentIdx,
    onSelectStudent,
    tabs,
    activeType,
    setActiveType
}: AssessmentHubNavigationProps) => {
    return (
        <div className="max-w-5xl mx-auto w-full px-4 mb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 text-left">
                    <button 
                        disabled={currentIdx <= 0}
                        onClick={() => {
                            if (students && currentIdx > 0 && onSelectStudent) {
                                onSelectStudent(students[currentIdx - 1].id);
                            }
                        }}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-slate-700 hover:text-black hover:border-slate-350 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 focus:outline-none transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none active:scale-95 shadow-sm"
                        title="Siswa Sebelumnya (←)"
                    >
                        <ChevronLeft size={14} strokeWidth={2.5} />
                    </button>

                    <div className="flex flex-col">
                        <h2 className="text-sm md:text-base font-black tracking-tight text-slate-950 leading-none">
                            {student.name}
                        </h2>
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mt-1 block">
                            Siswa {currentIdx + 1} dari {students.length} • NISN: {student.nisn || "-"}
                        </span>
                    </div>

                    <button 
                        disabled={!students || currentIdx === -1 || currentIdx >= students.length - 1}
                        onClick={() => {
                            if (students && currentIdx < students.length - 1 && onSelectStudent) {
                                onSelectStudent(students[currentIdx + 1].id);
                            }
                        }}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-slate-700 hover:text-black hover:border-slate-350 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 focus:outline-none transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none active:scale-95 shadow-sm"
                        title="Siswa Berikutnya (→)"
                    >
                        <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-sm self-start md:self-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveType(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
                                activeType === tab.id 
                                ? "bg-indigo-650 text-white shadow-md shadow-indigo-600/10 scale-100 font-black" 
                                : "text-slate-700 hover:text-indigo-950 font-extrabold hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40 scale-95"
                            )}
                        >
                            {React.cloneElement(tab.icon as React.ReactElement, { size: 12 })}
                            <span className="text-[9px] font-black uppercase tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800" />
        </div>
    );
}
