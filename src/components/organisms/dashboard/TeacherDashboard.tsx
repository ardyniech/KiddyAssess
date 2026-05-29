import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Users, 
    BookOpen, 
    Sparkles, 
    CheckCircle, 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    Pencil, 
    Wand2, 
    Printer, 
    Smile, 
    AlertCircle, 
    XCircle,
    Compass,
    Check,
    HelpCircle,
    Layers,
    UserPlus,
    Flame,
    Music,
    Palette
} from 'lucide-react';
import { Student, Aspect } from '../../../types';
import { cn } from '../../../lib/utils';
import { DashboardKPIMatrix } from './DashboardKPIMatrix';

interface TeacherDashboardProps {
    students: Student[];
    assessments?: Record<string, any>;
    aspects?: Aspect[];
    onSelectStudent: (student: Student) => void;
    setView?: (view: string) => void;
    events?: any[];
    tasks?: any[];
}

// Playful animal sticker tags for empty avatars
const CHILD_STICKERS = ["🦁", "🐼", "🐨", "🦊", "🐰", "🐯", "🐱", "🐶", "🐵", "🐸", "🐤", "🦄", "🐙", "🐢", "🐧", "🦉"];
const getStudentSticker = (name: string, index: number) => {
    const code = name.charCodeAt(0) + name.length + index;
    return CHILD_STICKERS[code % CHILD_STICKERS.length];
};

export const TeacherDashboard = ({ 
    students = [], 
    assessments = {}, 
    aspects = [], 
    onSelectStudent, 
    setView,
    events = [],
    tasks = []
}: TeacherDashboardProps) => {
    const upcomingEventsCount = events.filter(e => new Date(e.date) >= new Date()).length;
    const pendingTasksCount = tasks.filter(t => t.status !== 'DONE').length;
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showKPIMatrix, setShowKPIMatrix] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem('dismissed_tk_onboarding');
    });
    const [onboardingStep, setOnboardingStep] = useState(1);

    const itemsPerPage = 6;

    // Pre-calculate aspects list to fall back if empty
    const aspectsList = aspects.length > 0 ? aspects : [
        { id: 'nilai_agama_moral', name: 'Nilai Agama dan Moral', indicators: Array(15).fill({}) },
        { id: 'fisik_motorik', name: 'Fisik Motorik', indicators: Array(15).fill({}) },
        { id: 'kognitif', name: 'Kognitif', indicators: Array(15).fill({}) }
    ];

    // Total indicators across all aspects
    const totalIndicators = useMemo(() => {
        return aspectsList.reduce((acc, aspect) => acc + (aspect.indicators?.length || 0), 0);
    }, [aspectsList]);

    // Calculate student progress metrics
    const getStudentStats = (studentId: string) => {
        const studentAssess = assessments[studentId] || {};
        let filledCount = 0;

        aspectsList.forEach(aspect => {
            const aspectScores = studentAssess[aspect.id] || {};
            const activeIndicatorIds = aspect.indicators?.map(i => i.id) || [];
            if (activeIndicatorIds.length > 0) {
                filledCount += Object.keys(aspectScores).filter(k => activeIndicatorIds.includes(k)).length;
            } else {
                filledCount += Object.keys(aspectScores).length;
            }
        });

        const progressPercent = totalIndicators > 0 ? (filledCount / totalIndicators) * 100 : 0;
        return {
            filled: filledCount,
            total: totalIndicators,
            percent: Math.min(100, Math.round(progressPercent))
        };
    };

    // Filter students by search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        return students.filter(student => 
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (student.kelompok && student.kelompok.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [students, searchQuery]);

    // Reset pagination on search change safely with useEffect
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Calculate aggregate class stats based on kindergarten colors: Finished (Green), Assessing (Yellow), Unassessed (Pink)
    const childAssessMetrics = useMemo(() => {
        let fullyAssessed = 0; // Completed (100%)
        let inProgress = 0;    // Process (1-99%)
        let notAssessed = 0;   // Inactive (0%)

        students.forEach(student => {
            const { percent } = getStudentStats(student.id);
            if (percent === 100) {
                fullyAssessed++;
            } else if (percent > 0) {
                inProgress++;
            } else {
                notAssessed++;
            }
        });

        return {
            fullyAssessed,
            inProgress,
            notAssessed
        };
    }, [students, assessments, aspectsList, totalIndicators]);

    // Pagination slice
    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStudents, currentPage]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const handleSelectAction = (student: Student, targetView: string) => {
        onSelectStudent(student);
        if (setView) {
            setView(targetView);
        }
    };

    const dismissOnboarding = () => {
        setShowOnboarding(false);
        localStorage.setItem('dismissed_tk_onboarding', 'true');
    };

    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            {/* Playful Garden Top Welcome Segment */}
            <div className="bg-white border-b border-black/5 px-4 sm:px-6 md:px-8 py-5 sm:py-7 relative overflow-hidden shrink-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="text-left">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                            Dashboard Perkembangan Kelas <span>🎒</span>
                        </h2>
                        <p className="text-xs text-slate-800 tracking-normal mt-1 max-w-xl font-medium">
                            Selamat bertugas, Ibu & Bapak Guru! Kelola administrasi perkembangan anak usia dini dengan penuh cinta dan keajaiban AI.
                        </p>
                    </div>

                    {/* Direct Quick Actions */}
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-2 bg-[#AEE6FF]/15 px-3 h-10 rounded-xl border border-[#AEE6FF]/40 text-xs text-left">
                            <span className="text-lg">👩‍🏫</span>
                            <div className="pr-1">
                                <span className="text-[7.5px] font-black text-indigo-950 block leading-tight">GURU PENGAJAR</span>
                                <span className="text-[10px] font-black text-indigo-950">Ibu Sri Guruwati</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => { if (setView) setView('students'); }}
                            className="h-10 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                        >
                            <Users size={14} />
                            Semua Siswa
                        </button>
                    </div>
                </div>

                {/* Sub-header row with Search Bar & New Student trigger */}
                <div className="max-w-7xl mx-auto mt-6 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative w-full sm:flex-1 text-left">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ketik nama anak TK ceria..."
                            className="w-full h-11 pl-11 pr-4 bg-white border border-slate-300 rounded-xl text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-950"
                        />
                    </div>
                    
                    <button 
                        onClick={() => { if (setView) setView('students'); }}
                        className="w-full sm:w-auto h-11 px-5 bg-[#7EC8E3] hover:bg-[#5BB4D0] text-[#052C34] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                    >
                        <UserPlus size={14} />
                        Tambah Anak Baru
                    </button>
                </div>
            </div>

            {/* Main scrollable body */}
            <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">

                {/* INTERACTIVE MODULE ACCESS CARDS - ROLE LEVEL KPI & KANBAN */}
                <div id="interactive_role_visual_cards_grid" className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                     {/* E-Kanban Card */}
                     <div 
                         id="teacher_kanban_card"
                         onClick={() => setView && setView('kanban')}
                         className="bg-gradient-to-br from-indigo-50 to-white hover:from-indigo-100/70 hover:to-indigo-50/50 border border-indigo-200 hover:border-indigo-400 p-5 rounded-3xl cursor-pointer active:scale-[0.99] transition-all duration-300 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group"
                     >
                         <div className="absolute -top-1 -right-1 opacity-10 select-none group-hover:scale-110 transition-transform">
                             <span className="text-[72px]">📋</span>
                         </div>
                         <div>
                             <span className="text-[8px] font-black tracking-widest text-indigo-700 uppercase bg-indigo-50 border border-indigo-250 px-2.5 py-1 rounded-md">
                                 ALUR TUGAS KELAS
                             </span>
                             <h4 className="text-sm font-black text-slate-900 mt-2.5">E-Kanban Guru</h4>
                             <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Atur, perbarui, dan pantau tugas kelas secara kolaboratif bersama personil sekolah</p>
                         </div>
                         <div className="flex items-center justify-between mt-auto">
                              <span className="text-[10px] font-black text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-xl shadow-sm hover:bg-slate-50">
                                  {pendingTasksCount} Tugas Aktif →
                              </span>
                              {/* Small Data Visual for Kanban */}
                              <div className="flex gap-1 items-end h-6 shrink-0">
                                   <div className="w-1.5 h-3 bg-indigo-200 rounded-sm" />
                                   <div className="w-1.5 h-4 bg-indigo-300 rounded-sm" />
                                   <div className="w-1.5 h-6 bg-indigo-600 rounded-sm animate-pulse" />
                              </div>
                         </div>
                     </div>

                     {/* Agenda Card */}
                     <div 
                         id="teacher_agenda_card"
                         onClick={() => setView && setView('calendar')}
                         className="bg-gradient-to-br from-amber-50/40 to-white hover:from-amber-100/50 hover:to-amber-50/30 border border-amber-200 hover:border-amber-450 p-5 rounded-3xl cursor-pointer active:scale-[0.99] transition-all duration-300 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group"
                     >
                         <div className="absolute -top-1 -right-1 opacity-10 select-none group-hover:scale-110 transition-transform">
                             <span className="text-[72px]">📅</span>
                         </div>
                         <div>
                             <span className="text-[8px] font-black tracking-widest text-amber-700 uppercase bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                                 AGENDA SEKOLAH
                             </span>
                             <h4 className="text-sm font-black text-slate-900 mt-2.5">Kalender & Agenda</h4>
                             <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Cek jadwal kegiatan, rapat, dan hari libur sekolah.</p>
                         </div>
                         <div className="flex items-center justify-between mt-auto">
                              <span className="text-[10px] font-black text-amber-700 bg-white border border-amber-200 px-2.5 py-1 rounded-xl shadow-sm hover:bg-slate-50">
                                  {upcomingEventsCount} Agenda Terdekat
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[10px] font-black font-mono text-amber-700">Terpantau</span>
                              </div>
                         </div>
                     </div>
                </div>

                {/* Collapsible KPI Matrix block */}
                <AnimatePresence>
                    {showKPIMatrix && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white border text-left border-black/5 rounded-[32px] p-5 overflow-hidden shadow-xl"
                        >
                            <h3 className="text-xs font-black text-indigo-950 uppercase tracking-widest mb-4">
                                Matriks Perkembangan Aspek (KPI) Kelas Terintegrasi
                            </h3>
                            <DashboardKPIMatrix students={students} aspects={aspectsList} assessments={assessments} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* TEACHER WORK RESPONSIBILITY & KPI STATUS BOARD */}
                <div id="teacher_kpi_responsibilities_card" className="bg-white rounded-3xl p-5 border border-black/5 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-[8px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                                Pekerjaan & Target Utama
                            </span>
                            <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Status Kinerja Pengajaran Semester Ganjil</h3>
                        </div>
                        <div className="bg-[#9EE493] text-emerald-950 px-2 py-0.5 text-[9px] font-black rounded uppercase">
                            AKTIF
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-[#AEE6FF]/10 p-3 rounded-xl border border-[#AEE6FF]/30 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Isi Indikator</span>
                            <div className="mt-2 text-indigo-950 font-mono font-black text-lg">
                                {childAssessMetrics.fullyAssessed} / {students.length} Siswa
                            </div>
                            <div className="w-full bg-slate-150 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-[#7EC8E3] h-full" style={{ width: `${students.length ? (childAssessMetrics.fullyAssessed / students.length) * 100 : 0}%` }} />
                            </div>
                        </div>

                        <div className="bg-[#FFE699]/15 p-3 rounded-xl border border-[#FFE699]/40 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Narasi AI Rapor Beres</span>
                            <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                                {childAssessMetrics.fullyAssessed} Draft Rapor
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Wewenang Editor Bersertifikasi AI</span>
                        </div>

                        <div className="bg-[#FFB3B3]/10 p-3 rounded-xl border border-[#FFB3B3]/30 flex flex-col justify-between">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Rasio Absensi Rata-rata</span>
                            <div className="mt-2 text-rose-700 font-mono font-black text-lg">
                                94.2% Tertib
                            </div>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Penetapan harian diperbarui oleh Guru</span>
                        </div>
                    </div>
                </div>

                {/* Playful Top Classroom Metrics header row inside body */}
                <div className="text-left space-y-2">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 px-1 bg-gradient-to-r from-[#AEE6FF]/10 to-[#FFE699]/10 p-4 rounded-2xl border border-black/5">
                        <div>
                            <h2 className="text-base font-black text-indigo-950">Progres Perkembangan Kelas B1 🎨</h2>
                            <p className="text-xs text-slate-700 font-semibold mt-0.5">
                                Status: <span className="font-extrabold text-slate-950">{students.length} anak terdaftar</span>, 
                                <span className="text-emerald-800 font-extrabold ml-1">{childAssessMetrics.fullyAssessed} selesai</span> diisi, 
                                <span className="text-amber-900 font-extrabold ml-1">{childAssessMetrics.inProgress + childAssessMetrics.notAssessed} belum selesai</span>.
                            </p>
                        </div>
                        <div className="text-xs opacity-80 font-semibold text-slate-600">Tahun Ajaran Aktif</div>
                    </div>

                    {/* Three Kindergarten Status Summary Tiles (strict colors from PRD: #9EE493, #FFE699, #FFB3B3) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* Completed Row (Green) */}
                        <div className="bg-[#9EE493]/20 border-2 border-[#9EE493] rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                            <div className="w-9 h-9 rounded-full bg-[#9EE493] flex items-center justify-center text-emerald-950 font-black text-lg shrink-0 shadow shadow-emerald-200/50">
                                😊
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] font-extrabold text-[#144510] uppercase tracking-wider block leading-tight">Penilaian Lengkap</span>
                                <span className="text-sm font-black text-[#144510] mt-0.5 block leading-none">{childAssessMetrics.fullyAssessed} Anak Selesai</span>
                                <span className="text-[8.5px] font-bold text-emerald-700 uppercase tracking-wide mt-1 block">Rapor asisten siap cetak 🚀</span>
                            </div>
                        </div>

                        {/* In-Progress (Yellow) */}
                        <div className="bg-[#FFE699]/30 border-2 border-[#FFE699] rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                            <div className="w-9 h-9 rounded-full bg-[#FFE699] flex items-center justify-center text-amber-950 font-black text-lg shrink-0 shadow shadow-amber-100/50">
                                ✍️
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-wider block leading-tight">Sedang Berlangsung</span>
                                <span className="text-sm font-black text-amber-950 mt-0.5 block leading-none">{childAssessMetrics.inProgress} Sedang Dinilai</span>
                                <span className="text-[8.5px] font-bold text-amber-700 uppercase tracking-wide mt-1 block">Kurang beberapa indikator ✏️</span>
                            </div>
                        </div>

                        {/* Unassessed (Pink) */}
                        <div className="bg-[#FFB3B3]/25 border-2 border-[#FFB3B3] rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                            <div className="w-9 h-9 rounded-full bg-[#FFB3B3] flex items-center justify-center text-rose-950 font-black text-lg shrink-0 shadow shadow-rose-100/50">
                                💤
                            </div>
                            <div className="min-w-0">
                                <span className="text-[9px] font-extrabold text-rose-800 uppercase tracking-wider block leading-tight">Belum Diisi</span>
                                <span className="text-sm font-black text-rose-950 mt-0.5 block leading-none">{childAssessMetrics.notAssessed} Belum Dinilai</span>
                                <span className="text-[8.5px] font-bold text-rose-700 uppercase tracking-wide mt-1 block">Belum ada observasi masuk 💤</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Directory Content block */}
                <div className="text-left space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                            Direktori Anak Didik ({filteredStudents.length} siswa terfilter)
                        </span>
                        {totalPages > 1 && (
                            <span className="text-[9.5px] font-semibold text-slate-400">Halaman {currentPage} dari {totalPages}</span>
                        )}
                    </div>

                    {paginatedStudents.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center flex flex-col items-center justify-center shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 text-2xl mb-2">
                                🕵️
                            </div>
                            <h4 className="text-xs font-black text-[#1A365D] uppercase">Anak didik tidak ditemukan</h4>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-sm font-medium">
                                Cari dengan ejaan nama lain, kelompok rombel, atau tambahkan riwayat anak didik baru di atas.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {paginatedStudents.map((student, studentIndex) => {
                                const { percent } = getStudentStats(student.id);
                                const currentRankIndex = (currentPage - 1) * itemsPerPage + studentIndex;
                                const babySticker = getStudentSticker(student.name, currentRankIndex);
                                
                                return (
                                    <div 
                                        key={student.id}
                                        onClick={() => handleSelectAction(student, 'assessment')}
                                        className="bg-white rounded-xl border border-slate-100 p-3 flex items-center justify-between gap-3 active:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {student.photoUrl ? (
                                                <img 
                                                    src={student.photoUrl} 
                                                    alt={student.name}
                                                    referrerPolicy="no-referrer"
                                                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-lg flex items-center justify-center shrink-0">
                                                    {babySticker}
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <h3 className="text-xs font-bold text-slate-900 truncate">
                                                    {student.name}
                                                </h3>
                                                <p className="text-[9px] text-slate-500 truncate">
                                                    Kelompok {student.kelompok || "B1"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full"
                                                    style={{ 
                                                        width: `${percent}%`,
                                                        backgroundColor: percent === 100 ? '#9EE493' : percent > 0 ? '#FFE699' : '#FFB3B3'
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 font-mono w-8 text-right">
                                                {percent}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Cute pagination bar indicators list */}
                    {totalPages > 1 && (
                        <div className="pt-2 flex items-center justify-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={cn(
                                    "w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer",
                                    currentPage === 1 ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 text-[#2F5270] hover:bg-slate-50"
                                )}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {Array.from({ length: totalPages }).map((_, rank) => {
                                const rankIndex = rank + 1;
                                return (
                                    <button
                                        key={rankIndex}
                                        onClick={() => setCurrentPage(rankIndex)}
                                        className={cn(
                                            "w-8 h-8 rounded-full text-[11px] font-extrabold transition-all cursor-pointer",
                                            currentPage === rankIndex 
                                                ? "bg-indigo-600 text-white shadow shadow-indigo-200 scale-105" 
                                                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
                                        )}
                                    >
                                        {rankIndex}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={cn(
                                    "w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer",
                                    currentPage === totalPages ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 text-[#2F5270] hover:bg-slate-50"
                                )}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* HIGH CONTRAST PERMISSION GUIDE NOTE - PUT ON BOTTOM PAGE */}
                <div id="teacher_permission_guide_card" className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold leading-normal text-left flex items-start gap-3 transition-colors mt-8">
                    <span className="text-xl shrink-0">🟢</span>
                    <div>
                        <p className="font-black text-[#1A365D] text-xs uppercase tracking-wider mb-0.5">Catatan Hak Akses Guru Kelas (Full Access)</p>
                        <p className="text-[11px] text-slate-800 leading-tight">
                            Anda masuk sebagai <strong>Guru Utama</strong>. Anda memiliki wewenang penuh untuk: <strong>mengisi & mengedit data nilai siswa</strong>, <strong>menambahkan siswa baru</strong>, <strong>melakukan koreksi presensi</strong>, serta <strong>menghasilkan evaluasi Narasi AI</strong>. Hak ini dikecualikan bagi Yayasan & Kepala Sekolah yang bersifat Read-Only demi keandalan data.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
};
