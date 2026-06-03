import React, { useState } from 'react';
import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { Aspect, AssessmentScale, ScoreData, Indicator } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Settings, Plus, Check, Image as ImageIcon, ImageOff } from "lucide-react";
import { useCurriculum } from "../../context/CurriculumContext";
import { IndicatorRow } from "./assessment-hub/IndicatorRow";
import { CustomConfirmModal } from "../molecules/CustomDialog";
import { EmptyState } from "../atoms/EmptyState";

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
  const [deleteIndicatorId, setDeleteIndicatorId] = useState<string | null>(null);

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
    setDeleteIndicatorId(id);
  };

  const executeDeleteIndicator = () => {
    if (!deleteIndicatorId) return;
    saveIndicators(aspect.indicators.filter(i => i.id !== deleteIndicatorId));
    setDeleteIndicatorId(null);
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
        <div className="bento-card mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 text-left">
          <div>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#2c4e7d] block mb-1">PROGRESS ASPEK AKTIF</span>
            <span className="text-sm sm:text-base font-black text-slate-950 leading-tight">
              {aspect.name}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-1 sm:max-w-xs justify-end">
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                style={{ width: `${aspectPercentClamped}%` }}
              />
            </div>
            <span className="text-sm font-black text-indigo-750 shrink-0 tabular-nums">
              {ratedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Management Toolbar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-800">
              {aspect.indicators.length} Indikator Total
            </div>
            {(progress > 0 || ratedCount > 0) && (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                 <Check size={11} className="text-emerald-700 font-black" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Tersimpan</span>
              </div>
            )}
            <button 
              onClick={() => setShowPhotos(!showPhotos)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border min-h-[32px]",
                showPhotos 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
              )}
            >
              {showPhotos ? <ImageIcon size={10} /> : <ImageOff size={10} />}
              {showPhotos ? "Foto AKTIF" : "Foto MATI"}
            </button>
          </div>
          <button 
            onClick={() => setIsEditingMode(!isEditingMode)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer min-h-[32px] border",
              isEditingMode 
                ? "bg-amber-500 border-amber-600 text-white shadow-amber-500/15" 
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-205"
            )}
          >
            <Settings size={11} className={cn(isEditingMode && "animate-spin-slow")} />
            {isEditingMode ? "Selesai" : "Kelola"}
          </button>
        </div>

        {isEditingMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 p-3 bg-slate-50 border border-dashed border-slate-250 rounded-xl"
          >
            <div className="flex items-center gap-1.5 mb-2.5 text-left">
               <Plus size={12} className="text-slate-900" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Tambah Indikator Baru</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newIndicatorText}
                onChange={(e) => setNewIndicatorText(e.target.value)}
                placeholder="Tulis rumusan indikator penilaian di sini..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-650 outline-none transition-all text-slate-900"
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
            <EmptyState
              icon={Plus}
              title="Belum Ada Indikator"
              description="Aspek penilaian ini belum memiliki indikator kurikulum terdaftar. Sentuh tombol kelola kurikulum untuk menambahkan indikator baru sebagai acuan nilai."
              illustrationType="checklist"
              size="normal"
              className="py-16"
            />
          )}
        </div>
      </div>

      <CustomConfirmModal 
        isOpen={deleteIndicatorId !== null}
        title="Hapus Indikator Penilaian"
        message="Apakah Anda yakin ingin menghapus indikator ini? Seluruh data nilai murid pada indikator perkembangan ini akan terbuang secara permanen!"
        confirmText="Hapus Indikator"
        cancelText="Batal"
        variant="danger"
        onConfirm={executeDeleteIndicator}
        onCancel={() => setDeleteIndicatorId(null)}
      />
    </div>
  );
}
