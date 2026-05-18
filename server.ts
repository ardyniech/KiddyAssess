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

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.text;
      const data = JSON.parse(responseText);

      res.json(data);
    } catch (error: any) {
      console.error("Gemini Error:", error);
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
