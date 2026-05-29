import React, { useState } from 'react';
import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { MoleculeScaleSelector } from "../molecules/Molecules";
import { MoleculePhotoUploader } from "../molecules/MoleculePhotoUploader";
import { Aspect, AssessmentScale, ScoreData, Indicator } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { FileText, Settings, Award, Plus, Edit2, Trash2, Check, X, Info, Image as ImageIcon, ImageOff } from "lucide-react";
import { useCurriculum } from "../../context/CurriculumContext";

interface OrganismIndikatorListProps {
  studentId: string;
  studentName: string;
  aspect: Aspect;
  scores: ScoreData;
  onScoreChange: (indicatorId: string, score: AssessmentScale, aspectId?: string) => void;
  progress?: number;
  lastSaved?: string | null;
  syncStatus?: string | null;
  setView: (view: "dashboard" | "assessment" | "report" | "kartika-5nk") => void;
  aspects: Aspect[];
  activeAspectIndex: number;
  onAspectChange: (index: number) => void;
  onOpenSettings: () => void;
}

export function OrganismIndikatorList({ 
  studentId, 
  studentName,
  aspect, 
  aspects,
  activeAspectIndex,
  onAspectChange,
  scores, 
  onScoreChange, 
  progress = 0, 
  lastSaved, 
  syncStatus,
  setView,
  onOpenSettings
}: OrganismIndikatorListProps) {
  const { updateAspects } = useCurriculum();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [newIndicatorText, setNewIndicatorText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showPhotos, setShowPhotos] = useState(false);

  const totalCount = aspect.indicators.length;
  const ratedCount = aspect.indicators.filter(ind => scores[ind.id]).length;
  const aspectPercent = totalCount > 0 ? Math.round((ratedCount / totalCount) * 100) : 0;
  const aspectPercentClamped = Math.min(100, Math.max(0, aspectPercent));

  const saveIndicators = async (newIndicators: Indicator[]) => {
    const updatedAspects = aspects.map(a => 
      a.id === aspect.id ? { ...a, indicators: newIndicators } : a
    );
    await updateAspects(updatedAspects);
  };

  const addIndicator = () => {
    if (!newIndicatorText.trim()) return;
    const newItem: Indicator = {
      id: `ind_${Date.now()}`,
      text: newIndicatorText.trim()
    };
    saveIndicators([...aspect.indicators, newItem]);
    setNewIndicatorText("");
  };

  const deleteIndicator = (id: string) => {
    if (confirm("Hapus indikator ini? Data nilai murid pada indikator ini akan ikut hilang.")) {
      saveIndicators(aspect.indicators.filter(i => i.id !== id));
    }
  };

  const startEdit = (indicator: Indicator) => {
    setEditingId(indicator.id);
    setEditText(indicator.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    saveIndicators(aspect.indicators.map(i => i.id === editingId ? { ...i, text: editText.trim() } : i));
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col pt-0 relative pb-6">
      <div className="max-w-4xl mx-auto px-2 flex-1 w-full">
        
        {/* Progress Tracker Banner (Google Developer style: solid card, clean stats) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-xl p-2.5 px-4 mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm text-left">
          <div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">PROGRESS ASPEK AKTIF</span>
            <span className="text-xs font-black text-slate-800 dark:text-white leading-tight">
              {aspect.name}
            </span>
          </div>
          <div className="flex items-center gap-3.5 flex-1 sm:max-w-xs justify-end">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300" 
                style={{ width: `${aspectPercentClamped}%` }}
              />
            </div>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 shrink-0 tabular-nums">
              {ratedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Management Toolbar */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#8e8e93]">
              {aspect.indicators.length} Indikator Total
            </div>
            {(progress > 0 || ratedCount > 0) && (
              <div className="flex items-center gap-1">
                 <Check size={10} className="text-emerald-500" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Tersimpan</span>
              </div>
            )}
            <button 
              onClick={() => setShowPhotos(!showPhotos)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tight transition-all cursor-pointer",
                showPhotos ? "bg-sky-100 text-sky-600 dark:bg-sky-950/45 dark:text-sky-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-505"
              )}
            >
              {showPhotos ? <ImageIcon size={9} /> : <ImageOff size={9} />}
              {showPhotos ? "Foto AKTIF" : "Foto MATI"}
            </button>
          </div>
          <button 
            onClick={() => setIsEditingMode(!isEditingMode)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all shadow-xs cursor-pointer",
              isEditingMode 
                ? "bg-orange-500 text-white shadow-orange-500/20" 
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-705"
            )}
          >
            <Settings size={10} className={cn(isEditingMode && "animate-spin-slow")} />
            {isEditingMode ? "Selesai" : "Kelola"}
          </button>
        </div>

        {isEditingMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-250 dark:border-slate-800 rounded-xl"
          >
            <div className="flex items-center gap-1.5 mb-2.5 text-left">
               <Plus size={12} className="text-slate-900 dark:text-white" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Tambah Indikator Baru</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newIndicatorText}
                onChange={(e) => setNewIndicatorText(e.target.value)}
                placeholder="Tulis rumusan indikator penilaian di sini..."
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-650 outline-none transition-all dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && addIndicator()}
              />
              <button 
                onClick={addIndicator}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-1.5 font-black uppercase text-[10px] tracking-wider shadow-sm cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col gap-2 text-slate-900 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {aspect.indicators.map((indicator, index) => {
              const currentScore = scores[indicator.id];
              const isEditing = editingId === indicator.id;
              
              return (
                <motion.div
                  key={indicator.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className="group flex flex-col md:flex-row md:items-center gap-2.5 p-2.5 px-3.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-xs transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/15 hover:border-slate-250 dark:hover:bg-slate-755 text-left"
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
                        onSelect={(val) => onScoreChange(indicator.id, val, aspect.id)}
                      />
                      {showPhotos && (
                        <div className="mt-2 flex justify-center">
                          <div className="w-full scale-95 origin-center">
                            <MoleculePhotoUploader 
                              studentId={studentId}
                              aspectId={aspect.id}
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
            })}
          </AnimatePresence>
          {aspect.indicators.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Belum Ada Indikator</span>
                <span className="text-[9px] font-bold text-slate-400">Gunakan tombol kelola diatas untuk menambahkan indikator baru.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
