import Dexie, { Table } from 'dexie';
import { Student, StudentAssessment } from '../types';

export interface AssessmentPhoto {
  id?: number;
  studentId: string;
  aspectId: string;
  indicatorId: string;
  blob: Blob;
  previewUrl: string;
  createdAt: number;
}

export interface AppSettings {
  key: string;
  value: any;
}

export class KiddyDatabase extends Dexie {
  students!: Table<Student>;
  assessments!: Table<{ id: string; data: StudentAssessment }>;
  photos!: Table<AssessmentPhoto>;
  settings!: Table<AppSettings>;

  constructor() {
    super('KiddyAssessDB');
    this.version(1).stores({
      students: 'id, name',
      assessments: 'id',
      photos: '++id, studentId, [studentId+aspectId+indicatorId]',
      settings: 'key'
    });
  }
}

export const db = new KiddyDatabase();

// Helper to save whole assessment state to IDB
export async function saveAssessments(data: StudentAssessment) {
  return await db.assessments.put({ id: 'current', data });
}

export async function loadAssessments(): Promise<StudentAssessment> {
  const record = await db.assessments.get('current');
  return record?.data || {};
}

// Photo helpers
export async function savePhoto(studentId: string, aspectId: string, indicatorId: string, blob: Blob) {
  // Check if existing photo exists for this specific point
  const existing = await db.photos
    .where('[studentId+aspectId+indicatorId]')
    .equals([studentId, aspectId, indicatorId])
    .first();

  const photo: AssessmentPhoto = {
    studentId,
    aspectId,
    indicatorId,
    blob,
    previewUrl: URL.createObjectURL(blob),
    createdAt: Date.now()
  };

  if (existing?.id) {
    photo.id = existing.id;
  }

  return await db.photos.put(photo);
}

export async function getPhotosForStudent(studentId: string) {
  return await db.photos.where('studentId').equals(studentId).toArray();
}

export async function deletePhoto(photoId: number) {
  return await db.photos.delete(photoId);
}
