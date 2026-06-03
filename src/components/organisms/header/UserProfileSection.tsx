import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, UserPlus, Shield, ChevronDown, Check, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePermissions } from '../../../context/PermissionContext';
import { UserRole } from '../../../types';
import { cn } from '../../../lib/utils';

export const UserProfileSection = ({ user, onLogin, onLogout, onSettingsClick }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const { userRole, setUserRole, accountRoles } = usePermissions();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'MASTER', label: 'Master', desc: 'Full System Access' },
    { id: 'SUPER_USER', label: 'Super User', desc: 'System Configs' },
    { id: 'ADMIN', label: 'Admin / Kepsek', desc: 'School Management' },
    { id: 'TEACHER', label: 'Teacher / Guru', desc: 'Classroom & Grading' },
    { id: 'OPERATOR', label: 'Operator / TU', desc: 'Data Entry Only' },
  ];

  const displayRoles = roles.filter(role => {
    if (!user) {
      return role.id !== 'MASTER' && role.id !== 'SUPER_USER';
    }
    const cleanEmail = user.email ? user.email.toLowerCase().trim() : '';
    if (cleanEmail === 'ardy.syafii@gmail.com') return true;
    const key = cleanEmail ? cleanEmail.replace(/\./g, '_') : '';
    const actualDbRole = accountRoles[key] || 'TEACHER';
    
    const rolePrecedence = ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER', 'OPERATOR'];
    const actualIndex = rolePrecedence.indexOf(actualDbRole);
    const targetIndex = rolePrecedence.indexOf(role.id);
    
    return targetIndex >= actualIndex;
  });

  return (
    <div className="relative" ref={menuRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 p-0.5 rounded-xl border border-slate-200 cursor-pointer transition-colors group"
      >
        {user ? (
          <div className="flex items-center gap-2 p-1 pr-2 max-w-[170px]">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm" alt="Avatar" referrerPolicy="no-referrer" />
            <div className="hidden md:flex flex-col truncate">
                <span className="text-[10px] font-black uppercase text-slate-900 truncate">
                    {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[8px] font-black tracking-widest text-indigo-500 uppercase flex items-center gap-1">
                    {userRole}
                </span>
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden md:block group-hover:text-black" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors">
            <LogIn size={12} />
            <span className="hidden sm:inline">Account</span>
            <ChevronDown size={12} className="ml-1 opacity-50" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden z-[100] flex flex-col"
          >
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Menu</span>
                <span className="text-[7px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase tracking-widest">Online</span>
            </div>
            
            <div className="p-2">
                {user ? (
                    <>
                        <div className="px-3 py-3 bg-slate-50/50 rounded-xl mb-2 flex flex-col border border-slate-100">
                            <span className="text-sm font-black text-slate-900 truncate">{user.displayName || 'User'}</span>
                            <span className="text-[10px] font-bold text-slate-500 truncate">{user.email}</span>
                        </div>
                        
                        <div className="mb-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRoleMenu(!showRoleMenu);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors uppercase tracking-widest group"
                            >
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-slate-400 group-hover:text-indigo-500" /> 
                                    Role Context: <span className="text-indigo-600 ml-1">{userRole}</span>
                                </div>
                                <ChevronDown size={12} className={cn("transition-transform duration-200", showRoleMenu ? "rotate-180" : "")} />
                            </button>
                            
                            <AnimatePresence>
                                {showRoleMenu && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-6 pr-2 py-1 space-y-0.5 border-l-2 border-indigo-100 ml-5 my-1">
                                            {displayRoles.map(role => (
                                                <button
                                                    key={role.id}
                                                    onClick={() => {
                                                        setUserRole(role.id);
                                                        setShowRoleMenu(false);
                                                        setIsOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors",
                                                        userRole === role.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-600"
                                                    )}
                                                >
                                                    <div>
                                                        <div className="text-[9px] font-black uppercase tracking-widest">{role.label}</div>
                                                        <div className="text-[7px] font-bold uppercase text-slate-400 tracking-wider">{role.desc}</div>
                                                    </div>
                                                    {userRole === role.id && <Check size={12} className="text-indigo-600 shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <button
                            onClick={() => { onSettingsClick(); setIsOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-black text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors uppercase tracking-widest mt-1 mb-1"
                        >
                            <Settings size={14} /> System Settings
                        </button>

                        <div className="w-full h-px bg-slate-100 my-1" />

                        <button 
                            onClick={() => { onLogout(); setIsOpen(false); }} 
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-black text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors uppercase tracking-widest mt-1"
                        >
                            <LogOut size={14} /> End Session
                        </button>
                    </>
                ) : (
                    <div className="space-y-1">
                        <button 
                            onClick={() => { onLogin(); setIsOpen(false); }} 
                            className="w-full flex items-center gap-2 px-3 py-3 text-[10px] font-black text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-all uppercase tracking-widest"
                        >
                            <LogIn size={14} /> Log In with Google
                        </button>
                        <button 
                            onClick={() => { onLogin(); setIsOpen(false); }} 
                            className="w-full flex items-center justify-center gap-2 px-3 py-3 text-[10px] font-black text-white bg-slate-900 hover:bg-black shadow-md shadow-black/5 rounded-xl transition-all uppercase tracking-widest"
                        >
                            <UserPlus size={14} /> Register Free Account
                        </button>
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


