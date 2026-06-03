import React, { useState, useMemo } from 'react';
import { ShieldAlert, Lock, Search, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AppModule } from '../../../types';
import { EmptyState } from '../../atoms/EmptyState';

export const UnauthorizedMessage = ({ userRole, moduleName }: { userRole: string | null; moduleName: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white shadow-lg shadow-rose-200 mb-8 transform group-hover:rotate-12 transition-transform duration-500">
                <Lock size={32} />
            </div>
            <h3 className="text-2xl font-black text-rose-950 mb-2 uppercase tracking-tighter">Akses Terbatas</h3>
            <p className="text-[10px] text-rose-600 font-black uppercase tracking-[0.3em] mb-8">Unauthorized Clearance Level</p>
            <div className="max-w-xs text-center p-6 bg-white border border-slate-150 rounded-3xl shadow-sm">
                <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-6">
                    Akun Anda dengan peran <span className="text-rose-650 font-black">[{userRole}]</span> tidak memiliki wewenang untuk membuka modul <span className="text-indigo-600 font-black">{moduleName}</span>.
                </p>
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-50/50 rounded-full border border-rose-100">
                    <ShieldAlert size={12} className="text-rose-500" />
                    <span className="text-[8px] font-black text-rose-700 uppercase tracking-widest">Protocol Deviation 403</span>
                </div>
            </div>
        </motion.div>
    </div>
);

export const StudentSelector = ({ students, activeModule, moduleProps }: { students: any[], activeModule: AppModule, moduleProps: any }) => {
    const [pickerSearch, setPickerSearch] = useState("");

    const filteredStudents = useMemo(() => {
        if (!pickerSearch) return students;
        return students.filter((s: any) => 
            s.name?.toLowerCase().includes(pickerSearch.toLowerCase()) || 
            s.kelompok?.toLowerCase().includes(pickerSearch.toLowerCase())
        );
    }, [students, pickerSearch]);

    return (
        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#FDFDFD] text-left">
            <div className="max-w-xl mx-auto w-full space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Mulai Mengisi</span>
                    </div>
                    <h3 className="text-base font-black text-indigo-950 uppercase tracking-tight">
                        PILIH ANAK UNTUK MODUL {activeModule.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-semibold">
                        Silakan pilih salah satu anak di bawah ini untuk mengelola lembar bimbingan mereka secara langsung.
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text"
                        placeholder="Cari nama anak didik..."
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-950"
                    />
                </div>
                <div className="flex flex-col gap-2 max-h-[450px] overflow-y-auto pr-1">
                    {filteredStudents.length === 0 ? (
                        <EmptyState
                            icon={Search}
                            title="Anak Tidak Ditemukan"
                            description="Kata kunci pencarian Anda tidak cocok dengan nama atau data NISN anak didik manapun."
                            illustrationType="search"
                            size="compact"
                            className="bg-white border border-slate-200 rounded-2xl p-6"
                        />
                    ) : (
                        filteredStudents.map((s: any) => {
                            const progressVal = moduleProps.getStudentProgress ? moduleProps.getStudentProgress(s.id) : 0;
                            const displayProgress = Math.round(progressVal);
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => moduleProps.onSelectStudent(s)}
                                    className="w-full bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-center justify-between gap-3 text-left hover:border-indigo-500 hover:bg-slate-50 transition-all active:scale-[0.99] cursor-pointer min-h-[48px] shadow-sm group"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                                            {s.name}
                                        </h4>
                                        <p className="text-[9.5px] text-slate-600 font-semibold mt-0.5 uppercase tracking-wide">
                                            Kelompok {s.kelompok || "B1"} • NISN {s.nisn || "-"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="text-[9px] font-black uppercase text-slate-400">Progress</span>
                                            <span className="text-[11px] font-black text-slate-900 tabular-nums">
                                                {displayProgress}%
                                            </span>
                                        </div>
                                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                            <div 
                                                className="h-full rounded-full"
                                                style={{ 
                                                    width: `${displayProgress}%`,
                                                    backgroundColor: displayProgress === 100 ? '#9EE493' : displayProgress > 0 ? '#FFE699' : '#FFB3B3'
                                                }}
                                            />
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
