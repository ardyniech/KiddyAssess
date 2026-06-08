import React from 'react';
import { Student } from '../../../types';
import { User, CheckCircle } from 'lucide-react';

interface StudentInsightSelectorProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelect: (student: Student) => void;
  getStudentProgress: (studentId: string) => number;
}

export const StudentInsightSelector: React.FC<StudentInsightSelectorProps> = ({
  students,
  selectedStudent,
  onSelect,
  getStudentProgress,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 flex flex-col gap-3 h-full">
      <div className="border-b border-slate-100 pb-2">
        <span className="text-[8px] font-black tracking-widest text-[#4f46e5] uppercase font-mono">Daftar Kelompok</span>
        <h4 className="text-xs font-black text-slate-900 uppercase">Pilih Murid untuk Analisis</h4>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[350px] md:max-h-full space-y-1.5 pr-1">
        {students.map((st) => {
          const isSelected = selectedStudent?.id === st.id;
          const pct = Math.round(getStudentProgress(st.id));
          return (
            <button
              key={st.id}
              onClick={() => onSelect(st)}
              className={`w-full text-left p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-200 select-none min-h-[48px] ${
                isSelected
                  ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white border border-slate-200 text-slate-400'}`}>
                  <User size={13} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[11px] font-bold uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {st.name}
                  </span>
                  <span className={`text-[8.5px] font-medium font-mono ${isSelected ? 'text-indigo-150' : 'text-slate-500'}`}>
                    {st.kelompok} • Progress {pct}%
                  </span>
                </div>
              </div>
              {pct >= 100 && (
                <div className={isSelected ? 'text-emerald-300' : 'text-emerald-500'}>
                  <CheckCircle size={14} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
