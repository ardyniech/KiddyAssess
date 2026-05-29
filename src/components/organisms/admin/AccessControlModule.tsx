import React from 'react';
import { motion } from 'motion/react';
import { 
    ShieldCheck, 
    Lock, 
    ChevronRight, 
    Users, 
    Key, 
    Settings2,
    CheckCircle2,
    UserCircle,
    Fingerprint,
    ShieldAlert,
    ToggleLeft,
    ToggleRight,
    RefreshCw
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePermissions } from '../../../context/PermissionContext';
import { UserRole } from '../../../types';
import { APP_MODULES } from '../../../registry/appModules';
import { Button, Card, Badge, SectionHeader } from '../../atoms/UIPrimitives';

export const AccessControlModule = () => {
    const { userRole, setUserRole, moduleOverrides, updateModuleOverride, accountRoles, updateAccountRole, removeAccountRole, discoveredUsers, refreshDiscovery } = usePermissions();
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [newEmail, setNewEmail] = React.useState('');
    const [selectedRoleForEmail, setSelectedRoleForEmail] = React.useState<UserRole>('TEACHER');

    const roles: { id: UserRole, label: string, desc: string, icon: any }[] = [
        { id: 'MASTER', label: 'Master User', desc: 'Pengendali sistem utama dengan akses penuh.', icon: Fingerprint },
        { id: 'SUPER_USER', label: 'Yayasan', desc: 'Pengawasan kelembagaan dan pengaturan regional.', icon: ShieldCheck },
        { id: 'ADMIN', label: 'Kepala Sekolah', desc: 'Operasional sekolah, staf, dan manajemen keuangan.', icon: Key },
        { id: 'TEACHER', label: 'Pendidik', desc: 'Penilaian rapor dan tugas kelas.', icon: UserCircle },
        { id: 'OPERATOR', label: 'TU / Admin', desc: 'Dukungan logistik dan rekap staf.', icon: Settings2 },
    ];

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.includes('@')) return;
        await updateAccountRole(newEmail, selectedRoleForEmail);
        setNewEmail('');
    };

    const togglePermission = (moduleId: string, roleToToggle: UserRole, defaultRoles?: UserRole[]) => {
        const effectiveRoles = [...(moduleOverrides[moduleId] || defaultRoles || [])];
        const nextRoles = effectiveRoles.includes(roleToToggle)
            ? effectiveRoles.filter(r => r !== roleToToggle)
            : [...effectiveRoles, roleToToggle];
        
        updateModuleOverride(moduleId, nextRoles);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshDiscovery();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 relative font-sans transition-colors duration-500">
            {/* Header */}
            <header className="px-6 md:px-8 py-8 md:py-12 border-b border-black/5 bg-white shrink-0 relative overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.03 }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#4f46e5,#ffffff)]" 
                />
                
                <div className="relative z-10">
                    <SectionHeader 
                        title="Konsol Hak Akses" 
                        subtitle="Jaringan Manajemen Otorisasi" 
                        icon={Settings2}
                        actions={
                            <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/20" />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Keamanan Kernel v4.2</span>
                            </div>
                        }
                    />
                </div>
            </header>

            <main className="flex-1 p-5">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Role Selection */}
                    <div className="lg:col-span-4 space-y-8">
                        {userRole === 'MASTER' && (
                            <section className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Users size={16} />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Whitelist Google Account</h3>
                                </div>

                                <form onSubmit={handleAddAccount} className="space-y-3 mb-6">
                                    <input 
                                        type="email" 
                                        placeholder="Email Google..."
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={selectedRoleForEmail}
                                            onChange={(e) => setSelectedRoleForEmail(e.target.value as UserRole)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-400 focus:outline-none ring-0"
                                        >
                                            {roles.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
                                        </select>
                                        <Button size="sm" variant="dark" className="bg-indigo-600 hover:bg-indigo-500 border-none shrink-0" type="submit">Tambah</Button>
                                    </div>
                                </form>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.entries(accountRoles).map(([key, role]) => {
                                        const email = key.replace(/_/g, '.');
                                        return (
                                            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group">
                                                <div className="min-w-0">
                                                    <div className="text-[10px] font-bold truncate text-slate-300">{email}</div>
                                                    <div className="text-[8px] font-black uppercase text-indigo-400 mt-1">{role}</div>
                                                </div>
                                                <button 
                                                    onClick={() => removeAccountRole(email)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-all"
                                                >
                                                    <ShieldAlert size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {Object.keys(accountRoles).length === 0 && (
                                        <div className="text-[9px] text-slate-600 italic py-4 text-center">Belum ada akun terdaftar</div>
                                    )}
                                </div>
                            </section>
                        )}

                        {userRole === 'MASTER' && (
                            <section className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Users size={16} />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800">Discovery Pengguna</h3>
                                    <div className="ml-auto flex items-center gap-2">
                                        <Badge variant="outline" className="text-[7px] text-slate-400 border-slate-200">Default: GURU</Badge>
                                        <button 
                                            onClick={handleRefresh}
                                            disabled={isRefreshing}
                                            className={cn("p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all", isRefreshing && "animate-spin")}
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                        <Badge variant="success" className="text-[8px]">{discoveredUsers.length}</Badge>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {discoveredUsers.map((user) => {
                                        const emailKey = user.email.replace(/\./g, '_');
                                        const currentRole = accountRoles[emailKey] || 'TEACHER';
                                        
                                        return (
                                            <div key={user.email} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group transition-all hover:bg-indigo-50/20 hover:border-indigo-100/50">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-black text-slate-900 truncate tracking-tight">{user.displayName || 'Tanpa Nama'}</div>
                                                        <div className="text-xs font-bold text-slate-400 truncate tracking-wide">{user.email}</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-5 gap-1.5">
                                                    {roles.map(r => (
                                                        <button
                                                            key={r.id}
                                                            onClick={() => updateAccountRole(user.email, r.id)}
                                                            className={cn(
                                                                "min-h-[44px] flex items-center justify-center rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all shadow-sm",
                                                                currentRole === r.id 
                                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20" 
                                                                : "bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-600"
                                                            )}
                                                            title={r.label}
                                                        >
                                                            {r.id.substring(0, 3)}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="mt-4 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-200/50 pt-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span>Login Terakhir:</span>
                                                    </div>
                                                    <span className="text-slate-600">{new Date(user.lastLogin).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {discoveredUsers.length === 0 && (
                                        <div className="text-[10px] text-slate-500 italic py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                            Belum ada log aktivitas pengguna lain
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Pilih Identitas (Simulasi)</h3>
                            {roles.map((role) => (
                                <motion.button
                                    key={role.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setUserRole(role.id)}
                                    className={cn(
                                        "w-full p-5 bg-white border border-slate-100 rounded-3xl transition-all text-left flex items-start gap-5 relative group",
                                        userRole === role.id 
                                        ? "ring-2 ring-indigo-600 ring-offset-4 border-indigo-600 shadow-2xl shadow-indigo-500/10" 
                                        : "hover:border-black hover:shadow-xl hover:shadow-slate-200/50 grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                                        userRole === role.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                                    )}>
                                        <role.icon size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                        <div className="text-sm font-black uppercase tracking-tight mb-1 truncate leading-none text-slate-900">{role.label}</div>
                                        <div className="text-[10px] font-black leading-relaxed text-slate-400 uppercase tracking-widest line-clamp-2 mt-2">{role.desc}</div>
                                    </div>
                                    {userRole === role.id && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-600">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Permissions Matrix */}
                    <div className="lg:col-span-8">
                        <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-12">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Matriks Akses Modul</h3>
                                {(userRole === 'MASTER' || userRole === 'SUPER_USER') && (
                                    <Badge variant="error" className="px-5 py-2 flex items-center gap-2 border-rose-500/30">
                                        <ShieldAlert size={12} />
                                        Override Protokol Aktif
                                    </Badge>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                {APP_MODULES.map((module) => {
                                    const effectiveAllowedRoles = moduleOverrides[module.id] || module.requiredRoles || [];
                                    const isAllowed = userRole === 'MASTER' || userRole === 'SUPER_USER' || effectiveAllowedRoles.includes(userRole);
                                    
                                    return (
                                        <div key={module.id} className="p-5 rounded-xl sm:rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-black transition-all group shadow-inner">
                                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                                <div className="flex items-center gap-3 sm:gap-5">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                                        <module.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs sm:text-[13px] font-black text-slate-900 uppercase tracking-widest mb-1">{module.name}</div>
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">{module.category}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={isAllowed ? 'success' : 'error'} className="px-4 py-1.5 border-none shadow-sm">
                                                        {isAllowed ? 'Diizinkan' : 'Dilarang'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Advanced Controls for SUPER_USER and MASTER */}
                                            {(userRole === 'SUPER_USER' || userRole === 'MASTER') && (
                                                <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                    {roles.map(r => {
                                                        const isRoleAllowed = effectiveAllowedRoles.includes(r.id);
                                                        return (
                                                            <button 
                                                                key={r.id}
                                                                onClick={() => togglePermission(module.id, r.id, module.requiredRoles)}
                                                                className={cn(
                                                                    "flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-tighter",
                                                                    isRoleAllowed 
                                                                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-black/10" 
                                                                    : "bg-white border-slate-200 text-slate-400 hover:text-black hover:border-black"
                                                                )}
                                                            >
                                                                <span className="truncate mr-2 leading-none">{r.label}</span>
                                                                {isRoleAllowed ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 sm:mt-12 p-5 bg-slate-900 rounded-xl sm:rounded-[2rem] text-white shadow-2xl shadow-slate-900/10">
                                <div className="flex items-start gap-4 sm:gap-6">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Lock size={20} className="sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest mb-2">Protokol Kelembagaan</h4>
                                        <p className="text-[10px] font-medium leading-relaxed opacity-60 uppercase tracking-widest">
                                            Level akses dikelola secara real-time. Override akses berbasis peran memastikan navigasi platform yang aman di seluruh modul.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
