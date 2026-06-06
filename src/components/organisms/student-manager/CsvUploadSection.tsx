import React, { useRef } from 'react';
import { FileUp, Download } from 'lucide-react';

interface CsvUploadSectionProps {
  onFileSelected: (file: File) => void;
  onDownloadTemplate: () => void;
}

export const CsvUploadSection: React.FC<CsvUploadSectionProps> = ({ onFileSelected, onDownloadTemplate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-indigo-500/70 bg-white hover:bg-indigo-50/10 cursor-pointer rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group"
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
        />
        <div className="w-12 h-12 bg-slate-100 rounded-2xl border border-slate-200 text-slate-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-all">
          <FileUp size={20} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1">
          Upload atau Seret File CSV Rombel
        </h3>
        <p className="text-[10px] font-bold text-slate-400 leading-normal max-w-xs uppercase tracking-tight">
          Format tabel .CSV dipisahkan koma (Comma Separated)
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl">
        <div className="space-y-0.5">
          <span className="text-xs font-black block leading-none">Butuh Template Excel / CSV?</span>
          <span className="text-[10px] font-semibold text-slate-400 block leading-tight">
            Gunakan contoh format agar siap pemetaan tanpa ribet.
          </span>
        </div>
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="px-4 py-2.5 bg-slate-150 text-slate-700 hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-slate-200 shrink-0"
        >
          <Download size={12} /> Unduh Template CSV
        </button>
      </div>
    </div>
  );
};
