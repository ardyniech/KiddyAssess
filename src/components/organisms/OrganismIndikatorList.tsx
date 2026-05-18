import React, { useState } from 'react';
import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { MoleculeScaleSelector } from "../molecules/Molecules";
import { MoleculePhotoUploader } from "../molecules/MoleculePhotoUploader";
import { Aspect, AssessmentScale, ScoreData } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

interface OrganismIndikatorListProps {
  studentId: string;
  aspect: Aspect;
  scores: ScoreData;
  onScoreChange: (indicatorId: string, score: AssessmentScale) => void;
  progress?: number;
  lastSaved?: string | null;
  syncStatus?: string | null;
}

export function OrganismIndikatorList({ 
  studentId, 
  aspect, 
  scores, 
  onScoreChange, 
  progress = 0, 
  lastSaved, 
  syncStatus 
}: OrganismIndikatorListProps) {

  return (
    <div className="max-w-7xl mx-auto scaled-p-1 md:scaled-p-4">
      <div className="scaled-m-4 md:scaled-m-6 grid grid-cols-1 md:grid-cols-3 scaled-gap-4">
        <div className="md:col-span-2">
          <AtomText variant="h2" className="mb-0.5 tracking-tight text-xl md:text-3xl font-black text-aspect-title">{aspect.name}</AtomText>
          <AtomText variant="body" className="opacity-50 font-semibold italic text-xs md:text-sm mb-2">Pilih skala pencapaian untuk setiap indikator.</AtomText>
          
          <div className="flex items-center gap-4 glass-panel scaled-p-2 rounded-xl">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight">Progress Aspek</span>
                <span className="text-sm md:text-base font-black text-sky-500">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   className="h-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                />
              </div>
            </div>
            <div className="text-right">
               <div className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight mb-0.5">Status Lokal</div>
               <div className={cn(
                 "text-[10px] md:text-xs font-black uppercase tracking-widest",
                 syncStatus ? "text-amber-500 animate-pulse" : "text-emerald-500"
               )}>
                 {syncStatus ? syncStatus : (lastSaved ? `Tersimpan ${lastSaved}` : "Siap")}
               </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center items-end">
          <AtomBadge variant="default" className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl">
            Penilaian Digital v2.0
          </AtomBadge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 scaled-gap-4 text-slate-900 dark:text-white">
        <AnimatePresence mode="popLayout">
          {aspect.indicators.map((indicator, index) => {
            const currentScore = scores[indicator.id];
            
            return (
              <motion.div
                key={indicator.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "group scaled-p-3 md:scaled-p-4 rounded-2xl glass-card flex flex-col justify-between transition-all cursor-pointer active:shadow-inner",
                  index % 4 === 0 ? "dark:neon-cyan" : index % 4 === 1 ? "dark:neon-pink" : index % 4 === 2 ? "dark:neon-emerald" : "dark:neon-violet"
                )}
              >
                <div className="flex gap-3 items-start mb-2 md:mb-3">
                  <div className="bg-black/5 dark:bg-white/5 w-6 h-6 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5">
                    <span className="text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <AtomText variant="h3" className="text-[var(--card-font-size)] md:text-lg font-medium leading-relaxed text-[var(--card-font-color)]">
                    {indicator.text}
                  </AtomText>
                </div>

                <MoleculeScaleSelector 
                  currentValue={currentScore}
                  onSelect={(val) => onScoreChange(indicator.id, val)}
                />

                <MoleculePhotoUploader 
                  studentId={studentId}
                  aspectId={aspect.id}
                  indicatorId={indicator.id}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
