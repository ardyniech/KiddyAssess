import { Aspect } from '../../../types';

export interface TrendProfile {
  totalRated: number;
  unratedCount: number;
  excellentCount: number; // BSB + BSH
  developingCount: number; // MB + BB
  ratio: number;
  trendLabel: string;
  trendDesc: string;
}

export function calculateStudentTrend(
  aspects: Aspect[],
  allScores: Record<string, Record<string, any>>
): TrendProfile {
  let totalRated = 0;
  let unratedCount = 0;
  let excellentCount = 0;
  let developingCount = 0;

  aspects.forEach(aspect => {
    const scores = allScores[aspect.id] || {};
    aspect.indicators.forEach(ind => {
      const score = scores[ind.id];
      if (score) {
        totalRated++;
        if (score === 'BSB' || score === 'BSH') {
          excellentCount++;
        } else {
          developingCount++;
        }
      } else {
        unratedCount++;
      }
    });
  });

  const total = totalRated + unratedCount;
  const ratio = total > 0 ? (excellentCount / total) : 0;

  let trendLabel = "Berkembang Sehat (Stabil)";
  let trendDesc = "Menunjukkan konsistensi positif di sebagian besar aspek perkembangan harian.";

  if (ratio >= 0.8) {
    trendLabel = "Sangat Membanggakan (Meningkat)";
    trendDesc = "Kemajuan pesat melampaui rentang usia dengan kemampuan mandiri yang sangat kokoh.";
  } else if (ratio < 0.4 && totalRated > 0) {
    trendLabel = "Butuh Stimulasi Terarah (Fase Pertumbuhan)";
    trendDesc = "Sedang beradaptasi dengan materi baru dan membutuhkan bimbingan afektif intensif.";
  }

  return {
    totalRated,
    unratedCount,
    excellentCount,
    developingCount,
    ratio,
    trendLabel,
    trendDesc
  };
}
