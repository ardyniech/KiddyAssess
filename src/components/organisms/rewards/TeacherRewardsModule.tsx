import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Trophy, Flame, Zap, Star } from 'lucide-react';
import { Student, StudentAssessment } from '../../../types';
import { calculateTeacherEngagementState, getInitialBadges, getDynamicActivities } from './rewardsData';
import { Card } from '../../atoms/UIPrimitives';
import { RewardBadgeItem } from './RewardBadgeItem';
import { BadgeModal } from './BadgeModal';

interface TeacherRewardsModuleProps {
  students: Student[];
  assessments?: StudentAssessment;
}

export const TeacherRewardsModule: React.FC<TeacherRewardsModuleProps> = ({
  students = [],
  assessments,
}) => {
  const state = useMemo(() => calculateTeacherEngagementState(students, assessments), [students, assessments]);
  const badges = useMemo(() => {
    const list = getInitialBadges();
    return list.map(b => ({ ...b, isUnlocked: b.isUnlocked || state.points >= b.pointsRequired }));
  }, [state.points]);

  const activities = useMemo(() => getDynamicActivities(students, assessments), [students, assessments]);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const selectedBadge = badges.find(b => b.id === selectedBadgeId);

  return (
    <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans pb-12">
      <div className="bg-white border-b border-black/5 px-4 sm:px-6 md:px-8 py-5 text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[9px] font-black tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-100">
              SISTEM PRESTASI & REPUTASI GURU
            </span>
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 uppercase mt-1">
              Teacher Rewards <Trophy size={14} className="text-amber-500 animate-bounce" />
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 px-3 py-1 rounded-xl border border-amber-500/20 text-[10px] font-black shrink-0 self-start sm:self-center">
            <Flame size={12} className="text-amber-500 animate-pulse" /> 3 HARI BERUNTUN (STREAK)
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-5 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding={false} className="p-5 bg-slate-900 text-white rounded-3xl col-span-1 md:col-span-2 border border-slate-950 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest leading-none">LEVEL GURU</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-2xl font-black leading-none">{state.level}</span>
                <span className="text-[10px] font-bold text-slate-400 pb-0.5 uppercase tracking-wider">Level Edukator Inspiratif</span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                <span>XP Level Ini</span>
                <span>{state.progressPercentage}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-750 p-0.5">
                <div className="h-full bg-indigo-505 bg-indigo-550 bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${state.progressPercentage}%` }} />
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block">
                Kurang {state.experienceToNextLevel} XP lagi untuk mendaki ke Level {state.level + 1}
              </span>
            </div>
          </Card>

          <Card padding={false} className="p-5 bg-white border border-slate-205 rounded-3xl flex flex-col justify-between space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">TOTAL EXP UNTUK REPUTASI</span>
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Zap size={12} /></div>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none">{state.points}</span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded ml-2 border border-emerald-150">+35 REPUTASI</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 pb-1">Galeri Lencana Kehormatan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map(b => (
                <RewardBadgeItem key={b.id} badge={b} onClick={() => setSelectedBadgeId(b.id)} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 pb-1">Log Bukti Karya Guru</h3>
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-2.5 text-left border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5"><Star size={11} className="fill-indigo-100" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-slate-400">
                      <span>{act.date}</span>
                      <span className="text-indigo-600">+{act.points} XP</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-800 block truncate leading-tight mt-0.5">{act.title}</span>
                    <span className="text-[9px] font-semibold text-slate-400 block tracking-tight leading-tighter truncate mt-0.5">{act.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedBadge && <BadgeModal badge={selectedBadge} onClose={() => setSelectedBadgeId(null)} />}
      </AnimatePresence>
    </div>
  );
};
export default TeacherRewardsModule;
