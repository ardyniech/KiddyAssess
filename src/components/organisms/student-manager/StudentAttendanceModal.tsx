import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, XCircle, Clock, Save, Info, AlertTriangle } from 'lucide-react';
import { Student } from '../../../types';
import { cn } from '../../../lib/utils';

interface StudentAttendanceModalProps {
  students: Student[];
  onClose: () => void;
  onSave: (students: Student[]) => void;
  selectedClass?: string;
}

export function StudentAttendanceModal({ students, onClose, onSave, selectedClass }: StudentAttendanceModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  const filteredStudents = selectedClass && selectedClass !== 'all' 
    ? students.filter(s => s.kelompok === selectedClass)
    : students;

  useEffect(() => {
    const newAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
    filteredStudents.forEach(s => {
      if (s.attendanceLogs && s.attendanceLogs[date]) {
         // It might be 'excused' too but we'll map to absent here for simplicity, or just set it
         const val = s.attendanceLogs[date];
         if (val === 'present' || val === 'absent' || val === 'late') {
            newAttendance[s.id] = val;
         } else {
            newAttendance[s.id] = 'absent';
         }
      } else {
         newAttendance[s.id] = 'present'; // Default to present
      }
    });
    setAttendance(newAttendance);
  }, [date, students, selectedClass]);

  const handleSave = () => {
    const updatedStudents = students.map(s => {
        if (!attendance[s.id]) return s;
        const currentLogs = s.attendanceLogs || {};
        return {
            ...s,
            attendanceLogs: {
                ...currentLogs,
                [date]: attendance[s.id]
            }
        };
    });
    onSave(updatedStudents);
  };

  const getAbsenteeismRate = (student: Student) => {
    if (!student.attendanceLogs) return 0;
    const logs = Object.values(student.attendanceLogs);
    if (logs.length === 0) return 0;
    const absences = logs.filter(l => l === 'absent').length;
    return Math.round((absences / logs.length) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
      >
        <div className="p-4 sm:p-6 md:p-8 flex items-center justify-between border-b border-slate-100 bg-slate-50">
            <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-1">Kehadiran Harian</h2>
                <input 
                   type="date" 
                   value={date} 
                   onChange={(e) => setDate(e.target.value)}
                   className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-transparent outline-none cursor-pointer"
                />
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full border border-slate-100 hover:bg-slate-100 transition-colors">
                <X size={16} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-3">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 mb-2 px-4 select-none">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Siswa</div>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-500 text-center w-10 sm:w-16 truncate">Hadir</div>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-500 text-center w-10 sm:w-16 truncate">Telat</div>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-red-500 text-center w-10 sm:w-16 truncate">Absen</div>
            </div>

            {filteredStudents.map(student => {
                const rate = getAbsenteeismRate(student);
                const isChronic = rate >= 15;

                return (
                    <div key={student.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 items-center bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                        <div className="flex flex-col min-w-0">
                            <span className="font-black text-slate-900 uppercase tracking-tight text-xs sm:text-sm truncate">{student.name}</span>
                            {isChronic ? (
                                <span className="text-[9px] font-bold text-red-500 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                    <AlertTriangle size={10} className="shrink-0" />
                                    Absensi Kronis: {rate}%
                                </span>
                            ) : rate > 0 ? (
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                                    Tingkat Absen: {rate}%
                                </span>
                            ) : null}
                        </div>
                        
                        <button 
                            onClick={() => setAttendance(prev => ({...prev, [student.id]: 'present'}))}
                            className={cn(
                                "w-10 sm:w-16 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0",
                                attendance[student.id] === 'present' ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-300 hover:bg-emerald-50 hover:text-emerald-400"
                            )}
                        >
                            <CheckCircle size={18} />
                        </button>
                        
                        <button 
                            onClick={() => setAttendance(prev => ({...prev, [student.id]: 'late'}))}
                            className={cn(
                                "w-10 sm:w-16 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0",
                                attendance[student.id] === 'late' ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-300 hover:bg-amber-50 hover:text-amber-400"
                            )}
                        >
                            <Clock size={16} />
                        </button>

                        <button 
                            onClick={() => setAttendance(prev => ({...prev, [student.id]: 'absent'}))}
                            className={cn(
                                "w-10 sm:w-16 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0",
                                attendance[student.id] === 'absent' ? "bg-red-500 text-white" : "bg-white border border-slate-200 text-slate-300 hover:bg-red-50 hover:text-red-400"
                            )}
                        >
                            <XCircle size={18} />
                        </button>
                    </div>
                )
            })}
            
            {filteredStudents.length === 0 && (
                <div className="text-center py-10 opacity-50 text-sm font-black uppercase tracking-widest flex flex-col items-center">
                    <Info size={32} className="mb-2" />
                    Tidak ada siswa dalam kelas ini
                </div>
            )}
        </div>

        <div className="p-3 sm:p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 sm:gap-3 mt-auto">
            <button 
                onClick={onClose}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black hover:bg-slate-200 transition-colors"
            >
                Batal
            </button>
            <button 
                onClick={handleSave}
                className="px-5 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 transition-all shadow"
            >
                <Save size={14} />
                Simpan Kehadiran
            </button>
        </div>
      </motion.div>
    </div>
  );
}
