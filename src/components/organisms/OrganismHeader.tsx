import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  School,
  Pencil, Wand2, Users, BookOpen, Wallet, Package, 
  Calendar, ShieldCheck, WifiOff
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import { signInWithGoogle, logout } from "../../lib/firebase";
import { UserProfileSection } from "./header/UserProfileSection";
import { usePermissions } from "../../context/PermissionContext";
import { CloudSyncIndicator } from "./header/CloudSyncIndicator";

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

  const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
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
              <span className={cn("text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0", roleLabel.style)}>
                {roleLabel.text}
              </span>
            </div>
            {studentName && isStudentContext && (
              <span className="text-[9px] font-extrabold text-indigo-700 uppercase mt-0.5 max-w-[120px] sm:max-w-none truncate block">
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

      <div className="flex items-center gap-1.5 ml-auto">
        <div className="flex items-center gap-1.5 md:gap-2">
            <AnimatePresence>
              {!isOnline && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 10 }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-600 uppercase tracking-widest shadow-sm animate-pulse"
                  title="Koneksi terputus. Mode luring aktif!"
                >
                  <WifiOff size={13} className="text-rose-500 shrink-0" />
                  <span className="hidden sm:inline">Offline</span>
                </motion.div>
              )}
            </AnimatePresence>
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
