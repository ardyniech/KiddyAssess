import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Database, RefreshCw, CheckCircle2, Cloud, CloudOff } from "lucide-react";
import { cn } from "../../../lib/utils";
import { getSchoolProfile } from "../../../services/settingsService";
import { syncAnalyticsService } from "../../../services/syncAnalyticsService";

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
      setRecentLogs(history.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadSettingsAndLogs();
    
    window.addEventListener("app-settings-updated", loadSettingsAndLogs);
    window.addEventListener("app-sync-completed", loadSettingsAndLogs);
    return () => {
      window.removeEventListener("app-settings-updated", loadSettingsAndLogs);
      window.removeEventListener("app-sync-completed", loadSettingsAndLogs);
    };
  }, [loadSettingsAndLogs]);

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
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full">
                <span className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-black/5 p-4 z-[999] text-left"
          >
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

            {isSyncing ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Menyinkronkan...</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white tabular-nums">{syncProgress}%</span>
                </div>
                
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${syncProgress}%` }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full"
                  />
                </div>
                
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
