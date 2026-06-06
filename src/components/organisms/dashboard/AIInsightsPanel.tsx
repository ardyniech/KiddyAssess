import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, AlertCircle, CalendarRange, RotateCw, Lightbulb } from 'lucide-react';
import { Student, Aspect, StudentAssessment } from '../../../types';

interface AIInsightsPanelProps {
    students: Student[];
    aspects: Aspect[];
    assessments: StudentAssessment;
}

interface InsightReport {
    summary: string;
    strengths: { aspectName: string; metric: string; analysis: string }[];
    concerns: { aspectName: string; metric: string; analysis: string }[];
    focusAreas: { title: string; description: string }[];
    weeklyTip: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ students, aspects, assessments }) => {
    const [report, setReport] = useState<InsightReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const metrics = useMemo(() => {
        let totalStudents = students.length;
        let totalAssessments = 0;
        const scaleCounts = { BB: 0, MB: 0, BSH: 0, BSB: 0 };
        const aspectSummaries = aspects.map(a => {
            const counts = { BB: 0, MB: 0, BSH: 0, BSB: 0 };
            students.forEach(s => {
                if (assessments[s.id] && assessments[s.id][a.id]) {
                    const scores = assessments[s.id][a.id];
                    Object.values(scores).forEach((val: any) => {
                        const scale = typeof val === 'string' ? val : val?.scale;
                        if (scale && ['BB', 'MB', 'BSH', 'BSB'].includes(scale)) {
                            counts[scale as keyof typeof counts]++;
                            scaleCounts[scale as keyof typeof scaleCounts]++;
                            totalAssessments++;
                        }
                    });
                }
            });
            return { aspectName: a.name, ...counts };
        });
        return { totalStudents, totalAssessments, scaleCounts, aspectSummaries };
    }, [students, aspects, assessments]);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metrics })
            });
            if (!res.ok) throw new Error('Gagal mendapatkan analisis perkembangan AI.');
            const data = await res.json();
            setReport(data);
        } catch (err: any) {
            setError(err.message || 'Kesalahan koneksi AI');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, [students.length]);

    if (loading) {
        return (
            <div id="ai_insights_loading" className="p-5 border border-slate-250 bg-white rounded-3xl animate-pulse flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-8 bg-slate-200 rounded-xl w-32" />
                </div>
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="h-16 bg-slate-200 rounded-2xl" />
                    <div className="h-16 bg-slate-200 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div id="ai_insights_panel" className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600">
                        <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[8px] font-black tracking-widest text-indigo-700 uppercase font-mono">DASHBOARD CO-PILOT APPS</span>
                        <h3 className="text-xs font-black text-slate-900 uppercase">AI Insights & Fokus Pembelajaran</h3>
                    </div>
                </div>
                <button 
                    onClick={fetchInsights} 
                    className="flex items-center gap-1.5 self-start px-3 py-2 text-[9px] font-black uppercase tracking-wider bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 hover:text-black cursor-pointer transition-all"
                >
                    <RotateCw size={11} className={loading ? 'animate-spin' : ''} />
                    Refresh Analisis
                </button>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-[9px] font-bold rounded-xl flex items-center gap-2 uppercase tracking-wide">
                    ⚠️ {error}
                </div>
            )}

            {report && (
                <div className="space-y-4 text-left">
                    <p className="text-[11px] font-semibold leading-relaxed text-slate-700 bg-indigo-50/20 p-3.5 border border-indigo-100 rounded-2xl">
                        {report.summary}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths Card */}
                        {report.strengths?.map((item, idx) => (
                            <div key={`str-${idx}`} className="p-4 bg-emerald-50/35 border border-emerald-150 rounded-2xl flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-emerald-800">
                                        <TrendingUp size={14} className="shrink-0" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Kekuatan Pembelajaran</span>
                                    </div>
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase">{item.aspectName}</h4>
                                    <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{item.analysis}</p>
                                </div>
                                <span className="mt-3 inline-block self-start text-[8px] font-black uppercase px-2.5 py-1 bg-emerald-100 border border-emerald-250 text-emerald-800 rounded-lg">
                                    {item.metric}
                                </span>
                            </div>
                        ))}

                        {/* Concerns Card */}
                        {report.concerns?.map((item, idx) => (
                            <div key={`con-${idx}`} className="p-4 bg-amber-50/25 border border-amber-200 rounded-2xl flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-amber-800">
                                        <AlertCircle size={14} className="shrink-0" />
                                        <span className="text-[9px] font-black uppercase tracking-widest font-mono">Prioritas Stimulasi</span>
                                    </div>
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase">{item.aspectName}</h4>
                                    <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{item.analysis}</p>
                                </div>
                                <span className="mt-3 inline-block self-start text-[8px] font-black uppercase px-2.5 py-1 bg-amber-100 border border-amber-200 text-amber-800 rounded-lg">
                                    {item.metric}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Focus Areas for next week */}
                    <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-indigo-700 mb-3">
                            <CalendarRange size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest font-mono">Fokus Rencana Pembelajaran (Minggu Depan)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {report.focusAreas?.map((area, idx) => (
                                <div key={`focus-${idx}`} className="p-3.5 border border-slate-150 bg-slate-50/40 rounded-2xl space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{area.title}</h5>
                                    </div>
                                    <p className="text-[9.5px] leading-relaxed text-slate-600 font-semibold">{area.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pedagogic Tip overlay footer */}
                    {report.weeklyTip && (
                        <div className="p-3 bg-indigo-900 text-white rounded-2xl flex items-start gap-2.5">
                            <Lightbulb size={14} className="text-amber-300 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-[7.5px] font-black uppercase tracking-widest text-[#FFF275] block font-mono">Tip Guru Minggu Ini</span>
                                <p className="text-[9.5px] font-semibold text-indigo-100 leading-normal">{report.weeklyTip}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
