import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";
import { MoleculeScaleSelector } from "../molecules/Molecules";
import { KARTIKA_5NK_ASPECTS } from "./reports/KartikaData";
import { AssessmentScale, ScoreData } from "../../types";
import { KartikaProgressTracker } from "./assessment-hub/KartikaProgressTracker";

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

  return (
    <div className="flex-1 flex flex-col pt-0 relative pb-6">
      <div className="max-w-4xl mx-auto px-2 flex-1 w-full">
        <div className="mb-3">
            {/* Aspect Selector within tab */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none px-1">
              {KARTIKA_5NK_ASPECTS.map((a, idx) => (
                  <button
                      key={a.id}
                      onClick={() => setActiveAspectIndex(idx)}
                      className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 outline-none cursor-pointer flex items-center gap-1.5",
                          activeAspectIndex === idx 
                              ? "bg-rose-600 border-rose-700 text-white shadow-sm font-black" 
                              : "bg-white border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 hover:bg-slate-50"
                      )}
                  >
                         {a.name}
                     </button>
                 ))}
             </div>
        </div>

        {/* Progress Tracker Banner */}
        <KartikaProgressTracker 
            aspectName={aspect.name} 
            ratedCount={ratedCount} 
            totalCount={totalCount} 
        />

        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">
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
                  className="bento-card group flex flex-col md:flex-row md:items-center gap-2 p-3 transition-all text-left"
                >
                  <div className="flex items-start gap-2 flex-1 overflow-hidden">
                    <div 
                      className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-100/80 flex items-center justify-center shrink-0 select-none font-black text-[10px] text-rose-800 font-mono"
                    >
                      {index + 1}
                    </div>
                    <span className="text-[12px] font-bold text-slate-950 leading-tight whitespace-normal pr-2 pt-0.5">
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
