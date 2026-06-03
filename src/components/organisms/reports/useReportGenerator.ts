import { useState, useEffect } from 'react';
import { Aspect, Student } from '../../../types';
import { SavedNarrative } from '../../../lib/db';

export function useReportGenerator(
    student: Student,
    aspects: Aspect[],
    allScores: Record<string, Record<string, any>>,
    savedNarratives: Record<string, SavedNarrative>,
    onNarrativesChange: (narratives: Record<string, SavedNarrative>) => void
) {
    const [generating, setGenerating] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'aspects' | 'kokurikulum'>('aspects');

    const generateNativeNarrative = (aspectId: string) => {
        const aspectScores = allScores[aspectId] || {};
        const scoreValues = Object.values(aspectScores);
        
        if (scoreValues.length === 0) {
            return `Selama semester ini, ${student.name} telah mengikuti berbagai kegiatan pada aspek ini. Kami terus memberikan dukungan agar ${student.name} semakin aktif dan percaya diri.`;
        }

        const bsbCount = scoreValues.filter(v => v === 'BSB').length;
        const bshCount = scoreValues.filter(v => v === 'BSH').length;

        let narrative = `${student.name} menunjukkan perkembangan yang `;
        if (bsbCount > scoreValues.length / 2) {
            narrative += "sangat membanggakan. Ananda mampu menyelesaikan tugas dengan mandiri dan sering membantu teman.";
        } else if (bshCount + bsbCount > scoreValues.length / 2) {
            narrative += "baik dan sesuai harapan. Ananda aktif berpartisipasi dalam diskusi dan kooperatif dalam kelompok.";
        } else {
            narrative += "cukup baik. Ananda mulai menunjukkan minat dalam kegiatan kelas dan perlu terus dimotivasi.";
        }

        return narrative;
    };

    const handleGenerateAI = async (aspectId: string) => {
        setGenerating(aspectId);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockNarrative = `[AI VERSION] Melalui pendekatan personal, ${student.name} terlihat memiliki potensi besar. Observasi mendalam menunjukkan ia merespons stimulus dengan cara yang unik dan kreatif. Sangat disarankan untuk memberikan tantangan baru secara berkala untuk menjaga antusiasmenya.`;
        const mockAdvice = "Berikan apresiasi verbal setiap " + student.name + " mencoba hal baru.";
        
        onNarrativesChange({
            ...savedNarratives,
            [aspectId]: {
                narrative: mockNarrative,
                advice: savedNarratives[aspectId]?.advice || mockAdvice,
                tone: 'positive',
                updatedAt: Date.now()
            } as any
        });
        setGenerating(null);
    };

    useEffect(() => {
        const newNarratives = { ...savedNarratives };
        let changed = false;

        aspects.forEach(aspect => {
            if (!newNarratives[aspect.id]?.narrative) {
                newNarratives[aspect.id] = {
                    narrative: generateNativeNarrative(aspect.id),
                    advice: "Lanjutkan stimulasi di rumah.",
                    updatedAt: Date.now()
                } as any;
                changed = true;
            }
        });

        if (!newNarratives['kokurikulum']?.narrative) {
            newNarratives['kokurikulum'] = {
                narrative: `${student.name} berpartisipasi aktif dalam kegiatan kokurikulum dan ekstrakurikuler dengan antusias.`,
                advice: "Dukung minat bakat ananda.",
                updatedAt: Date.now()
            } as any;
            changed = true;
        }

        if (changed) {
            onNarrativesChange(newNarratives);
        }
    }, [aspects, student.id, allScores, savedNarratives, student.name, generateNativeNarrative, onNarrativesChange]);

    return {
        generating,
        activeTab,
        setActiveTab,
        handleGenerateAI
    };
}
