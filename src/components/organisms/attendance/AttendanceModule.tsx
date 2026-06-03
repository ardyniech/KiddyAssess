import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Users, 
    CheckCircle, 
    Clock, 
    XCircle, 
    Calendar, 
    TrendingUp, 
    TrendingDown,
    Save,
    Smile,
    ShieldCheck
} from 'lucide-react';
import { Student } from '../../../types';
import { cn } from '../../../lib/utils';
import { Card, Badge, Button } from '../../atoms/UIPrimitives';

interface AttendanceModuleProps {
    students: Student[];
    onEditStudent: (student: Student) => void;
}

export const AttendanceModule = ({ students = [], onEditStudent }: AttendanceModuleProps) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
    const [filterClass, setFilterClass] = useState<string>('all');
    const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

    const classes = Array.from(new Set(students.map(s => s.kelompok).filter(Boolean)));
    
    const filteredStudents = filterClass === 'all' 
        ? students 
        : students.filter(s => s.kelompok === filterClass);

    // Load attendance state on date or students change
    useEffect(() => {
        const newAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
        students.forEach(s => {
            if (s.attendanceLogs && s.attendanceLogs[date]) {
                const val = s.attendanceLogs[date];
                if (val === 'present' || val === 'absent' || val === 'late') {
                    newAttendance[s.id] = val;
                } else {
                    newAttendance[s.id] = 'present';
                }
            } else {
                newAttendance[s.id] = 'present'; // default
            }
        });
        setAttendance(newAttendance);
    }, [date, students]);

    const handleSave = () => {
        filteredStudents.forEach(s => {
            const currentLogs = s.attendanceLogs || {};
            const status = attendance[s.id] || 'present';
            onEditStudent({
                ...s,
                attendanceLogs: {
                    ...currentLogs,
                    [date]: status
                }
            });
        });
        
        setSaveFeedback('Absensi Berhasil Disimpan!');
        setTimeout(() => setSaveFeedback(null), 3000);
    };

    // Attendance stats
    const totalPresent = filteredStudents.filter(s => attendance[s.id] === 'present').length;
    const totalLate = filteredStudents.filter(s => attendance[s.id] === 'late').length;
    const totalAbsent = filteredStudents.filter(s => attendance[s.id] === 'absent').length;
    const statsPercentage = filteredStudents.length > 0 
        ? Math.round((totalPresent / filteredStudents.length) * 100) 
        : 100;

    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            {/* Top Workspace Bar */}
            <div className="bg-white border-b border-black/5 shrink-0 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-extrabold tracking-widest text-indigo-750 uppercase bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                PENILAIAN NON-AKADEMIK
                            </span>
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
                            Pencatatan Absensi Siswa 📋
                        </h2>
                        <span className="text-xs text-slate-500 tracking-wide mt-1 font-medium block">
                            Kelola presensi harian siswa secara dinamis. Perubahan langsung disimpan ke database offline Anda.
                        </span>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-2 sm:p-3 rounded-2xl border border-slate-150 text-xs">
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">Tanggal Pelaporan</span>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                className="text-xs font-black border-none bg-transparent outline-none cursor-pointer mt-1 text-indigo-950 focus:ring-0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
                
                {/* Visual Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card padding={false} className="p-4 flex items-center gap-4 text-left shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle size={18} />
                        </div>
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Hadir</span>
                            <span className="text-base font-black text-indigo-950 mt-1 block">{totalPresent} Anak</span>
                        </div>
                    </Card>

                    <Card padding={false} className="p-4 flex items-center gap-4 text-left shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock size={16} />
                        </div>
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Telat</span>
                            <span className="text-base font-black text-indigo-950 mt-1 block">{totalLate} Anak</span>
                        </div>
                    </Card>

                    <Card padding={false} className="p-4 flex items-center gap-4 text-left shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                            <XCircle size={18} />
                        </div>
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Absen</span>
                            <span className="text-base font-black text-indigo-950 mt-1 block">{totalAbsent} Anak</span>
                        </div>
                    </Card>

                    <Card padding={false} className="p-4 flex items-center gap-4 text-left shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Tingkat Kehadiran</span>
                            <span className="text-base font-black text-indigo-950 mt-1 block">{statsPercentage}%</span>
                        </div>
                    </Card>
                </div>

                {/* Filter and Action Headers */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 self-start scrollbar-none max-w-full">
                        <button 
                            onClick={() => setFilterClass('all')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap",
                                filterClass === 'all' ? "bg-black text-white" : "bg-white text-slate-500 border border-slate-250 hover:border-slate-400"
                            )}
                        >
                            Semua Kelompok
                        </button>
                        {classes.map(cls => (
                            <button 
                                key={cls}
                                onClick={() => setFilterClass(cls)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap",
                                    filterClass === cls ? "bg-black text-white" : "bg-white text-slate-500 border border-slate-250 hover:border-slate-400"
                                )}
                            >
                                Kelas {cls}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto self-end sm:self-center shrink-0">
                        {saveFeedback && (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg uppercase tracking-wider animate-pulse whitespace-nowrap">
                                ✔ {saveFeedback}
                            </span>
                        )}
                        <button 
                            onClick={handleSave}
                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] uppercase font-black tracking-widest h-10 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 cursor-pointer w-full sm:w-auto"
                        >
                            <Save size={13} />
                            Simpan Perubahan
                        </button>
                    </div>
                </div>

                {/* Interactive Tactile Workspace Grid (Min 44px round check buttons) */}
                <div className="bg-white border border-black/5 rounded-[24px] overflow-hidden shadow-sm">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-6 py-4 bg-slate-50 border-b border-slate-100 font-extrabold text-[9px] text-slate-400 uppercase tracking-widest text-left select-none">
                        <span>Nama Lengkap Murid</span>
                        <span className="w-16 text-center text-emerald-500 truncate">HADIR (H)</span>
                        <span className="w-16 text-center text-amber-500 truncate">TELAT (T)</span>
                        <span className="w-16 text-center text-rose-500 truncate">ALFA (A)</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredStudents.map(student => (
                            <div 
                                key={student.id} 
                                className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors text-left"
                            >
                                <div className="min-w-0">
                                    <div className="font-black text-indigo-950 uppercase tracking-tight text-xs sm:text-sm truncate">
                                        {student.name}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5 font-mono">
                                        NISN: {student.nisn || '-'} • Kelas {student.kelompok}
                                    </div>
                                </div>

                                {/* Tactile Checkbuttons - Touch optimized width and height */}
                                <button
                                    onClick={() => setAttendance(p => ({ ...p, [student.id]: 'present' }))}
                                    className={cn(
                                        "w-12 sm:w-16 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer border shrink-0 outline-none focus:ring-2 focus:ring-emerald-300",
                                        attendance[student.id] === 'present' 
                                            ? "bg-emerald-500 border-emerald-500 text-white" 
                                            : "bg-white border-slate-200 text-slate-300 hover:bg-emerald-50 hover:text-emerald-500"
                                    )}
                                    title="Tandai Hadir"
                                >
                                    <CheckCircle size={20} />
                                </button>
                                
                                <button
                                    onClick={() => setAttendance(p => ({ ...p, [student.id]: 'late' }))}
                                    className={cn(
                                        "w-12 sm:w-16 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer border shrink-0 outline-none focus:ring-2 focus:ring-amber-300",
                                        attendance[student.id] === 'late' 
                                            ? "bg-amber-500 border-amber-500 text-white" 
                                            : "bg-white border-slate-200 text-slate-300 hover:bg-amber-50 hover:text-amber-500"
                                    )}
                                    title="Tandai Telat"
                                >
                                    <Clock size={18} />
                                </button>

                                <button
                                    onClick={() => setAttendance(p => ({ ...p, [student.id]: 'absent' }))}
                                    className={cn(
                                        "w-12 sm:w-16 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer border shrink-0 outline-none focus:ring-2 focus:ring-rose-300",
                                        attendance[student.id] === 'absent' 
                                            ? "bg-rose-500 border-rose-500 text-white" 
                                            : "bg-white border-slate-200 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                                    )}
                                    title="Tandai Alfa"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        ))}

                        {filteredStudents.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center select-none">
                                <Users size={48} className="text-slate-300 mb-3" />
                                <span className="text-sm font-black uppercase tracking-widest text-slate-400">Tidak ada murid terdaftar</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <Card className="p-6 md:p-8 flex items-center gap-6 text-left border border-slate-100">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                        <Smile size={28} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Kemandirian Offline-First 🌟</h4>
                        <p className="text-xs text-slate-500 tracking-wide leading-relaxed font-semibold max-w-2xl mt-1">
                            Perubahan status kehadiran yang Anda simpan akan disimpan secara luring terlebih dahulu ke mesin IndexedDB pada peranti Anda, lalu diunggah otomatis ke cloud server yayasan ketika jaringan internet aktif kembali. Ini menjamin proses pendataan presensi di lapangan yang aman dan lancar di manapun Anda berada.
                        </p>
                    </div>
                </Card>

            </main>
        </div>
    );
};
