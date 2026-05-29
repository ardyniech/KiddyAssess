import React from 'react';
import { motion } from 'motion/react';
import { 
    Cpu, 
    ShieldCheck, 
    Settings2, 
    ArrowUpRight, 
    Users, 
    Database, 
    Lock,
    Settings,
    FileText,
    AppWindow,
    RefreshCw
} from 'lucide-react';
import { Card, Badge, Button } from '../../atoms/UIPrimitives';
import { cn } from '../../../lib/utils';
import { Student } from '../../../types';

interface MasterDashboardProps {
    setView?: (view: string) => void;
    students?: Student[];
    events?: any[];
    tasks?: any[];
    aspects?: any[];
    assessments?: Record<string, any>;
    users?: any[];
}

export const MasterDashboard = ({ setView, students = [], events = [], tasks = [], aspects = [], assessments = {}, users = [] }: MasterDashboardProps) => {
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
    const pendingTasks = tasks.filter(t => t.status !== 'DONE').length;
    const userCount = users.length;
    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            {/* Top Playful Workspace Bar */}
            <div className="bg-white border-b border-black/5 shrink-0 px-4 sm:px-6 md:px-8 py-6 sm:py-8 relative overflow-hidden">
                {/* Visual Sky Ornaments */}
                <div className="absolute top-4 right-16 opacity-10 select-none text-4xl animate-bounce-slow">⚙️</div>
                
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 text-left">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-extrabold tracking-widest text-[#7EC8E3] uppercase bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                Ruang Kontrol Utama Master
                            </span>
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
                            Sistem Utama KiddyApps 🚀
                        </h2>
                        <p className="text-xs text-slate-500 tracking-wide mt-1 font-medium italic">
                            Administrator Sistem: Akses kendali inti, autentikasi, hak akses, dan mesin AI.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 bg-indigo-50 p-2 rounded-2xl border border-indigo-100 text-xs text-left">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                            <Cpu size={20} />
                        </div>
                        <div className="pr-4">
                            <span className="text-[8px] font-black text-indigo-800 block leading-tight">SYSTEM HEALTH</span>
                            <span className="text-[11px] font-black text-indigo-950 uppercase mt-0.5">
                                100% ONLINE / SAFE
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Workspace with Kindergarten Palette */}
            <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">
                
                {/* HIGH CONTRAST MASTER CONTROL GUIDE NOTE */}
                <div id="master_permission_guide_card" className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold leading-normal text-left flex items-start gap-3 transition-colors animate-pulse-slow">
                    <span className="text-xl shrink-0">🟢</span>
                    <div>
                        <p className="font-black text-[#1A365D] text-xs uppercase tracking-wider mb-0.5">Catatan Hak Akses Master Super-Admin (Core System Root)</p>
                        <p className="text-[11px] text-slate-800 leading-tight">
                            Anda masuk dengan hak <strong>MASTER ADMINISTRATOR (ROOT)</strong>. Anda memiliki kendali penuh di atas segala aspek: <strong>mengonfigurasi otorisasi sistem/role</strong>, <strong>melakukan audit status sinkronisasi IndexedDB/Firestore</strong>, serta <strong>memonitor ketersediaan mesin narasi AI Gemini</strong>. Harap lakukan penyuntingan peran dengan hati-hati.
                        </p>
                    </div>
                </div>

                {/* MASTER SYSTEM HEATH & PERFORMANCE TARGETS (KPI) */}
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
                                {students.length} Siswa Terarsip luring
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

                {/* Master KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {[
                        { label: 'Manajemen Peran', val: '5 Role Aktif', sub: 'Izin sistem tersegregasi', icon: Lock, color: '#AEE6FF' },
                        { label: 'Penyimpanan Lokal', val: 'IndexedDB Aman', sub: 'Sinkronisasi offline optimal', icon: Database, color: '#9EE493' },
                        { label: 'Pengguna Terdaftar', val: `${userCount} Akun`, sub: 'Log masuk KiddyApps', icon: Users, color: '#FFE699' },
                        { label: 'Integrasi AI', val: 'Gemini 1.5 Lite', sub: 'Mesin narasi siap pakai', icon: RefreshCw, color: '#AEE6FF' }
                    ].map((stat) => (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {/* Control Block 1 */}
                    <div 
                        onClick={() => setView && setView('access-control')}
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
                        onClick={() => setView && setView('settings')}
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

                {/* System Status Log Table Component */}
                <div className="bg-white rounded-[32px] p-6 border border-black/5 text-left shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h4 className="text-xs font-black uppercase text-indigo-950 tracking-widest">
                                Panel Monitor Kesehatan Sistem Digital
                            </h4>
                        </div>
                        <Badge variant="outline" className="text-[8px]">Aktualisasi Terakhir: {new Date().toLocaleTimeString()}</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                        {[
                            { name: 'IndexDB Client Storage', status: 'Optimal', detail: `${students.length} record terindeks`, color: 'emerald' },
                            { name: 'Autentikasi Pengguna', status: 'Aktif', detail: 'Firebase Auth', color: 'indigo' },
                            { name: 'Agenda & Event', status: 'Sinkron', detail: `${upcomingEvents} Agenda Mendatang`, color: 'sky' },
                            { name: 'Kanban & Tugas', status: 'Tertata', detail: `${pendingTasks} Tugas Aktif`, color: 'amber' }
                        ].map((node) => (
                            <div key={node.name} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="text-[11px] text-indigo-950 font-black truncate uppercase tracking-tight">{node.name}</span>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-[9px] font-bold text-slate-400">{node.detail}</span>
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded-lg uppercase shadow-sm",
                                        node.color === 'emerald' ? "bg-emerald-500 text-white" :
                                        node.color === 'indigo' ? "bg-indigo-500 text-white" :
                                        node.color === 'sky' ? "bg-sky-500 text-white" :
                                        "bg-amber-500 text-white"
                                    )}>{node.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Monitoring for Branch Schools */}
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
                                                 <span className="text-[7px] font-bold text-slate-500 group-hover:text-amber-900 leading-none mt-0.5">MEI</span>
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
                </div>

            </main>
        </div>
    );
};
