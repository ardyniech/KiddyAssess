import React from 'react';
import { Settings, Plus, Check, X, Edit2, Trash2 } from 'lucide-react';
import { Aspect } from '../../../types';
import { cn } from '../../../lib/utils';

interface AspectsToolbarProps {
    aspects: Aspect[];
    activeAspectIndex: number;
    onAspectChange: (index: number) => void;
    editingAspectId: string | null;
    editAspectName: string;
    setEditAspectName: (name: string) => void;
    saveAspectEdit: () => void;
    setEditingAspectId: (id: string | null) => void;
    isManagingAspects: boolean;
    setIsManagingAspects: (managing: boolean) => void;
    startEditAspect: (aspect: Aspect) => void;
    deleteAspect: (id: string) => void;
    addAspect: () => void;
}

export const AspectsToolbar = ({
    aspects,
    activeAspectIndex,
    onAspectChange,
    editingAspectId,
    editAspectName,
    setEditAspectName,
    saveAspectEdit,
    setEditingAspectId,
    isManagingAspects,
    setIsManagingAspects,
    startEditAspect,
    deleteAspect,
    addAspect
}: AspectsToolbarProps) => {
    return (
        <div className="mb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {aspects.map((aspect, idx) => (
                    <div key={aspect.id} className="relative flex items-center shrink-0">
                        {editingAspectId === aspect.id ? (
                            <div className="flex items-center gap-1.5 bg-white border border-indigo-600 rounded-xl px-2.5 py-1 shadow-md">
                                <input 
                                    autoFocus
                                    value={editAspectName}
                                    onChange={e => setEditAspectName(e.target.value)}
                                    className="text-[9px] font-black uppercase outline-none w-20 bg-transparent"
                                    onKeyDown={e => e.key === 'Enter' && saveAspectEdit()}
                                />
                                <button onClick={saveAspectEdit} className="text-emerald-500 hover:scale-110 transition-transform"><Check size={12}/></button>
                                <button onClick={() => setEditingAspectId(null)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={12}/></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onAspectChange(idx)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight whitespace-nowrap transition-all border flex items-center gap-2",
                                    activeAspectIndex === idx 
                                        ? "bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-600/10" 
                                        : "bg-white border-slate-205 text-slate-700 font-extrabold hover:border-slate-350 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                )}
                            >
                                {aspect.name}
                                {isManagingAspects && (
                                    <div className="flex items-center gap-1.5 ml-1.5 border-l border-white/20 pl-1.5">
                                        <Edit2 size={9} className="hover:text-amber-400 transition-colors" onClick={(e) => { e.stopPropagation(); startEditAspect(aspect); }} />
                                        <Trash2 size={9} className="hover:text-rose-400 transition-colors" onClick={(e) => { e.stopPropagation(); deleteAspect(aspect.id); }} />
                                    </div>
                                )}
                            </button>
                        )}
                    </div>
                ))}
                <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-100">
                    <button 
                        onClick={() => setIsManagingAspects(!isManagingAspects)}
                        className={cn(
                            "p-1.5 rounded-xl transition-all shadow-sm border",
                            isManagingAspects 
                                ? "bg-amber-100 border-amber-200 text-amber-600" 
                                : "bg-white border-slate-100 text-slate-300 hover:text-slate-600"
                        )}
                    >
                        <Settings size={12} />
                    </button>
                    {isManagingAspects && (
                        <button 
                            onClick={addAspect}
                            className="p-1.5 bg-black text-white rounded-xl shadow-md active:scale-95"
                        >
                            <Plus size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
