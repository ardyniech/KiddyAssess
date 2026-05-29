import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldAlert, Sparkles, User, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications] = useState([
        { id: '1', type: 'system', title: 'Security Protocol Active', desc: 'Auth kernels synchronized across 12 nodes.', time: '2m ago', icon: ShieldAlert, color: 'text-rose-500' },
        { id: '2', type: 'assessment', title: 'AI Generation Ready', desc: '14 Student narratives synthesized successfully.', time: '1h ago', icon: Sparkles, color: 'text-indigo-500' },
        { id: '3', type: 'user', title: 'New Staff Entry', desc: 'Andi Wijaya joined as Senior Educator.', time: '3h ago', icon: User, color: 'text-emerald-500' },
        { id: '4', type: 'info', title: 'System Build 3.0', desc: 'Migration to Cloud Infrastructure complete.', time: '5h ago', icon: Info, color: 'text-sky-500' },
    ]);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-black/5 hover:bg-black/5 text-slate-400 group relative",
                    isOpen && "bg-black text-white"
                )}
            >
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white">
                                        <Bell size={16} />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tighter">Command Feed</h3>
                                </div>
                                <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-widest">{notifications.length} NEW</span>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto no-scrollbar py-3">
                                {notifications.map((notif, idx) => (
                                    <motion.div 
                                        key={notif.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-start gap-4 group cursor-pointer"
                                    >
                                        <div className={cn("w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0", notif.color)}>
                                            <notif.icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h4 className="text-xs font-black uppercase tracking-tight text-slate-900">{notif.title}</h4>
                                                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{notif.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="p-4 bg-slate-50 mt-auto">
                                <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                    Mark all as processed
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
