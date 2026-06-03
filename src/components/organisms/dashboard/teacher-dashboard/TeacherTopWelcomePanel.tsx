import React from 'react';
import { Users, UserPlus, Search } from 'lucide-react';

interface TeacherTopWelcomePanelProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    setView?: (view: string) => void;
}

export const TeacherTopWelcomePanel = ({ searchQuery, setSearchQuery, setView }: TeacherTopWelcomePanelProps) => {
    return (
        <div className="bg-white border-b border-black/5 px-4 sm:px-6 md:px-8 py-5 sm:py-7 relative overflow-hidden shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="text-left">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                        Dashboard Perkembangan Kelas <span>🎒</span>
                    </h2>
                    <p className="text-xs text-slate-800 tracking-normal mt-1 max-w-xl font-medium">
                        Selamat bertugas, Ibu & Bapak Guru! Kelola administrasi perkembangan anak usia dini dengan penuh cinta dan keajaiban AI.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 bg-[#AEE6FF]/15 px-3 h-10 rounded-xl border border-[#AEE6FF]/40 text-xs text-left">
                        <span className="text-lg">👩‍🏫</span>
                        <div className="pr-1">
                            <span className="text-[7.5px] font-black text-indigo-950 block leading-tight">GURU PENGAJAR</span>
                            <span className="text-[10px] font-black text-indigo-950">Ibu Sri Guruwati</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => { if (setView) setView('students'); }}
                        className="h-10 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                    >
                        <Users size={14} />
                        Semua Siswa
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-6 flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-full sm:flex-1 text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ketik nama anak TK ceria..."
                        className="w-full h-11 pl-11 pr-4 bg-white border border-slate-300 rounded-xl text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-950"
                    />
                </div>
                
                <button 
                    onClick={() => { if (setView) setView('students'); }}
                    className="w-full sm:w-auto h-11 px-5 bg-[#7EC8E3] hover:bg-[#5BB4D0] text-[#052C34] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                >
                    <UserPlus size={14} />
                    Tambah Anak Baru
                </button>
            </div>
        </div>
    );
};
