import React from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, BookOpen, Star } from 'lucide-react';
import { MoleculeMetricCard } from '../../molecules/DashboardMolecules';

interface DashboardStatsProps {
    totalStudents: number;
    classAverageCompletion: number;
    totalAspects: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
    totalStudents, 
    classAverageCompletion, 
    totalAspects 
}) => {
    return (
        <div className="space-y-4">
            <div className="bento-card bg-indigo-600 text-white border-none shadow-xl shadow-indigo-500/20 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <Users size={20} className="text-white/80" />
                        <div className="px-2 py-0.5 bg-white/20 rounded-full text-[8px] font-black tracking-widest uppercase">Node Aktif</div>
                    </div>
                    <div className="text-3xl font-black tracking-tighter mb-1">{totalStudents}</div>
                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Siswa Terdaftar</div>
                </div>
            </div>

            <div className="bento-card overflow-hidden relative">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0">
                        <TrendingUp size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                             <span className="text-[11px] font-black text-indigo-600">{Math.round(classAverageCompletion)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${classAverageCompletion}%` }}
                                className="h-full bg-indigo-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <MoleculeMetricCard 
                    icon={<BookOpen />}
                    label="Aspek Dasar"
                    value={String(totalAspects)}
                />
                <MoleculeMetricCard 
                    icon={<Star />}
                    label="Status Kesiapan"
                    value={classAverageCompletion === 100 ? "Lengkap" : classAverageCompletion > 50 ? "Lanjutan" : "Fase Awal"}
                />
            </div>
        </div>
    );
};
