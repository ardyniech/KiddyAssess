import React from 'react';
import { motion } from 'motion/react';
import { User, CheckCircle2, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Student } from '../../../types';
import { cn } from '../../../lib/utils';

interface StudentListCardProps {
  key?: React.Key;
  student: Student;
  idx: number;
  progress: number;
  isManageMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function StudentListCard({ 
  student, 
  idx, 
  progress, 
  isManageMode,
  onEdit, 
  onDelete, 
  onClick 
}: StudentListCardProps) {

  const getAbsenteeismRate = () => {
    if (!student.attendanceLogs) return 0;
    const logs = Object.values(student.attendanceLogs);
    if (logs.length === 0) return 0;
    const absences = logs.filter(l => l === 'absent').length;
    return Math.round((absences / logs.length) * 100);
  };

  const currentAbsentRate = getAbsenteeismRate();
  const isChronic = currentAbsentRate >= 15;

  const cardVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.96 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 18
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      transition: { duration: 0.15 } 
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      layout
      className={cn(
          "group bento-card p-2.5 hover:ring-1 hover:ring-black transition-all flex flex-col relative overflow-hidden cursor-pointer h-full shadow-sm origin-center",
          isChronic ? "bg-red-50/50" : "bg-white"
      )}
      onClick={onClick}
      id={`student-card-${student.id}`}
    >
      {/* High Contrast Progress Accent - Modern bottom strip */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={cn(
            "h-full transition-all duration-1000",
            progress === 100 ? "bg-emerald-500" : progress > 50 ? "bg-sky-500" : "bg-amber-500"
          )}
        />
      </div>
      
      <div className="flex items-start gap-2.5 mb-2">
        <div className="relative shrink-0">
          <div className={cn("w-9 h-9 rounded overflow-hidden flex items-center justify-center border group-hover:scale-105 transition-transform", isChronic ? "bg-red-100 border-red-200" : "bg-slate-50 border-slate-100")}>
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className={cn(isChronic ? "text-red-400" : "text-slate-300")}>
                <User size={16} strokeWidth={2.5} />
              </div>
            )}
          </div>
          {progress === 100 && (
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-emerald-100">
              <CheckCircle2 size={10} className="text-emerald-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
             <span className="text-[7px] font-black uppercase px-1 py-0.5 bg-black text-white rounded-[2px] leading-tight shrink-0">KLS {student.kelompok}</span>
             {isManageMode && (
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button 
                      onClick={() => {
                          const msg = `Halo Orang Tua/Wali dari ${student.name}, kami menginformasikan progres rapor/kehadiran anak pada periode ini.`;
                          const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank');
                      }} 
                      className="w-5 h-5 flex items-center justify-center bg-green-50 border border-green-200 rounded text-green-600 hover:bg-green-100 shadow-sm"
                      title="Kirim pesan WhatsApp manual"
                  >
                     <span className="font-bold text-[8px]">WA</span>
                  </button>
                  <button onClick={onEdit} className="w-5 h-5 flex items-center justify-center bg-amber-50 border border-amber-100 rounded text-amber-600 hover:bg-amber-100 transition-all shadow-sm">
                      <Edit2 size={10} />
                  </button>
                  <button onClick={onDelete} className="w-5 h-5 flex items-center justify-center bg-red-50 border border-red-100 rounded text-red-500 hover:bg-red-100 transition-all shadow-sm">
                      <Trash2 size={10} />
                  </button>
                </div>
             )}
          </div>
          <h3 className="text-[10px] font-black text-black leading-tight mb-0.5 truncate uppercase tracking-tight">{student.name}</h3>
          <p className="text-[8px] font-bold text-slate-400 truncate leading-none capitalize">{student.semester} {student.semesterType}</p>
        </div>
      </div>

      <div className="mt-auto space-y-1">
        {isChronic ? (
           <div className="flex items-center justify-between mt-1 pt-1 border-t border-red-100">
               <span className="text-[7px] font-black uppercase tracking-widest text-red-500 flex items-center gap-0.5">
                   <AlertTriangle size={8} /> Absensi Tinggi
               </span>
               <span className="text-[9px] font-black text-red-600 font-mono">{currentAbsentRate}%</span>
           </div>
        ) : (
            <div className="flex items-center justify-between">
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">Cakupan Nilai</span>
                <span className="text-[9px] font-black text-black font-mono">{Math.round(progress)}%</span>
            </div>
        )}
      </div>
    </motion.div>
  );
}
