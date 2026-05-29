import React from 'react';
import { ClipboardCheck, Users } from 'lucide-react';

interface DashboardHeaderProps {
    totalStudents: number;
    totalIndicators: number;
    totalScoresSubmitted: number;
    classAverageCompletion: number;
    onViewStudents?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
    totalStudents, 
    totalIndicators, 
    totalScoresSubmitted, 
    classAverageCompletion,
    onViewStudents
}) => {
    return (
        <div className="bento-card bg-white border-slate-100 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl font-black tracking-tighter leading-none text-black">
                        Kontrol Aktivitas
                    </h1>
                    <p className="text-[11px] font-bold text-slate-400 leading-tight uppercase tracking-tight">
                        Pemantauan detail • {totalStudents} data siswa aktif
                    </p>
                </div>
                
                <div className="flex gap-4 sm:border-l border-slate-100 sm:pl-4">
                    <div>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-300">Indikator</span>
                        <span className="text-lg font-black text-black leading-none">{totalIndicators}</span>
                    </div>
                    <div>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-300">Tertilai</span>
                        <span className="text-lg font-black text-black leading-none">{totalScoresSubmitted}</span>
                    </div>
                    {onViewStudents && (
                        <div className="flex items-center ml-2">
                             <button 
                                onClick={onViewStudents}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-tight shadow-md hover:scale-105 active:scale-95 transition-all"
                             >
                                <Users size={10} />
                                Database Siswa
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
