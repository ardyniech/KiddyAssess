import React from 'react';
import { Aspect, AssessmentScale, ScoreData, Student } from "../../types";
import { LayoutDashboard, GraduationCap, School, Shield } from "lucide-react";
import { AtomText } from "../atoms/CommonAtoms";
import { AssessmentHubNavigation } from './assessment-hub/AssessmentHubNavigation';
import { useAssessmentHub } from './assessment-hub/useAssessmentHub';
import { AssessmentHubContent } from './assessment-hub/AssessmentHubContent';
import { CustomConfirmModal, CustomPromptModal } from '../molecules/CustomDialog';

interface OrganismAssessmentHubProps {
  key?: React.Key;
  student: Student;
  aspects: Aspect[];
  activeAspectIndex: number;
  onAspectChange: (index: number) => void;
  scores: Record<string, ScoreData>;
  onScoreChange: (indicatorId: string, score: AssessmentScale, aspectId?: string) => void;
  setView: (view: "dashboard" | "assessment" | "report") => void;
  onOpenSettings: () => void;
  students?: Student[];
  onSelectStudent?: (id: string) => void;
}

export type AssessmentType = 'development' | 'curriculum' | 'kartika';

export function OrganismAssessmentHub({
  student,
  aspects,
  activeAspectIndex,
  onAspectChange,
  scores,
  onScoreChange,
  setView,
  onOpenSettings,
  students = [],
  onSelectStudent
}: OrganismAssessmentHubProps) {
  
  const {
      activeType, setActiveType,
      isManagingAspects, setIsManagingAspects,
      editingAspectId, setEditingAspectId,
      editAspectName, setEditAspectName,
      currentIdx,
      confirmDeleteId, setConfirmDeleteId,
      showAddPrompt, setShowAddPrompt,
      executeAddAspect,
      executeDeleteAspect,
      startEditAspect,
      saveAspectEdit
  } = useAssessmentHub(student, students, aspects, activeAspectIndex, onAspectChange, onSelectStudent);

  const tabs = [
    { id: 'development' as AssessmentType, label: 'Aspek Perkembangan', icon: <LayoutDashboard size={16} />, desc: '3 Aspek • 60 Indikator' },
    { id: 'curriculum' as AssessmentType, label: 'Kokurikuler', icon: <GraduationCap size={16} />, desc: 'Program Kokurikuler' },
    { id: 'kartika' as AssessmentType, label: 'Nilai 5NK', icon: <Shield size={16} />, desc: 'Kartika 5NK Nasional' }
  ];

  if (!student) {
      return (
          <div className="flex flex-col min-h-full bg-[var(--bg-main)]">
            <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-20">
              <School size={64} className="mb-4" />
              <AtomText variant="body" className="font-black uppercase tracking-[0.3em] text-xs">Akses Database Ditolak</AtomText>
              <p className="text-[10px] uppercase font-bold mt-2">Pilih Peserta Didik Terlebih Dahulu</p>
            </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-full bg-[var(--bg-main)]">
      <div className="flex-1 overflow-y-auto pt-3 pb-8 custom-scrollbar">
        <AssessmentHubNavigation 
            student={student} 
            students={students} 
            currentIdx={currentIdx} 
            onSelectStudent={onSelectStudent} 
            tabs={tabs} 
            activeType={activeType} 
            setActiveType={setActiveType} 
        />
        <div className="flex-1">
          <AssessmentHubContent
              activeType={activeType}
              student={student}
              aspects={aspects}
              activeAspectIndex={activeAspectIndex}
              onAspectChange={onAspectChange}
              scores={scores}
              onScoreChange={onScoreChange}
              setView={setView}
              onOpenSettings={onOpenSettings}
              editingAspectId={editingAspectId}
              editAspectName={editAspectName}
              setEditAspectName={setEditAspectName}
              saveAspectEdit={saveAspectEdit}
              setEditingAspectId={setEditingAspectId}
              isManagingAspects={isManagingAspects}
              setIsManagingAspects={setIsManagingAspects}
              startEditAspect={startEditAspect}
              deleteAspect={(id) => setConfirmDeleteId(id)}
              addAspect={() => setShowAddPrompt(true)}
          />
        </div>
      </div>

      {/* Modern Dialogs replaces browser native alert blocks */}
      <CustomConfirmModal 
        isOpen={confirmDeleteId !== null}
        title="Hapus Aspek Perkembangan"
        message="Apakah Anda yakin ingin menghapus aspek ini? Seluruh rumusan indikator dan data nilai anak di bawah aspek ini akan terhapus secara permanen!"
        confirmText="Hapus Permanen"
        cancelText="Batal"
        variant="danger"
        onConfirm={executeDeleteAspect}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <CustomPromptModal 
        isOpen={showAddPrompt}
        title="Aspek Perkembangan Baru"
        message="Masukkan nama kelompok aspek perkembangan baru (contoh: Nilai Agama & Moral):"
        placeholder="Nama aspek perkembangan..."
        onConfirm={executeAddAspect}
        onCancel={() => setShowAddPrompt(false)}
      />
    </div>
  );
}
