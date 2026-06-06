import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Student, Aspect, ScoreData, AssessmentScale } from '../../types';

interface CompareStudentsProps {
    students: Student[];
    assessments: Record<string, Record<string, ScoreData>>;
    aspects: Aspect[];
}

const SCALE_VALUES: Record<AssessmentScale, number> = {
    BB: 1,
    MB: 2,
    BSH: 3,
    BSB: 4
};

export const CompareStudentsModule: React.FC<CompareStudentsProps> = ({ students, assessments, aspects }) => {
    const [studentAId, setStudentAId] = useState<string>('');
    const [studentBId, setStudentBId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'radar' | 'bar'>('radar');

    const handleStudentAChange = (e: React.ChangeEvent<HTMLSelectElement>) => setStudentAId(e.target.value);
    const handleStudentBChange = (e: React.ChangeEvent<HTMLSelectElement>) => setStudentBId(e.target.value);

    const data = useMemo(() => {
        if (!studentAId || !studentBId) return [];

        const aScores = assessments[studentAId] || {};
        const bScores = assessments[studentBId] || {};

        return aspects.map(aspect => {
            const aAspectScores = aScores[aspect.id] || {};
            const aValues = Object.values(aAspectScores).map(score => SCALE_VALUES[score as AssessmentScale]);
            const aAvg = aValues.length ? aValues.reduce((sum, val) => sum + val, 0) / aValues.length : 0;

            const bAspectScores = bScores[aspect.id] || {};
            const bValues = Object.values(bAspectScores).map(score => SCALE_VALUES[score as AssessmentScale]);
            const bAvg = bValues.length ? bValues.reduce((sum, val) => sum + val, 0) / bValues.length : 0;

            return {
                subject: aspect.name,
                fullMark: 4,
                [studentAId]: Number(aAvg.toFixed(2)),
                [studentBId]: Number(bAvg.toFixed(2)),
            };
        });
    }, [studentAId, studentBId, assessments, aspects]);

    const studentA = students?.find(s => s.id === studentAId);
    const studentB = students?.find(s => s.id === studentBId);

    const gapAnalysis = useMemo(() => {
        if(!studentA || !studentB) return [];
        return data.map(item => {
            const valA = (item as any)[studentAId] || 0;
            const valB = (item as any)[studentBId] || 0;
            const gap = Number((valA - valB).toFixed(2));
            return {
                aspectName: item.subject,
                gap,
                favors: gap > 0 ? studentA.name : (gap < 0 ? studentB.name : 'Seimbang')
            };
        }).sort((a,b) => Math.abs(b.gap) - Math.abs(a.gap));
    }, [data, studentAId, studentBId, studentA, studentB]);

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto w-full pb-24">
            <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Bandingkan Siswa</h1>
            <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider text-[11px]">Pilih dua siswa untuk membandingkan capaian pembelajaran dan identifikasi gap.</p>

            <div className="flex flex-col md:flex-row gap-6 mb-8 w-full max-w-4xl mx-auto">
                <div className="flex-1 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Siswa A</label>
                    <select 
                        value={studentAId} 
                        onChange={handleStudentAChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                        <option value="">-- Pilih Siswa A --</option>
                        {Array.isArray(students) && students.map(s => <option key={s.id} value={s.id} disabled={s.id === studentBId}>{s.name} ({s.kelompok})</option>)}
                    </select>
                </div>
                
                <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-black/10 text-xs">VS</div>
                </div>

                <div className="flex-1 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Siswa B</label>
                    <select 
                        value={studentBId} 
                        onChange={handleStudentBChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                        <option value="">-- Pilih Siswa B --</option>
                        {Array.isArray(students) && students.map(s => <option key={s.id} value={s.id} disabled={s.id === studentAId}>{s.name} ({s.kelompok})</option>)}
                    </select>
                </div>
            </div>

            {studentAId && studentBId && studentA && studentB ? (
                <div className="flex flex-col xl:flex-row gap-6 w-full max-w-4xl mx-auto">
                    <div className="flex-[3] bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Perbandingan Visual</h2>
                            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                               <button onClick={() => setViewMode('radar')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'radar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Radar</button>
                               <button onClick={() => setViewMode('bar')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'bar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>Bar</button>
                            </div>
                        </div>
                        <div className="h-80 w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                {viewMode === 'radar' ? (
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 4]} tick={{ fill: '#94a3b8', fontSize: 9 }} tickCount={5} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 800, paddingTop: '10px' }} formatter={(value) => value === studentAId ? studentA.name : studentB.name} />
                                        <Radar name={studentAId} dataKey={studentAId} stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} strokeWidth={3} />
                                        <Radar name={studentBId} dataKey={studentBId} stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} />
                                    </RadarChart>
                                ) : (
                                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} dy={10} />
                                        <YAxis domain={[0, 4]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} tickCount={5} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} cursor={{ fill: '#f8fafc' }} />
                                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 800, paddingTop: '10px' }} formatter={(value) => value === studentAId ? studentA.name : studentB.name} />
                                        <Bar name={studentAId} dataKey={studentAId} fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                                        <Bar name={studentBId} dataKey={studentBId} fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex-[2] bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Analisis Kesenjangan</h2>
                        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {gapAnalysis.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-slate-200 hover:shadow-sm">
                                    <div>
                                        <div className="text-[11px] font-black text-slate-950 uppercase">{item.aspectName}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                            {item.favors === 'Seimbang' ? 'Capaian Seimbang' : `Unggul: ${item.favors}`}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xl leading-none font-black ${item.gap === 0 ? 'text-slate-300' : (item.gap > 0 ? 'text-indigo-600' : 'text-emerald-500')}`}>
                                            {Math.abs(item.gap).toFixed(1)}
                                        </div>
                                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Poin Gap</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 mt-12">
                    <div className="w-24 h-24 mb-6 rounded-[2rem] bg-slate-200 text-white flex items-center justify-center rotate-3 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shimmer" />
                         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Pilih dua siswa untuk memulai</p>
                </div>
            )}
        </div>
    );
};
