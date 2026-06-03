import React, { useState } from 'react';
import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { Aspect, AssessmentScale, ScoreData, Indicator } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Settings, Plus, Check, Image as ImageIcon, ImageOff } from "lucide-react";
import { useCurriculum } from "../../context/CurriculumContext";
import { IndicatorRow } from "./assessment-hub/IndicatorRow";

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
        {/* Progress Tracker Banner */}
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
            {aspect.indicators.map((indicator, index) => (
                <IndicatorRow 
                    key={indicator.id}
                    indicator={indicator}
                    index={index}
                    currentScore={scores[indicator.id]}
                    isEditing={editingId === indicator.id}
                    isEditingMode={isEditingMode}
                    editText={editText}
                    setEditText={setEditText}
                    saveEdit={saveEdit}
                    setEditingId={setEditingId}
                    onScoreChange={(indId, val) => onScoreChange(indId, val, aspect.id)}
                    showPhotos={showPhotos}
                    studentId={studentId}
                    aspectId={aspect.id}
                    startEdit={startEdit}
                    deleteIndicator={deleteIndicator}
                />
            ))}
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
