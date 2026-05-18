import { GoogleGenAI } from "@google/genai";
import { Aspect, ScoreData, AssessmentScale } from "../types";

// Note: GEMINI_API_KEY is handled server-side. 
// We should create an API route to proxy this to keep keys safe.
// For now, I'll define the service structure and then create the server route.

export const generateStudentNarrative = async (
  studentName: string,
  aspectName: string,
  indicators: any[],
  scores: Record<string, string>
) => {
  try {
    const response = await fetch('/api/generate-narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName, aspectName, indicators, scores })
    });
    
    if (!response.ok) throw new Error('AI generation failed');
    return await response.json();
  } catch (err) {
    console.error("AI Error:", err);
    return null;
  }
};
