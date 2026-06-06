import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { ConflictReport } from './types';

interface ConflictReportCardProps {
    report: ConflictReport | null;
    isValidating: boolean;
}

export const ConflictReportCard: React.FC<ConflictReportCardProps> = ({ report, isValidating }) => {
    if (isValidating) {
        return (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-indigo-400 rotate-12 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">AI Sedang Menganalisis Konflik...</span>
                </div>
                <div className="h-3 bg-slate-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
        );
    }

    if (!report) return null;

    const themeMap = {
        aman: {
            bg: "bg-emerald-50/50 border-emerald-250",
            icon: <CheckCircle className="text-emerald-600 shrink-0" size={18} />,
            badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
            title: "Aman Dijadwalkan",
            textClass: "text-emerald-950"
        },
        peringatan: {
            bg: "bg-amber-50/50 border-amber-350",
            icon: <AlertTriangle className="text-amber-600 shrink-0" size={18} />,
            badge: "bg-amber-100 text-amber-800 border-amber-300",
            title: "Potensi Kepadatan",
            textClass: "text-amber-950"
        },
        konflik: {
            bg: "bg-rose-50/50 border-rose-300",
            icon: <AlertCircle className="text-rose-600 shrink-0" size={18} />,
            badge: "bg-rose-100 text-rose-800 border-rose-300",
            title: "Konflik Waktu Terdeteksi",
            textClass: "text-rose-950"
        }
    };

    const currentTheme = themeMap[report.status] || themeMap.aman;

    return (
        <div id="ai_driven_conflict_container" className={`p-4 border rounded-2xl transition-all duration-300 ${currentTheme.bg}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {currentTheme.icon}
                    <span className="text-[11px] font-black uppercase tracking-wide text-slate-800">Analisis Konflik AI</span>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 border rounded-lg ${currentTheme.badge}`}>
                    {currentTheme.title}
                </span>
            </div>
            
            <p className={`text-[10px] font-semibold leading-relaxed mb-3 ${currentTheme.textClass}`}>
                {report.reason}
            </p>

            <div className="pt-2.5 border-t border-black/5 flex items-start gap-1.5">
                <Sparkles size={11} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[9px] font-black text-indigo-700 uppercase tracking-tight">
                    Rekomendasi: <span className="font-semibold text-slate-600 lowercase first-letter:uppercase">{report.recommendation}</span>
                </p>
            </div>
        </div>
    );
};
