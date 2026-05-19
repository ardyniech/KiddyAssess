import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Narasi Generator using Gemini
  app.post("/api/generate-narrative", async (req, res) => {
    try {
      const { studentName, aspectName, indicators, scores } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      // Generate a detailed prompt for the report
      const prompt = `
        Tuliskan sebuah laporan penilaian formal untuk murid TK bernama ${studentName}.
        Aspek Perkembangan: ${aspectName}.
        Data Indikator dan Skor:
        ${indicators.map((ind: any, i: number) => `- ${ind.text}: ${scores[ind.id]}`).join("\n")}

        Keterangan Skor:
        - BB (Belum Berkembang)
        - MB (Mulai Berkembang)
        - BSH (Berkembang Sesuai Harapan)
        - BSB (Berkembang Sangat Baik)

        Tugas:
        1. "narrative": Narasi penilaian (3-5 kalimat). Gunakan bahasa positif dan edukatif.
        2. "parentAdvice": Saran praktis singkat untuk orang tua di rumah agar dapat mendukung perkembangan anak pada aspek ini (2-3 saran).

        Kirimkan output dalam format JSON murni:
        { "narrative": "teks narasi...", "parentAdvice": "teks saran orang tua..." }
      `;

      const modelResponse = await ai.models.generateContent({ 
        model: "gemini-3.1-flash-lite", 
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = modelResponse.text || "";
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      const errorMessage = error.message || "";
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "Quota gratis harian Gemini AI telah habis. Klik opsi Offline/System Narrative jika tidak ingin menunggu." });
      }

      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
