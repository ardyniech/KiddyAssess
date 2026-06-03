import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Printer } from 'lucide-react';
import { Student, Aspect } from '../../../types';
import { SavedNarrative } from '../../../lib/db';
import { cn } from '../../../lib/utils';
import { NarrativeCard } from './NarrativeCard';
import { useReportGenerator } from './useReportGenerator';

interface OrganismReportGeneratorProps {
    key?: React.Key;
    student: Student;
    aspects: Aspect[];
    allScores: Record<string, Record<string, any>>;
    savedNarratives: Record<string, SavedNarrative>;
    onNarrativesChange: (narratives: Record<string, SavedNarrative>) => void;
    setView: (view: any) => void;
}

export function OrganismReportGenerator({ 
    student, 
    aspects, 
    allScores, 
    savedNarratives, 
    onNarrativesChange,
    setView
}: OrganismReportGeneratorProps) {
    const {
        generating,
        activeTab,
        setActiveTab,
        handleGenerateAI
    } = useReportGenerator(student, aspects, allScores, savedNarratives, onNarrativesChange);

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                    <div>
                        <h1 className="text-xl font-black text-black tracking-tight leading-none mb-1 uppercase">Mesin Rapor AI</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifikasi & Validasi Narasi Rapor untuk {student.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setActiveTab('aspects')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                                activeTab === 'aspects' ? "bg-black text-white border-black" : "bg-white text-slate-400 border-slate-200"
                            )}
                        >
                            Aspek Utama
                        </button>
                        <button 
                            onClick={() => setActiveTab('kokurikulum')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                                activeTab === 'kokurikulum' ? "bg-black text-white border-black" : "bg-white text-slate-400 border-slate-200"
                            )}
                        >
                            Kokurikulum
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'aspects' ? (
                        <motion.div 
                            key="aspects"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {aspects.map((aspect) => (
                                <NarrativeCard 
                                    key={aspect.id}
                                    title={aspect.name}
                                    content={savedNarratives[aspect.id]?.narrative || ''}
                                    advice={savedNarratives[aspect.id]?.advice || ''}
                                    isGenerating={generating === aspect.id}
                                    onGenerate={() => handleGenerateAI(aspect.id)}
                                    onUpdate={(n, a) => onNarrativesChange({
                                        ...savedNarratives,
                                        [aspect.id]: { ...savedNarratives[aspect.id], narrative: n, advice: a }
                                    })}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="kokurikulum"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                             <NarrativeCard 
                                title="Ekstrakurikuler & Projek"
                                content={savedNarratives['kokurikulum']?.narrative || ''}
                                advice={savedNarratives['kokurikulum']?.advice || ''}
                                isGenerating={generating === 'kokurikulum'}
                                onGenerate={() => handleGenerateAI('kokurikulum')}
                                onUpdate={(n, a) => onNarrativesChange({
                                    ...savedNarratives,
                                    ['kokurikulum']: { ...savedNarratives['kokurikulum'], narrative: n, advice: a }
                                })}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200 no-print">
                    <button 
                        onClick={() => setView('assessment')}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-black hover:text-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 sm:mr-auto w-full sm:w-auto justify-center"
                    >
                        Kembali
                    </button>

                    <button 
                        onClick={() => {
                            let message = `*_Laporan Perkembangan Anak_*\n`;
                            message += `Nama: ${student.name}\n\n`;
                            aspects.forEach(aspect => {
                                const data = savedNarratives[aspect.id];
                                if (data?.narrative) {
                                    message += `*${aspect.name}*\n${data.narrative}\n`;
                                }
                            });
                            const koku = savedNarratives['kokurikulum'];
                            if (koku?.narrative) {
                                message += `\n*Kokurikulum*\n${koku.narrative}\n`;
                            }
                            const encodedMessage = encodeURIComponent(message);
                            window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
                        }}
                        className="px-6 py-3 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <MessageCircle size={14} /> Kirim via WhatsApp
                    </button>
                    
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Printer size={14} /> Cetak PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
