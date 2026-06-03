import React from 'react';
import { ArrowRight, ChevronRight, Search } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Student } from '../../../../types';

interface PrincipalAnalysisBoardProps {
    classFilter: string;
    setClassFilter: (filter: string) => void;
    availableClasses: string[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredList: Student[];
    chronicAbsentSiswa: Student[];
    getAbsenteeRate: (student: Student) => number;
    setView?: (view: string) => void;
    onViewStudents: () => void;
}

export const PrincipalAnalysisBoard = ({
    classFilter,
    setClassFilter,
    availableClasses,
    searchQuery,
    setSearchQuery,
    filteredList,
    chronicAbsentSiswa,
    getAbsenteeRate,
    setView,
    onViewStudents
}: PrincipalAnalysisBoardProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-black/5 p-4 shadow-sm text-left flex flex-col h-[380px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 shrink-0">
                    <div>
                        <h3 className="text-sm font-black text-indigo-950 tracking-tight">Analisis Kelas & Kelayakan Rapor</h3>
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5 font-sans">Tinjauan Akademik Kepala Sekolah</p>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
                        <button 
                            onClick={() => setClassFilter('ALL')}
                            className={cn(
                                "px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider transition-all",
                                classFilter === 'ALL' 
                                    ? "bg-indigo-950 border-indigo-950 text-white" 
                                    : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            Semua
                        </button>
                        {availableClasses.map(cls => (
                            <button 
                                key={cls}
                                onClick={() => setClassFilter(cls)}
                                className={cn(
                                    "px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider transition-all",
                                    classFilter === cls 
                                        ? "bg-indigo-950 border-indigo-950 text-white" 
                                        : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                {cls}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 mb-2 shrink-0">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari perkembangan siswa..."
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-650 transition-all"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
                    {filteredList.map((student) => {
                        const rate = getAbsenteeRate(student);
                        const progress = student.height ? 90 : 45;
                        return (
                            <div 
                                key={student.id}
                                onClick={() => setView?.('students')}
                                className="p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-150 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded bg-white border border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 uppercase shrink-0">
                                        {student.photoUrl ? (
                                            <img src={student.photoUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                                        ) : student.name.substring(0, 2)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[11px] font-black text-slate-900 leading-tight truncate uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                            {student.name}
                                        </h4>
                                        <p className="text-[8px] font-bold text-slate-400 block leading-tight mt-0.5">
                                            KELOMPOK {student.kelompok} • UNIK ID #{student.id.substring(0, 5)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[8px] font-extrabold text-slate-500 uppercase block leading-none font-sans">Absensi</span>
                                            <span className={cn(
                                                "text-[10px] font-extrabold font-mono",
                                                rate >= 15 ? "text-red-500" : "text-slate-700"
                                            )}>
                                                {rate}%
                                            </span>
                                        </div>
                                        <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={cn("h-full", rate >= 15 ? "bg-red-500" : "bg-emerald-500")}
                                                style={{ width: `${Math.max(100 - rate, 0)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-700 font-mono block leading-none">{progress}%</span>
                                        <span className="text-[7px] font-extrabold text-slate-500 uppercase tracking-widest block mt-0.5">Progress</span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        );
                    })}
                    {filteredList.length === 0 && (
                        <div className="py-20 text-center opacity-30">
                            <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">Tidak ada data siswa ditemukan</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-4 shadow-sm text-left flex flex-col justify-between h-[380px]">
                <div className="shrink-0 mb-2">
                    <span className="text-[8px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200 tracking-wider">
                        ⚠ Peringatan Konseling
                    </span>
                    <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Absensi Rawan Cabang</h3>
                    <p className="text-[11px] font-medium text-slate-500 leading-normal mt-0.5">
                        Siswa dengan tingkat ketidakhadiran harian melampaui ambang batas aman (15%). Disarankan untuk penjadwalan bincang guru & orang tua.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
                    {chronicAbsentSiswa.map(student => (
                        <div 
                            key={student.id}
                            onClick={() => setView?.('students')}
                            className="p-3 bg-red-50/50 rounded-xl border border-red-100 hover:bg-red-50 flex items-center justify-between gap-2 transition-all cursor-pointer"
                        >
                            <div className="min-w-0">
                                <h4 className="text-[10px] font-black text-red-950 uppercase tracking-tight truncate leading-tight">
                                    {student.name}
                                </h4>
                                <p className="text-[8px] font-extrabold text-red-650 tracking-wider block mt-0.5">
                                    KELAS {student.kelompok} • ABSEN: {getAbsenteeRate(student)}%
                                </p>
                            </div>
                            <div className="bg-red-500 text-white rounded-[4px] px-1.5 py-0.5 font-bold font-mono text-[8px] tracking-tight uppercase shrink-0">
                                RAWAN
                            </div>
                        </div>
                    ))}
                    {chronicAbsentSiswa.length === 0 && (
                        <div className="py-16 text-center opacity-40 flex flex-col items-center justify-center">
                            <span className="text-xl mb-1">🎉</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#9EE493]">Semua siswa hadir tertib</span>
                        </div>
                    )}
                </div>

                <div className="mt-2 shrink-0 border-t border-slate-50 pt-2">
                    <button 
                        onClick={onViewStudents}
                        className="w-full h-8 bg-indigo-950 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 shadow transition-all cursor-pointer"
                    >
                        Periksa Hubungan Kelas <ArrowRight size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
};
