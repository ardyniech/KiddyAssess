import React from 'react';
import { motion } from 'motion/react';
import { 
    Users, 
    Package, 
    ArrowRight, 
    ShieldCheck, 
    PlusCircle, 
    Database, 
    FileSpreadsheet,
    Smile
} from 'lucide-react';
import { Student } from '../../../types';
import { cn } from '../../../lib/utils';
import { Card, Badge, Button } from '../../atoms/UIPrimitives';

interface OperatorDashboardProps {
    students: Student[];
    onViewStudents: () => void;
    setView?: (view: string) => void;
    aspects?: any[];
    assessments?: Record<string, any>;
    events?: any[];
    tasks?: any[];
}

export const OperatorDashboard = ({ students = [], onViewStudents, setView, aspects = [], assessments = {}, events = [], tasks = [] }: OperatorDashboardProps) => {
    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            {/* Top Playful Workspace Bar */}
            <div className="bg-white border-b border-black/5 shrink-0 px-4 sm:px-6 md:px-8 py-6 sm:py-8 relative overflow-hidden">
                {/* Visual Sky Ornaments */}
                <div className="absolute top-4 right-16 opacity-10 select-none text-4xl animate-bounce-slow">📦</div>
                
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 text-left">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-extrabold tracking-widest text-[#FF8000] uppercase bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Terminal Operator & TU
                            </span>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
                            Manajemen Data & Logistik TU 🗄️
                        </h2>
                        <p className="text-xs text-slate-500 tracking-wide mt-1 font-medium">
                            Kelola pendaftaran siswa didik, verifikasi NISN, inventaris alat belajar mengajar, dan pencadangan instan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 bg-amber-50 p-2 rounded-2xl border border-amber-100 text-xs text-left">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="pr-4">
                            <span className="text-[8px] font-black text-amber-800 block leading-tight">STATUS AKSES</span>
                            <span className="text-[11px] font-black text-indigo-950 uppercase mt-0.5">
                                OPERATOR TU
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Workspace with Kindergarten Palette */}
            <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">
                
                {/* HIGH CONTRAST PERMISSION GUIDE NOTE */}
                <div id="operator_permission_guide_card" className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold leading-normal text-left flex items-start gap-3 transition-colors">
                    <span className="text-xl shrink-0">🟢</span>
                    <div>
                        <p className="font-black text-[#1A365D] text-xs uppercase tracking-wider mb-0.5">Catatan Hak Akses Tata Usaha & Operator (Full Access)</p>
                        <p className="text-[11px] text-slate-800 leading-tight">
                            Anda masuk sebagai <strong>Operator TU / Administrasi</strong>. Anda memiliki hak penuh untuk: <strong>mengelola roster siswa</strong>, <strong>mengedit data pendaftaran (NISN, biodata, dll)</strong>, serta <strong>menginput daftar Sarpras / Inventaris</strong> sekolah. Namun, Anda tidak memiliki akses untuk mengisi narasi akademik rapor siswa demi menjaga orisinalitas penilaian guru kelas.
                        </p>
                    </div>
                </div>

                {/* OPERATOR WORK RESPONSIBILITY & KPI STATUS BOARD */}
                <div id="operator_kpi_responsibilities_card" className="bg-white rounded-3xl p-5 border border-black/5 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-[8px] font-black tracking-widest text-[#FF8000] uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Target & Manajemen Data Sipil
                            </span>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Status Keandalan Database Sekolah</h3>
                        </div>
                        <div className="bg-[#9EE493] text-emerald-950 px-2 py-0.5 text-[9px] font-black rounded uppercase">
                            OPTIMAL
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-[#AEE6FF]/10 p-3 rounded-xl border border-[#AEE6FF]/30 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Verifikasi NISN Terdaftar</span>
                            <div className="mt-2 text-indigo-950 font-mono font-black text-lg">
                                {students.filter(s => s.nisn).length} / {students.length} Siswa
                            </div>
                            <div className="w-full bg-slate-150 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-[#7EC8E3] h-full" style={{ width: `${students.length ? (students.filter(s => s.nisn).length / students.length) * 100 : 0}%` }} />
                            </div>
                        </div>

                        <div className="bg-[#FFE699]/15 p-3 rounded-xl border border-[#FFE699]/40 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Kesiapan Sarana Sekolah</span>
                            <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                                12 Barang Terdata
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Logistik Sarana Mainan Edukatif</span>
                        </div>

                        <div className="bg-[#FFB3B3]/10 p-3 rounded-xl border border-[#FFB3B3]/30 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Metrik Sinkronisasi DB</span>
                            <div className="mt-2 text-emerald-700 font-mono font-black text-lg">
                                0ms (Sinkron)
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Firestore & Offline Dexie Terhubung</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                        { label: 'Siswa Terdaftar (Aktif)', val: `${students.length} Anak`, sub: 'TK Kelompok A & B', icon: Users, color: '#AEE6FF', textColor: '#0F3C4B' },
                        { label: 'Sistem Sinkronis Cloud', val: 'IndexedDB Aktif', sub: 'Pencadangan Tersimpan Aman', icon: Database, color: '#9EE493', textColor: '#144510' },
                        { label: 'Kesiapan Sarana Belajar', val: 'Siap Pakai', sub: 'Pendataan Inventaris Aktif', icon: Package, color: '#FFE699', textColor: '#4D3E00' }
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-2xl p-4 border border-black/5 flex items-center gap-3 text-left shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                        >
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                                style={{ backgroundColor: stat.color, color: stat.textColor }}
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

                {/* Grid Navigation Blocks for operator specific tasks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {/* Student Entry Block */}
                    <div className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col justify-between text-left h-56 shadow-sm relative group hover:border-[#7EC8E3] transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-[#AEE6FF]/30 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                                <Users size={20} />
                            </div>
                            <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded">DATA UTAMA</div>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight">Entri & Edit Data Murid</h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal font-semibold">
                                Lakukan pencatatan murid baru, sunting identitas kelompok kelas B1/B2, kelola NISN, data antropometri (tinggi & berat badan), dan status absensi bulanan.
                            </p>
                        </div>
                        <button 
                            onClick={onViewStudents}
                            className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all active:scale-[0.98] w-fit"
                        >
                            Daftar Siswa <ArrowRight size={10} />
                        </button>
                    </div>

                    {/* Inventory Entry Block */}
                    <div className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col justify-between text-left h-56 shadow-sm relative group hover:border-[#FFE699] transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-[#FFE699]/30 flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110">
                                <Package size={20} />
                            </div>
                            <div className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded">SARANA PRASARANA</div>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight">Inventarisasi Sekolah</h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal font-semibold">
                                Catat dan kelola sarana prasarana sekolah TK seperti alat permainan edukatif (APE), buku pelajaran kurikulum merdeka, sarana toilet higienis, dan logistik kantor sekolah.
                            </p>
                        </div>
                        <button 
                            onClick={() => setView && setView('inventory')}
                            className="h-8 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-all active:scale-[0.98] w-fit"
                        >
                            Direktori Barang <ArrowRight size={10} />
                        </button>
                    </div>
                </div>

                {/* Friendly Illustration & Tip Board */}
                <div className="bg-white rounded-[32px] p-6 border border-black/5 flex flex-col md:flex-row items-center gap-6 text-left shadow-sm relative overflow-hidden">
                    {/* Soft decorative cloud */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FFE699] opacity-5 rounded-full blur-3xl" />
                    
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-[#FFE699] via-[#AEE6FF] to-[#9EE493] rounded-full flex items-center justify-center text-4xl shrink-0 shadow-lg">
                        🏫
                    </div>
                    
                    <div className="flex-1">
                        <h4 className="text-base font-black text-indigo-950">Terima Kasih atas Dukungan Administrasi Anda! 📑</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold max-w-2xl">
                            Selaku staf Tata Usaha dan Operator, akurasi pendaftaran identitas anak serta NISN merupakan sendi utama kelancaran penerbitan rapor akhir semester. KiddyApps menyimpan database Anda dengan aman secara luring (luring-first) agar pekerjaan tidak tersendat oleh koneksi internet.
                        </p>
                        <div className="mt-3 flex items-center gap-5">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Akses Validasi DB Siap</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};
