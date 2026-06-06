import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Printer, Star, Heart, Award, Eye, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Student, Aspect } from '../../../types';
import { SavedNarrative } from '../../../lib/db';
import { cn } from '../../../lib/utils';
import { NarrativeCard } from './NarrativeCard';
import { useReportGenerator } from './useReportGenerator';
import { KARTIKA_5NK_ASPECTS } from './KartikaData';
import { PDFPreviewBuilder } from './PDFPreviewBuilder';
import { calculateStudentTrend } from './autoGeneratorUtils';

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
    const [copiedFeedback, setCopiedFeedback] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const {
        generating,
        apiError,
        activeTab,
        setActiveTab,
        handleGenerateAI,
        handleRefineText,
        kartikaScores,
        kartikaComments,
        handleGenerateKartikaAI,
        handleRefineKartikaText,
        updateKartikaComment,
        autoProgress,
        handleAutoGenerateAll
    } = useReportGenerator(student, aspects, allScores, savedNarratives, onNarrativesChange);

    // Calculate count of rated Kartika indicators for live display
    const ratedKartikaCount = kartikaScores ? Object.keys(kartikaScores).filter(k => kartikaScores[k]).length : 0;
    const totalKartikaCount = KARTIKA_5NK_ASPECTS.flatMap(a => a.indicators).length;

    if (showPreview) {
        return (
            <PDFPreviewBuilder 
                student={student}
                aspects={aspects}
                savedNarratives={savedNarratives}
                kartikaComments={kartikaComments}
                onClose={() => setShowPreview(false)}
            />
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1 uppercase">Mesin Rapor AI</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifikasi & Validasi Narasi Rapor untuk {student.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setActiveTab('aspects')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer",
                                activeTab === 'aspects' ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-350"
                            )}
                        >
                            Aspek Utama
                        </button>
                        <button 
                            onClick={() => setActiveTab('kokurikulum')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer",
                                activeTab === 'kokurikulum' ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-350"
                            )}
                        >
                            Kokurikulum
                        </button>
                        <button 
                            onClick={() => setActiveTab('kartika')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer flex items-center gap-1.5",
                                activeTab === 'kartika' ? "bg-rose-600 border-rose-600 text-white shadow-sm" : "bg-white text-rose-500 border-rose-100 hover:border-rose-400"
                            )}
                        >
                            Kartika 5NK 
                            <span className="text-[7.5px] font-bold px-1 bg-rose-50 text-rose-600 rounded">
                                {ratedKartikaCount} / {totalKartikaCount}
                            </span>
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
                            className="space-y-5"
                        >
                            {/* Bento Dashboard for Auto-Fill with Real-Time Trends & Progress */}
                            {(() => {
                                const trend = calculateStudentTrend(aspects, allScores);
                                return (
                                    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row gap-5 items-stretch overflow-hidden select-none relative group no-print">
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-all duration-700 pointer-events-none" />
                                        
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/30">
                                                    <Sparkles size={16} className="animate-pulse" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase tracking-wider text-indigo-200">Auto-Generate Deteksi Cerdas</h3>
                                                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest leading-none mt-0.5">Asah Narasi Instan Sesuai Skor & Tren</p>
                                                </div>
                                            </div>

                                            {/* Student Trends Metrics Banner */}
                                            <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Tren Perkembangan</span>
                                                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-tight block leading-tight">{trend.trendLabel}</span>
                                                    <span className="text-[8.5px] font-bold text-slate-400 block leading-tight">{trend.trendDesc}</span>
                                                </div>
                                                <div className="space-y-1 border-l border-slate-800 pl-3">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Metrik Aktivitas</span>
                                                    <span className="text-xs font-black text-indigo-300 block leading-tight">{trend.totalRated} Indikator Dinilai</span>
                                                    <span className="text-[8.5px] font-bold text-slate-400 block leading-tight">Mendukung pre-fill narasi cepat berbasis instrumen.</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-64 flex flex-col justify-center gap-3 bg-slate-950/25 p-4 md:p-3 rounded-2xl border border-slate-800/40">
                                            {!autoProgress.active ? (
                                                <>
                                                    <p className="text-[9.5px] font-bold text-indigo-200/80 leading-relaxed text-center">
                                                        AI memproses status di atas untuk menyusun narasi rapor lengkap secara instan.
                                                    </p>
                                                    <button 
                                                        onClick={handleAutoGenerateAll}
                                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer flex items-center justify-center gap-2"
                                                    >
                                                        <Sparkles size={12} /> Auto-Generate Semua
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="space-y-3 py-2 w-full">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-indigo-300">
                                                        <span className="animate-pulse">Memproses...</span>
                                                        <span>{autoProgress.percent}%</span>
                                                    </div>
                                                    
                                                    {/* Custom High Contrast Visual Progress Bar */}
                                                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-indigo-500 rounded-full transition-all duration-300 shadow-sm"
                                                            style={{ width: `${autoProgress.percent}%` }}
                                                        />
                                                    </div>
                                                    
                                                    <p className="text-[9px] font-bold text-slate-300 leading-tight text-center italic line-clamp-2">
                                                        {autoProgress.currentAspect}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {aspects.map((aspect) => (
                                <NarrativeCard 
                                    key={aspect.id}
                                    title={aspect.name}
                                    content={savedNarratives[aspect.id]?.narrative || ''}
                                    advice={savedNarratives[aspect.id]?.advice || ''}
                                    isGenerating={generating === aspect.id}
                                    onGenerate={() => handleGenerateAI(aspect.id)}
                                    onRefine={(action) => handleRefineText(aspect.id, savedNarratives[aspect.id]?.narrative || '', action)}
                                    onUpdate={(n, a) => onNarrativesChange({
                                        ...savedNarratives,
                                        [aspect.id]: { ...savedNarratives[aspect.id], narrative: n, advice: a }
                                    })}
                                />
                            ))}
                        </motion.div>
                    ) : activeTab === 'kokurikulum' ? (
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
                                onRefine={(action) => handleRefineText('kokurikulum', savedNarratives['kokurikulum']?.narrative || '', action)}
                                onUpdate={(n, a) => onNarrativesChange({
                                    ...savedNarratives,
                                    ['kokurikulum']: { ...savedNarratives['kokurikulum'], narrative: n, advice: a }
                                })}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="kartika"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Kartika Quick Reference Header */}
                            <div className="p-5 bg-gradient-to-br from-rose-50 to-rose-100/30 border border-rose-100 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 no-print select-none">
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-1.5">
                                        <Award size={14} /> Karakter Rujukan
                                    </h3>
                                    <p className="text-[13px] font-bold text-slate-800 uppercase">Cinta Tanah Air, Disiplin, luhur</p>
                                </div>
                                <div className="md:border-l md:border-rose-100 md:pl-6 space-y-1">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Metode Evaluasi</div>
                                    <div className="text-[11px] font-extrabold text-slate-600 uppercase">Skala BB, MB, BSH, BSB</div>
                                </div>
                                <div className="md:border-l md:border-rose-100 md:pl-6 flex items-center justify-between">
                                    <div>
                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Status Penilaian</div>
                                        <div className="text-[14px] font-black text-rose-600">
                                            {ratedKartikaCount} / {totalKartikaCount} Indikator
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider">
                                        {ratedKartikaCount === totalKartikaCount ? "Lengkap" : "Penilaian"}
                                    </span>
                                </div>
                            </div>

                            <NarrativeCard 
                                title="Nilai Karakter Kebangsaan Kartika 5NK"
                                content={kartikaComments.kesimpulan}
                                advice={kartikaComments.catatanWali}
                                isGenerating={generating === 'kartika'}
                                onGenerate={() => handleGenerateKartikaAI()}
                                onRefine={(action) => handleRefineKartikaText('kesimpulan', action)}
                                onUpdate={(n, a) => {
                                    updateKartikaComment('kesimpulan', n);
                                    updateKartikaComment('catatanWali', a);
                                }}
                            />

                            {/* Additional Parent Reflection */}
                            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 no-print shadow-xs">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Umpan Balik Wali Murid (Disiapkan)</label>
                                <input 
                                    type="text"
                                    value={kartikaComments.catatanOrtu}
                                    onChange={(e) => updateKartikaComment('catatanOrtu', e.target.value)}
                                    placeholder="Input tanggapan/harapan orang tua di rumah..."
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs sm:text-sm font-semibold text-black focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200 no-print">
                    <button 
                        onClick={() => setView('assessment')}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-650 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 sm:mr-auto w-full sm:w-auto justify-center cursor-pointer"
                    >
                        Kembali
                    </button>

                    <button 
                        onClick={() => {
                            let message = `*_Laporan Perkembangan Anak_*\n`;
                            message += `Nama: ${student.name}\n\n`;
                            
                            // Standard Aspects
                            aspects.forEach(aspect => {
                                const data = savedNarratives[aspect.id];
                                if (data?.narrative) {
                                    message += `*${aspect.name}*\n${data.narrative}\n\n`;
                                }
                            });
                            
                            // Kokurikulum
                            const koku = savedNarratives['kokurikulum'];
                            if (koku?.narrative) {
                                message += `*Kokurikulum*\n${koku.narrative}\n\n`;
                            }
                            
                            // Kartika Comments
                            if (kartikaComments?.kesimpulan) {
                                message += `*Nilai Karakter (Kartika 5NK)*\n${kartikaComments.kesimpulan}\n`;
                                if (kartikaComments.catatanWali) {
                                    message += `Saran Guru: ${kartikaComments.catatanWali}\n`;
                                }
                            }
                            
                            // Copy message to clipboard first due to potential sandboxed iframe restrictions
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(message)
                                    .then(() => {
                                        setCopiedFeedback(true);
                                        setTimeout(() => setCopiedFeedback(false), 4500);
                                    })
                                    .catch(err => console.warn("Could not copy message:", err));
                            }

                            try {
                                const encodedMessage = encodeURIComponent(message);
                                const win = window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
                                if (!win || win.closed || typeof win.closed === 'undefined') {
                                    console.log("Popup blocked or not opened.");
                                }
                            } catch (err) {
                                console.warn("Could not open WhatsApp window:", err);
                            }
                        }}
                        className="px-6 py-3 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
                    >
                        <MessageCircle size={14} /> Kirim via WhatsApp
                    </button>
                    
                    <button 
                        onClick={() => setShowPreview(true)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
                    >
                        <FileText size={14} /> Preview & Cetak PDF
                    </button>
                </div>
            </div>

            {/* Custom Interactive Feedback Toast */}
            <AnimatePresence>
                {apiError && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 left-6 md:left-auto md:max-w-md z-50 bg-red-900 border border-red-700 text-white text-xs p-4 rounded-2xl shadow-xl flex items-center gap-3 no-print font-sans"
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                        <p className="flex-1 font-semibold leading-relaxed">
                            <strong className="text-red-400">AI Error: </strong> {apiError}
                        </p>
                    </motion.div>
                )}
                {copiedFeedback && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 left-6 md:left-auto md:max-w-md z-50 bg-slate-900 text-white text-xs p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 no-print font-sans"
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                        <p className="flex-1 font-semibold leading-relaxed text-slate-100">
                            <strong className="text-emerald-400">Teks Rapor Berhasil Disalin!</strong> Sandbox peramban membatasi pembuakaan link WhatsApp otomatis. Silakan tempel (paste) manual teks rapor langsung ke WA Orang Tua.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
