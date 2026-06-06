import React from 'react';
import { User, CheckCircle } from 'lucide-react';
import { Student } from '../../../types';

interface CsvDataPreviewProps {
  students: Omit<Student, 'id'>[];
}

export const CsvDataPreview: React.FC<CsvDataPreviewProps> = ({ students }) => {
  return (
    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[120px] bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5 text-center">
          <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block mb-1">TOTAL IMPOR</span>
          <span className="text-xl font-black text-indigo-700 leading-none">{students.length}</span>
          <span className="text-[9px] font-bold text-indigo-600 block mt-1">Siswa Terdeteksi</span>
        </div>
        <div className="flex-1 min-w-[120px] bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center">
          <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block mb-1">ROMBEL BERBEDA</span>
          <span className="text-xl font-black text-slate-800 leading-none">
            {Array.from(new Set(students.map((s) => s.kelompok))).length}
          </span>
          <span className="text-[9px] font-bold text-slate-400 block mt-1">Rombel Belajar</span>
        </div>
      </div>

      <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
        <div className="bg-slate-50 py-2 py-2.5 px-4 border-b border-slate-150 flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
          <span>Pratinjau Data Siswa</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {students.slice(0, 15).map((student, index) => (
            <div 
              key={index} 
              className="px-4 py-3 flex items-center justify-between gap-3 text-slate-900 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                  <User size={14} />
                </div>
                <div>
                  <span className="text-xs font-black block leading-none mb-1">{student.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                      Kelas {student.kelompok}
                    </span>
                    {student.nisn && (
                      <span className="text-[9px] font-bold text-slate-400">
                        NISN: {student.nisn}
                      </span>
                    )}
                    {(student.height || student.weight) ? (
                      <span className="text-[9px] font-bold text-slate-400">
                        {student.height}cm / {student.weight}kg
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 select-none">
                <CheckCircle size={10} className="text-emerald-600" />
                <span className="text-[8px] font-black uppercase tracking-wider">Valid</span>
              </div>
            </div>
          ))}

          {students.length > 15 && (
            <div className="p-3 text-center bg-slate-50 text-[10px] font-bold text-slate-400">
              Menampilkan 15 dari {students.length} baris total. Semua data tersisa akan ikut terimpor secara aman.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
