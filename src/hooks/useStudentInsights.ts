import { useState, useEffect } from 'react';
import { Student, Aspect } from '../types';
import { StudentInsightReport } from '../types/insights';

export function useStudentInsights(
  student: Student | null,
  assessments: any,
  aspects: Aspect[]
) {
  const [insight, setInsight] = useState<StudentInsightReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const studentScores = student ? assessments[student.id] || {} : {};

  const fetchStudentInsights = async () => {
    if (!student) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/student-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          scores: studentScores,
          aspects
        })
      });

      if (!response.ok) {
        throw new Error('Gagal memuat rekomendasi intervensi edukasi AI.');
      }

      const data = await response.json();
      setInsight(data);
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke modul kecerdasan buatan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student) {
      fetchStudentInsights();
    } else {
      setInsight(null);
    }
  }, [student?.id]);

  return {
    insight,
    loading,
    error,
    refetch: fetchStudentInsights,
    studentScores
  };
}
