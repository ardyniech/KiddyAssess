import React, { useState } from 'react';
import { Aspect, Indicator } from '../../types';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CurriculumEditor: React.FC<{
  aspects: Aspect[];
  onChange: (aspects: Aspect[]) => void;
}> = ({ aspects, onChange }) => {
  const updateAspectName = (id: string, name: string) => {
    onChange(aspects.map(a => a.id === id ? { ...a, name } : a));
  };

  const addAspect = () => {
    onChange([...aspects, { id: Date.now().toString(), name: 'Aspek Baru', indicators: [] }]);
  };

  const removeAspect = (id: string) => {
    onChange(aspects.filter(a => a.id !== id));
  };

  const addIndicator = (aspectId: string) => {
    onChange(aspects.map(a => 
      a.id === aspectId ? { ...a, indicators: [...a.indicators, { id: Date.now().toString(), text: 'Indikator Baru' }] } : a
    ));
  };

  const updateIndicator = (aspectId: string, indicatorId: string, text: string) => {
    onChange(aspects.map(a => 
      a.id === aspectId ? { ...a, indicators: a.indicators.map(i => i.id === indicatorId ? { ...i, text } : i) } : a
    ));
  };

  const removeIndicator = (aspectId: string, indicatorId: string) => {
    onChange(aspects.map(a => 
      a.id === aspectId ? { ...a, indicators: a.indicators.filter(i => i.id !== indicatorId) } : a
    ));
  };

  return (
    <div className="space-y-6">
      {aspects.map(aspect => (
        <div key={aspect.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm relative group">
          <button 
            onClick={() => removeAspect(aspect.id)} 
            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
          <input 
            value={aspect.name}
            onChange={(e) => updateAspectName(aspect.id, e.target.value)}
            className="w-full text-xs font-black uppercase text-slate-900 dark:text-white bg-transparent outline-none mb-3 pr-6"
          />
          <div className="space-y-2">
            {aspect.indicators.map(ind => (
              <div key={ind.id} className="flex gap-2 items-center">
                <GripVertical size={14} className="text-slate-400" />
                <input 
                  value={ind.text}
                  onChange={(e) => updateIndicator(aspect.id, ind.id, e.target.value)}
                  className="flex-1 text-[10px] bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
                />
                <button onClick={() => removeIndicator(aspect.id, ind.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button 
                onClick={() => addIndicator(aspect.id)}
                className="text-[10px] text-sky-500 font-bold flex items-center gap-1 mt-2"
            >
                <Plus size={12} /> Tambah Indikator
            </button>
          </div>
        </div>
      ))}
      <button 
        onClick={addAspect}
        className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-sky-500 hover:border-sky-500 transition-colors"
      >
        <Plus size={14} /> Tambah Aspek Baru
      </button>
    </div>
  );
};
