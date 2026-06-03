import React from 'react';
import { motion } from 'motion/react';
import { 
    Users, 
    TrendingUp, 
    ShieldCheck, 
    ArrowUpRight, 
    Building2, 
    MapPin,
    ChevronRight,
    Award,
    School,
    Search,
    BookOpen
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Student } from '../../../types';

interface YayasanDashboardProps {
    setView?: (view: string) => void;
    students?: Student[];
    aspects?: any[];
    assessments?: Record<string, any>;
    events?: any[];
    tasks?: any[];
}

export const YayasanDashboard: React.FC<YayasanDashboardProps> = ({ setView, students = [], aspects = [], assessments = {}, events = [], tasks = [] }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedGender, setSelectedGender] = React.useState('ALL');

    // Live Metrics calculations
    const totalStudents = students.length;
    const rombelCount = Array.from(new Set(students.map(s => s.kelompok))).filter(Boolean).length || 1;
    
    const kelompokA = students.filter(s => s.kelompok && s.kelompok.toUpperCase().startsWith('A')).length;
    const kelompokB = students.filter(s => s.kelompok && s.kelompok.toUpperCase().startsWith('B')).length;

    const averageProgress = students.length > 0
        ? Math.round(students.reduce((acc, s) => acc + (s.height ? 75 : 30), 0) / students.length)
        : 0;

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (student.kelompok && student.kelompok.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            {/* Top Workspace Bar */}
            <div className="bg-white border-b border-black/5 shrink-0 px-4 sm:px-6 md:px-8 py-6 sm:py-8 relative overflow-hidden">
                {/* Visual Sky Ornaments */}
                <div className="absolute top-4 right-16 opacity-10 select-none text-4xl animate-bounce-slow">🏢</div>
                
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 text-left">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-extrabold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                Kantor Eksekutif Yayasan
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
                            Manajemen Pusat Yayasan 🏢
                        </h2>
                        <p className="text-xs text-slate-500 tracking-wide mt-1 font-medium">
                            Sistem kontrol operasional, statistik pendaftaran antar-cabang, dan pemantauan kualitas akademik.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 bg-emerald-50 p-2 rounded-2xl border border-emerald-100 text-xs text-left">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="pr-4">
                            <span className="text-[8px] font-black text-emerald-800 block leading-tight">HAK MONITORING</span>
                            <span className="text-[11px] font-black text-emerald-950 uppercase mt-0.5">
                                AMAN / READ-ONLY
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Workspace */}
            <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">
                
                {/* HIGH CONTRAST PERMISSION GUIDE NOTE */}
                <div id="yayasan_permission_guide_card" className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold leading-normal text-left flex items-start gap-3 transition-colors">
                    <span className="text-xl shrink-0">🟢</span>
                    <div>
                        <p className="font-black text-[#1A365D] text-xs uppercase tracking-wider mb-0.5">Catatan Hak Akses Pengurus Yayasan (Read-Only Audiens)</p>
                        <p className="text-[11px] text-slate-800 leading-tight">
                            Anda masuk sebagai wakil dari <strong>Pengurus Yayasan Pusat</strong>. Sesuai kebijakan tata kelola kurikulum akreditasi, peran Anda adalah <strong>Read-Only</strong>: memantau perkembangan nilai, presensi, & sarana sekolah. Akses penambahan murid & penginputan nilai/narasi dibatasi eksklusif bagi Guru Kelas & Operator TU guna mencegah benturan wewenang.
                        </p>
                    </div>
                </div>

                {/* YAYASAN EXEC EXCELLENCE TARGET (KPI) */}
                <div id="yayasan_kpi_responsibilities_card" className="bg-white rounded-3xl p-5 border border-black/5 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-[8px] font-black tracking-widest text-[#FF8000] uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Target Kinerja Evaluasi Yayasan
                            </span>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Audit Kualitas Pengajaran Cabang</h3>
                        </div>
                        <div className="bg-[#9EE493] text-emerald-950 px-2 py-0.5 text-[9px] font-black rounded uppercase">
                            TERJAGA
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-[#AEE6FF]/10 p-3 rounded-xl border border-[#AEE6FF]/30 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Presentasi Pengisian Berkas</span>
                            <div className="mt-2 text-indigo-950 font-mono font-black text-lg">
                                {averageProgress}% Rerata Cabang
                            </div>
                            <div className="w-full bg-slate-150 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-[#7EC8E3] h-full" style={{ width: `${averageProgress}%` }} />
                            </div>
                        </div>

                        <div className="bg-[#FFE699]/15 p-3 rounded-xl border border-[#FFE699]/40 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Ekspansi Target Rombel</span>
                            <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                                {rombelCount} Kelas Aktif
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Penyebaran Distribusi Merdeka</span>
                        </div>

                        <div className="bg-[#FFB3B3]/10 p-3 rounded-xl border border-[#FFB3B3]/30 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Status Akreditasi Lembaga</span>
                            <div className="mt-2 text-rose-700 font-mono font-black text-lg">
                                GRADE A (UNGGUL)
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Diaudit berkala oleh Pengawas</span>
                        </div>
                    </div>
                </div>

                {/* Executive KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                        { label: 'Total Murid Roster', val: `${totalStudents} Anak`, sub: `Ke. A: ${kelompokA} | Ke. B: ${kelompokB}`, icon: Users, color: '#AEE6FF', textColor: '#0F3C4B' },
                        { label: 'Rombongan Belajar (Rombel)', val: `${rombelCount} Kelas`, sub: 'Rombel Aktif Terbuka', icon: Building2, color: '#9EE493', textColor: '#144510' },
                        { label: 'Akademik Rerata Rapor', val: `${averageProgress}% Isi`, sub: 'Pencapaian Indikator', icon: TrendingUp, color: '#FFE699', textColor: '#4D3E00' },
                        { label: 'Akreditasi Lembaga', val: 'STANDAR A', sub: 'Nasional PAUD Ceria', icon: Award, color: '#FFB3B3', textColor: '#521010' }
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-white rounded-2xl p-4 border border-black/5 flex flex-col gap-3 text-left shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                    style={{ backgroundColor: stat.color, color: stat.textColor }}
                                >
                                    <stat.icon size={18} />
                                </div>
                                <div className="text-[8px] font-black opacity-10 select-none">YYS_ID</div>
                            </div>
                            <div className="min-w-0">
                                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">{stat.label}</span>
                                <span className="text-base font-black text-indigo-950 mt-1 block leading-tight">{stat.val}</span>
                                <span className="text-[9px] font-semibold text-slate-500 mt-0.5 block leading-tight truncate">{stat.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dynamic Student Monitoring & Search for Yayasan */}
                <div className="bg-white rounded-3xl border border-black/5 p-4 shadow-sm text-left flex flex-col h-[320px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
                        <div>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight">Inspeksi Roster Siswa Seluruh Cabang</h3>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Tinjauan Pusat Terintegrasi</p>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-350" />
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama atau kelompok..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-3 py-1 text-xs font-bold text-[#2e2e33] placeholder:text-slate-350 focus:outline-none focus:border-indigo-600 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
                        {filteredStudents.map(student => {
                            const progress = student.height ? 92 : 38;
                            return (
                                <div 
                                    key={student.id}
                                    className="p-3 bg-slate-50/50 hover:bg-slate-100 rounded-xl border border-slate-150 flex items-center justify-between gap-3 transition-all"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded bg-white border border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400 uppercase shrink-0">
                                            {student.photoUrl ? (
                                                <img src={student.photoUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                                            ) : student.name.substring(0, 2)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[11px] font-black text-slate-900 leading-none truncate uppercase tracking-tight">
                                                {student.name}
                                            </h4>
                                            <p className="text-[8px] font-black text-slate-500 mt-1 block leading-none">
                                                KELAS {student.kelompok} • NISN: {student.nisn || "BELUM REGISTER"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 text-right">
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-950 font-mono block leading-none">{progress}%</span>
                                            <span className="text-[7px] font-extrabold text-slate-500 uppercase mt-1 block tracking-wider">Capaian</span>
                                        </div>
                                        <div className="px-2 py-1 bg-white border border-slate-200 text-[#2e2e33] font-black text-[8px] tracking-tight uppercase rounded">
                                            BACA SAJA
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <div className="py-16 text-center opacity-30">
                                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">Tidak ada data siswa ditemukan</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Branch Monitoring & Executive Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-left">
                    {/* Branch Card 1 */}
                    <div className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col justify-between h-48 shadow-sm group hover:border-[#7EC8E3] transition-colors">
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <MapPin size={14} className="text-indigo-600" />
                                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Wilayah Barat</span>
                            </div>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight">Kiddy Bandung Central</h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">
                                Status akreditasi semester ini tetap terjaga di Level A. Progress pengisian rapor digital mencapai 100%.
                            </p>
                        </div>
                        <div className="flex justify-between items-end border-t border-slate-50 pt-2">
                            <span className="text-[8px] font-black text-slate-400 uppercase">AKREDITASI: A ✔</span>
                            <button onClick={() => setView?.('students')} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Monitor Roster</button>
                        </div>
                    </div>

                    {/* Branch Card 2 */}
                    <div className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col justify-between h-48 shadow-sm group hover:border-emerald-200 transition-colors">
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <MapPin size={14} className="text-emerald-600" />
                                <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Wilayah Selatan</span>
                            </div>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight">Kiddy South Jakarta</h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">
                                Cabang unggulan dengan peminat pendaftaran tertinggi musim ini. Fokus pada peningkatan rasio asisten pendidik.
                            </p>
                        </div>
                        <div className="flex justify-between items-end border-t border-slate-50 pt-2">
                            <span className="text-[8px] font-black text-slate-400 uppercase">AKREDITASI: A ✔</span>
                            <button onClick={() => setView?.('students')} className="text-[9px] font-black text-emerald-600 uppercase hover:underline">Monitor Roster</button>
                        </div>
                    </div>

                    {/* Executive Control Block */}
                    <div className="bg-indigo-950 rounded-3xl p-5 flex flex-col justify-between h-48 shadow-lg shadow-indigo-900/10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                            <School size={60} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black tracking-tight leading-tight">Kebijakan Mutu Yayasan</h3>
                            <p className="text-[11px] text-indigo-200 mt-1 leading-normal opacity-80">
                                Seluruh butir indikator rapor disusun terpusat untuk menjaga standar kualitas lulusan di seluruh cabang sekolah.
                            </p>
                        </div>
                        <button 
                            onClick={() => setView && setView('finance')}
                            className="h-8 w-full bg-white text-indigo-950 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                        >
                            Keuangan & SPP <ArrowUpRight size={10} />
                        </button>
                    </div>
                </div>

                {/* Friendly Illustration & Tip Board */}
                <div className="bg-white rounded-[32px] p-6 border border-black/5 flex flex-col md:flex-row items-center gap-6 text-left shadow-sm relative overflow-hidden">
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500 opacity-5 rounded-full blur-3xl" />
                    
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-[#9EE493] via-[#AEE6FF] to-[#FFE699] rounded-full flex items-center justify-center text-4xl shrink-0 shadow-lg">
                        🏢
                    </div>
                    
                    <div className="flex-1">
                        <h4 className="text-base font-black text-indigo-950">Visi Masa Depan Yayasan 🌟</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium max-w-2xl">
                            Dashboard Yayasan bertindak sebagai pemantau ringkas dari kejauhan. Keamanan data disuplai oleh cloud sinkronisasi Firebase, sementara manipulasi nilai harian diserahkan sepenuhnya kepada tanggung jawab masing-masing Guru Kelas di lapangan menggunakan sistem klien yang mandiri.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
};
