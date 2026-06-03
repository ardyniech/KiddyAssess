import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrincipalTopPanel = () => {
    return (
        <div className="bg-white border-b border-black/5 shrink-0 px-4 sm:px-6 md:px-8 py-6 sm:py-8 relative overflow-hidden">
            <div className="absolute top-4 right-16 opacity-10 select-none text-4xl animate-bounce-slow">🎨</div>
            
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 text-left">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-extrabold tracking-widest text-[#7EC8E3] uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                            Kantor Utama Kepala Sekolah
                        </span>
                        <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
                        Konsol Utama KiddyApps 🏛️
                    </h2>
                    <p className="text-xs text-slate-500 tracking-wide mt-1 font-medium">
                        Pantau kemajuan pengisian rapor kelas, daftar staf pengajar, dan kesiapan administrasi dengan ceria.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 bg-[#AEE6FF]/15 p-2 rounded-2xl border border-[#AEE6FF]/40 text-xs text-left">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                        <ShieldCheck size={20} />
                    </div>
                    <div className="pr-4">
                        <span className="text-[8px] font-black text-indigo-800 block leading-tight">TAHUN AJARAN</span>
                        <span className="text-[11px] font-black text-indigo-950 uppercase mt-0.5">
                            2026/2027 Ganjil
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
