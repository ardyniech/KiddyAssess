import { useState } from "react";
import { AssessmentScale, Student, SchoolProfile } from "../types";
import { saveKartikaComments } from "../lib/db";
import { KARTIKA_5NK_ASPECTS } from "../components/organisms/reports/KartikaData";
import { generateStudentNarrative } from "../services/aiService";

export function useKartikaNarrative(student: Student, scores: Record<string, AssessmentScale>, comments: any, setComments: any, profile: SchoolProfile | null) {
    const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);

    const generateNarrative = async () => {
        setIsGeneratingNarrative(true);
        try {
            if (profile?.useAINarrative) {
                // Call AI Service
                const allIndicators = KARTIKA_5NK_ASPECTS.flatMap(a => a.indicators);
                const aiResult = await generateStudentNarrative(
                    student.name,
                    "Nilai-nilai 5NK Kartika",
                    allIndicators,
                    scores,
                    profile.aiTone || "Formal & Profesional",
                    "Fokus pada kebiasaan, karakter, moral, kesantunan dan kedisiplinan berdasar pada instrumen penilaian 5NK",
                    profile.aiSensitivity || "Standard Balanced",
                    profile.autoCorrect
                );
                
                setComments((prev: any) => {
                    const newComments = { 
                        ...prev, 
                        kesimpulan: aiResult.narrative || prev.kesimpulan, 
                        catatanWali: aiResult.parentAdvice || prev.catatanWali,
                        catatanOrtu: prev.catatanOrtu || "Kami bangga dengan proses belajar Ananda." 
                    };
                    saveKartikaComments(student.id, newComments);
                    return newComments;
                });
            } else {
                // Fallback to static generation
                const scoresArray = Object.values(scores);
                const bsb = scoresArray.filter(s => s === "BSB").length;
                const bsh = scoresArray.filter(s => s === "BSH").length;
                const mb = scoresArray.filter(s => s === "MB").length;
                const bb = scoresArray.filter(s => s === "BB").length;

                const aspectPerformance = KARTIKA_5NK_ASPECTS.map(aspect => {
                  const aspectScores = aspect.indicators.map(ind => scores[ind.id]);
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
                  kesimpulan = `Ananda ${student.name} secara konsisten menunjukkan internalisasi nilai-nilai 5NK dengan sangat luar biasa. Capaian paling menonjol terlihat pada aspek ${topAspects.join(" dan ")} di mana Ananda mampu menjadi teladan bagi rekan sejawat. Keteguhan dalam prinsip dan kemandirian bersikap menjadi aset berharga perkembangannya.`;
                } else if (bsb + bsh > 12) {
                  kesimpulan = `Progres perkembangan Ananda ${student.name} pada semester ini berada pada taraf yang sangat memuaskan (Berkembang Sesuai Harapan). Ananda menunjukkan antusiasme tinggi terutama pada Nilai ${topAspects[0]}. Kami merekomendasikan penguatan berkelanjutan pada aspek ${lowAspects[0] || "Kedisiplinan"} untuk keseimbangan karakter.`;
                } else {
                  kesimpulan = `Ananda ${student.name} menunjukkan usaha yang gigih dalam proses adaptasi nilai-anak sekolah. Saat ini Ananda sedang berkembang pesat pada aspek ${topAspects[0]}. Stimulasi yang lebih intensif pada lingkungan rumah terkait pembiasaan Nilai Kartika akan sangat mendukung akselerasi potensi dirinya.`;
                }

                let catatanWali = "";
                if (bb > 0) {
                  catatanWali = `Mohon pendampingan lebih intensif untuk aspek yang belum berkembang. Kami optimis dengan bimbingan bersama, Ananda dapat melampaui fase ini.`;
                } else if (mb > 5) {
                  catatanWali = `Pertahankan motivasi belajar Ananda. Kami menyarankan untuk lebih banyak memberikan kesempatan pada Ananda untuk bereksplorasi secara mandiri di rumah.`;
                } else {
                  catatanWali = `Kami bangga dengan pencapaian Ananda semester ini. Terus berikan apresiasi atas setiap usaha kecil yang ia tunjukkan.`;
                }

                setComments((prev: any) => {
                    const newComments = { ...prev, kesimpulan, catatanWali, catatanOrtu: "Kami bangga dengan proses belajar Ananda." };
                    saveKartikaComments(student.id, newComments);
                    return newComments;
                });
            }
        } catch(error: any) {
            console.error("Failed to generate narrative", error);
            alert(`Gagal melakukan generate narasi menggunakan AI.\n${error.message || ""}\nSilakan coba mematikan bantuan AI di pengaturan atau perbaiki API Key.`);
        } finally {
            setIsGeneratingNarrative(false);
        }
    };
    return { generateNarrative, isGeneratingNarrative };
}
