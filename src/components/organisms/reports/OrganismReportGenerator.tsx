import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Save, FileText, Layout, MessageCircle, Printer } from 'lucide-react';
import { Student, Aspect, StudentAssessment } from '../../../types';
import { SavedNarrative } from '../../../lib/db';
import { cn } from '../../../lib/utils';

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
    const [generating, setGenerating] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'aspects' | 'kokurikulum'>('aspects');

    // Native Engine: Generate narrative based on scores
    const generateNativeNarrative = (aspectId: string) => {
        const aspectScores = allScores[aspectId] || {};
        const scoreValues = Object.values(aspectScores);
        
        if (scoreValues.length === 0) {
            return `Selama semester ini, ${student.name} telah mengikuti berbagai kegiatan pada aspek ini. Kami terus memberikan dukungan agar ${student.name} semakin aktif dan percaya diri.`;
        }

        const bsbCount = scoreValues.filter(v => v === 'BSB').length;
        const bshCount = scoreValues.filter(v => v === 'BSH').length;
        const mbbCount = scoreValues.filter(v => v === 'MB').length;

        let narrative = `${student.name} menunjukkan perkembangan yang `;
        if (bsbCount > scoreValues.length / 2) {
            narrative += "sangat membanggakan. Ananda mampu menyelesaikan tugas dengan mandiri dan sering membantu teman.";
        } else if (bshCount + bsbCount > scoreValues.length / 2) {
            narrative += "baik dan sesuai harapan. Ananda aktif berpartisipasi dalam diskusi dan kooperatif dalam kelompok.";
        } else {
            narrative += "cukup baik. Ananda mulai menunjukkan minat dalam kegiatan kelas dan perlu terus dimotivasi.";
        }

        return narrative;
    };

    const handleGenerateAI = async (aspectId: string) => {
        setGenerating(aspectId);
        // Simulate AI Engine processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockNarrative = `[AI VERSION] Melalui pendekatan personal, ${student.name} terlihat memiliki potensi besar. Observasi mendalam menunjukkan ia merespons stimulus dengan cara yang unik dan kreatif. Sangat disarankan untuk memberikan tantangan baru secara berkala untuk menjaga antusiasmenya.`;
        const mockAdvice = "Berikan apresiasi verbal setiap ${student.name} mencoba hal baru.";
        
        onNarrativesChange({
            ...savedNarratives,
            [aspectId]: {
                narrative: mockNarrative,
                advice: savedNarratives[aspectId]?.advice || mockAdvice,
                tone: 'positive',
                updatedAt: Date.now()
            } as any
        });
        setGenerating(null);
    };

    // Auto-generate native narratives on first load if empty
    React.useEffect(() => {
        const newNarratives = { ...savedNarratives };
        let changed = false;

        aspects.forEach(aspect => {
            if (!newNarratives[aspect.id]?.narrative) {
                newNarratives[aspect.id] = {
                    narrative: generateNativeNarrative(aspect.id),
                    advice: "Lanjutkan stimulasi di rumah.",
                    updatedAt: Date.now()
                } as any;
                changed = true;
            }
        });

        if (!newNarratives['kokurikulum']?.narrative) {
            newNarratives['kokurikulum'] = {
                narrative: `${student.name} berpartisipasi aktif dalam kegiatan kokurikulum dan ekstrakurikuler dengan antusias.`,
                advice: "Dukung minat bakat ananda.",
                updatedAt: Date.now()
            } as any;
            changed = true;
        }

        if (changed) {
            onNarrativesChange(newNarratives);
        }
    }, [aspects, student.id, allScores]);

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Page */}
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

interface NarrativeCardProps {
    key?: React.Key;
    title: string;
    content: string;
    advice: string;
    isGenerating: boolean;
    onGenerate: () => void;
    onUpdate: (content: string, advice: string) => void;
}

function NarrativeCard({ title, content, advice, isGenerating, onGenerate, onUpdate }: NarrativeCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:border-none print:bg-transparent">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white print:hidden">
                        <FileText size={12} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-black">{title}</span>
                </div>
                <button 
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#8e8e93] hover:text-black hover:border-black transition-all disabled:opacity-50 no-print"
                >
                    {isGenerating ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    {isGenerating ? "Mengoptimalkan..." : "Tingkatkan dengan AI"}
                </button>
            </div>
            
            <div className="p-5 space-y-4 print:p-0">
                <div className="space-y-2">
                    <div className="flex items-center justify-between no-print">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Narasi Rapor</label>
                        <span className="text-[8px] font-bold text-slate-300 uppercase">Bawaan Sistem</span>
                    </div>
                    <div className="hidden print:block text-xs sm:text-sm font-medium text-black leading-relaxed whitespace-pre-wrap pb-2">
                        {content}
                    </div>
                    <textarea 
                        value={content}
                        onChange={(e) => onUpdate(e.target.value, advice)}
                        placeholder="Klik 'Regenerate AI' atau tulis narasi manual di sini..."
                        className="w-full min-h-[120px] px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs sm:text-sm font-medium text-black leading-relaxed focus:bg-white focus:border-black outline-none transition-all resize-none print:hidden"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 print:text-black print:text-xs text-left w-full block">Saran Pembimbing</label>
                    <div className="hidden print:block text-xs sm:text-sm font-bold text-black pb-2">
                        {advice}
                    </div>
                    <input 
                        value={advice}
                        onChange={(e) => onUpdate(content, e.target.value)}
                        placeholder="Saran untuk orang tua..."
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs sm:text-sm font-bold text-black focus:bg-white focus:border-black outline-none transition-all print:hidden"
                    />
                </div>
            </div>

            {content && (
                <div className="px-5 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2 no-print">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Terverifikasi & Siap Cetak</span>
                </div>
            )}
        </div>
    );
}
