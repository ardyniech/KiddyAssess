import React from 'react';
import { SyncResolutionStrategy } from '../../../types/sync';
import { RefreshCw, Smartphone, Cloud } from 'lucide-react';

interface SyncConflictStrategySelectProps {
  activeStrategy: SyncResolutionStrategy;
  onSelectStrategy: (strat: SyncResolutionStrategy) => void;
  conflictCount: number;
}

export const SyncConflictStrategySelect: React.FC<SyncConflictStrategySelectProps> = ({
  activeStrategy,
  onSelectStrategy,
  conflictCount,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5">
      <div className="flex flex-col">
        <span className="text-[7.5px] font-black uppercase text-[#4f46e5] tracking-widest font-mono">
          Metode Resolusi Otomatis ({conflictCount} Murid Terpengaruh)
        </span>
        <h5 className="text-[11px] font-black uppercase text-slate-800">
          Pilih Cara Cepat Selesaikan Konflik
        </h5>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Strategy: Auto Newest */}
        <button
          type="button"
          onClick={() => onSelectStrategy('auto')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider justify-center min-h-[44px] cursor-pointer transition-colors ${
            activeStrategy === 'auto'
              ? 'bg-indigo-600 border-indigo-700 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <RefreshCw size={12} className={activeStrategy === 'auto' ? 'animate-spin' : ''} />
          Gunakan Versi Terbaru
        </button>

        {/* Strategy: Force Local */}
        <button
          type="button"
          onClick={() => onSelectStrategy('local')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider justify-center min-h-[44px] cursor-pointer transition-colors ${
            activeStrategy === 'local'
              ? 'bg-indigo-600 border-indigo-700 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Smartphone size={12} />
          Paksa Perangkat Ini
        </button>

        {/* Strategy: Force Cloud */}
        <button
          type="button"
          onClick={() => onSelectStrategy('cloud')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider justify-center min-h-[44px] cursor-pointer transition-colors ${
            activeStrategy === 'cloud'
              ? 'bg-indigo-600 border-indigo-700 text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Cloud size={12} />
          Paksa Backup Cloud
        </button>
      </div>
    </div>
  );
};
