import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Calendar, Gift, Info, Check, Trash2, CheckSquare } from 'lucide-react';
import { AppNotification, NotificationType } from './types';
import { loadStoredNotifications, saveStoredNotifications } from './notificationStore';
import { Student } from '../../../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  students,
  unreadCount,
  setUnreadCount,
  notifications,
  setNotifications,
}) => {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const handleMarkRead = (id: string) => {
    const next = notifications.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n);
    setNotifications(next);
    saveStoredNotifications(next);
  };

  const handleMarkAllRead = () => {
    const next = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(next);
    saveStoredNotifications(next);
  };

  const handleClearAll = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'deadline': return <Calendar size={13} className="text-rose-500" />;
      case 'birthday': return <Gift size={13} className="text-amber-500" />;
      case 'system': return <Info size={13} className="text-indigo-500" />;
    }
  };

  const getBg = (type: NotificationType) => {
    switch (type) {
      case 'deadline': return 'bg-rose-50 border-rose-200';
      case 'birthday': return 'bg-amber-50 border-amber-200';
      case 'system': return 'bg-indigo-50 border-indigo-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[80] no-print"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl z-[90] flex flex-col no-print text-slate-800"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-wider">Kotak Pengingat Guru</span>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-all cursor-pointer">
                <X size={14} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
              <span>Filter Notifikasi</span>
              <div className="flex gap-2">
                <button onClick={handleMarkAllRead} className="text-indigo-600 hover:text-indigo-950 flex items-center gap-0.5 cursor-pointer">
                  <CheckSquare size={11} /> Tandai Semua Dibaca
                </button>
                <button onClick={handleClearAll} className="text-slate-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer">
                  <Trash2 size={11} /> Bersihkan
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="p-3 border-b border-slate-100 grid grid-cols-4 gap-1.5">
              {(['all', 'deadline', 'birthday', 'system'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`py-1.5 text-center rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    filter === f ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f === 'deadline' ? 'Tenggat' : f === 'birthday' ? 'Ultah' : 'Sistem'}
                </button>
              ))}
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none">
              {filtered.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Bell size={16} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Belum Ada Pengingat</p>
                  <p className="text-[9px] font-medium text-slate-400 leading-tight">Semua data perkembangan, ultah, dan sistem berjalan dengan lancar.</p>
                </div>
              ) : (
                filtered.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleMarkRead(item.id)}
                    className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none group flex gap-3 ${getBg(item.type)} ${
                      !item.isRead ? 'ring-1 ring-indigo-500/30 shadow-md' : 'opacity-70'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center border border-slate-200 mt-0.5 text-slate-700 shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-black tracking-tight truncate leading-none">{item.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.priority === 'high' && !item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          )}
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider bg-white/60 px-1 border border-slate-150 rounded-sm">
                            {item.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 leading-snug">{item.description}</p>
                    </div>

                    <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center border bg-white text-emerald-600 transition-opacity border-slate-200 group-hover:opacity-100 opacity-60">
                      {item.isRead ? <Check size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
