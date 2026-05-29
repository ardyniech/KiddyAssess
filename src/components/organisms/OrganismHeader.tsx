import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  School, Database, RefreshCw, CheckCircle2, Cloud, CloudOff,
  Pencil, Wand2, Printer, Users, BookOpen, Wallet, Package, 
  Calendar, ShieldCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { signInWithGoogle, logout } from "../../lib/firebase";
import { UserProfileSection } from "./header/UserProfileSection";
import { getSchoolProfile } from "../../services/settingsService";
import { syncAnalyticsService } from "../../services/syncAnalyticsService";
import { usePermissions } from "../../context/PermissionContext";

interface CloudSyncIndicatorProps {
  isSyncing: boolean;
  syncProgress: number;
  currentSyncItem: string | null;
  triggerSync: () => Promise<void>;
  lastSaved: string | null;
}

export function CloudSyncIndicator({ 
  isSyncing, 
  syncProgress, 
  currentSyncItem, 
  triggerSync, 
  lastSaved 
}: CloudSyncIndicatorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCloudEnabled, setIsCloudEnabled] = useState(true);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadSettingsAndLogs = useCallback(async () => {
    try {
      const profile = await getSchoolProfile();
      setIsCloudEnabled(profile?.enableCloudSync ?? false);
      const history = await syncAnalyticsService.getLogs();
      setRecentLogs(history.slice(0, 3)); // Latest 3 logs
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadSettingsAndLogs();
    
    // Listen to changes in settings or complete syncing to pull fresh stats
    window.addEventListener("app-settings-updated", loadSettingsAndLogs);
    window.addEventListener("app-sync-completed", loadSettingsAndLogs);
    return () => {
      window.removeEventListener("app-settings-updated", loadSettingsAndLogs);
      window.removeEventListener("app-sync-completed", loadSettingsAndLogs);
    };
  }, [loadSettingsAndLogs]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualSync = async () => {
    if (isSyncing || !isCloudEnabled) return;
    await triggerSync();
    loadSettingsAndLogs();
  };

  return (
    <div className="relative font-sans select-none" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-2xl transition-all relative overflow-hidden group cursor-pointer active:scale-95",
          isSyncing 
            ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" 
            : !isCloudEnabled 
              ? "bg-slate-100/80 text-slate-400 hover:bg-slate-100 hover:text-slate-500" 
              : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
        )}
        title={isSyncing ? `Progres cadangan: ${syncProgress}%` : !isCloudEnabled ? "Cadangan Cloud Mati" : "Cadangan Cloud Aman"}
      >
        <AnimatePresence mode="wait">
          {isSyncing ? (
            <motion.div
              key="syncing"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="relative"
            >
              <RefreshCw size={18} />
            </motion.div>
          ) : !isCloudEnabled ? (
            <motion.div key="disabled" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CloudOff size={18} />
            </motion.div>
          ) : (
            <motion.div key="active" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative flex items-center justify-center">
              <Cloud size={18} />
              {/* Pulsing indicator if recently backed up */}
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full">
                <span className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Popover Dropdown Container */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-black/5 p-4 z-[999] text-left"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  isSyncing ? "bg-amber-500/10 text-amber-500" : !isCloudEnabled ? "bg-slate-100 text-slate-400" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  <Database size={14} />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white leading-tight">Perlindungan Basis Data</h4>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">IndexedDB ⟷ Cloud Sync</span>
                </div>
              </div>
              <div className="flex items-center">
                {isSyncing ? (
                  <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">Menyinkronkan</span>
                ) : !isCloudEnabled ? (
                  <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">DB Lokal Saja</span>
                ) : (
                  <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Aman</span>
                )}
              </div>
            </div>

            {/* Active Backup Progress State Indicator */}
            {isSyncing ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Menyinkronkan...</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white tabular-nums">{syncProgress}%</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${syncProgress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full"
                  />
                </div>
                
                {/* Current syncing item stream label */}
                {currentSyncItem && (
                  <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-slate-400 truncate tracking-tight">
                    <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span className="truncate">{currentSyncItem}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 mb-3 flex flex-col items-center text-center">
                {isCloudEnabled ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                      <CheckCircle2 size={18} />
                    </div>
                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Semua Data Dicadangkan</h5>
                    <p className="text-[9px] text-slate-400 max-w-[210px] mt-0.5 leading-snug">Berkas siswa lokal dan matriks penilaian telah tersinkronisasi penuh dengan server cloud.</p>
                    
                    {lastSaved && (
                      <div className="mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <span>Terakhir disinkronkan:</span>
                        <span className="text-slate-600 dark:text-slate-300 font-extrabold">{lastSaved}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <CloudOff size={18} />
                    </div>
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-tight font-mono">Proteksi Cloud Nonaktif</h5>
                    <p className="text-[9px] text-slate-400 max-w-[210px] mt-0.5 leading-snug">Berkas Anda tersimpan aman di database offline. Aktifkan fitur Cloud untuk mencadangkan secara otomatis.</p>
                  </>
                )}
              </div>
            )}

            {/* Quick backup force button */}
            {isCloudEnabled && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className={cn(
                  "w-full py-2 bg-black text-white hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-[0.98]",
                  isSyncing && "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
                )}
              >
                {!isSyncing && <RefreshCw size={10} className={cn(isSyncing && "animate-spin")} />}
                {isSyncing ? "Menyimpan Berkas..." : "Sinkronkan"}
              </button>
            )}

            {/* Sync Status Log Stream list inside Popover */}
            {recentLogs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Riwayat Sinkronisasi Terbaru</span>
                <div className="space-y-1">
                  {recentLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between text-[9px] p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          log.status === "success" ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <span className="font-bold text-slate-600 dark:text-slate-300 truncate">{log.message}</span>
                      </div>
                      <span className="text-[8px] text-slate-400 shrink-0 font-medium font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OrganismHeader({ 
  studentName, 
  studentClass, 
  globalProgress, 
  onMenuClick, 
  onSettingsClick, 
  onBackToDashboard, 
  onNext, 
  onPrev, 
  view,
  activeModule,
  isSyncing,
  syncProgress,
  currentSyncItem,
  triggerSync,
  lastSaved,
  onNavigate
}: any) {
  const { user } = useAuth();
  const { userRole } = usePermissions();
  
  const ModuleIcon = activeModule?.icon || School;
  const isStudentContext = activeModule?.requiresStudent && studentName;

  const roleLabel = React.useMemo(() => {
    switch (userRole) {
      case 'MASTER': return { text: "👑 MASTER", style: "bg-red-50 text-red-700 border-red-200" };
      case 'SUPER_USER': return { text: "🏛️ YAYASAN", style: "bg-amber-50 text-amber-800 border-amber-200" };
      case 'ADMIN': return { text: "🎓 KEPSEK", style: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case 'TEACHER': return { text: "✏️ GURU KELAS", style: "bg-indigo-50 text-indigo-800 border-indigo-200" };
      case 'OPERATOR': return { text: "📁 TATA USAHA", style: "bg-purple-50 text-purple-800 border-purple-200" };
      default: return { text: "GURU", style: "bg-indigo-50 text-indigo-800 border-indigo-200" };
    }
  }, [userRole]);

  const quickLinks = React.useMemo(() => {
    switch (userRole) {
      case 'MASTER':
      case 'SUPER_USER':
        return [
          { id: 'access-control', label: 'Hak Akses', icon: ShieldCheck, colorClass: "text-[#EF4444]" },
          { id: 'students', label: 'Siswa', icon: Users, colorClass: "text-[#4F46E5]" },
        ];
      case 'ADMIN':
        return [
          { id: 'staff', label: 'Data Guru', icon: BookOpen, colorClass: "text-[#10B981]" },
          { id: 'finance', label: 'Keuangan', icon: Wallet, colorClass: "text-[#FF8000]" },
        ];
      case 'OPERATOR':
        return [
          { id: 'inventory', label: 'Aset', icon: Package, colorClass: "text-[#8B5CF6]" },
          { id: 'calendar', label: 'Jadwal', icon: Calendar, colorClass: "text-[#EC4899]" },
        ];
      default:
        return [
          { id: 'assessment', label: 'Nilai', icon: Pencil, colorClass: "text-[#F59E0B]" },
          { id: 'generator', label: 'AI Rapor', icon: Wand2, colorClass: "text-[#6366F1]" },
        ];
    }
  }, [userRole]);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-16 md:h-20 shrink-0 flex items-center justify-between px-4 md:px-8 bg-white/95 backdrop-blur-xl border-b border-black/5 z-[60] sticky top-0 shadow-sm"
    >
      <div className="flex items-center gap-2">
        {/* Module Identity Action Toggle */}
        <button 
          onClick={onMenuClick}
          className="flex items-center hover:bg-slate-50 p-1.5 rounded-xl transition-all group active:scale-[0.98] cursor-pointer"
        >
          <div className="flex flex-col leading-none text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs font-black tracking-tight uppercase text-indigo-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block shrink-0" />
                {activeModule?.name || "KiddyApps"}
              </h1>
              {/* Intelligent high-contrast Role Badge */}
              <span className={cn("text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0", roleLabel.style)}>
                {roleLabel.text}
              </span>
            </div>
            {studentName && isStudentContext && (
              <span className="text-[9px] font-extrabold text-[#7EC8E3] uppercase mt-0.5 max-w-[120px] sm:max-w-none truncate block">
                Anak: {studentName} ({studentClass || "B1"})
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="hidden md:flex items-center gap-1.5 px-2">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          const isActive = view === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate?.(link.id)}
              title={link.label}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-95",
                isActive
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-white text-slate-700 border-slate-200 hover:border-indigo-400"
              )}
            >
              <Icon size={12} className={isActive ? "text-white opacity-100" : link.colorClass} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <div className="flex items-center gap-1">
            <CloudSyncIndicator 
              isSyncing={isSyncing}
              syncProgress={syncProgress}
              currentSyncItem={currentSyncItem}
              triggerSync={triggerSync}
              lastSaved={lastSaved}
            />
            <UserProfileSection user={user} onLogin={signInWithGoogle} onLogout={logout} onSettingsClick={onSettingsClick} />
        </div>
      </div>
    </motion.header>
  );
}
