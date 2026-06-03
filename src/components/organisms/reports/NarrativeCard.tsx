import React from 'react';
import { FileText, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface NarrativeCardProps {
    key?: React.Key;
    title: string;
    content: string;
    advice: string;
    isGenerating: boolean;
    onGenerate: () => void;
    onUpdate: (content: string, advice: string) => void;
}

export function NarrativeCard({ title, content, advice, isGenerating, onGenerate, onUpdate }: NarrativeCardProps) {
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
