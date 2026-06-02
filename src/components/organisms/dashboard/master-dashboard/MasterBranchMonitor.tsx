import React from 'react';

interface MasterBranchMonitorProps {
    events: any[];
}

export const MasterBranchMonitor = ({ events }: MasterBranchMonitorProps) => {
    return (
        <div className="mt-2 pt-6 border-t border-slate-50">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Monitoring Operasional Cabang SMP & TK</h5>
            <div className="bg-slate-900 rounded-3xl p-5 text-white grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
                 
                 <div className="relative z-10">
                     <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Status Pengumpulan SPP</div>
                     <div className="space-y-4">
                         {[
                             { label: 'Cabang SMP Harapan', val: 'Rp 42.5M', progress: 75, status: 'Meningkat' },
                             { label: 'Cabang TK Ceria', val: 'Rp 12.8M', progress: 95, status: 'Optimal' }
                         ].map(b => (
                             <div key={b.label} className="space-y-1.5">
                                 <div className="flex justify-between items-end">
                                     <span className="text-xs font-bold text-slate-200">{b.label}</span>
                                     <span className="text-[9px] font-black text-indigo-400">{b.val}</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                     <div className="h-full bg-indigo-500" style={{ width: `${b.progress}%` }} />
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 <div className="relative z-10 border-l border-white/5 pl-0 md:pl-6">
                     <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-4">Agenda Penting Mendatang</div>
                     <div className="space-y-3">
                         {events.slice(0, 3).map(e => (
                             <div key={e.id} className="flex gap-3 items-start group">
                                 <div className="w-7 h-7 rounded-lg bg-white/5 flex flex-col items-center justify-center border border-white/5 group-hover:bg-amber-500 transition-colors">
                                     <span className="text-[9px] font-black text-amber-500 group-hover:text-amber-950 leading-none">{e.date.split('-')[2]}</span>
                                     <span className="text-[7px] font-bold text-slate-500 group-hover:text-amber-900 leading-none mt-0.5">Bulan ini</span>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className="text-[10px] font-black text-slate-200 group-hover:text-amber-400 truncate transition-colors uppercase">{e.title}</div>
                                     <div className="text-[8px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">{e.location} • {e.startTime}</div>
                                 </div>
                             </div>
                         ))}
                         {events.length === 0 && <div className="text-[10px] text-slate-500 italic">Tidak ada agenda dekat ini</div>}
                     </div>
                 </div>
            </div>
        </div>
    );
};
