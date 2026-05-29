import React from 'react';
import { motion } from 'motion/react';
import { X, User, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Student } from '../../../types';

interface StudentDetailModalProps {
  student: Student;
  progress: number;
  onClose: () => void;
  onGoToAssessment: (id: string) => void;
}

export function StudentDetailModal({ student, progress, onClose, onGoToAssessment }: StudentDetailModalProps) {
  // Mock data for the last 3 months progress
  const mockProgressData = [
    { name: 'Mar', progress: Math.max(0, progress - 30) },
    { name: 'Apr', progress: Math.max(0, progress - 15) },
    { name: 'May', progress: progress },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                        {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <User size={32} className="text-slate-300" strokeWidth={2} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-1">{student.name}</h2>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded shadow-sm">KLS {student.kelompok}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.semester} {student.semesterType}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={16} className="text-slate-500" />
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <TrendingUp size={12} />
                        Progres Penilaian (3 Bulan)
                    </h3>
                    <div className="bg-slate-50 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-slate-100 shadow-inner">
                        <div className="flex items-end justify-between mb-4 sm:mb-6">
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Cakupan Penilaian</div>
                                <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{Math.round(progress)}%</div>
                            </div>
                            <div className="text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                <TrendingUp size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">+15%</span>
                            </div>
                        </div>

                        <div className="h-40 w-full mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockProgressData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                                        dy={10}
                                    />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                                      itemStyle={{ color: '#0f172a' }}
                                    />
                                    <Area type="monotone" dataKey="progress" stroke="#0f172a" strokeWidth={4} fillOpacity={1} fill="url(#colorProgress)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm flex flex-col justify-center">
                        <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={10} /> Rekap Kehadiran</div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 uppercase">
                            {student.attendanceLogs ? 
                                `${Object.values(student.attendanceLogs).filter(l => l === 'present').length} Hadir, ${Object.values(student.attendanceLogs).filter(l => l === 'absent').length} Absen`
                            : 'Belum Ada Data'}
                        </div>
                    </div>
                    <div className="p-3 sm:p-4 bg-white border border-slate-100 rounded-xl sm:rounded-2xl shadow-sm flex flex-col justify-center">
                        <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-xs sm:text-sm font-black text-emerald-600 uppercase">Terkontrol</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 shrink-0 mt-auto flex">
            <button 
                onClick={() => onGoToAssessment(student.id)}
                className="w-full flex justify-between items-center bg-black hover:bg-slate-900 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-black/10 group"
            >
                <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Aksi Tambahan</span>
                    <span className="text-sm font-black uppercase tracking-widest">Buka Penilaian Modul</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronRight size={20} />
                </div>
            </button>
        </div>
      </motion.div>
    </div>
  );
}
