import React from 'react';
import { 
    LayoutGrid, ClipboardList, FileText, CalendarDays, 
    Sparkles, Users, BookOpen, Wallet, Package, ShieldCheck 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { usePermissions } from '../../context/PermissionContext';

interface BottomNavProps {
    currentView: string;
    activeStudentId?: string | null;
    onNavigate: (view: string) => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({ currentView, activeStudentId, onNavigate }) => {
    const { userRole } = usePermissions();

    // Dynamically retrieve high-value actions for the active role to load on bottom navigation
    const items = React.useMemo(() => {
        // If we have an active student chosen, morph the bottom nav to focus exclusively on that child's report sheets
        if (activeStudentId) {
            return [
                { id: 'students', label: 'Roster Siswa', icon: Users },
                { id: 'assessment', label: 'Isi Nilai', icon: FileText },
                { id: 'generator', label: 'Narasi AI', icon: Sparkles },
                { id: 'dashboard', label: 'Selesai', icon: LayoutGrid },
            ];
        }

        if (userRole === 'ADMIN') {
            return [
                { id: 'dashboard', label: 'Monitor', icon: LayoutGrid },
                { id: 'students', label: 'Siswa', icon: Users },
                { id: 'staff', label: 'Guru', icon: BookOpen },
                { id: 'finance', label: 'Keuangan', icon: Wallet },
            ];
        } else if (userRole === 'OPERATOR') {
            return [
                { id: 'dashboard', label: 'Tinjau', icon: LayoutGrid },
                { id: 'attendance', label: 'Absen', icon: ClipboardList },
                { id: 'inventory', label: 'Aset', icon: Package },
                { id: 'calendar', label: 'Jadwal', icon: CalendarDays },
            ];
        } else if (userRole === 'MASTER' || userRole === 'SUPER_USER') {
            return [
                { id: 'dashboard', label: 'Kontrol', icon: LayoutGrid },
                { id: 'students', label: 'Siswa', icon: Users },
                { id: 'access-control', label: 'Hak Akses', icon: ShieldCheck },
                { id: 'attendance', label: 'Absensi', icon: ClipboardList },
            ];
        } else {
            // Default: TEACHER (Guru) Classroom grading & work flows
            return [
                { id: 'dashboard', label: 'Beranda', icon: LayoutGrid },
                { id: 'students', label: 'Siswa', icon: Users },
                { id: 'attendance', label: 'Absensi', icon: ClipboardList },
                { id: 'calendar', label: 'Jadwal', icon: CalendarDays },
            ];
        }
    }, [userRole, activeStudentId]);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe select-none shadow-lg">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all relative cursor-pointer active:scale-95",
                                isActive ? "text-indigo-600 font-extrabold" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon size={20} className="shrink-0 transition-transform duration-200" strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] tracking-tight truncate max-w-[70px] leading-tight select-none">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-b-md"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
