import React from 'react';
import { Award, ClipboardList, FileText, Sparkles, Users } from 'lucide-react';
import { Badge } from './types';

interface RewardBadgeItemProps {
  badge: Badge;
  onClick: () => void;
}

export const RewardBadgeItem: React.FC<RewardBadgeItemProps> = ({ badge, onClick }) => {
  const getIcon = (name: string, active: boolean) => {
    const cls = active ? 'text-amber-500' : 'text-slate-300';
    switch (name) {
      case 'ClipboardList': return <ClipboardList size={18} className={cls} />;
      case 'FileText': return <FileText size={18} className={cls} />;
      case 'Sparkles': return <Sparkles size={18} className={cls} />;
      case 'Users': return <Users size={18} className={cls} />;
      default: return <Award size={18} className={cls} />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all select-none cursor-pointer hover:shadow-md ${
        badge.isUnlocked 
          ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-200 ring-1 ring-amber-100' 
          : 'bg-slate-50 border-slate-200 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${badge.isUnlocked ? 'bg-amber-500/10' : 'bg-slate-200/60'}`}>
          {getIcon(badge.iconName, badge.isUnlocked)}
        </div>
        {badge.isUnlocked ? (
          <span className="text-[7.5px] font-black text-amber-600 uppercase tracking-widest bg-amber-100 px-1 border border-amber-200 rounded leading-none shrink-0 animate-pulse">Buka</span>
        ) : (
          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 px-1 rounded leading-none shrink-0">{badge.pointsRequired} XP</span>
        )}
      </div>
      <div className="min-w-0">
        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight block leading-tight truncate">{badge.title}</span>
        <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-tighter truncate leading-none block mt-0.5">Ketuk untuk detail</span>
      </div>
    </button>
  );
};
