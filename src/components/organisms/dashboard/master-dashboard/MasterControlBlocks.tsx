import React from 'react';
import { ShieldCheck, Settings2, ArrowUpRight } from 'lucide-react';

interface MasterControlBlocksProps {
    setView?: (view: string) => void;
}

export const MasterControlBlocks = ({ setView }: MasterControlBlocksProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {/* Control Block 1 */}
            <div 
                onClick={() => setView?.('access-control')}
                className="bg-indigo-950 rounded-3xl p-6 flex flex-col justify-between h-56 shadow-lg shadow-indigo-900/10 text-white relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                    <ShieldCheck size={80} />
                </div>
                <div>
                    <span className="text-[10px] font-black tracking-widest text-[#7EC8E3] uppercase">Keamanan Inti</span>
                    <h3 className="text-lg font-black tracking-tight leading-tight mt-1 italic">Role Vault & Hak Akses</h3>
                    <p className="text-xs text-indigo-200 mt-1 leading-normal opacity-80 max-w-sm">
                        Kelola siapa saja yang bisa masuk ke platform dengan setelan izin khusus untuk Guru, Kepsek, dan Operator.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#AEE6FF]">
                    Kelola Akses <ArrowUpRight size={14} />
                </div>
            </div>

            {/* Control Block 2 */}
            <div 
                onClick={() => setView?.('settings')}
                className="bg-white rounded-3xl border border-black/5 p-6 flex flex-col justify-between h-56 shadow-sm group cursor-pointer transition-transform hover:scale-[1.01] hover:border-indigo-100"
            >
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                        <Settings2 size={20} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                        <ArrowUpRight size={16} />
                    </div>
                </div>
                <div>
                    <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Administrasi Sistem</span>
                    <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Profil Sekolah & Regional</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                        Kelola identitas sekolah, branding, logo, dan fitur-fitur aplikasi lainnya secara terpusat untuk seluruh pengguna TK.
                    </p>
                </div>
            </div>
        </div>
    );
};
