import { syncService } from './firebaseService';
import { db } from './db';
import { Student, StudentAssessment } from '../types';
import { StudentNarratives } from './db';

// Extracting types
interface SaveData {
  students: Student[];
  assessments: StudentAssessment;
  narratives: StudentNarratives;
}

export class SyncManager {
    static async triggerSync(data: SaveData, onProgress: (item: string, count: number) => void): Promise<void> {
        try {
            let count = 0;
            // 1. Upload Students
            for (const s of data.students) {
                onProgress(`Mengunggah Peserta: ${s.name}`, ++count);
                await syncService.saveStudent(s);
            }

            // 2. Upload Assessments
            for (const sid of Object.keys(data.assessments)) {
                onProgress(`Mengunggah Raport: ${sid}`, ++count);
                const kScores = await db.assessments.get(`kartika_scores_${sid}`).then(r => r?.data);
                const kComments = await db.assessments.get(`kartika_comments_${sid}`).then(r => r?.data);
                
                await syncService.saveAssessment(sid, data.assessments[sid], data.narratives[sid] || null, kScores, kComments);
            }
        } catch (error) {
            console.error("Atomic Sync Failed:", error);
            throw error; // Propagate for handling
        }
    }
}
