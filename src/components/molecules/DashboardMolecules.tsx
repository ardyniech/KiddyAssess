import React from 'react';
import { cn } from '../../lib/utils';

interface MoleculeMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
}

export const MoleculeMetricCard: React.FC<MoleculeMetricCardProps> = ({ icon, label, value, subValue }) => {
  return (
    <div className="bento-card group flex flex-col justify-between min-h-[140px] bg-white border-slate-200">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
          {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1 block">
          {label}
        </span>
        <h3 className="text-2xl font-black text-black tracking-tighter leading-none">
          {value}
        </h3>
        <p className="text-[10px] font-medium text-slate-500 mt-2">
          {subValue}
        </p>
      </div>
    </div>
  );
};

export const MoleculeStatsCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: number | string; 
  color?: string 
}> = ({ icon, label, value }) => (
    <div className="bento-card flex items-center gap-4 bg-white border-slate-200">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {React.cloneElement(icon as React.ReactElement, { size: 20, className: "text-black" })}
        </div>
        <div>
            <div className="text-xl font-black text-black leading-none mb-1">{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
        </div>
    </div>
);

