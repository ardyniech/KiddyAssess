import React from 'react';
import { motion } from 'motion/react';
import { 
    Users, 
    BookOpen, 
    TrendingUp, 
    ShieldCheck,
    ArrowRight,
    Search,
    ChevronRight,
    UsersRound,
    FileText,
    Settings,
    CheckCircle2,
    CalendarCheck
} from 'lucide-react';
import { Student } from '../../../types';
import { cn } from '../../../lib/utils';
import { Card, Badge, Button } from '../../atoms/UIPrimitives';

interface PrincipalDashboardProps {
    students: Student[];
    onViewStudents: () => void;
    setView?: (view: string) => void;
    events?: any[];
    tasks?: any[];
    aspects?: any[];
    assessments?: Record<string, any>;
}

export const PrincipalDashboard = ({ students = [], onViewStudents, setView, events = [], tasks = [], aspects = [], assessments = {} }: PrincipalDashboardProps) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [classFilter, setClassFilter] = React.useState('ALL');

    // Dynamic computations
    const totalStudents = students.length;
    const kelompokA = students.filter(s => s.kelompok && s.kelompok.toUpperCase().startsWith('A')).length;
    const kelompokB = students.filter(s => s.kelompok && s.kelompok.toUpperCase().startsWith('B')).length;
    
    const getAbsenteeRate = (student: Student) => {
        if (!student.attendanceLogs) return 0;
        const logs = Object.values(student.attendanceLogs);
        if (logs.length === 0) return 0;
        const absences = logs.filter(l => l === 'absent').length;
        return Math.round((absences / logs.length) * 100);
    };

    const chronicAbsentSiswa = students.filter(s => getAbsenteeRate(s) >= 15);
    const averageProgress = students.length > 0 
        ? Math.round(students.reduce((acc, s) => acc + (s.height ? 60 : 25), 0) / students.length) 
        : 0;

    const availableClasses = Array.from(new Set(students.map(s => s.kelompok))).filter(Boolean);

    const filteredList = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = classFilter === 'ALL' || s.kelompok === classFilter;
        return matchesSearch && matchesClass;
    });

    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            {/* Top Playful Workspace Bar */}
            <div className="bg-white border-b border-black/5 shrink-0 px-4 sm:px-6 md:px-8 py-6 sm:py-8 relative overflow-hidden">
                {/* Visual Sky Ornaments */}
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

            {/* Main Content Workspace with Kindergarten Palette */}
            <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">
                
                {/* HIGH CONTRAST PERMISSION GUIDE NOTE */}
                <div id="principal_permission_guide_card" className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold leading-normal text-left flex items-start gap-3 transition-colors">
                    <span className="text-xl shrink-0">🟢</span>
                    <div>
                        <p className="font-black text-[#1A365D] text-xs uppercase tracking-wider mb-0.5">Catatan Hak Akses Kepala Sekolah (Supervisi Read-Only)</p>
                        <p className="text-[11px] text-slate-800 leading-tight">
                            Anda masuk sebagai <strong>Kepala Sekolah (ADMIN)</strong>. Sesuai kebijakan pengawasan sekolah, peran utama Anda adalah <strong>Read-Only supervisi</strong>: memonitor kelengkapan berkas, mendata absensi ekstrim, serta mengontrol SDM guru. Penambahan murid atau manipulasi indikator nilai dibatasi pada Guru Kelas/Wali Kelas demi kepatuhan data.
                        </p>
                    </div>
                </div>

                {/* PRINCIPAL EXCELLENCE TARGET (KPI) */}
                <div id="principal_kpi_responsibilities_card" className="bg-white rounded-3xl p-5 border border-black/5 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-[8px] font-black tracking-widest text-[#FF8000] uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Target Kinerja Kepala Sekolah (SLA)
                            </span>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Metrik Pengawasan Kualitas Lembaga</h3>
                        </div>
                        <div className="bg-[#9EE493] text-emerald-950 px-2 py-0.5 text-[9px] font-black rounded uppercase">
                            AKTIF
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-[#AEE6FF]/10 p-3 rounded-xl border border-[#AEE6FF]/30 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Kesiapan Rapor Kelas</span>
                            <div className="mt-2 text-indigo-950 font-mono font-black text-lg">
                                {averageProgress}% Terisi Rata-Rata
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Target Verifikasi: 100% Akhir Pekan</span>
                        </div>

                        <div className="bg-[#FFE699]/15 p-3 rounded-xl border border-[#FFE699]/40 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Kontrol Rombongan Belajar</span>
                            <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                                2 Rombel Utama
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Kelompok A: {kelompokA} | Kelompok B: {kelompokB}</span>
                        </div>

                        <div className="bg-[#FFB3B3]/10 p-3 rounded-xl border border-[#FFB3B3]/30 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Siswa Rawan Kehadiran</span>
                            <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                                {chronicAbsentSiswa.length} Siswa Diatasi
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Tingkat Absen Melampaui 15%</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards using Requested TK Colors */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                        { label: 'Total Anak Terdaftar', val: `${totalStudents} Siswa`, sub: `Ke. A: ${kelompokA} | Ke. B: ${kelompokB}`, icon: Users, color: '#AEE6FF', textColor: '#0F3C4B' },
                        { label: 'Staf Pengajar (Guru)', val: '4 Guru Cahaya', sub: '2 Wali Kelas, 2 Pendamping', icon: UsersRound, color: '#9EE493', textColor: '#144510' },
                        { label: 'Rata-rata Kelengkapan', val: `${averageProgress}% Isi`, sub: 'Progres Pengisian Rapor', icon: CheckCircle2, color: '#FFE699', textColor: '#4D3E00' },
                        { label: 'Siswa Rawan Absensi', val: `${chronicAbsentSiswa.length} Siswa`, sub: 'Kehadiran di bawah 85%', icon: CalendarCheck, color: '#FFB3B3', textColor: '#521010' }
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
                                    <stat.icon size={18} className="shrink-0" />
                                </div>
                                <div className="text-[8px] font-black opacity-10 select-none">KID_ID</div>
                            </div>
                            <div className="min-w-0">
                                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">{stat.label}</span>
                                <span className="text-base font-black text-indigo-950 mt-1 block leading-tight">{stat.val}</span>
                                <span className="text-[9px] font-semibold text-slate-500 mt-0.5 block leading-tight truncate">{stat.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Growth Analysis & Advisory Dashboard Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Interactive Analysis Table */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-black/5 p-4 shadow-sm text-left flex flex-col h-[380px]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 shrink-0">
                            <div>
                                <h3 className="text-sm font-black text-indigo-950 tracking-tight">Analisis Kelas & Kelayakan Rapor</h3>
                                <p className="text-[9px] text-[#8e8e93] uppercase font-black tracking-widest mt-0.5 font-sans">Tinjauan Akademik Kepala Sekolah</p>
                            </div>
                            {/* Class filter pills */}
                            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
                                <button 
                                    onClick={() => setClassFilter('ALL')}
                                    className={cn(
                                        "px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider transition-all",
                                        classFilter === 'ALL' 
                                            ? "bg-indigo-950 border-indigo-950 text-white" 
                                            : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                                    )}
                                >
                                    Semua
                                </button>
                                {availableClasses.map(cls => (
                                    <button 
                                        key={cls}
                                        onClick={() => setClassFilter(cls)}
                                        className={cn(
                                            "px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider transition-all",
                                            classFilter === cls 
                                                ? "bg-indigo-950 border-indigo-950 text-white" 
                                                : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        {cls}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search and results count */}
                        <div className="flex gap-2 mb-2 shrink-0">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari perkembangan siswa..."
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-650 transition-all"
                            />
                        </div>

                        {/* Interactive list */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
                            {filteredList.map((student) => {
                                const rate = getAbsenteeRate(student);
                                const progress = student.height ? 90 : 45;
                                return (
                                    <div 
                                        key={student.id}
                                        onClick={() => setView?.('students')}
                                        className="p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-150 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded bg-white border border-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 uppercase shrink-0">
                                                {student.photoUrl ? (
                                                    <img src={student.photoUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                                                ) : student.name.substring(0, 2)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-[11px] font-black text-slate-900 leading-tight truncate uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {student.name}
                                                </h4>
                                                <p className="text-[8px] font-bold text-slate-400 block leading-tight mt-0.5">
                                                    KELOMPOK {student.kelompok} • UNIK ID #{student.id.substring(0, 5)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[8px] font-extrabold text-[#7EC8E3] uppercase block leading-none font-sans">Absensi</span>
                                                    <span className={cn(
                                                        "text-[10px] font-extrabold font-mono",
                                                        rate >= 15 ? "text-red-500" : "text-slate-700"
                                                    )}>
                                                        {rate}%
                                                    </span>
                                                </div>
                                                <div className="w-16 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                    <div 
                                                        className={cn("h-full", rate >= 15 ? "bg-red-500" : "bg-emerald-500")}
                                                        style={{ width: `${Math.max(100 - rate, 0)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-slate-700 font-mono block leading-none">{progress}%</span>
                                                <span className="text-[7px] font-extrabold text-[#8e8e93] uppercase tracking-widest block mt-0.5">Progress</span>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredList.length === 0 && (
                                <div className="py-20 text-center opacity-30">
                                    <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">Tidak ada data siswa ditemukan</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Proactive Advisory panel */}
                    <div className="bg-white rounded-3xl border border-black/5 p-4 shadow-sm text-left flex flex-col justify-between h-[380px]">
                        <div className="shrink-0 mb-2">
                            <span className="text-[8px] font-black text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200 tracking-wider">
                                ⚠ Peringatan Konseling
                            </span>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Absensi Rawan Cabang</h3>
                            <p className="text-[11px] font-medium text-slate-500 leading-normal mt-0.5">
                                Siswa dengan tingkat ketidakhadiran harian melampaui ambang batas aman (15%). Disarankan untuk penjadwalan bincang guru & orang tua.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
                            {chronicAbsentSiswa.map(student => (
                                <div 
                                    key={student.id}
                                    onClick={() => setView?.('students')}
                                    className="p-3 bg-red-50/50 rounded-xl border border-red-100 hover:bg-red-50 flex items-center justify-between gap-2 transition-all cursor-pointer"
                                >
                                    <div className="min-w-0">
                                        <h4 className="text-[10px] font-black text-red-950 uppercase tracking-tight truncate leading-tight">
                                            {student.name}
                                        </h4>
                                        <p className="text-[8px] font-extrabold text-red-650 tracking-wider block mt-0.5">
                                            KELAS {student.kelompok} • ABSEN: {getAbsenteeRate(student)}%
                                        </p>
                                    </div>
                                    <div className="bg-red-500 text-white rounded-[4px] px-1.5 py-0.5 font-bold font-mono text-[8px] tracking-tight uppercase shrink-0">
                                        RAWAN
                                    </div>
                                </div>
                            ))}
                            {chronicAbsentSiswa.length === 0 && (
                                <div className="py-16 text-center opacity-40 flex flex-col items-center justify-center">
                                    <span className="text-xl mb-1">🎉</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#9EE493]">Semua siswa hadir tertib</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-2 shrink-0 border-t border-slate-50 pt-2">
                            <button 
                                onClick={onViewStudents}
                                className="w-full h-8 bg-indigo-950 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 shadow transition-all cursor-pointer"
                            >
                                Periksa Hubungan Kelas <ArrowRight size={10} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid Navigation Blocks for Principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Agenda & Monitoring Widget */}
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

                    {/* Data Master Block */}
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

                    {/* Teacher Portal Block */}
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

                    {/* Report Center Block */}
                    <div className="bg-white rounded-3xl border border-black/5 p-5 flex flex-col justify-between text-left h-56 shadow-sm relative group hover:border-[#FFE699] transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-2xl bg-[#FFE699]/30 flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110">
                                <FileText size={20} />
                            </div>
                            <div className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase rounded-md">Logistik</div>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight">Pusat Cetak Rapor</h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">
                                Lakukan finalisasi nilai, penandatanganan digital massal, dan unduh PDF rapor siap bagi ke orang tua siswa.
                            </p>
                        </div>
                        <button 
                            onClick={() => setView && setView('generator')}
                            className="h-8 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-[0.98] w-fit"
                        >
                            Cetak Rapor <ArrowRight size={12} />
                        </button>
                    </div>
                </div>

                {/* Friendly Illustration & Tip Board */}
                <div className="bg-white rounded-[32px] p-6 border border-black/5 flex flex-col md:flex-row items-center gap-6 text-left shadow-sm relative overflow-hidden">
                    {/* Soft decorative cloud */}
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

            </main>
        </div>
    );
};
