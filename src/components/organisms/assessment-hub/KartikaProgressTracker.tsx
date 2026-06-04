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
    <div className="bento-card mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 text-left">
      <div className="flex-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#822a3f] block mb-0.5">PROGRESS 5NK NASIONAL</span>
        <span className="text-sm font-black text-rose-950 leading-tight">
          {aspectName}
        </span>
      </div>
      <div className="flex items-center gap-3 w-full sm:max-w-[200px] justify-between">
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-rose-100/40">
          <div 
            className="bg-rose-600 h-full transition-all duration-300 rounded-full" 
            style={{ width: `${aspectPercentClamped}%` }}
          />
        </div>
        <span className="text-xs font-black text-rose-700 shrink-0 tabular-nums">
          {ratedCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}
