import React from 'react';
import { motion } from 'motion/react';
import { 
    Settings, Settings2, Terminal, Home, Smile, GraduationCap, 
    Heart, Sparkles, BookOpen, Palette, Users, Calendar, 
    Wallet, Package, ShieldCheck, ClipboardList 
} from 'lucide-react';
import { getSidebarModules } from '../../../registry/appModules';
import { usePermissions } from '../../../context/PermissionContext';
import { cn } from '../../../lib/utils';

interface StudentManagerNavigationProps {
    currentView: string;
    setView: (view: string) => void;
    onClose: () => void;
    onOpenSettings: () => void;
}

export const StudentManagerNavigation: React.FC<StudentManagerNavigationProps> = ({ 
    currentView, 
    setView, 
    onClose, 
    onOpenSettings 
}) => {
    const { canAccessModule, userRole } = usePermissions();
    const allSidebarModules = getSidebarModules();
    
    // Filter modules based on role access
    const sidebarModules = allSidebarModules.filter(m => canAccessModule(m.id, m.requiredRoles));
    const categories = Array.from(new Set(sidebarModules.map(m => m.category)));

    // Mapping cute child-themed icons and colors
    const getCuteModuleIconInfo = (moduleId: string) => {
        switch (moduleId) {
            case 'dashboard':
                return { 
                    icon: Home, 
                    iconBg: 'bg-yellow-100 dark:bg-yellow-950', 
                    iconColor: 'text-yellow-500 font-bold',
                    label: '🏡 Dashboard' 
                };
            case 'students':
                return { 
                    icon: Smile, 
                    iconBg: 'bg-rose-100 dark:bg-rose-950', 
                    iconColor: 'text-rose-500 font-bold',
                    label: '👶 Data Anak' 
                };
            case 'staff':
                return { 
                    icon: GraduationCap, 
                    iconBg: 'bg-emerald-100 dark:bg-emerald-950', 
                    iconColor: 'text-emerald-500 font-bold',
                    label: '👩‍🏫 Data Guru' 
                };
            case 'assessment':
                return { 
                    icon: BookOpen, 
                    iconBg: 'bg-indigo-100 dark:bg-indigo-950', 
                    iconColor: 'text-indigo-500 font-bold',
                    label: '🌈 Nilai & Rapor' 
                };
            case 'generator':
                return { 
                    icon: Sparkles, 
                    iconBg: 'bg-indigo-100 dark:bg-indigo-950', 
                    iconColor: 'text-indigo-500 font-bold',
                    label: '🪄 Generasi AI Cantik' 
                };
            case 'calendar':
                return { 
                    icon: Calendar, 
                    iconBg: 'bg-pink-100 dark:bg-pink-950', 
                    iconColor: 'text-pink-500 font-bold',
                    label: '📅 Agenda Riang' 
                };
            case 'finance':
                return { 
                    icon: Wallet, 
                    iconBg: 'bg-pink-100 dark:bg-pink-350 bg-opacity-20', 
                    iconColor: 'text-fuchsia-600 font-bold',
                    label: '💼 Keuangan' 
                };
            case 'inventory':
                return { 
                    icon: Package, 
                    iconBg: 'bg-yellow-100 dark:bg-yellow-950', 
                    iconColor: 'text-yellow-600 font-bold',
                    label: '🎒 Inventaris' 
                };
            case 'access-control':
                return { 
                    icon: ShieldCheck, 
                    iconBg: 'bg-sky-100 dark:bg-sky-950', 
                    iconColor: 'text-sky-600 font-bold',
                    label: '🔒 Hak Akses' 
                };
            case 'kanban':
                return { 
                    icon: ClipboardList, 
                    iconBg: 'bg-indigo-100 dark:bg-indigo-950', 
                    iconColor: 'text-indigo-600 font-bold',
                    label: '📋 E-Kanban Sekolah' 
                };
            default:
                return { 
                    icon: Settings, 
                    iconBg: 'bg-slate-100 dark:bg-slate-950', 
                    iconColor: 'text-slate-500 font-bold',
                    label: 'Pengaturan' 
                };
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 text-slate-800 border-r border-slate-200">
            {/* Playful Top Header for Sidebar */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-md">
                    <Palette size={20} />
                </div>
                <div className="flex flex-col leading-none text-left">
                    <span className="text-[14px] font-black text-slate-900 tracking-wide uppercase font-sans flex items-center gap-1.5">
                        KiddyApps TK
                        {userRole === 'MASTER' && (
                            <span className="text-[8px] bg-red-100 border border-red-300 px-1 py-0.2 rounded text-red-600 font-extrabold shrink-0 uppercase tracking-widest">[MASTER]</span>
                        )}
                    </span>
                    <span className="text-[9px] font-black text-indigo-700 tracking-[0.1em] mt-1">SISTEM GURU DAN SISWA</span>
                </div>
            </div>

            {/* Program Modules list with Cloud effects */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {categories.map((cat) => {
                    const mappedCategoryLabel = 
                        cat === 'core' ? '🏡 MENU UTAMA' :
                        cat === 'assessment' ? '✏️ PENILAIAN & RAPOR' :
                        cat === 'admin' ? '🏫 ADMINISTRASI SEKOLAH' :
                        '⚙️ LAINNYA';

                    return (
                        <div key={cat} className="flex flex-col relative">
                            {/* Colorful Header badge */}
                            <div className="flex items-center gap-2 mb-2.5 px-1">
                                <span className="text-[9.5px] font-black text-slate-700 tracking-[0.1em] uppercase">
                                    {mappedCategoryLabel}
                                </span>
                            </div>
                            
                            {/* Playful cards Container and borderless items */}
                            <div className="space-y-2 pl-1">
                                {sidebarModules.filter(m => m.category === cat).map((module) => {
                                    const { icon: CuteIcon, iconBg, iconColor, label } = getCuteModuleIconInfo(module.id);
                                    const isActive = currentView === module.id;
                                    
                                    return (
                                        <button 
                                            key={module.id}
                                            onClick={() => { setView(module.id); onClose(); }} 
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all group relative overflow-hidden text-left cursor-pointer active:scale-[0.98] border shadow-sm",
                                                isActive 
                                                ? "bg-indigo-600 text-white font-black border-indigo-700 scale-[1.02] shadow-indigo-100" 
                                                : "bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:text-indigo-950 font-extrabold"
                                            )}
                                        >
                                            {/* Micro-animation round container */}
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-110",
                                                isActive ? "bg-white/20 text-white border-white/20" : "bg-slate-100 text-slate-600 border-slate-200"
                                            )}>
                                                <CuteIcon size={16} className={cn("shrink-0", isActive ? "text-white" : "text-slate-700")} />
                                            </div>
                                            <div className="text-[12px] uppercase tracking-wide truncate flex-1 font-extrabold">
                                                {isActive ? <span className="text-white font-black">{label || module.name}</span> : <span className="text-slate-850">{module.name}</span>}
                                            </div>
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="active-indicator-globe"
                                                    className="w-2.5 h-2.5 rounded-full bg-white shadow-md"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Playful Soft colored Settings at the bottom */}
            <div className="p-3 border-t border-slate-200 bg-white shadow-sm">
                <button 
                    onClick={() => { onOpenSettings(); onClose(); }} 
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all group border border-slate-200 shadow-sm cursor-pointer"
                >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:rotate-45 transition-transform duration-300 shrink-0">
                        <Settings2 size={16} />
                    </div>
                    <div className="text-left overflow-hidden">
                        <div className="text-[11.5px] font-black text-slate-900 uppercase tracking-tight">Atur KiddyApps</div>
                        <div className="text-[8.5px] font-black uppercase tracking-widest leading-none mt-1 text-slate-600">Pengaturan Sistem</div>
                    </div>
                </button>
            </div>
        </div>
    );
};
