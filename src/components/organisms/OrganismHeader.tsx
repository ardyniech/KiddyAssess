import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { User as UserIcon, ChevronRight, Menu, HelpCircle, School, ChevronLeft, Users, Moon, Sun, Settings, LogIn, LogOut, ShieldCheck, Monitor } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/ThemeContext";
import { signInWithGoogle, logout } from "../../lib/firebase";
import { cn } from "../../lib/utils";

interface OrganismHeaderProps {
  studentName: string;
  studentClass: string;
  globalProgress: number;
  onMenuClick: () => void;
  onSettingsClick: () => void;
  onBackToDashboard?: () => void;
}

export function OrganismHeader({ 
  studentName, 
  studentClass, 
  globalProgress, 
  onMenuClick, 
  onSettingsClick,
  onBackToDashboard
}: OrganismHeaderProps) {
  const { user, isUserAdmin } = useAuth();
  const { theme, resolvedTheme, updateTheme } = useAppTheme();

  const handleToggleTheme = () => {
    if (theme.appearance === 'system') {
      updateTheme({ appearance: 'light' });
    } else if (theme.appearance === 'light') {
      updateTheme({ appearance: 'dark' });
    } else {
      updateTheme({ appearance: 'system' });
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-12 md:h-14 shrink-0 flex items-center justify-between px-2 md:px-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-3xl border-b border-black/5 dark:border-white/10 z-30"
    >
      <div className="flex items-center gap-1.5 md:gap-3">
        {onBackToDashboard && (
          <button 
            onClick={onBackToDashboard}
            className="w-7 h-7 md:w-8 md:h-8 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 border-black/5 dark:border-white/10"
          >
            <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-900 dark:text-white" />
          </button>
        )}
        <button 
          onClick={onBackToDashboard || (() => window.location.reload())}
          className="hidden xs:flex w-7 h-7 md:w-8 md:h-8 bg-sky-500 rounded-lg items-center justify-center shadow-lg shadow-sky-500/20 active:scale-95"
        >
          <School size={14} className="text-white" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xs md:text-sm font-black tracking-tight line-clamp-1 text-slate-900 dark:text-white leading-none">
            {studentName ? studentName : "KiddyAssess Pro"}
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-[7px] md:text-[9px] text-slate-600 dark:text-slate-300 uppercase tracking-widest font-black">
              {studentName ? `${studentClass}` : "Digital Assistant"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Progress Minimal */}
        <div className="hidden sm:flex flex-col items-end">
            <div className="w-12 md:w-24 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${globalProgress}%` }}
                  className="h-full bg-sky-500"
              />
            </div>
            <span className="text-[7px] md:text-[9px] font-black text-sky-500 mt-0.5">{Math.round(globalProgress)}%</span>
        </div>
        
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-0.5 rounded-xl border border-black/5">
          {user ? (
            <div className="flex items-center p-0.5 max-w-[28px] md:max-w-[120px] overflow-hidden transition-all">
              <img src={user.photoURL || ""} className="w-6 h-6 rounded-full border border-white/20" alt="Avatar" />
              <button onClick={() => logout()} className="hidden md:block ml-2 text-[8px] font-black text-red-500 uppercase tracking-widest hover:underline shrink-0">Keluar</button>
            </div>
          ) : (
            <button 
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[8px] font-black uppercase tracking-tighter"
            >
              <LogIn size={10} />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-1.5">
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-lg glass-card hover:bg-white/10 border-black/5 dark:border-white/10"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </button>

          <button
            onClick={handleToggleTheme}
            className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-lg glass-card hover:bg-white/10 border-black/5 dark:border-white/10 relative"
          >
            {theme.appearance === "system" ? (
              <Monitor className="w-3.5 h-3.5 text-sky-500" />
            ) : resolvedTheme === "dark" ? (
              <Moon className="w-3.5 h-3.5 text-sky-300" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            {theme.appearance === 'system' && (
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-sky-500 rounded-full" />
            )}
          </button>

          <button 
            onClick={onMenuClick}
            className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-lg glass-card hover:bg-white/10 border-black/5 dark:border-white/10"
          >
            <Users className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}

