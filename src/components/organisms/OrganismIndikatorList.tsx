import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { MoleculeScaleSelector } from "../molecules/Molecules";
import { Aspect, AssessmentScale, ScoreData } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";

interface OrganismIndikatorListProps {
  aspect: Aspect;
  scores: ScoreData;
  onScoreChange: (indicatorId: string, score: AssessmentScale) => void;
}

export function OrganismIndikatorList({ aspect, scores, onScoreChange }: OrganismIndikatorListProps) {
  return (
    <div className="max-w-7xl mx-auto py-2 px-2 md:py-4">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <AtomText variant="h2" className="mb-0.5 font-display uppercase tracking-tight text-xl md:text-3xl">{aspect.name}</AtomText>
          <AtomText variant="body" className="opacity-50 font-medium italic text-[10px] md:text-sm">Evaluasi indikator pencapaian siswa.</AtomText>
        </div>
        <AtomBadge variant="default" className="hidden md:flex bg-white/5 border-white/5 text-slate-400">
          Penilaian Digital v2.0
        </AtomBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        <AnimatePresence mode="popLayout">
          {aspect.indicators.map((indicator, index) => {
            const currentScore = scores[indicator.id];
            
            return (
              <motion.div
                key={indicator.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group p-3 md:p-5 rounded-2xl md:rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between hover:bg-white/[0.08] transition-all hover:border-white/20"
              >
                <div className="flex gap-3 items-start mb-3 md:mb-6">
                  <div className="bg-white/5 w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5">
                    <span className="text-[9px] md:text-[10px] font-black text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <AtomText variant="h3" className="text-[11px] md:text-sm font-medium leading-relaxed text-slate-200">
                    {indicator.text}
                  </AtomText>
                </div>

                <MoleculeScaleSelector 
                  currentValue={currentScore}
                  onSelect={(val) => onScoreChange(indicator.id, val)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
