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

  const CHILD_STICKERS = ["🦁", "🐼", "🐨", "🦊", "🐰", "🐯", "🐱", "🐶", "🐵", "🐸", "🐤", "🦄", "🐙", "🐢", "🐧", "🦉"];
  const sticker = CHILD_STICKERS[student.name.length % CHILD_STICKERS.length];

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

  const getProgressBg = (p: number) => {
    if (p === 100) return "bg-emerald-500";
    if (p > 50) return "bg-indigo-600";
    if (p > 0) return "bg-amber-500";
    return "bg-slate-200";
  };

  return (
    <motion.div 
      variants={cardVariants}
      layout
      className={cn(
          "group rounded-2xl border p-3 flex flex-col relative overflow-hidden cursor-pointer h-full shadow-sm origin-center transition-all duration-300",
          isChronic 
            ? "bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:ring-2 hover:ring-rose-500/10" 
            : "bg-white border-slate-200 hover:border-slate-350 hover:shadow-md hover:scale-[1.01]"
      )}
      onClick={onClick}
      id={`student-card-${student.id}`}
    >
      {/* High Contrast Progress Accent - Modern bottom strip */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] bg-slate-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={cn(
            "h-full transition-all duration-1000",
            getProgressBg(progress)
          )}
        />
      </div>
      
      <div className="flex items-start gap-3 mb-2.5">
        <div className="relative shrink-0">
          <div className={cn(
            "w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border transition-all duration-300 shadow-inner shrink-0", 
            isChronic 
              ? "bg-rose-100 border-rose-300 text-rose-600" 
              : "bg-slate-100 border-slate-200 text-slate-500"
          )}>
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xl select-none">{sticker}</span>
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
             <span className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-[4px] leading-tight shrink-0 font-sans tracking-wide">KLS {student.kelompok}</span>
             {isManageMode && (
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button 
                      onClick={() => {
                          const msg = `Halo Orang Tua/Wali dari ${student.name}, kami menginformasikan progres rapor/kehadiran anak pada periode ini.`;
                          const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
                          window.open(url, '_blank');
                      }} 
                      className="w-5 h-5 flex items-center justify-center bg-green-50 border border-green-200 rounded text-green-600 hover:bg-green-100 shadow-sm cursor-pointer"
                      title="Kirim pesan WhatsApp manual"
                  >
                     <span className="font-bold text-[8px]">WA</span>
                  </button>
                  <button onClick={onEdit} className="w-5 h-5 flex items-center justify-center bg-amber-50 border border-amber-100 rounded text-amber-600 hover:bg-amber-100 transition-all shadow-sm cursor-pointer">
                      <Edit2 size={10} />
                  </button>
                  <button onClick={onDelete} className="w-5 h-5 flex items-center justify-center bg-rose-50 border border-rose-100 rounded text-rose-500 hover:bg-rose-100 transition-all shadow-sm cursor-pointer">
                      <Trash2 size={10} />
                  </button>
                </div>
             )}
          </div>
          <h3 className="text-[11px] font-black text-slate-900 leading-tight mb-0.5 truncate uppercase tracking-tight">{student.name}</h3>
          <p className="text-[8px] font-bold text-slate-550 truncate leading-none capitalize">{student.semester} {student.semesterType}</p>
        </div>
      </div>

      <div className="mt-auto space-y-1 pb-1">
        {isChronic ? (
           <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-rose-100">
               <span className="text-[7px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-0.5 shrink-0">
                   <AlertTriangle size={8} /> Absensi Tinggi
               </span>
               <span className="text-[9px] font-black text-rose-600 font-mono shrink-0">{currentAbsentRate}%</span>
           </div>
        ) : (
            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100">
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 shrink-0">Cakupan Nilai</span>
                <span className="text-[9px] font-black text-slate-800 font-mono shrink-0">{Math.round(progress)}%</span>
            </div>
        )}
      </div>
    </motion.div>
  );
}
