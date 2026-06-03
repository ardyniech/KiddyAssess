import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { SchoolProfile } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
    totalScoresSubmitted,
    distributionChartData
}) => {
    return (
        <div className="bento-card h-full flex flex-col justify-between">
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analisis Distribusi Nilai</span>
                    <TrendingUp size={14} className="text-black" />
                </div>
                
                <div className="h-[180px] w-full">
                    {distributionChartData && distributionChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fill: '#64748B', fontWeight: 700 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fill: '#64748B', fontWeight: 700 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 700 }}
                                    labelStyle={{ fontSize: '12px', fontWeight: 900, marginBottom: '4px', color: '#0F172A' }}
                                    cursor={{ fill: '#F1F5F9' }}
                                />
                                <Bar dataKey="BB" stackId="a" fill="#F43F5E" radius={[0, 0, 4, 4]} name="Belum Berkembang" />
                                <Bar dataKey="MB" stackId="a" fill="#F59E0B" name="Mulai Berkembang" />
                                <Bar dataKey="BSH" stackId="a" fill="#10B981" name="Berkembang Sesuai Harapan" />
                                <Bar dataKey="BSB" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]} name="Berkembang Sangat Baik" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                            <span className="text-[10px] font-black uppercase text-slate-400">Tidak Cukup Data</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block border-b pb-2 border-slate-100">Capaian Aspek Dasar</span>
                    {aspectMetrics.slice(0, 3).map(m => (
                        <div key={m.id} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-black">
                                <span className="truncate max-w-[120px] opacity-70">{m.fullName}</span>
                                <span className="font-black tabular-nums">{Math.round(m.completionRate)}%</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${m.completionRate}%` }} 
                                    className="h-full bg-indigo-600"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-end justify-between">
                    <div>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Entri Penilaian</span>
                        <span className="text-3xl font-black tracking-tighter leading-none text-slate-900">{totalScoresSubmitted}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

