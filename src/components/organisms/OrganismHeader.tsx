import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { User, ChevronRight, Menu, HelpCircle, School, ChevronLeft, Users } from "lucide-react";
import { motion } from "motion/react";

interface OrganismHeaderProps {
  studentName: string;
  studentClass: string;
  globalProgress: number;
  onMenuClick: () => void;
  onBackToDashboard?: () => void;
}

export function OrganismHeader({ studentName, studentClass, globalProgress, onMenuClick, onBackToDashboard }: OrganismHeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 md:h-20 shrink-0 flex items-center justify-between px-4 md:px-8 bg-white/5 backdrop-blur-xl border-b border-white/10 z-30"
    >
      <div className="flex items-center gap-3 md:gap-4">
        {onBackToDashboard && (
          <button 
            onClick={onBackToDashboard}
            className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        )}
        <button 
          onClick={onBackToDashboard || (() => window.location.reload())}
          className="hidden xs:flex w-8 h-8 md:w-10 md:h-10 bg-sky-400 rounded-xl items-center justify-center shadow-lg shadow-sky-400/20 hover:scale-105 transition-transform"
        >
          <School className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-sm md:text-lg font-bold tracking-tight text-white line-clamp-1">
            {studentName ? studentName : "Dashboard Guru"}
          </h1>
          <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            {studentName ? `Penilaian ${studentClass}` : "Digital Teacher Assistant"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden xs:flex flex-col items-end">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-black">Progres</span>
                <span className="text-[10px] md:text-xs font-bold text-sky-400">{Math.round(globalProgress)}%</span>
             </div>
             <div className="w-16 md:w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${globalProgress}%` }}
                  className="h-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                />
             </div>
          </div>
          
          <button 
            onClick={onMenuClick}
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Users className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
