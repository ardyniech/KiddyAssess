import React from 'react';
import { motion } from 'motion/react';
import { Indicator, AssessmentScale } from '../../../types';
import { Check, X, Edit2, Trash2 } from 'lucide-react';
import { MoleculeScaleSelector } from '../../molecules/Molecules';
import { MoleculePhotoUploader } from '../../molecules/MoleculePhotoUploader';

interface IndicatorRowProps {
    key?: string | number;
    indicator: Indicator;
    index: number;
    currentScore: AssessmentScale;
    isEditing: boolean;
    isEditingMode: boolean;
    editText: string;
    setEditText: (text: string) => void;
    saveEdit: () => void;
    setEditingId: (id: string | null) => void;
    onScoreChange: (indicatorId: string, val: AssessmentScale) => void;
    showPhotos: boolean;
    studentId: string;
    aspectId: string;
    startEdit: (indicator: Indicator) => void;
    deleteIndicator: (id: string) => void;
}

export const IndicatorRow = ({
    indicator,
    index,
    currentScore,
    isEditing,
    isEditingMode,
    editText,
    setEditText,
    saveEdit,
    setEditingId,
    onScoreChange,
    showPhotos,
    studentId,
    aspectId,
    startEdit,
    deleteIndicator
}: IndicatorRowProps) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.01 }}
            className="group flex flex-col md:flex-row md:items-center gap-2.5 p-2.5 px-3.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-xs transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/15 text-left"
        >
            <div className="flex items-start gap-2.5 flex-1 overflow-hidden">
                <div 
                    className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0 select-none font-bold"
                    style={{ backgroundColor: '#fbff00', fontSize: '10px', color: '#000000', borderStyle: 'dashed' }}
                >
                    {index + 1}
                </div>
                {isEditing ? (
                    <div className="flex gap-2 flex-1 w-full">
                        <input 
                            autoFocus
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none text-slate-900 dark:text-white"
                        />
                        <button onClick={saveEdit} className="p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer"><Check size={14}/></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"><X size={14}/></button>
                    </div>
                ) : (
                    <span className="text-[14px] font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-normal pr-2">
                        {indicator.text}
                    </span>
                )}
            </div>

            {!isEditing && !isEditingMode && (
                <div className="w-full md:w-[320px] shrink-0">
                    <MoleculeScaleSelector 
                        currentValue={currentScore}
                        onSelect={(val) => onScoreChange(indicator.id, val)}
                    />
                    {showPhotos && (
                        <div className="mt-2 flex justify-center">
                            <div className="w-full scale-95 origin-center">
                                <MoleculePhotoUploader 
                                    studentId={studentId}
                                    aspectId={aspectId}
                                    indicatorId={indicator.id}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isEditingMode && !isEditing && (
                <div className="flex items-center gap-1 shrink-0 self-end md:self-auto border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-1.5 md:pt-0 w-full md:w-auto justify-end">
                    <button onClick={() => startEdit(indicator)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-all text-slate-400 hover:text-black dark:hover:text-white cursor-pointer" title="Edit">
                        <Edit2 size={12} />
                    </button>
                    <button onClick={() => deleteIndicator(indicator.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all text-slate-400 hover:text-red-500 cursor-pointer" title="Hapus">
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
