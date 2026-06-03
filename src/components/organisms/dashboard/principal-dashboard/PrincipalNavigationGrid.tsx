import React from 'react';
import { CalendarCheck, Users, BookOpen, FileText, ArrowRight } from 'lucide-react';

interface PrincipalNavigationGridProps {
    events: any[];
    tasks: any[];
    setView?: (view: string) => void;
    onViewStudents: () => void;
}

export const PrincipalNavigationGrid = ({ events, tasks, setView, onViewStudents }: PrincipalNavigationGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-slate-900 rounded-3xl p-5 border border-black/5 flex flex-col justify-between text-left h-56 shadow-lg relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                    <CalendarCheck size={80} className="text-white" />
                </div>
                <div>
                     <span className="text-[9px] font-black tracking-widest text-[#7EC8E3] uppercase block mb-1">Status Operasional</span>
                     <h3 className="text-sm font-black text-white tracking-tight">Agenda & Tugas Aktif</h3>
                     <div className="mt-4 space-y-2">
                         <div className="flex items-center justify-between text-[10px] text-slate-300">
                             <span>Agenda Mendatang</span>
                             <span className="font-black text-amber-400">{events.filter(e => new Date(e.date) >= new Date()).length} Item</span>
                         </div>
                         <div className="flex items-center justify-between text-[10px] text-slate-300">
                             <span>Tugas Guru (Kanban)</span>
                             <span className="font-black text-emerald-400">{tasks.filter(t => t.status !== 'DONE').length} Aktif</span>
                         </div>
                     </div>
                </div>
                <button 
                    onClick={() => setView && setView('calendar')}
                    className="h-8 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] w-fit"
                >
                    Buka Kalender <ArrowRight size={12} />
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col justify-between text-left h-56 shadow-sm relative group hover:border-[#7EC8E3] transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-[#AEE6FF]/30 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110 animate-pulse-slow">
                        <Users size={20} />
                    </div>
                    <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-md">Database</div>
                </div>
                <div>
                    <h3 className="text-sm font-black text-indigo-950 tracking-tight">Anak Didik B1 & B2</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">
                        Kelola pendaftaran siswa, mutasi kelas, NISN, dan arsip dokumen fisik perkembangan murid TK yang ceria.
                    </p>
                </div>
                <button 
                    onClick={onViewStudents}
                    className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-[0.98] w-fit"
                >
                    Daftar Siswa <ArrowRight size={12} />
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col justify-between text-left h-56 shadow-sm relative group hover:border-[#9EE493] transition-colors">
                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-[#9EE493]/30 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                        <BookOpen size={20} />
                    </div>
                    <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-md">SDM Guru</div>
                </div>
                <div>
                    <h3 className="text-sm font-black text-indigo-950 tracking-tight">Portal Guru Kreatif</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">
                        Pantau kesiapan guru dalam observasi anak, validasi rapor hasil generator AI, dan kontrol jam mengajar wali kelas.
                    </p>
                </div>
                <button 
                    onClick={() => setView && setView('staff')}
                    className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-[0.98] w-fit"
                >
                    Direktori Staf <ArrowRight size={12} />
                </button>
            </div>
            
            <div className="bg-white rounded-[32px] p-6 border border-black/5 flex flex-col md:flex-row items-center gap-6 text-left shadow-sm relative overflow-hidden md:col-span-3 mt-2">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#7EC8E3] opacity-5 rounded-full blur-3xl" />
                
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-[#AEE6FF] via-[#FFE699] to-[#FFB3B3] rounded-full flex items-center justify-center text-4xl shrink-0 shadow-lg">
                    🎈
                </div>
                
                <div className="flex-1">
                    <h4 className="text-base font-black text-indigo-950">Selamat Bertugas, Ibu/Bapak Kepala Sekolah! 🏫</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium max-w-2xl">
                        Aplikasi KiddyApps didesain khusus untuk memudahkan Sekolah TK dalam mengelola kurikulum Merdeka PAUD. Pantau setiap inci perkembangan karakter anak didik dengan asisten cerdas Gemini AI yang siap membantu membuat narasi rapor yang indah dan menyentuh hati.
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            <span className="text-[9px] font-black text-[#8e8e93] uppercase tracking-widest">Sistem Online</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-indigo-400" />
                            <span className="text-[9px] font-black text-[#8e8e93] uppercase tracking-widest">Cloud Sync Aktif</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
