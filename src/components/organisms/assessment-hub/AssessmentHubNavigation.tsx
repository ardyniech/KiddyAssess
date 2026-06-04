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

                <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm self-start md:self-auto w-full md:w-auto overflow-x-auto scrollbar-none">
                    {tabs.map((tab) => {
                        let activeColor = "bg-indigo-600 border-indigo-700 shadow-indigo-500/30";
                        let hoverColor = "hover:text-indigo-600 hover:bg-indigo-50";
                        if (tab.id === 'curriculum') {
                            activeColor = "bg-emerald-500 border-emerald-600 shadow-emerald-500/30";
                            hoverColor = "hover:text-emerald-600 hover:bg-emerald-50";
                        } else if (tab.id === 'kartika') {
                            activeColor = "bg-amber-500 border-amber-600 shadow-amber-500/30";
                            hoverColor = "hover:text-amber-600 hover:bg-amber-50";
                        } else {
                            activeColor = "bg-rose-500 border-rose-600 shadow-rose-500/30";
                            hoverColor = "hover:text-rose-600 hover:bg-rose-50";
                        }

                        return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveType(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 whitespace-nowrap",
                                activeType === tab.id 
                                ? `${activeColor} border text-white shadow-sm scale-100 font-extrabold` 
                                : `text-slate-600 font-bold scale-95 ${hoverColor}`
                            )}
                        >
                            {React.cloneElement(tab.icon as any, { size: 14 })}
                            <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
                        </button>
                    )})}
                </div>
            </div>

            <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800" />
        </div>
    );
}
