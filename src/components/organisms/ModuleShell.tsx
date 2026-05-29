import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppModule } from '../../types';
import { cn } from '../../lib/utils';
import { AlertCircle, Loader2, ShieldAlert, Lock, Search, Users, ArrowRight } from 'lucide-react';
import { usePermissions } from '../../context/PermissionContext';

interface ModuleShellProps {
    activeModule: AppModule;
    moduleProps: any;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * ModuleShell: The second layer of the platform.
 * It provides a standardized environment for any plug-and-play module.
 */
export const ModuleShell: React.FC<ModuleShellProps> = ({ 
    activeModule, 
    moduleProps, 
    isLoading = false,
    error = null 
}) => {
    const Component = activeModule.component;
    const { student, students = [] } = moduleProps;
    const { canAccessModule, userRole } = usePermissions();
    const [pickerSearch, setPickerSearch] = useState("");

    const isAuthorized = canAccessModule(activeModule.id, activeModule.requiredRoles);

    // Filter students for inline selection
    const filteredStudents = useMemo(() => {
        if (!pickerSearch) return students;
        return students.filter((s: any) => 
            s.name?.toLowerCase().includes(pickerSearch.toLowerCase()) || 
            s.kelompok?.toLowerCase().includes(pickerSearch.toLowerCase())
        );
    }, [students, pickerSearch]);

    return (
        <div className="flex-1 flex flex-col relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeModule.id}
                    initial={{ opacity: 0, y: 10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 1.01 }}
                    transition={{ 
                        duration: 0.4, 
                        ease: [0.23, 1, 0.32, 1] 
                    }}
                    className="flex-1 flex flex-col"
                >
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-100/30 backdrop-blur-md">
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 180, 360]
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full mb-6"
                            />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Mounting Environment</span>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-rose-50/30">
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-6 font-bold shadow-lg shadow-rose-500/10">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tighter">Module Error</h3>
                            <p className="text-[10px] text-slate-500 font-bold max-w-xs text-center leading-relaxed">
                                {error}
                            </p>
                        </div>
                    ) : !isAuthorized ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 relative overflow-hidden group">
                             {/* Retro grid background */}
                             <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#4f4f4f_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                             
                             <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative z-10 flex flex-col items-center"
                             >
                                <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-rose-900/50 mb-8 transform group-hover:rotate-12 transition-transform duration-500">
                                    <Lock size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Access Restricted</h3>
                                <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.3em] mb-8">Unauthorized Clearance Level</p>
                                
                                <div className="max-w-xs text-center p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                                    <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6">
                                        Your current role <span className="text-white font-black">[{userRole}]</span> does not have the necessary permissions to access the <span className="text-indigo-400 font-black">{activeModule.name}</span> suite.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                        <ShieldAlert size={12} className="text-rose-500" />
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol Deviation 403</span>
                                    </div>
                                </div>
                             </motion.div>
                        </div>
                    ) : activeModule.requiresStudent && !student ? (
                        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#FDFDFD] text-left">
                            <div className="max-w-xl mx-auto w-full space-y-4">
                                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#7EC8E3]">Mulai Mengisi</span>
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
                                        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                                            <p className="text-xs text-slate-500 font-bold uppercase">Anak tidak ditemukan</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Coba ketik kata kunci pencarian yang lain.</p>
                                        </div>
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
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={cn(
                            "flex-1 flex flex-col",
                            activeModule.category === 'core' ? "bg-white" : "bg-slate-50/30"
                        )}>
                            <Component {...moduleProps} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
