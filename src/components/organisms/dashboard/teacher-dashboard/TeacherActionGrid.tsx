import React from 'react';

interface TeacherActionGridProps {
    pendingTasksCount: number;
    upcomingEventsCount: number;
    setView?: (view: string) => void;
}

export const TeacherActionGrid = ({ pendingTasksCount, upcomingEventsCount, setView }: TeacherActionGridProps) => {
    return (
        <div id="interactive_role_visual_cards_grid" className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            {/* E-Kanban Card */}
            <div 
                onClick={() => setView?.('kanban')}
                className="bg-gradient-to-br from-indigo-50 to-white hover:from-indigo-100/70 hover:to-indigo-50/50 border border-indigo-200 hover:border-indigo-400 p-5 rounded-3xl cursor-pointer active:scale-[0.99] transition-all duration-300 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group"
            >
                <div className="absolute -top-1 -right-1 opacity-10 select-none group-hover:scale-110 transition-transform">
                    <span className="text-[72px]">📋</span>
                </div>
                <div>
                    <span className="text-[8px] font-black tracking-widest text-indigo-700 uppercase bg-indigo-50 border border-indigo-250 px-2.5 py-1 rounded-md">
                        ALUR TUGAS KELAS
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-2.5">E-Kanban Guru</h4>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Atur, perbarui, dan pantau tugas kelas secara kolaboratif bersama personil sekolah</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-xl shadow-sm hover:bg-slate-50">
                        {pendingTasksCount} Tugas Aktif →
                    </span>
                    <div className="flex gap-1 items-end h-6 shrink-0">
                        <div className="w-1.5 h-3 bg-indigo-200 rounded-sm" />
                        <div className="w-1.5 h-4 bg-indigo-300 rounded-sm" />
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-sm animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Agenda Card */}
            <div 
                onClick={() => setView?.('calendar')}
                className="bg-gradient-to-br from-amber-50/40 to-white hover:from-amber-100/50 hover:to-amber-50/30 border border-amber-200 hover:border-amber-450 p-5 rounded-3xl cursor-pointer active:scale-[0.99] transition-all duration-300 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group"
            >
                <div className="absolute -top-1 -right-1 opacity-10 select-none group-hover:scale-110 transition-transform">
                    <span className="text-[72px]">📅</span>
                </div>
                <div>
                    <span className="text-[8px] font-black tracking-widest text-amber-700 uppercase bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                        AGENDA SEKOLAH
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-2.5">Kalender & Agenda</h4>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Cek jadwal kegiatan, rapat, dan hari libur sekolah.</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black text-amber-700 bg-white border border-amber-200 px-2.5 py-1 rounded-xl shadow-sm hover:bg-slate-50">
                        {upcomingEventsCount} Agenda Terdekat
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-black font-mono text-amber-700">Terpantau</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
