import React from 'react';
import { SyncConflict } from '../../../types/sync';
import { Smartphone, Cloud, Check } from 'lucide-react';

interface SyncConflictCardProps {
  conflict: SyncConflict;
  selectedResolution: 'local' | 'cloud';
  onSelect: (studentId: string, choice: 'local' | 'cloud') => void;
}

export const SyncConflictCard: React.FC<SyncConflictCardProps> = ({
  conflict,
  selectedResolution,
  onSelect,
}) => {
  const localTime = new Date(conflict.localTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const cloudTime = new Date(conflict.cloudTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex flex-col">
        <h4 className="text-[12px] font-black uppercase text-slate-900 tracking-tight">{conflict.studentName}</h4>
        <span className="text-[9px] font-mono font-medium text-slate-500">ID: {conflict.studentId}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Local Copy Selector */}
        <button
          type="button"
          onClick={() => onSelect(conflict.studentId, 'local')}
          className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[85px] cursor-pointer relative ${
            selectedResolution === 'local'
              ? 'border-indigo-600 bg-indigo-50/40 divide-indigo-100 ring-1 ring-indigo-600'
              : 'border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-700">
              <Smartphone size={12} className="text-indigo-600" />
              Perangkat Ini
            </div>
            {selectedResolution === 'local' && (
              <div className="bg-indigo-600 text-white rounded-full p-0.5">
                <Check size={10} />
              </div>
            )}
          </div>
          <div className="mt-2 text-[10px] text-slate-800 font-semibold">
            {conflict.localSummary || 'Profile & Skor'}
          </div>
          <div className="text-[8.5px] font-mono text-slate-500 font-medium">
            Nilai: {conflict.localAssessCount} Indikator • Pkl {localTime}
          </div>
        </button>

        {/* Cloud Copy Selector */}
        <button
          type="button"
          onClick={() => onSelect(conflict.studentId, 'cloud')}
          className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[85px] cursor-pointer relative ${
            selectedResolution === 'cloud'
              ? 'border-indigo-600 bg-indigo-50/40 divide-indigo-100 ring-1 ring-indigo-600'
              : 'border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-700">
              <Cloud size={12} className="text-emerald-600" />
              Pencadangan Awan
            </div>
            {selectedResolution === 'cloud' && (
              <div className="bg-indigo-600 text-white rounded-full p-0.5">
                <Check size={10} />
              </div>
            )}
          </div>
          <div className="mt-2 text-[10px] text-slate-800 font-semibold">
            {conflict.cloudSummary || 'Profile & Skor'}
          </div>
          <div className="text-[8.5px] font-mono text-slate-500 font-medium">
            Nilai: {conflict.cloudAssessCount} Indikator • Pkl {cloudTime}
          </div>
        </button>
      </div>
    </div>
  );
};
