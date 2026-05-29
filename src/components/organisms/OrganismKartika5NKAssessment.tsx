import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Check, X } from "lucide-react";
import { MoleculeScaleSelector } from "../molecules/Molecules";
import { KARTIKA_5NK_ASPECTS } from "./reports/KartikaData";
import { AssessmentScale, ScoreData } from "../../types";

interface OrganismKartika5NKAssessmentProps {
  studentId: string;
  studentName: string;
  scores: ScoreData; // Flat map of indicator ID to score
  onScoreChange: (indicatorId: string, score: AssessmentScale) => void;
}

export function OrganismKartika5NKAssessment({ 
  studentId, 
  studentName,
  scores, 
  onScoreChange, 
}: OrganismKartika5NKAssessmentProps) {
  const [activeAspectIndex, setActiveAspectIndex] = useState(0);

  const aspect = KARTIKA_5NK_ASPECTS[activeAspectIndex];
  
  if (!aspect) return null;

  // Since scores is flat, we just pass the full object which maps ind.id -> scale
  const totalCount = aspect.indicators.length;
  const ratedCount = aspect.indicators.filter(ind => scores[ind.id]).length;
  const aspectPercent = totalCount > 0 ? Math.round((ratedCount / totalCount) * 100) : 0;
  const aspectPercentClamped = Math.min(100, Math.max(0, aspectPercent));

  return (
    <div className="flex-1 flex flex-col pt-0 relative pb-6">
      <div className="max-w-4xl mx-auto px-2 flex-1 w-full">
        <div className="mb-3">
            {/* Aspect Selector within tab */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {KARTIKA_5NK_ASPECTS.map((a, idx) => (
                    <button
                        key={a.id}
                        onClick={() => setActiveAspectIndex(idx)}
                        className={cn(
                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight whitespace-nowrap transition-all border flex items-center gap-2",
                        activeAspectIndex === idx 
                            ? "bg-rose-600 border-rose-700 text-white shadow-md shadow-rose-600/10" 
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                        )}
                    >
                        {a.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Progress Tracker Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-xl p-2.5 px-4 mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm text-left">
          <div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">PROGRESS 5NK NASIONAL</span>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 leading-tight">
              {aspect.name}
            </span>
          </div>
          <div className="flex items-center gap-3.5 flex-1 sm:max-w-xs justify-end">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-rose-600 h-full transition-all duration-300" 
                style={{ width: `${aspectPercentClamped}%` }}
              />
            </div>
            <span className="text-xs font-black text-rose-600 dark:text-rose-400 shrink-0 tabular-nums">
              {ratedCount}/{totalCount}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-[#8e8e93]">
              {aspect.indicators.length} Indikator Total
            </div>
            {(ratedCount > 0) && (
              <div className="flex items-center gap-1">
                 <Check size={10} className="text-emerald-500" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Tersimpan</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-slate-900 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {aspect.indicators.map((indicator, index) => {
              const currentScore = scores[indicator.id];
              return (
                <motion.div
                  key={indicator.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className="group flex flex-col md:flex-row md:items-center gap-2.5 p-2.5 px-3.5 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 rounded-xl shadow-xs transition-all hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:border-rose-200 dark:hover:border-rose-800/50 text-left"
                >
                  <div className="flex items-start gap-2.5 flex-1 overflow-hidden">
                    <div 
                      className="w-5 h-5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0 select-none font-bold"
                      style={{ backgroundColor: '#fff0f2', fontSize: '10px', color: '#e11d48', borderStyle: 'solid' }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-[14px] font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-normal pr-2">
                      {indicator.text}
                    </span>
                  </div>

                  <div className="w-full md:w-[320px] shrink-0">
                    <MoleculeScaleSelector 
                      currentValue={currentScore}
                      onSelect={(val) => onScoreChange(indicator.id, val)}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
