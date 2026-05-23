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
      const { studentName, aspectName, indicators, scores, tone, customNotes, lengthTarget } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const toneGuideline = tone === "appreciative" 
        ? "Gunakan nada hangat, sangat apresiatif, fokus pada potensi dan kenyamanan emosional anak, positif, dan penuh kasih sayang."
        : tone === "formal"
        ? "Gunakan nada objektif, formal-akademis, profesional, berimbang, dan berwibawa."
        : tone === "constructive"
        ? "Gunakan nada konstruktif, memotivasi, menekankan pertumbuhan berkelanjutan, dan memberikan dorongan semangat."
        : "Gunakan bahasa positif, edukatif, hangat, dan profesional.";

      const lengthGuideline = lengthTarget === "short"
        ? "MAX 250 karakter (sangat ringkas, padat langsung ke poin capaian utama)."
        : "MAX 450 karakter (panjang standar laporan perkembangan, terurai runut).";

      // Generate a detailed prompt for the report
      const prompt = `
        Tuliskan sebuah laporan penilaian formal kemajuan belajar untuk murid TK bernama ${studentName}.
        Aspek Perkembangan: ${aspectName}.
        Data Indikator dan Skor:
        ${indicators.map((ind: any) => `- ${ind.text}: ${scores[ind.id] || "Belum Dinilai"}`).join("\n")}

        Keterangan Skor:
        - BB (Belum Berkembang)
        - MB (Mulai Berkembang)
        - BSH (Berkembang Sesuai Harapan)
        - BSB (Berkembang Sangat Baik)

        ${customNotes ? `Catatan Khusus Tambahan dari Guru: "${customNotes}" (Integrasikan informasi spesifik ini ke dalam isi narasi secara halus dan relevan).` : ""}

        Pedoman Penulisan:
        - ${toneGuideline}
        - Hindari pengulangan kata yang kaku atau berputar-putar.
        - Fokus pada perkembangan riil yang terukur dari data indikator di atas.
        
        Tugas:
        1. "narrative": Narasi capaian penilaian (${lengthGuideline}).
        2. "parentAdvice": Saran praktis singkat, ramah, konkret, dan aplikatif untuk orang tua di rumah (MAX 200 karakter).

        Kirimkan output dalam format JSON murni:
        { "narrative": "teks narasi...", "parentAdvice": "teks saran orang tua..." }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      const errorMessage = error.message || "";
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "Quota gratis harian Gemini AI telah habis. Klik opsi Offline/System Narrative jika tidak ingin menunggu." });
      }

      res.status(500).json({ error: error.message });
    }
  });

  // API Route: Narasi Refiner for instant text polishing or shortening
  app.post("/api/refine-text", async (req, res) => {
    try {
      const { text, aspectName, action } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }
      if (!text || !text.trim()) {
        return res.status(405).json({ error: "Text to refine is required." });
      }

      let instruction = "";
      if (action === "polish") {
        instruction = "Muliakan dan poles bahasa teks penilaian ini menjadi sangat santun, profesional, penuh apresiasi pedagogik yang menyentuh, dan mengalir natural dalam bahasa Indonesia formal. Hindari pengulangan berlebih.";
      } else if (action === "shorten") {
        const charLimit = aspectName?.toLowerCase()?.includes("saran") || action === "shorten-advice" ? 200 : 450;
        instruction = `Persingkat narasi penilaian ini agar padat, ringkas, dan ekspresif dengan batas MUTLAK yaitu di bawah ${charLimit} karakter. Pastikan makna positif utama dan esensi aspek tetap utuh terjaga tanpa kata sambung berbelit-belit.`;
      } else if (action === "constructive") {
        instruction = "Poles teks ini agar terdengar jauh lebih konstruktif (membangun), memotivasi, menekankan bahwa anak senantiasa bertumbuh, serta tawarkan dorongan apresiatif yang membakar semangat belajar anak di masa depan.";
      } else {
        instruction = "Rapikan tata bahasa, hilangkan saltik (typo), serta pastikan alur kalimat mengalir profesional dan mendidik.";
      }

      const prompt = `
        Tugas Anda adalah memperbagus teks penilaian perkembangan murid TK.
        Aspek/Kategori: ${aspectName || "Umum"}.
        Teks Asli: "${text}"

        Instruksi Khusus untuk Proses Refinement / Perbaikan:
        ${instruction}

        Kirimkan HASIL PERBAIKAN DALAM FORMAT JSON BERIKUT, HANYA teks murni hasil edit tanpa penjelasan tambahan apa pun:
        { "refinedText": "teks hasil perbaikan..." }
        
        *Catatan: Pastikan format JSON valid.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      // Let's parse securely
      let textClean = responseText.trim();
      // Remove markdowns if any
      if (textClean.startsWith("```json")) {
        textClean = textClean.substring(7);
      } else if (textClean.startsWith("```")) {
        textClean = textClean.substring(3);
      }
      if (textClean.endsWith("```")) {
        textClean = textClean.substring(0, textClean.length - 3);
      }
      textClean = textClean.trim();

      // Safe replacement if model ends up with bracket
      if (textClean.endsWith("]")) {
        textClean = textClean.slice(0, -1) + "}";
      }
      const data = JSON.parse(textClean);
      res.json({ refinedText: data.refinedText || text });
    } catch (error: any) {
      console.error("Refine Text Gemini Error:", error);
      res.status(500).json({ error: error.message || "Gagal menyempurnakan teks dengan AI." });
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
