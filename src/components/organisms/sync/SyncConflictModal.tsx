import React, { useState, useEffect } from 'react';
import { SyncConflict, SyncResolutionStrategy } from '../../../types/sync';
import { SyncConflictHeader } from './SyncConflictHeader';
import { SyncConflictStrategySelect } from './SyncConflictStrategySelect';
import { SyncConflictCard } from './SyncConflictCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SyncConflictModalProps {
  conflicts: SyncConflict[];
  onResolve: (resolutions: Record<string, 'local' | 'cloud'>) => void;
}

export const SyncConflictModal: React.FC<SyncConflictModalProps> = ({
  conflicts,
  onResolve,
}) => {
  const [strategy, setStrategy] = useState<SyncResolutionStrategy>('auto');
  const [resolutions, setResolutions] = useState<Record<string, 'local' | 'cloud'>>({});

  useEffect(() => {
    const nextRes: Record<string, 'local' | 'cloud'> = {};
    conflicts.forEach((c) => {
      if (strategy === 'local') {
        nextRes[c.studentId] = 'local';
      } else if (strategy === 'cloud') {
        nextRes[c.studentId] = 'cloud';
      } else if (strategy === 'auto') {
        nextRes[c.studentId] = c.localTimestamp >= c.cloudTimestamp ? 'local' : 'cloud';
      }
    });

    if (strategy !== 'manual') {
      setResolutions(nextRes);
    }
  }, [strategy, conflicts]);

  const handleCardSelect = (studentId: string, choice: 'local' | 'cloud') => {
    setStrategy('manual');
    setResolutions((prev) => ({
      ...prev,
      [studentId]: choice,
    }));
  };

  const handleConfirm = () => {
    onResolve(resolutions);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 border border-slate-350 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Block */}
        <div className="p-4 md:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-[#4f46e5] rounded-xl">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-[8px] font-black tracking-widest text-[#4f46e5] uppercase font-mono block">AI STUDIO SYNC ENGINE</span>
              <h2 className="text-xs font-black uppercase text-slate-900">Resolusi Konflik Data</h2>
            </div>
          </div>
        </div>

        {/* Form Body Scroll area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          <SyncConflictHeader />
          
          <SyncConflictStrategySelect 
            activeStrategy={strategy}
            onSelectStrategy={setStrategy}
            conflictCount={conflicts.length}
          />

          <div className="space-y-2.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 font-mono block px-1">
              Daftar Murid Dengan Pembaharuan Ganda
            </span>
            <div className="space-y-3">
              {conflicts.map((c) => (
                <SyncConflictCard 
                  key={c.studentId}
                  conflict={c}
                  selectedResolution={resolutions[c.studentId] || 'local'}
                  onSelect={handleCardSelect}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px] cursor-pointer shadow-md"
          >
            Selesaikan Dan Terapkan Sinkronisasi
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
};
