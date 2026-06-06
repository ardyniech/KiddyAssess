import React from 'react';
import { motion } from 'motion/react';
import { X, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCsvImporter } from './useCsvImporter';
import { CsvUploadSection } from './CsvUploadSection';
import { CsvMappingSelector } from './CsvMappingSelector';
import { CsvDataPreview } from './CsvDataPreview';
import { Student } from '../../../types';

interface StudentCsvImportModalProps {
  onClose: () => void;
  onAddStudentsBatch: (students: Omit<Student, 'id'>[]) => void;
}

export const StudentCsvImportModal: React.FC<StudentCsvImportModalProps> = ({ onClose, onAddStudentsBatch }) => {
  const {
    step, setStep, headers, mapping, handleFileChange, handleUpdateMapping,
    generatePreviewData, downloadSampleTemplate, executeImport
  } = useCsvImporter(onAddStudentsBatch, onClose);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 border border-indigo-700">
              <Upload size={14} />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider animate-pulse">Migrasi Data Siswa (CSV Bulk)</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 leading-none">Impor Instan Berpanduan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-xl cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 flex-1 min-h-0 bg-slate-50/50">
          <div className="flex items-center justify-between mb-5 select-none max-w-md mx-auto bg-slate-100 border border-slate-200/65 rounded-full p-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
            {[{ s: 1, label: 'Upload' }, { s: 2, label: 'Mapping' }, { s: 3, label: 'Review' }].map(({ s, label }) => (
              <span
                key={s}
                className={`flex-1 py-1 px-3 text-center rounded-full leading-none transition-all ${
                  step === s ? 'bg-indigo-600 text-white font-extrabold shadow-sm' : ''
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          {step === 1 && (
            <CsvUploadSection onFileSelected={handleFileChange} onDownloadTemplate={downloadSampleTemplate} />
          )}

          {step === 2 && (
            <CsvMappingSelector headers={headers} mapping={mapping} onChange={handleUpdateMapping} />
          )}

          {step === 3 && (
            <CsvDataPreview students={generatePreviewData()} />
          )}
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-3 bg-white text-slate-600 hover:bg-slate-100 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-slate-250 cursor-pointer animate-fade-in"
              >
                Kembali
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-3 bg-white text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!mapping.name || !mapping.kelompok}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100"
              >
                Pratinjau Impor <ArrowRight size={12} />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={executeImport}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-100"
              >
                Migrasikan Sekarang <CheckCircle2 size={12} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
