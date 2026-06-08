import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, ArrowLeft } from 'lucide-react';
import { StudentInsightSelector } from './StudentInsightSelector';
import { StudentInsightDetails } from './StudentInsightDetails';
import { useStudentInsights } from '../../../hooks/useStudentInsights';
import { Student, Aspect } from '../../../types';

interface OrganismAiInsightsModuleProps {
  students: Student[];
  assessments: any;
  aspects: Aspect[];
  activeStudentId?: string | null;
  onViewStudents?: () => void;
  getStudentProgress: (studentId: string) => number;
}

export const OrganismAiInsightsModule: React.FC<OrganismAiInsightsModuleProps> = ({
  students,
  assessments,
  aspects,
  activeStudentId,
  onViewStudents,
  getStudentProgress,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (activeStudentId) {
      const active = students.find((s) => s.id === activeStudentId);
      if (active) setSelectedStudent(active);
    } else if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [activeStudentId, students]);

  const { insight, loading, error, refetch } = useStudentInsights(
    selectedStudent,
    assessments,
    aspects
  );

  return (
    <div id="ai_insights_module" className="flex-1 flex flex-col p-4 md:p-5 max-w-7xl mx-auto w-full gap-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onViewStudents}
            className="p-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Kembali ke Daftar Siswa"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-[#4f46e5]">
              <Brain size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[8px] font-black tracking-widest text-[#4f46e5] uppercase font-mono block">DIAGNOSTIK PEDAGOGIS AI</span>
              <h1 className="text-sm font-black text-slate-950 uppercase tracking-tight">Rekomendasi Intervensi Belajar</h1>
            </div>
          </div>
        </div>
        <div className="px-3.5 py-1.5 bg-indigo-50 border border-indigo-150 rounded-xl text-[9px] font-black uppercase text-[#4f46e5] tracking-widest font-mono shrink-0">
          ✨ Co-Pilot Siswa Aktif
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white border border-slate-250 p-12 text-center rounded-3xl flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <Sparkles size={20} />
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Tidak ada data murid</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs">
            Harap isi data siswa terlebih dahulu di menu Utama sebelum melihat analisis AI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-start">
          {/* Sidebar selector */}
          <div className="lg:col-span-4 no-print">
            <StudentInsightSelector
              students={students}
              selectedStudent={selectedStudent}
              onSelect={setSelectedStudent}
              getStudentProgress={getStudentProgress}
            />
          </div>

          {/* Details visualizer */}
          <div className="lg:col-span-8 print:col-span-12">
            {selectedStudent && (
              <StudentInsightDetails
                student={selectedStudent}
                insight={insight}
                loading={loading}
                error={error}
                onRefresh={refetch}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
