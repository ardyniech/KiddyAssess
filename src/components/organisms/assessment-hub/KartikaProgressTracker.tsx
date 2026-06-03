import React from 'react';

interface KartikaProgressTrackerProps {
  aspectName: string;
  ratedCount: number;
  totalCount: number;
}

export function KartikaProgressTracker({ aspectName, ratedCount, totalCount }: KartikaProgressTrackerProps) {
  const aspectPercent = totalCount > 0 ? Math.round((ratedCount / totalCount) * 100) : 0;
  const aspectPercentClamped = Math.min(100, Math.max(0, aspectPercent));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-xl p-2.5 px-4 mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm text-left">
      <div>
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">PROGRESS 5NK NASIONAL</span>
        <span className="text-xs font-black text-rose-600 dark:text-rose-400 leading-tight">
          {aspectName}
        </span>
      </div>
      <div className="flex items-center gap-3.5 flex-1 sm:max-w-xs justify-end">
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-rose-600 h-full transition-all duration-300" 
            style={{ width: `${aspectPercentClamped}%` }}
          />
        </div>
        <span className="text-xs font-black text-rose-600 dark:text-rose-400 shrink-0 tabular-nums">
          {ratedCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}
