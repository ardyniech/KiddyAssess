import Dexie, { Table } from 'dexie';
import { Student, StudentAssessment, KanbanTask } from '../types';

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

export interface NarrativeEntry {
  id?: string; // combination of studentId + aspectId
  studentId: string;
  aspectId: string;
  narrative: string;
  advice: string;
  updatedAt: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: 'Academic' | 'Holiday' | 'Event' | 'Holiday Staff';
  description: string;
}

export class KiddyDatabase extends Dexie {
  students!: Table<Student>;
  assessments!: Table<{ id: string; data: StudentAssessment }>;
  photos!: Table<AssessmentPhoto>;
  settings!: Table<AppSettings>;
  narratives!: Table<NarrativeEntry>;
  events!: Table<Event>; // Add this line
  tasks!: Table<KanbanTask>;

  constructor() {
    super('KiddyAssessDB');
    this.version(1).stores({
      students: 'id, name',
      assessments: 'id',
      photos: '++id, studentId, [studentId+aspectId+indicatorId]',
      settings: 'key',
      narratives: '++id, studentId, [studentId+aspectId]'
    });
    this.version(2).stores({ // Bump to version 2
      students: 'id, name',
      assessments: 'id',
      photos: '++id, studentId, [studentId+aspectId+indicatorId]',
      settings: 'key',
      narratives: '++id, studentId, [studentId+aspectId]',
      events: 'id, date' // Add events store
    });
    this.version(3).stores({ // Bump to version 3
      students: 'id, name',
      assessments: 'id',
      photos: '++id, studentId, [studentId+aspectId+indicatorId]',
      settings: 'key',
      narratives: '++id, studentId, [studentId+aspectId]',
      events: 'id, date',
      tasks: 'id, status'
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

// Events helpers
export async function saveEvents(events: Event[]) {
  return await db.events.bulkPut(events);
}

export async function loadEvents(): Promise<Event[]> {
  return await db.events.toArray();
}

// Task helpers
export async function saveTasksLocal(tasks: KanbanTask[]) {
  return await db.tasks.bulkPut(tasks);
}

export async function loadTasksLocal(): Promise<KanbanTask[]> {
  return await db.tasks.toArray();
}

export interface SavedNarrative {
  narrative: string;
  advice: string;
  tone?: string;
  customNotes?: string;
  lengthTarget?: 'short' | 'standard';
}

export type StudentNarratives = Record<string, Record<string, SavedNarrative>>; // studentId -> aspectId -> SavedNarrative

export async function saveNarrativesLocal(data: StudentNarratives) {
  return await db.assessments.put({ id: 'comment_narratives', data: data as any });
}

export async function loadNarrativesLocal(): Promise<StudentNarratives> {
  const record = await db.assessments.get('comment_narratives');
  return (record?.data as unknown as StudentNarratives) || {};
}

// Photo helpers
export async function savePhoto(studentId: string, aspectId: string, indicatorId: string, blob: Blob) {
  // Check if existing photo exists for this specific point
  const existing = await db.photos
    .where('[studentId+aspectId+indicatorId]')
    .equals([studentId, aspectId, indicatorId])
    .first();

  const previewBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const photo: AssessmentPhoto = {
    studentId,
    aspectId,
    indicatorId,
    blob,
    previewUrl: previewBase64,
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

// Kartika 5NK Helpers
export async function saveKartikaScores(studentId: string, scores: Record<string, string>) {
  return await db.assessments.put({ id: `kartika_scores_${studentId}`, data: scores as any });
}

export async function loadKartikaScores(studentId: string): Promise<Record<string, string>> {
  const record = await db.assessments.get(`kartika_scores_${studentId}`);
  return (record?.data as any) || {};
}

export async function saveKartikaComments(studentId: string, comments: any) {
  return await db.assessments.put({ id: `kartika_comments_${studentId}`, data: comments });
}

export async function loadKartikaComments(studentId: string): Promise<any> {
  const record = await db.assessments.get(`kartika_comments_${studentId}`);
  return record?.data || null;
}

export async function saveKartikaTemplate(template: Uint8Array) {
  return await db.settings.put({ key: 'kartika_template', value: template });
}

export async function loadKartikaTemplate(): Promise<Uint8Array | null> {
  const record = await db.settings.get('kartika_template');
  return record ? record.value : null;
}
