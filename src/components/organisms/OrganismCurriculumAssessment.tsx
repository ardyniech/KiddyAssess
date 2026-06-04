import React, { useState, useEffect } from 'react';
import { AtomText } from "../atoms/CommonAtoms";
import { MoleculeScaleSelector } from "../molecules/Molecules";
import { Indicator, AssessmentScale, ScoreData } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Settings, Plus, Trash2, Edit2, Check, X, Info } from "lucide-react";
import { CURRICULUM_INDICATORS } from "../../constants";
import { db } from "../../lib/db";
import { CustomConfirmModal } from "../molecules/CustomDialog";
import { EmptyState } from "../atoms/EmptyState";

interface OrganismCurriculumAssessmentProps {
  studentId: string;
  studentName: string;
  scores: ScoreData;
  onScoreChange: (indicatorId: string, score: AssessmentScale) => void;
}

export function OrganismCurriculumAssessment({ 
  studentId, 
  studentName,
  scores, 
  onScoreChange, 
}: OrganismCurriculumAssessmentProps) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [newIndicatorText, setNewIndicatorText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteIndicatorId, setDeleteIndicatorId] = useState<string | null>(null);

  useEffect(() => {
    async function loadIndicators() {
      const record = await db.settings.get('custom_curriculum_indicators');
      if (record?.value) {
        setIndicators(record.value);
      } else {
        setIndicators(CURRICULUM_INDICATORS);
      }
    }
    loadIndicators();
  }, []);

  const totalCount = indicators.length;
  const ratedCount = indicators.filter(ind => scores[ind.id]).length;
  const aspectPercent = totalCount > 0 ? Math.round((ratedCount / totalCount) * 100) : 0;
  const aspectPercentClamped = Math.min(100, Math.max(0, aspectPercent));

  const saveIndicators = async (newItems: Indicator[]) => {
    setIndicators(newItems);
    await db.settings.put({ key: 'custom_curriculum_indicators', value: newItems });
  };

  const addIndicator = () => {
    if (!newIndicatorText.trim()) return;
    const newItem: Indicator = {
      id: `curr_${Date.now()}`,
      text: newIndicatorText.trim()
    };
    saveIndicators([...indicators, newItem]);
    setNewIndicatorText("");
  };

  const deleteIndicator = (id: string) => {
    setDeleteIndicatorId(id);
  };

  const executeDeleteIndicator = () => {
    if (!deleteIndicatorId) return;
    saveIndicators(indicators.filter(i => i.id !== deleteIndicatorId));
    setDeleteIndicatorId(null);
  };

  const startEdit = (indicator: Indicator) => {
    setEditingId(indicator.id);
    setEditText(indicator.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    saveIndicators(indicators.map(i => i.id === editingId ? { ...i, text: editText.trim() } : i));
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col pt-0 relative pb-6">
      <div className="max-w-4xl mx-auto px-2 flex-1 w-full">
        
        {/* Progress Tracker Banner (Google Developer style: solid card, clean stats) */}
        <div className="bento-card mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 text-left">
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2c4e7d] block mb-0.5">PROGRESS KOKURIKULER</span>
            <span className="text-sm font-black text-slate-950 leading-tight">
              Program Kokurikuler Siswa
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:max-w-[200px] justify-between">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                style={{ width: `${aspectPercentClamped}%` }}
              />
            </div>
            <span className="text-xs font-black text-indigo-750 shrink-0 tabular-nums">
              {ratedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Management Toolbar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-800">
              {indicators.length} Indikator Total
            </div>
            {(ratedCount > 0) && (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                 <Check size={11} className="text-emerald-700 font-black" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Tersimpan</span>
              </div>
            )}
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
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Tambah Indikator Kokurikuler</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newIndicatorText}
                onChange={(e) => setNewIndicatorText(e.target.value)}
                placeholder="Tulis rumusan indikator kokurikuler..."
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
            {indicators.map((indicator, index) => {
              const isEditing = editingId === indicator.id;
              
              return (
                <motion.div
                  key={indicator.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className="bento-card group flex flex-col md:flex-row md:items-center gap-2 p-[5px] min-h-[80px] md:h-[80px] transition-all hover:bg-slate-50 hover:border-indigo-400 text-left"
                >
                  <div className="flex items-start gap-2 flex-1 overflow-hidden">
                    <div 
                      className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 select-none font-black text-[10px] text-indigo-750 font-mono"
                    >
                      {index + 1}
                    </div>
                    {isEditing ? (
                      <div className="flex gap-2 flex-1 w-full">
                        <input 
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold outline-none text-slate-950"
                        />
                        <button onClick={saveEdit} className="p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer"><Check size={14}/></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"><X size={14}/></button>
                      </div>
                    ) : (
                      <span className="text-[12px] font-bold text-slate-950 leading-tight whitespace-normal pr-2 pt-0.5">
                        {indicator.text}
                      </span>
                    )}
                  </div>

                  {!isEditing && !isEditingMode && (
                    <div className="w-full md:w-[320px] shrink-0">
                      <MoleculeScaleSelector 
                        currentValue={scores[indicator.id]}
                        onSelect={(val) => onScoreChange(indicator.id, val)}
                      />
                    </div>
                  )}

                  {isEditingMode && !isEditing && (
                    <div className="flex items-center gap-1 shrink-0 self-end md:self-auto border-t md:border-t-0 border-slate-100 pt-1.5 md:pt-0 w-full md:w-auto justify-end">
                       <button onClick={() => startEdit(indicator)} className="p-1.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900 cursor-pointer" title="Edit">
                          <Edit2 size={12} />
                       </button>
                       <button onClick={() => deleteIndicator(indicator.id)} className="p-1.5 hover:bg-red-50 rounded-xl transition-all text-slate-400 hover:text-red-600 cursor-pointer" title="Hapus">
                          <Trash2 size={12} />
                       </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {indicators.length === 0 && (
            <EmptyState
              icon={Info}
              title="Belum Ada Indikator Penilaian"
              description="Kurikulum kokurikuler rombel ini masih bersih atau belum dikonfigurasi. Sentuh tombol pengaturan atau kelola di bagian kanan atas untuk menambahkan indikator baru."
              illustrationType="checklist"
              size="normal"
              className="py-16"
            />
          )}
        </div>
      </div>

      <CustomConfirmModal 
        isOpen={deleteIndicatorId !== null}
        title="Hapus Indikator Kokurikuler"
        message="Apakah Anda yakin ingin menghapus indikator ini? Seluruh data nilai murid pada indikator ini akan disingkirkan secara permanen!"
        confirmText="Hapus Indikator"
        cancelText="Batal"
        variant="danger"
        onConfirm={executeDeleteIndicator}
        onCancel={() => setDeleteIndicatorId(null)}
      />
    </div>
  );
}
