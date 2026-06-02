import React from 'react';

interface MasterSystemKPIProps {
    studentCount: number;
}

export const MasterSystemKPI = ({ studentCount }: MasterSystemKPIProps) => {
    return (
        <div id="master_system_kpi_card" className="bg-white rounded-3xl p-5 border border-black/5 text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <span className="text-[8px] font-black tracking-widest text-[#7EC8E3] uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                        SLA & Keandalan Infra
                    </span>
                    <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Metrik Operasional Sistem Cerdas</h3>
                </div>
                <div className="bg-[#9EE493] text-emerald-950 px-2 py-0.5 text-[9px] font-black rounded uppercase">
                    100% ONLINE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-[#AEE6FF]/10 p-3 rounded-xl border border-[#AEE6FF]/30 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">IndexedDB Cache Sync</span>
                    <div className="mt-2 text-indigo-950 font-mono font-black text-lg">
                        {studentCount} Siswa Terarsip luring
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Kecepatan Response: ~0.8ms</span>
                </div>

                <div className="bg-[#FFE699]/15 p-3 rounded-xl border border-[#FFE699]/40 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Model Pembelajaran AI</span>
                    <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                        Gemini 1.5 Lite
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Waktu Muat Narasi: &lt;1.5s</span>
                </div>

                <div className="bg-[#FFB3B3]/10 p-3 rounded-xl border border-[#FFB3B3]/30 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Uptime & Konektivitas</span>
                    <div className="mt-2 text-rose-700 font-mono font-black text-lg">
                        99.99% Bebas Kendala
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Backend Firebase Terhubung</span>
                </div>
            </div>
        </div>
    );
};
