import React, { useState } from 'react';
import { Aspect, AssessmentScale, ScoreData, Student } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { LayoutDashboard, GraduationCap, ClipboardList, Info, Plus, Settings, Edit2, Trash2, Check, X, School, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { OrganismIndikatorList } from "./OrganismIndikatorList";
import { OrganismCurriculumAssessment } from "./OrganismCurriculumAssessment";
import { OrganismKartika5NKAssessment } from "./OrganismKartika5NKAssessment";
import { AtomText } from "../atoms/CommonAtoms";
import { useCurriculum } from "../../context/CurriculumContext";

interface OrganismAssessmentHubProps {
  key?: React.Key;
  student: Student;
  aspects: Aspect[];
  activeAspectIndex: number;
  onAspectChange: (index: number) => void;
  scores: Record<string, ScoreData>;
  onScoreChange: (indicatorId: string, score: AssessmentScale, aspectId?: string) => void;
  setView: (view: "dashboard" | "assessment" | "report") => void;
  onOpenSettings: () => void;
  students?: Student[];
  onSelectStudent?: (id: string) => void;
}

type AssessmentType = 'development' | 'curriculum' | 'kartika';

export function OrganismAssessmentHub({
  student,
  aspects,
  activeAspectIndex,
  onAspectChange,
  scores,
  onScoreChange,
  setView,
  onOpenSettings,
  students = [],
  onSelectStudent
}: OrganismAssessmentHubProps) {
  const { updateAspects } = useCurriculum();
  const [activeType, setActiveType] = useState<AssessmentType>('development');
  const [isManagingAspects, setIsManagingAspects] = useState(false);
  const [editingAspectId, setEditingAspectId] = useState<string | null>(null);
  const [editAspectName, setEditAspectName] = useState("");

  const currentIdx = students ? students.findIndex(s => s.id === student?.id) : -1;

  // Add Left & Right Arrow keys keyboard navigation for ultra fast swap:
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft' && currentIdx > 0 && students && onSelectStudent) {
        onSelectStudent(students[currentIdx - 1].id);
      } else if (e.key === 'ArrowRight' && students && currentIdx < students.length - 1 && onSelectStudent) {
        onSelectStudent(students[currentIdx + 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, students, onSelectStudent]);

  const tabs: { id: AssessmentType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'development', label: 'Aspek Perkembangan', icon: <LayoutDashboard size={16} />, desc: '3 Aspek • 60 Indikator' },
    { id: 'curriculum', label: 'Kokurikuler', icon: <GraduationCap size={16} />, desc: 'Program Kokurikuler' },
    { id: 'kartika', label: 'Nilai 5NK', icon: <Shield size={16} />, desc: 'Kartika 5NK Nasional' }
  ];

  const addAspect = async () => {
    const name = prompt("Enter aspect name:");
    if (!name) return;
    const newAspect: Aspect = {
      id: `asp_${Date.now()}`,
      name,
      indicators: []
    };
    await updateAspects([...aspects, newAspect]);
  };

  const deleteAspect = async (id: string) => {
    if (confirm("Delete this aspect? All indicator data for this aspect will be lost.")) {
      await updateAspects(aspects.filter(a => a.id !== id));
      if (activeAspectIndex >= aspects.length - 1) {
        onAspectChange(Math.max(0, aspects.length - 2));
      }
    }
  };

  const startEditAspect = (aspect: Aspect) => {
    setEditingAspectId(aspect.id);
    setEditAspectName(aspect.name);
  };

  const saveAspectEdit = async () => {
    if (!editAspectName.trim()) return;
    await updateAspects(aspects.map(a => a.id === editingAspectId ? { ...a, name: editAspectName.trim() } : a));
    setEditingAspectId(null);
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--bg-main)]">
      {!student && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-20">
           <School size={64} className="mb-4" />
           <AtomText variant="body" className="font-black uppercase tracking-[0.3em] text-xs">Akses Database Ditolak</AtomText>
           <p className="text-[10px] uppercase font-bold mt-2">Pilih Peserta Didik Terlebih Dahulu</p>
        </div>
      )}
      {student && (
        <div className="flex-1 overflow-y-auto pt-3 pb-8 custom-scrollbar">
          {/* Sub-Navigation Hub */}
          <div className="max-w-5xl mx-auto w-full px-4 mb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 text-left">
                    {/* Left Swapper Arrow */}
                    <button 
                        disabled={currentIdx <= 0}
                        onClick={() => {
                            if (students && currentIdx > 0 && onSelectStudent) {
                                onSelectStudent(students[currentIdx - 1].id);
                            }
                        }}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-slate-700 hover:text-black hover:border-slate-350 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 focus:outline-none transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none active:scale-95 shadow-sm"
                        title="Siswa Sebelumnya (←)"
                    >
                        <ChevronLeft size={14} strokeWidth={2.5} />
                    </button>

                    <div className="flex flex-col">
                        <h2 className="text-sm md:text-base font-black tracking-tight text-slate-950 leading-none">
                            {student.name}
                        </h2>
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mt-1 block">
                            Siswa {currentIdx + 1} dari {students.length} • NISN: {student.nisn || "-"}
                        </span>
                    </div>

                    {/* Right Swapper Arrow */}
                    <button 
                        disabled={!students || currentIdx === -1 || currentIdx >= students.length - 1}
                        onClick={() => {
                            if (students && currentIdx < students.length - 1 && onSelectStudent) {
                                onSelectStudent(students[currentIdx + 1].id);
                            }
                        }}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-slate-700 hover:text-black hover:border-slate-350 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-700 focus:outline-none transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none active:scale-95 shadow-sm"
                        title="Siswa Berikutnya (→)"
                    >
                        <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-sm self-start md:self-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveType(tab.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all",
                                activeType === tab.id 
                                ? "bg-indigo-650 text-white shadow-md shadow-indigo-600/10 scale-100 font-black" 
                                : "text-slate-700 hover:text-indigo-950 font-extrabold hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40 scale-95"
                            )}
                        >
                            {React.cloneElement(tab.icon as React.ReactElement, { size: 12 })}
                            <span className="text-[9px] font-black uppercase tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeType === 'development' && (
                <motion.div
                  key="development"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="max-w-5xl mx-auto px-4"
                >
                  <div className="mb-3">
                     {/* Aspect Selector within tab */}
                     <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                        {aspects.map((aspect, idx) => (
                          <div key={aspect.id} className="relative flex items-center shrink-0">
                            {editingAspectId === aspect.id ? (
                               <div className="flex items-center gap-1.5 bg-white border border-indigo-600 rounded-xl px-2.5 py-1 shadow-md">
                                  <input 
                                    autoFocus
                                    value={editAspectName}
                                    onChange={e => setEditAspectName(e.target.value)}
                                    className="text-[9px] font-black uppercase outline-none w-20 bg-transparent"
                                    onKeyDown={e => e.key === 'Enter' && saveAspectEdit()}
                                  />
                                  <button onClick={saveAspectEdit} className="text-emerald-500 hover:scale-110 transition-transform"><Check size={12}/></button>
                                  <button onClick={() => setEditingAspectId(null)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={12}/></button>
                                </div>
                            ) : (
                              <button
                                onClick={() => onAspectChange(idx)}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight whitespace-nowrap transition-all border flex items-center gap-2",
                                  activeAspectIndex === idx 
                                    ? "bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-600/10" 
                                    : "bg-white border-slate-205 text-slate-700 font-extrabold hover:border-slate-350 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                )}
                              >
                                {aspect.name}
                                {isManagingAspects && (
                                   <div className="flex items-center gap-1.5 ml-1.5 border-l border-white/20 pl-1.5">
                                      <Edit2 size={9} className="hover:text-amber-400 transition-colors" onClick={(e) => { e.stopPropagation(); startEditAspect(aspect); }} />
                                      <Trash2 size={9} className="hover:text-rose-400 transition-colors" onClick={(e) => { e.stopPropagation(); deleteAspect(aspect.id); }} />
                                   </div>
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-100">
                            <button 
                            onClick={() => setIsManagingAspects(!isManagingAspects)}
                            className={cn(
                                "p-1.5 rounded-xl transition-all shadow-sm border",
                                isManagingAspects 
                                ? "bg-amber-100 border-amber-200 text-amber-600" 
                                : "bg-white border-slate-100 text-slate-300 hover:text-slate-600"
                            )}
                            >
                            <Settings size={12} />
                            </button>
                            {isManagingAspects && (
                            <button 
                                onClick={addAspect}
                                className="p-1.5 bg-black text-white rounded-xl shadow-md active:scale-95"
                            >
                                <Plus size={12} />
                            </button>
                            )}
                        </div>
                     </div>
                  </div>

                  {aspects[activeAspectIndex] && student && (
                    <OrganismIndikatorList 
                      studentId={student.id}
                      studentName={student.name}
                      setView={setView}
                      onOpenSettings={onOpenSettings}
                      aspect={aspects[activeAspectIndex]}
                      aspects={aspects}
                      activeAspectIndex={activeAspectIndex}
                      onAspectChange={onAspectChange}
                      scores={scores[aspects[activeAspectIndex].id] || {}}
                      onScoreChange={onScoreChange}
                    />
                  )}
                </motion.div>
              )}


          {activeType === 'curriculum' && student && (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2"
            >
              <OrganismCurriculumAssessment 
                studentId={student.id}
                studentName={student.name}
                scores={scores["curriculum"] || {}}
                onScoreChange={(id, val) => onScoreChange(id, val, "curriculum")}
              />
            </motion.div>
          )}

          {activeType === 'kartika' && student && (
            <motion.div
              key="kartika"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2"
            >
              <OrganismKartika5NKAssessment 
                studentId={student.id}
                studentName={student.name}
                scores={scores["kartika"] || {}}
                onScoreChange={(id, val) => {
                  onScoreChange(id, val, "kartika");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
      )}
    </div>
  );
}
