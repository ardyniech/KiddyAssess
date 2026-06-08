import { Student, StudentAssessment } from '../types';
import { SyncConflict } from '../types/sync';

export function countAssessments(scores: any): number {
  if (!scores) return 0;
  let count = 0;
  Object.values(scores).forEach((aspectScores: any) => {
    if (aspectScores && typeof aspectScores === 'object') {
      Object.values(aspectScores).forEach((val) => {
        if (val) count++;
      });
    }
  });
  return count;
}

export function scanConflicts(
  localStudents: Student[],
  cloudStudents: Student[],
  localAssess: StudentAssessment,
  cloudAssess: StudentAssessment
): SyncConflict[] {
  const conflicts: SyncConflict[] = [];

  cloudStudents.forEach((cS) => {
    const lS = localStudents.find((s) => s.id === cS.id);
    if (lS) {
      const localTime = lS.updatedAt || 0;
      const cloudTime = cS.updatedAt || 0;

      const profileMismatch =
        lS.name !== cS.name ||
        lS.kelompok !== cS.kelompok ||
        lS.semester !== cS.semester;

      const localCount = countAssessments(localAssess[cS.id]);
      const cloudCount = countAssessments(cloudAssess[cS.id]);
      const assessMismatch = localCount !== cloudCount;

      // Conflict if content is mismatch and timestamps are unequal
      if ((profileMismatch || assessMismatch) && localTime !== cloudTime) {
        conflicts.push({
          studentId: cS.id,
          studentName: cS.name,
          localStudent: lS,
          cloudStudent: cS,
          localAssessCount: localCount,
          cloudAssessCount: cloudCount,
          localTimestamp: localTime,
          cloudTimestamp: cloudTime,
          localSummary: `Kelompok: ${lS.kelompok || ''}, Smt: ${lS.semester || ''}`,
          cloudSummary: `Kelompok: ${cS.kelompok || ''}, Smt: ${cS.semester || ''}`,
        });
      }
    }
  });

  return conflicts;
}
export function applyMergeResolutions(
  localStudents: Student[],
  cloudStudents: Student[],
  localAssess: StudentAssessment,
  cloudAssess: any,
  resolutions: Record<string, 'local' | 'cloud'>
) {
  const mergedS = [...localStudents];
  const mergedA = { ...localAssess };
  const mergedN: Record<string, any> = {};

  // Seed non-conflicted ones first
  cloudStudents.forEach((cS) => {
    const lS = localStudents.find((s) => s.id === cS.id);
    if (!lS) {
      // safe merge into local
      mergedS.push(cS);
      if (cloudAssess?.assessments?.[cS.id]) {
        mergedA[cS.id] = cloudAssess.assessments[cS.id];
      }
      if (cloudAssess?.narratives?.[cS.id]) {
        mergedN[cS.id] = cloudAssess.narratives[cS.id];
      }
    } else {
      const choice = resolutions[cS.id];
      if (choice === 'cloud') {
        const idx = mergedS.findIndex((s) => s.id === cS.id);
        if (idx !== -1) mergedS[idx] = cS;
        if (cloudAssess?.assessments?.[cS.id]) {
          mergedA[cS.id] = cloudAssess.assessments[cS.id];
        }
        if (cloudAssess?.narratives?.[cS.id]) {
          mergedN[cS.id] = cloudAssess.narratives[cS.id];
        }
      } else if (!choice) {
        // No conflict or unrecorded, fallback to newer timestamp auto choice
        const localTime = lS.updatedAt || 0;
        const cloudTime = cS.updatedAt || 0;
        if (cloudTime > localTime) {
          const idx = mergedS.findIndex((s) => s.id === cS.id);
          if (idx !== -1) mergedS[idx] = cS;
          if (cloudAssess?.assessments?.[cS.id]) {
            mergedA[cS.id] = cloudAssess.assessments[cS.id];
          }
          if (cloudAssess?.narratives?.[cS.id]) {
            mergedN[cS.id] = cloudAssess.narratives[cS.id];
          }
        }
      }
    }
  });

  return { mergedS, mergedA, mergedN };
}
