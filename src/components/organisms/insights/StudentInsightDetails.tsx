import React from 'react';
import { Student } from '../../../types';
import { StudentInsightReport } from '../../../types/insights';
import { Sparkles, Milestone, Compass, RotateCw, Printer, AlertTriangle } from 'lucide-react';

interface StudentInsightDetailsProps {
  student: Student;
  insight: StudentInsightReport | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const StudentInsightDetails: React.FC<StudentInsightDetailsProps> = ({
  student,
  insight,
  loading,
  error,
  onRefresh,
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center gap-4">
        <RotateCw size={36} className="text-[#4f46e5] animate-spin" />
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-[#4f46e5]">Menyelaraskan Pola Belajar</p>
          <p className="text-[10px] uppercase font-bold text-slate-400">Model AI sedang merumuskan intervensi pedagogis personal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-150 flex items-center justify-center text-rose-500">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-1 max-w-md">
          <h5 className="text-xs font-black uppercase tracking-wide text-slate-900">Gagal Merumuskan Intervensi</h5>
          <p className="text-[10px] leading-relaxed text-slate-500 font-medium uppercase font-mono">{error}</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Coba Hubungkan Kembali
        </button>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center text-slate-400">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-[#4f46e5] mb-3">
          <Sparkles size={20} />
        </div>
        <p className="text-xs font-black uppercase tracking-tight text-slate-700">Mulai Analisis Pola Belajar</p>
        <p className="text-[9px] font-bold uppercase tracking-wider max-w-sm">
          Pilih salah satu murid di sebelah kiri untuk melihat analisis tumbuh kembang lintas aspek.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 print:p-0">
      {/* Top Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[8px] font-black tracking-widest text-[#4f46e5] uppercase font-mono">Profil Intervensi</span>
          <h2 className="text-sm font-black text-slate-950 uppercase tracking-tighter">
            Ananda {student.name} • {student.kelompok}
          </h2>
          <p className="text-[10px] text-slate-600 font-semibold leading-relaxed mt-1 max-w-xl">
            {insight.visualTrendSummary}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 no-print">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCw size={11} /> Refresh AI
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-[#4f46e5] border border-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <Printer size={11} /> Cetak Kartu
          </button>
        </div>
      </div>

      {/* Bento Cards */}
      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide px-1 flex items-center gap-2">
        <Milestone size={14} className="text-[#4f46e5]" /> Pola Capaian Lintas Bidang
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insight.patterns.map((p, idx) => (
          <div
            key={`pattern-${idx}`}
            className={`p-4 border rounded-3xl flex flex-col justify-between ${
              p.type === 'strength'
                ? 'bg-emerald-50/20 border-emerald-150'
                : 'bg-amber-50/20 border-amber-100'
            }`}
          >
            <div className="space-y-1.5">
              <span className={`text-[8.5px] font-black uppercase tracking-wider ${
                p.type === 'strength' ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {p.type === 'strength' ? '⚡ Pola Kekuatan Belajar' : '🧠 Rekomendasi Area Pertumbuhan'}
              </span>
              <h4 className="text-[11px] font-black text-slate-950 uppercase">{p.title}</h4>
              <p className="text-[10px] text-slate-700 font-medium leading-relaxed">{p.description}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
              {p.aspectsInvolved.map((asp, i) => (
                <span
                  key={i}
                  className="bg-white border border-slate-200 text-slate-600 text-[8.5px] font-bold px-2 py-0.5 rounded-lg"
                >
                  {asp}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Interventions Section */}
      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide px-1 flex items-center gap-2 pt-2">
        <Compass size={14} className="text-[#4f46e5]" /> Rencana Intervensi Kelas Yang Disarankan
      </h3>
      <div className="space-y-3">
        {insight.interventions.map((item, idx) => (
          <div
            key={`int-${idx}`}
            className="bg-white border border-slate-250 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-start justify-between"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                  item.priority === 'tinggi'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : item.priority === 'sedang'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {item.priority}
                </span>
                <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-tight">
                  Target: {item.targetAspect}
                </span>
              </div>
              <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-tight">{item.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1">
                  <span className="text-[8px] font-bold tracking-wide text-[#4f46e5] uppercase">Langkah Guru:</span>
                  <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">{item.actionStep}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-bold tracking-wide text-[#4f46e5] uppercase">Cara Evaluasi:</span>
                  <p className="text-[10px] text-slate-700 leading-relaxed font-medium">{item.howToAssess}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
