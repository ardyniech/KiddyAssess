import React from 'react';
import { ArrowRight, User } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Student } from '../../../types';

interface DashboardStudentRosterProps {
    students: Student[];
    studentCompletion: any[];
    onSelectStudent: (id: string | null) => void;
}

export const DashboardStudentRoster: React.FC<DashboardStudentRosterProps> = ({ 
    students, 
    studentCompletion, 
    onSelectStudent 
}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {students.map((student, idx) => {
                const compInfo = studentCompletion.find(sc => sc.student.id === student.id) || { percentage: 0 };
                const percentage = Math.round(compInfo.percentage);
                return (
                    <button 
                        key={student.id} 
                        onClick={() => onSelectStudent(student.id)}
                        className="bento-card group text-left flex flex-col justify-between min-h-[110px] bg-white hover:bg-slate-50 transition-all p-3"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black transition-colors text-black">
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-right">
                                <span className="block text-[7px] font-black uppercase opacity-20 leading-none">
                                    #{idx + 1}
                                </span>
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full ml-auto mt-1",
                                    percentage === 100 ? "bg-emerald-500" : percentage > 0 ? "bg-amber-500" : "bg-slate-100"
                                )} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[11px] font-black tracking-tight mb-0.5 uppercase truncate leading-none text-black">
                                {student.name}
                            </h3>
                            <div className="flex items-center justify-between text-black">
                                <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">
                                    {student.kelompok || student.class}
                                </span>
                                <span className="text-[8px] font-black">{percentage}%</span>
                            </div>
                            <div className="mt-2 h-[1px] w-full bg-slate-50 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-black transition-all duration-500" 
                                    style={{ width: `${percentage}%` }} 
                                />
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

