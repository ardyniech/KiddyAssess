import React from 'react';
import { Lock, Database, Users, RefreshCw } from 'lucide-react';

interface MasterActionGridProps {
    userCount: number;
}

export const MasterActionGrid = ({ userCount }: MasterActionGridProps) => {
    const stats = [
        { label: 'Manajemen Peran', val: '5 Role Aktif', sub: 'Izin sistem tersegregasi', icon: Lock, color: '#AEE6FF' },
        { label: 'Penyimpanan Lokal', val: 'IndexedDB Aman', sub: 'Sinkronisasi offline optimal', icon: Database, color: '#9EE493' },
        { label: 'Pengguna Terdaftar', val: `${userCount} Akun`, sub: 'Log masuk KiddyApps', icon: Users, color: '#FFE699' },
        { label: 'Integrasi AI', val: 'Gemini 1.5 Lite', sub: 'Mesin narasi siap pakai', icon: RefreshCw, color: '#AEE6FF' }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-white rounded-2xl p-4 border border-black/5 flex items-center gap-3 text-left shadow-sm relative overflow-hidden"
                >
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                        style={{ backgroundColor: stat.color, color: '#0F3C4B' }}
                    >
                        <stat.icon size={18} />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">{stat.label}</span>
                        <span className="text-sm font-black text-indigo-950 mt-1 block leading-tight">{stat.val}</span>
                        <span className="text-[9px] font-semibold text-slate-500 mt-0.5 block leading-tight truncate">{stat.sub}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
