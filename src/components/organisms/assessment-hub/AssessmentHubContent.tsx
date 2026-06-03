import React from 'react';
import { Aspect, AssessmentScale, ScoreData, Student } from "../../../types";
import { motion, AnimatePresence } from "motion/react";
import { OrganismIndikatorList } from "../OrganismIndikatorList";
import { OrganismCurriculumAssessment } from "../OrganismCurriculumAssessment";
import { OrganismKartika5NKAssessment } from "../OrganismKartika5NKAssessment";
import { AspectsToolbar } from './AspectsToolbar';
import { AssessmentType } from '../OrganismAssessmentHub';

interface AssessmentHubContentProps {
    activeType: AssessmentType;
    student: Student;
    aspects: Aspect[];
    activeAspectIndex: number;
    onAspectChange: (index: number) => void;
    scores: Record<string, ScoreData>;
    onScoreChange: (indicatorId: string, score: AssessmentScale, aspectId?: string) => void;
    setView: (view: "dashboard" | "assessment" | "report") => void;
    onOpenSettings: () => void;
    editingAspectId: string | null;
    editAspectName: string;
    setEditAspectName: (name: string) => void;
    saveAspectEdit: () => void;
    setEditingAspectId: (id: string | null) => void;
    isManagingAspects: boolean;
    setIsManagingAspects: (managing: boolean) => void;
    startEditAspect: (aspect: Aspect) => void;
    deleteAspect: (id: string) => void;
    addAspect: () => void;
}

export const AssessmentHubContent = ({
    activeType, student, aspects, activeAspectIndex, onAspectChange, scores, onScoreChange, setView, onOpenSettings,
    editingAspectId, editAspectName, setEditAspectName, saveAspectEdit, setEditingAspectId,
    isManagingAspects, setIsManagingAspects, startEditAspect, deleteAspect, addAspect
}: AssessmentHubContentProps) => {
    return (
        <AnimatePresence mode="wait">
            {activeType === 'development' && (
                <motion.div key="development" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="max-w-5xl mx-auto px-4">
                    <AspectsToolbar 
                        aspects={aspects}
                        activeAspectIndex={activeAspectIndex}
                        onAspectChange={onAspectChange}
                        editingAspectId={editingAspectId}
                        editAspectName={editAspectName}
                        setEditAspectName={setEditAspectName}
                        saveAspectEdit={saveAspectEdit}
                        setEditingAspectId={setEditingAspectId}
                        isManagingAspects={isManagingAspects}
                        setIsManagingAspects={setIsManagingAspects}
                        startEditAspect={startEditAspect}
                        deleteAspect={deleteAspect}
                        addAspect={addAspect}
                    />
                    {aspects[activeAspectIndex] && (
                        <OrganismIndikatorList 
                            studentId={student.id}
                            studentName={student.name}
                            setView={setView}
                            onOpenSettings={onOpenSettings}
                            aspect={aspects[activeAspectIndex]}
                            aspects={aspects}
                            activeAspectIndex={activeAspectIndex}
                            onAspectChange={onAspectChange}
                            scores={scores[aspects[activeAspectIndex].id] || {}}
                            onScoreChange={onScoreChange}
                        />
                    )}
                </motion.div>
            )}

            {activeType === 'curriculum' && (
                <motion.div key="curriculum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-2">
                    <OrganismCurriculumAssessment 
                        studentId={student.id}
                        studentName={student.name}
                        scores={scores["curriculum"] || {}}
                        onScoreChange={(id, val) => onScoreChange(id, val, "curriculum")}
                    />
                </motion.div>
            )}

            {activeType === 'kartika' && (
                <motion.div key="kartika" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-2">
                    <OrganismKartika5NKAssessment 
                        studentId={student.id}
                        studentName={student.name}
                        scores={scores["kartika"] || {}}
                        onScoreChange={(id, val) => onScoreChange(id, val, "kartika")}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
