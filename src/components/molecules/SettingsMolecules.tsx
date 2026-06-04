import React from 'react';
import { cn } from '../../lib/utils';
import { MoleculeHelpTooltip } from './MoleculeHelpTooltip';

export const MoleculeSettingsSection: React.FC<{ 
  title: string; 
  subtitle?: string; 
  helpText?: string; 
  children: React.ReactNode 
}> = ({ title, subtitle, helpText, children }) => (
    <div className="space-y-3 mb-6 md:mb-8">
        <div className="ml-1 flex items-center justify-between">
            <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">{title}</h4>
            {helpText && <MoleculeHelpTooltip text={helpText} />}
        </div>
        {subtitle && <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">{subtitle}</p>}
        <div className="space-y-3 md:space-y-4">
            {children}
        </div>
    </div>
);

export const MoleculeSettingItem: React.FC<{ 
  icon?: React.ReactNode; 
  label: string; 
  description?: string; 
  children: React.ReactNode; 
  danger?: boolean 
}> = ({ icon, label, description, children, danger }) => (
    <div className={cn(
        "p-2 md:p-3 rounded-lg md:rounded-xl border transition-all flex flex-row items-center justify-between gap-2 md:gap-3 shadow-xs",
        danger ? "bg-red-500/10 border-red-500/20" : "bg-white dark:bg-slate-800/30 border-slate-200 dark:border-white/5"
    )}>
        <div className="flex gap-2 md:gap-3 items-center min-w-0">
            {icon && (
                <div className={cn(
                    "w-8 h-8 md:w-9 md:h-9 rounded-md md:rounded-lg flex items-center justify-center shrink-0 border",
                    danger ? "bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 text-sky-500 shadow-xs"
                )}>
                    {React.cloneElement(icon as any, { size: 14 })}
                </div>
            )}
            <div className="min-w-0">
                <h5 className={cn("text-[10px] md:text-[11px] font-black uppercase tracking-tight truncate", danger ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-slate-100")}>{label}</h5>
                {description && <p className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 leading-snug truncate">{description}</p>}
            </div>
        </div>
        <div className="shrink-0 flex items-center">
            {children}
        </div>
    </div>
);

export const MoleculeTabButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  desc: string 
}> = ({ active, onClick, icon, label, desc }) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl transition-all text-left group shrink-0",
            active ? "bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-white/10" : "hover:bg-slate-100 dark:hover:bg-white/5"
        )}
    >
        <div className={cn(
            "w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center shrink-0 border transition-all",
            active ? "bg-sky-500 border-sky-400 text-white shadow-md shadow-sky-500/20" : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-slate-400 group-hover:text-sky-500"
        )}>
            {React.cloneElement(icon as any, { size: 12 })}
        </div>
        <div className="min-w-0">
            <h4 className={cn("text-[8px] md:text-[11px] font-black uppercase tracking-widest transition-colors leading-none", active ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>{label}</h4>
            <p className={cn("text-[7px] md:text-[9px] font-black uppercase tracking-tight mt-0.5 truncate", active ? "text-sky-500" : "text-slate-400 dark:text-slate-500")}>{desc}</p>
        </div>
    </button>
);

export const MoleculeToggleButton: React.FC<{ 
  active: boolean; 
  onClick: () => void 
}> = ({ active, onClick }) => (
    <button 
        onClick={onClick}
        className={cn(
            "w-12 h-7 rounded-full relative transition-all duration-300",
            active ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200 dark:bg-white/10"
        )}
    >
        <div className={cn(
            "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md",
            active ? "left-6" : "left-1"
        )} />
    </button>
);

export const MoleculeIdentityInput: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  placeholder: string; 
  isTextArea?: boolean 
}> = ({ label, value, onChange, placeholder, isTextArea }) => (
    <div className="space-y-2 w-full">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 ml-1">{label}</label>
        {isTextArea ? (
            <textarea 
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-[12px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 min-h-[100px] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-xs"
            />
        ) : (
            <input 
                type="text"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-[12px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-xs"
            />
        )}
    </div>
);
