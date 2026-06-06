import { useState, useEffect, useCallback } from 'react';
import { Aspect, Student } from '../../../types';
import { SavedNarrative, loadKartikaScores, loadKartikaComments, saveKartikaComments } from '../../../lib/db';
import { useSchoolProfile } from '../../../context/SchoolProfileContext';
import { KARTIKA_5NK_ASPECTS } from './KartikaData';
import { generateStudentNarrative, refineStudentText } from '../../../services/aiService';
import { calculateStudentTrend } from './autoGeneratorUtils';

export function useReportGenerator(
    student: Student,
    aspects: Aspect[],
    allScores: Record<string, Record<string, any>>,
    savedNarratives: Record<string, SavedNarrative>,
    onNarrativesChange: (narratives: Record<string, SavedNarrative>) => void
) {
    const [generating, setGenerating] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'aspects' | 'kokurikulum' | 'kartika'>('aspects');
    const { schoolProfile } = useSchoolProfile();
    const [autoProgress, setAutoProgress] = useState<{ active: boolean; currentAspect: string; percent: number }>({
        active: false,
        currentAspect: '',
        percent: 0
    });

    const [kartikaScores, setKartikaScores] = useState<Record<string, string>>({});
    const [kartikaComments, setKartikaComments] = useState<{ kesimpulan: string; catatanWali: string; catatanOrtu: string }>({
        kesimpulan: '',
        catatanWali: '',
        catatanOrtu: 'Kami bangga dengan proses belajar Ananda.'
    });

    useEffect(() => {
        const fetchKartikaData = async () => {
            if (!student?.id) return;
            const sc = await loadKartikaScores(student.id);
            setKartikaScores(sc);

            const cm = await loadKartikaComments(student.id);
            if (cm) {
                setKartikaComments({
                    kesimpulan: cm.kesimpulan || '',
                    catatanWali: cm.catatanWali || '',
                    catatanOrtu: cm.catatanOrtu || 'Kami bangga dengan proses belajar Ananda.'
                });
            } else {
                setKartikaComments({
                    kesimpulan: '',
                    catatanWali: '',
                    catatanOrtu: 'Kami bangga dengan proses belajar Ananda.'
                });
            }
        };
        fetchKartikaData();
    }, [student?.id]);

    const generateNativeNarrative = useCallback((aspectId: string) => {
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
    }, [allScores, student.name]);

    const handleGenerateAI = async (aspectId: string, customNotes = "") => {
        setGenerating(aspectId);
        try {
            const aspect = aspects.find(a => a.id === aspectId);
            const aspectName = aspect ? aspect.name : (aspectId === 'kokurikulum' ? 'Kokurikulum & Ekstrakurikuler' : 'Aspek Utama');
            const indicators = aspect ? aspect.indicators : [];
            const scores = allScores[aspectId] || {};
            
            const tone = schoolProfile?.aiTone || 'appreciative';
            const autoCorrect = schoolProfile?.autoCorrect || false;

            const res = await fetch('/api/generate-narrative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: student.name,
                    aspectName,
                    indicators,
                    scores,
                    tone,
                    customNotes,
                    lengthTarget: 'standard',
                    autoCorrect
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            
            onNarrativesChange({
                ...savedNarratives,
                [aspectId]: {
                    narrative: data.narrative || generateNativeNarrative(aspectId),
                    advice: data.parentAdvice || savedNarratives[aspectId]?.advice || "Lanjutkan stimulasi di rumah.",
                    tone,
                    updatedAt: Date.now()
                } as any
            });
        } catch (err: any) {
            console.error("AI Generation failed, falling back to local description:", err);
            if (err.message && (err.message.includes("API Key") || err.message.includes("Quota") || err.message.includes("401"))) {
                setApiError(err.message);
                setTimeout(() => setApiError(null), 5000);
            }
            const localNarrative = generateNativeNarrative(aspectId);
            onNarrativesChange({
                ...savedNarratives,
                [aspectId]: {
                    narrative: localNarrative,
                    advice: savedNarratives[aspectId]?.advice || "Dukung perkembangan ananda di rumah.",
                    tone: 'local-fallback',
                    updatedAt: Date.now()
                } as any
            });
        } finally {
            setGenerating(null);
        }
    };

    const handleRefineText = async (aspectId: string, text: string, action: 'polish' | 'shorten' | 'constructive') => {
        if (!text || !text.trim()) return;
        setGenerating(aspectId);
        try {
            const aspect = aspects.find(a => a.id === aspectId);
            const aspectName = aspect ? aspect.name : 'Umum';

            const res = await fetch('/api/refine-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    aspectName,
                    action
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Gagal merapikan teks');
            }

            const data = await res.json();
            if (data.refinedText) {
                onNarrativesChange({
                    ...savedNarratives,
                    [aspectId]: {
                        ...savedNarratives[aspectId],
                        narrative: data.refinedText,
                        updatedAt: Date.now()
                    } as any
                });
            }
        } catch (err: any) {
            console.error("AI Refinement failed:", err);
            if (err.message && (err.message.includes("API Key") || err.message.includes("Quota") || err.message.includes("401"))) {
                setApiError(err.message);
                setTimeout(() => setApiError(null), 5000);
            }
        } finally {
            setGenerating(null);
        }
    };

    const handleGenerateKartikaAI = async (customNotes = "") => {
        setGenerating('kartika');
        try {
            const tone = schoolProfile?.aiTone || 'Formal & Profesional';
            const autoCorrect = schoolProfile?.autoCorrect || false;

            if (schoolProfile?.useAINarrative !== false) {
                const allIndicators = KARTIKA_5NK_ASPECTS.flatMap(a => a.indicators);
                const aiResult = await generateStudentNarrative(
                    student.name,
                    "Nilai-nilai 5NK Kartika",
                    allIndicators,
                    kartikaScores,
                    tone,
                    customNotes || "Fokus pada kebiasaan, karakter, moral, kesantunan dan kedisiplinan berdasar pada instrumen penilaian 5NK",
                    "standard",
                    autoCorrect
                );

                const newComments = {
                    kesimpulan: aiResult.narrative || "Ananda menunjukkan internalisasi nilai-nilai karakter yang sangat baik.",
                    catatanWali: aiResult.parentAdvice || "Pertahankan motivasi belajar dan bimbingan di rumah.",
                    catatanOrtu: kartikaComments.catatanOrtu || "Kami bangga dengan proses belajar Ananda."
                };

                setKartikaComments(newComments);
                await saveKartikaComments(student.id, newComments);
            } else {
                throw new Error("AI disabled, falling back to static");
            }
        } catch (err: any) {
            console.warn("AI generation failed or disabled. Generating via local rules...");
            if (err.message && (err.message.includes("API Key") || err.message.includes("Quota") || err.message.includes("401"))) {
                setApiError(err.message);
                setTimeout(() => setApiError(null), 5000);
            }
            const scoresArray = Object.values(kartikaScores);
            const bsb = scoresArray.filter(s => s === "BSB").length;
            const bsh = scoresArray.filter(s => s === "BSH").length;
            const mb = scoresArray.filter(s => s === "MB").length;
            const bb = scoresArray.filter(s => s === "BB").length;

            const aspectPerformance = KARTIKA_5NK_ASPECTS.map(aspect => {
                const aspectScores = aspect.indicators.map(ind => kartikaScores[ind.id]);
                const high = aspectScores.filter(s => s === "BSB" || s === "BSH").length;
                return { id: aspect.id, name: aspect.name, highCount: high, total: aspect.indicators.length };
            });

            const topAspects = aspectPerformance
                .sort((a, b) => b.highCount - a.highCount)
                .slice(0, 2)
                .map(a => a.name);
            
            const lowAspects = aspectPerformance
                .filter(a => a.highCount < a.total)
                .sort((a, b) => a.highCount - b.highCount)
                .slice(0, 1)
                .map(a => a.name);

            let kesimpulan = "";
            if (bsb > 15) {
                kesimpulan = `Ananda ${student.name} secara konsisten menunjukkan internalisasi nilai-nilai 5NK dengan sangat luar biasa. Capaian paling menonjol terlihat pada aspek ${topAspects.join(" dan ")} di mana Ananda mampu menjadi teladan bagi rekan sejawat.`;
            } else if (bsb + bsh > 12) {
                kesimpulan = `Progres perkembangan Ananda ${student.name} pada semester ini berada pada taraf yang memuaskan (Berkembang Sesuai Harapan). Ananda menunjukkan antusiasme tinggi terutama pada Nilai ${topAspects[0] || "Cinta Tanah Air"}.`;
            } else {
                kesimpulan = `Ananda ${student.name} menunjukkan usaha yang gigih dalam proses adaptasi nilai-nilai sekolah. Saat ini Ananda sedang berkembang pesat pada aspek ${topAspects[0] || "Berbudi Luhur"}.`;
            }

            let catatanWali = "";
            if (bb > 0) {
                catatanWali = `Mohon pendampingan lebih intensif untuk aspek yang belum berkembang. Kami optimis dengan bimbingan bersama, Ananda dapat melampaui fase ini.`;
            } else if (mb > 5) {
                catatanWali = `Pertahankan motivasi belajar Ananda. Kami menyarankan untuk memberikan kesempatan bereksplorasi secara mandiri.`;
            } else {
                catatanWali = `Kami bangga dengan pencapaian Ananda semester ini. Terus berikan bimbingan terarah dan hangat di rumah.`;
            }

            const newComments = {
                kesimpulan,
                catatanWali,
                catatanOrtu: kartikaComments.catatanOrtu || "Kami bangga dengan proses belajar Ananda."
            };
            setKartikaComments(newComments);
            await saveKartikaComments(student.id, newComments);
        } finally {
            setGenerating(null);
        }
    };

    const handleRefineKartikaText = async (field: 'kesimpulan' | 'catatanWali', action: 'polish' | 'shorten' | 'constructive') => {
        const text = kartikaComments[field];
        if (!text || !text.trim()) return;
        setGenerating(`kartika_${field}`);
        try {
            const refined = await refineStudentText(text, "Nilai Kartika", action);
            if (refined) {
                const next = { ...kartikaComments, [field]: refined };
                setKartikaComments(next);
                await saveKartikaComments(student.id, next);
            }
        } catch (err: any) {
            console.error("AI refinement failed:", err);
            if (err.message && (err.message.includes("API Key") || err.message.includes("Quota") || err.message.includes("401"))) {
                setApiError(err.message);
                setTimeout(() => setApiError(null), 5000);
            }
        } finally {
            setGenerating(null);
        }
    };

    const handleAutoGenerateAll = async () => {
        setAutoProgress({ active: true, currentAspect: 'Membaca penilaian aktivitas & tren kemajuan...', percent: 5 });
        const allAspectIds = [...aspects.map(a => a.id), 'kokurikulum'];
        const totalSteps = allAspectIds.length + 1; // including Kartika
        let stepCount = 0;
        let currentNarratives = { ...savedNarratives };

        // Analyze trends profile
        const trend = calculateStudentTrend(aspects, allScores);

        try {
            // Process aspects
            for (const aspectId of allAspectIds) {
                const aspect = aspects.find(a => a.id === aspectId);
                const aspectName = aspect ? aspect.name : 'Kokurikulum & Projek';
                setAutoProgress({
                    active: true,
                    currentAspect: `Menganalisis kemajuan & menulis narasi ${aspectName}...`,
                    percent: Math.round(((stepCount / totalSteps) * 90) + 5)
                });

                const indicators = aspect ? aspect.indicators : [];
                const scores = allScores[aspectId] || {};
                const tone = schoolProfile?.aiTone || 'appreciative';
                const autoCorrect = schoolProfile?.autoCorrect || false;

                try {
                    // Integrate the computed trend data directly in a gentle prompt guideline so Gemini incorporates it!
                    const trendAdvice = `Siswa ini memiliki tren kemajuan ${trend.trendLabel} (${trend.trendDesc}). Total capaian memuaskan: ${trend.excellentCount} indikator.`;
                    
                    const res = await fetch('/api/generate-narrative', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentName: student.name,
                            aspectName,
                            indicators,
                            scores,
                            tone,
                            customNotes: `${trendAdvice} Pastikan tulisan laras dengan progres nyata ini.`,
                            lengthTarget: 'standard',
                            autoCorrect
                        })
                    });

                    if (!res.ok) {
                        throw new Error("HTTP error");
                    }
                    const data = await res.json();
                    currentNarratives[aspectId] = {
                        narrative: data.narrative || generateNativeNarrative(aspectId),
                        advice: data.parentAdvice || "Teruskan bimbingan yang penuh kasih sayang di rumah.",
                        tone,
                        updatedAt: Date.now()
                    } as any;
                } catch (err) {
                    console.warn(`Fallback to local narrative calculation due to API Key status for aspect: ${aspectId}`);
                    currentNarratives[aspectId] = {
                        narrative: generateNativeNarrative(aspectId),
                        advice: "Pertahankan ketekunan belajar Ananda di rumah.",
                        tone: 'offline-system',
                        updatedAt: Date.now()
                    } as any;
                }

                stepCount++;
                onNarrativesChange({ ...currentNarratives });
                await new Promise(r => setTimeout(r, 450));
            }

            // Process Kartika 5NK characters
            setAutoProgress({
                active: true,
                currentAspect: "Menseleksi Nilai-nilai Karakter Kartika 5NK...",
                percent: 95
            });

            await handleGenerateKartikaAI();

            setAutoProgress({
                active: false,
                currentAspect: 'Selesai!',
                percent: 100
            });
        } catch (error) {
            console.error("Auto generate error:", error);
            setAutoProgress({ active: false, currentAspect: '', percent: 0 });
        }
    };

    const updateKartikaComment = async (field: 'kesimpulan' | 'catatanWali' | 'catatanOrtu', value: string) => {
        const next = { ...kartikaComments, [field]: value };
        setKartikaComments(next);
        await saveKartikaComments(student.id, next);
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
        apiError,
        activeTab,
        setActiveTab,
        handleGenerateAI,
        handleRefineText,
        kartikaScores,
        kartikaComments,
        handleGenerateKartikaAI,
        handleRefineKartikaText,
        updateKartikaComment,
        autoProgress,
        handleAutoGenerateAll
    };
}
