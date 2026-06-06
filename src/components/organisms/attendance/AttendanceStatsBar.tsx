import React from 'react';
import { CheckCircle2, Clock, HelpCircle, XCircle, BarChart3 } from 'lucide-react';
import { Card } from '../../atoms/UIPrimitives';
import { AttendanceStats } from './types';

interface AttendanceStatsBarProps {
  stats: AttendanceStats;
}

export const AttendanceStatsBar: React.FC<AttendanceStatsBarProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Hadir (H)',
      value: `${stats.totalPresent} Anak`,
      icon: <CheckCircle2 size={16} />,
      colorClass: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Telat (T)',
      value: `${stats.totalLate} Anak`,
      icon: <Clock size={16} />,
      colorClass: 'bg-amber-500/10 text-amber-600',
    },
    {
      title: 'Izin (I)',
      value: `${stats.totalExcused} Anak`,
      icon: <HelpCircle size={16} />,
      colorClass: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      title: 'Alfa (A)',
      value: `${stats.totalAbsent} Anak`,
      icon: <XCircle size={16} />,
      colorClass: 'bg-rose-500/10 text-rose-600',
    },
    {
      title: 'Kehadiran',
      value: `${stats.percentage}%`,
      icon: <BarChart3 size={16} />,
      colorClass: 'bg-slate-900/10 text-slate-800',
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {cards.map((c, i) => (
        <Card 
          key={i} 
          padding={false} 
          className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-sm transition-all text-left flex items-center gap-3"
        >
          <div className={`w-8 h-8 rounded-xl ${c.colorClass} flex items-center justify-center shrink-0`}>
            {c.icon}
          </div>
          <div className="min-w-0">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">
              {c.title}
            </span>
            <span className="text-sm font-black text-slate-800 mt-1 block leading-none">
              {c.value}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};
export default AttendanceStatsBar;
