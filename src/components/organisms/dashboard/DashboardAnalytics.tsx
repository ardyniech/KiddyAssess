import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { SchoolProfile } from '../../../types';

interface AspectMetric {
    id: string;
    fullName: string;
    completionRate: number;
}

interface DashboardAnalyticsProps {
    aspectMetrics: AspectMetric[];
    scoreCounts: { BSB: number; BSH: number; MB: number; BB: number };
    totalScoresSubmitted: number;
    schoolProfile: SchoolProfile | null;
    distributionChartData: any[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ 
    aspectMetrics, 
    scoreCounts, 
    totalScoresSubmitted 
}) => {
    return (
        <div className="bento-card h-full flex flex-col justify-between">
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analitik Kelas</span>
                    <TrendingUp size={14} className="text-black" />
                </div>
                
                <div className="space-y-5">
                    {aspectMetrics.slice(0, 3).map(m => (
                        <div key={m.id} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-black">
                                <span className="truncate max-w-[120px] opacity-70">{m.fullName}</span>
                                <span className="font-black">{Math.round(m.completionRate)}%</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${m.completionRate}%` }} 
                                    className="h-full bg-black"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-end justify-between">
                    <div>
                        <span className="block text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Total Nilai</span>
                        <span className="text-3xl font-black tracking-tighter leading-none text-black">{totalScoresSubmitted}</span>
                    </div>
                    <div className="flex gap-1.5 h-12 items-end">
                        {['BB', 'MB', 'BSH', 'BSB'].map(key => {
                            const count = scoreCounts[key as keyof typeof scoreCounts] || 0;
                            const height = totalScoresSubmitted > 0 ? (count / totalScoresSubmitted) * 100 : 0;
                            return (
                                <div key={key} className="w-5 bg-slate-50 rounded-sm relative overflow-hidden flex flex-col justify-end border border-slate-100">
                                    <motion.div 
                                        initial={{ height: 0 }} 
                                        animate={{ height: `${height}%` }}
                                        className="w-full bg-black"
                                    />
                                    <span className="absolute bottom-1 w-full text-center text-[5px] font-black text-white mix-blend-difference">{key}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

