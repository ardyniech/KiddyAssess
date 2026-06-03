import { useState, useEffect } from 'react';
import { Aspect } from '../../../types';
import { useCurriculum } from '../../../context/CurriculumContext';

export function useAssessmentHub(
    student: any,
    students: any[],
    aspects: Aspect[],
    activeAspectIndex: number,
    onAspectChange: (index: number) => void,
    onSelectStudent: ((id: string) => void) | undefined
) {
    const { updateAspects } = useCurriculum();
    const [activeType, setActiveType] = useState<'development' | 'curriculum' | 'kartika'>('development');
    const [isManagingAspects, setIsManagingAspects] = useState(false);
    const [editingAspectId, setEditingAspectId] = useState<string | null>(null);
    const [editAspectName, setEditAspectName] = useState("");

    const currentIdx = students ? students.findIndex(s => s.id === student?.id) : -1;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft' && currentIdx > 0 && students && onSelectStudent) {
                onSelectStudent(students[currentIdx - 1].id);
            } else if (e.key === 'ArrowRight' && students && currentIdx < students.length - 1 && onSelectStudent) {
                onSelectStudent(students[currentIdx + 1].id);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIdx, students, onSelectStudent]);

    const addAspect = async () => {
        const name = prompt("Enter aspect name:");
        if (!name) return;
        await updateAspects([...aspects, { id: `asp_${Date.now()}`, name, indicators: [] }]);
    };

    const deleteAspect = async (id: string) => {
        if (confirm("Delete this aspect? All indicator data for this aspect will be lost.")) {
            await updateAspects(aspects.filter(a => a.id !== id));
            if (activeAspectIndex >= aspects.length - 1) onAspectChange(Math.max(0, aspects.length - 2));
        }
    };

    const startEditAspect = (aspect: Aspect) => {
        setEditingAspectId(aspect.id);
        setEditAspectName(aspect.name);
    };

    const saveAspectEdit = async () => {
        if (!editAspectName.trim()) return;
        await updateAspects(aspects.map(a => a.id === editingAspectId ? { ...a, name: editAspectName.trim() } : a));
        setEditingAspectId(null);
    };

    return {
        activeType, setActiveType,
        isManagingAspects, setIsManagingAspects,
        editingAspectId, setEditingAspectId,
        editAspectName, setEditAspectName,
        currentIdx,
        addAspect,
        deleteAspect,
        startEditAspect,
        saveAspectEdit
    };
}
