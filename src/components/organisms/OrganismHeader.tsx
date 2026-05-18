import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { User as UserIcon, ChevronRight, Menu, HelpCircle, School, ChevronLeft, Users, Moon, Sun, Settings, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { signInWithGoogle, logout } from "../../lib/firebase";
import { cn } from "../../lib/utils";

interface OrganismHeaderProps {
  studentName: string;
  studentClass: string;
  globalProgress: number;
  onMenuClick: () => void;
  onSettingsClick: () => void;
  onBackToDashboard?: () => void;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

export function OrganismHeader({ 
  studentName, 
  studentClass, 
  globalProgress, 
  onMenuClick, 
  onSettingsClick,
  onBackToDashboard,
  theme = "dark",
  onThemeToggle
}: OrganismHeaderProps) {
  const { user, isUserAdmin } = useAuth();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-14 md:h-16 shrink-0 flex items-center justify-between scaled-p-3 md:scaled-p-5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-3xl border-b border-black/5 dark:border-white/10 z-30"
    >
      <div className="flex items-center gap-2 md:gap-3">
        {onBackToDashboard && (
          <button 
            onClick={onBackToDashboard}
            className="w-7 h-7 md:w-9 md:h-9 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-all border-black/5 dark:border-white/10"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-700 dark:text-white" />
          </button>
        )}
        <button 
          onClick={onBackToDashboard || (() => window.location.reload())}
          className="hidden xs:flex w-7 h-7 md:w-9 md:h-9 bg-cyan-500 rounded-lg items-center justify-center shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
        >
          <School className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-base md:text-xl font-black tracking-tight line-clamp-1 text-slate-800 dark:text-white leading-tight">
            {studentName ? studentName : "Dashboard Guru"}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-[8px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">
              {studentName ? `${studentClass}` : "Digital Assistant"}
            </p>
            {isUserAdmin && (
              <span className="flex items-center gap-1 text-[7px] md:text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-black uppercase tracking-tighter">
                <ShieldCheck size={8} /> Admin
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden xs:flex flex-col items-end">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">Progres</span>
                <span className="text-[10px] md:text-xs font-bold text-sky-400">{Math.round(globalProgress)}%</span>
             </div>
             <div className="w-16 md:w-32 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${globalProgress}%` }}
                   className="h-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                />
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5">
                {user ? (
                   <div className="flex items-center gap-2 px-1.5 overflow-hidden max-w-[40px] md:max-w-[150px] transition-all">
                      <img src={user.photoURL || ""} className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/20" alt="Avatar" />
                      <div className="hidden md:flex flex-col">
                         <span className="text-[10px] font-black tracking-tight truncate">{user.displayName}</span>
                         <button onClick={() => logout()} className="text-[8px] font-black text-red-500 uppercase tracking-widest text-left hover:underline">Logout</button>
                      </div>
                   </div>
                ) : (
                   <button 
                     onClick={() => signInWithGoogle()}
                     className="flex items-center gap-2 px-3 py-1.5 md:py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                   >
                     <LogIn size={14} />
                     <span className="hidden md:inline">Google Login</span>
                   </button>
                )}
             </div>

             <button
               onClick={onSettingsClick}
               className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl glass-card hover:bg-white/20 transition-colors border-black/5 dark:border-white/10"
               title="App Settings"
             >
               <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
             </button>
  
             <button
               onClick={onThemeToggle}
               className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl glass-card hover:bg-white/20 transition-colors border-black/5 dark:border-white/10"
               title="Toggle Theme"
             >
               {theme === "dark" ? (
                 <Sun className="w-4 h-4 text-amber-400" />
               ) : (
                 <Moon className="w-4 h-4 text-slate-600" />
               )}
             </button>
  
             <button 
               onClick={onMenuClick}
               className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl glass-card hover:bg-white/20 transition-colors border-black/5 dark:border-white/10"
             >
               <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
             </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

