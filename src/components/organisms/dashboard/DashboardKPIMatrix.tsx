import React from 'react';
import { Aspect, Student, StudentAssessment } from '../../../types';
import { cn } from '../../../lib/utils';

interface DashboardKPIMatrixProps {
    students: Student[];
    aspects: Aspect[];
    assessments: StudentAssessment;
}

export const DashboardKPIMatrix: React.FC<DashboardKPIMatrixProps> = ({ students, aspects, assessments }) => {
    return (
        <div className="bento-card overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <div className="flex flex-col">
                    <span className="text-[12px] font-black uppercase text-slate-800 tracking-tight">Matrix Ketuntasan Penilaian</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status Pengisian Indikator per Peserta Didik</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded shadow-inner border border-slate-100" />
                        <span className="text-[8px] font-black text-slate-400">KOSONG</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-indigo-100" />
                        <span className="text-[8px] font-black text-indigo-400">PARSIAL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-indigo-600 shadow-lg shadow-indigo-600/20" />
                        <span className="text-[8px] font-black text-indigo-600">LENGKAP</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar -mx-5 px-5">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left text-[9px] font-black uppercase tracking-widest text-slate-300 pb-4 pr-6 sticky left-0 bg-white z-10 backdrop-blur-sm">NAMA SISWA</th>
                            {aspects.map(a => (
                                <th key={a.id} className="text-center text-[9px] font-black uppercase tracking-widest text-slate-300 pb-4 px-2 whitespace-nowrap min-w-[50px]">
                                    {a.name.substring(0, 3)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {students.slice(0, 50).map(s => (
                            <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 pr-6 text-[11px] font-bold text-slate-800 truncate max-w-[160px] sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 transition-colors">
                                    {s.name}
                                </td>
                                {aspects.map(a => {
                                    const count = Object.keys(assessments[s.id]?.[a.id] || {}).length;
                                    const total = a.indicators.length;
                                    const p = total > 0 ? count / total : 0;
                                    
                                    return (
                                        <td key={a.id} className="py-2.5 px-2">
                                            <div className="flex justify-center">
                                                <div 
                                                    className={cn(
                                                        "w-4 h-4 rounded-lg transition-all duration-500",
                                                        p === 1 ? "bg-indigo-600 scale-100 shadow-md shadow-indigo-600/20" :
                                                        p > 0 ? "bg-indigo-100 scale-90" :
                                                        "bg-white border border-slate-100 scale-75 opacity-50"
                                                    )}
                                                    title={`${Math.round(p * 100)}%`}
                                                />
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {students.length > 50 && (
                <div className="mt-4 pt-4 border-t border-slate-50 text-center">
                    <span className="text-[9px] font-black text-slate-300 italic">Menampilkan 50 dari {students.length} siswa...</span>
                </div>
            )}
        </div>
    );
};
