import React from 'react';
import { motion } from 'motion/react';
import { Award, ClipboardList, FileText, Sparkles, Users } from 'lucide-react';
import { Badge } from './types';

interface BadgeModalProps {
  badge: Badge;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badge, onClose }) => {
  const getIcon = (name: string, active: boolean) => {
    const cls = active ? 'text-amber-500' : 'text-slate-300';
    switch (name) {
      case 'ClipboardList': return <ClipboardList size={22} className={cls} />;
      case 'FileText': return <FileText size={22} className={cls} />;
      case 'Sparkles': return <Sparkles size={22} className={cls} />;
      case 'Users': return <Users size={22} className={cls} />;
      default: return <Award size={22} className={cls} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-slate-200 text-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col space-y-4"
      >
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Informasi Lencana</span>
          <button onClick={onClose} className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-[10px] uppercase font-black tracking-widest rounded-lg cursor-pointer">
            Tutup
          </button>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${badge.isUnlocked ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 text-slate-350'}`}>
            {getIcon(badge.iconName, badge.isUnlocked)}
          </div>
          <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">{badge.title}</h4>
          <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">{badge.description}</p>
          
          {badge.isUnlocked ? (
            <div className="bg-emerald-50 border border-emerald-205 text-emerald-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
              ✓ Diperoleh pada: {badge.unlockedAt || '04 Jun 2026'}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
              🔒 Memerlukan {badge.pointsRequired} XP untuk Unlocked
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
