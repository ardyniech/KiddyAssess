import React from 'react';
import { motion } from 'motion/react';
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
        <div className="max-w-5xl mx-auto w-full px-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex justify-center w-full md:w-auto">
                    

                    <motion.div
                        drag="x"
                        dragConstraints={{ left: -100, right: 100 }}
                        dragElastic={0.4}
                        animate={{ rotate: [0, -1, 1, -1, 0] }}
                        transition={{
                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                            default: { type: "spring", stiffness: 400, damping: 25 }
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onDragEnd={(e, { offset }) => {
                            const swipe = offset.x;
                            if (swipe < -80 && currentIdx < students.length - 1 && onSelectStudent) {
                                onSelectStudent(students[currentIdx + 1].id);
                            } else if (swipe > 80 && currentIdx > 0 && onSelectStudent) {
                                onSelectStudent(students[currentIdx - 1].id);
                            }
                        }}
                        className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-2xl p-2 px-3 shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing mx-auto"
                    >
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 bg-slate-100 shadow-inner">
                                {student.photoUrl ? (
                                    <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <span className="text-xl select-none">
                                        {["🦁", "🐼", "🐨", "🦊", "🐰", "🐯", "🐱", "🐶", "🐵", "🐸", "🐤", "🦄", "🐙", "🐢", "🐧", "🦉"][student.name.length % 16]}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col min-w-0 pr-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="text-sm font-black tracking-tight text-slate-950 leading-tight truncate max-w-[130px] sm:max-w-[200px] uppercase">
                                    {student.name}
                                </h2>
                                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md shrink-0">
                                    KLS {student.kelompok || "B1"}
                                </span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block leading-none">
                                SISWA {currentIdx + 1}/{students.length} • NISN: {student.nisn || "-"}
                            </span>
                        </div>
                    </motion.div>

                    
                </div>

                <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm self-start md:self-auto w-full md:w-auto overflow-x-auto scrollbar-none">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveType(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap",
                                activeType === tab.id 
                                ? "bg-indigo-600 border border-indigo-700 text-white shadow-sm scale-100 font-extrabold" 
                                : "text-slate-700 dark:text-slate-200 hover:text-indigo-600 font-bold hover:bg-white/80 dark:hover:bg-slate-800/40 scale-95"
                            )}
                        >
                            {React.cloneElement(tab.icon as React.ReactElement, { size: 14 })}
                            <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800" />
        </div>
    );
}
