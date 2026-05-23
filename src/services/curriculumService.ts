import { db } from '../lib/db';
import { Aspect } from '../types';
import { ASPECTS } from '../constants';

export async function getCurriculum(): Promise<Aspect[]> {
  const record = await db.settings.get('curriculum');
  return record?.value || ASPECTS;
}

export async function saveCurriculum(aspects: Aspect[]): Promise<void> {
  await db.settings.put({ key: 'curriculum', value: aspects });
}
