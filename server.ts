import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Narasi Generator using Gemini
  app.post("/api/generate-narrative", async (req, res) => {
    try {
      const { studentName, aspectName, indicators, scores, tone, customNotes, lengthTarget, autoCorrect } = req.body;

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
        : "Sekitar 600 - 800 karakter (agak detail, terurai runut menjadi beberapa paragraf yang mengalir, tidak terlalu panjang namun juga tidak terlalu singkat, ukuran paragraf sedang/menengah).";

      const autoCorrectGuideline = autoCorrect 
        ? "- Lakukan KOREKSI OTOMATIS: Poles bahasa menjadi indah, pastikan Ejaan Yang Disempurnakan (EYD) tepat, perbaiki tanda baca, dan hilangkan saltik/typo." 
        : "";

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
        ${autoCorrectGuideline}
        
        Tugas:
        1. "narrative": Narasi capaian penilaian (${lengthGuideline}).
        2. "parentAdvice": Saran praktis singkat, ramah, konkret, dan aplikatif untuk orang tua di rumah (MAX 200 karakter).

        Kirimkan output dalam format JSON murni:
        { "narrative": "teks narasi...", "parentAdvice": "teks saran orang tua..." }
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text() || "{}";
      const cleanedText = cleanJsonResponse(responseText);
      res.json(JSON.parse(cleanedText));
    } catch (error: any) {
      const errorMessage = error.message || "";
      console.log(`AI Narrative Generator: Service status is offline fallback (${errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("expired") ? "invalid/expired key" : "temporary error"}).`);
      
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "Quota gratis harian Gemini AI telah habis. Klik opsi Offline/System Narrative jika tidak ingin menunggu." });
      }
      
      if (errorMessage.includes("API key not valid") || errorMessage.includes("API key expired") || errorMessage.includes("API_KEY_INVALID")) {
        return res.status(401).json({ error: "API Key Gemini tidak valid atau telah kedaluwarsa. Silakan perbarui di Workspace Settings atau gunakan opsi Offline/System Narrative." });
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
        instruction = `Persingkat narasi penilaian ini agar padat, ringkas, and ekspresif dengan batas MUTLAK yaitu di bawah ${charLimit} karakter. Pastikan makna positif utama dan esensi aspek tetap utuh terjaga tanpa kata sambung berbelit-belit.`;
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

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text() || "{}";
      const cleanedText = cleanJsonResponse(responseText);
      const data = JSON.parse(cleanedText);
      res.json({ refinedText: data.refinedText || text });
    } catch (error: any) {
      const errorMessage = error.message || "";
      console.log(`AI Refine Text: Service status is offline fallback (${errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("expired") ? "invalid/expired key" : "temporary error"}).`);
      
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "Quota gratis harian Gemini AI telah habis. Silakan coba besok atau gunakan narasi manual." });
      }
      if (errorMessage.includes("API key not valid") || errorMessage.includes("API key expired") || errorMessage.includes("API_KEY_INVALID")) {
        return res.status(401).json({ error: "API Key Gemini tidak valid atau telah kedaluwarsa. Silakan perbarui di Workspace Settings." });
      }
      res.status(500).json({ error: errorMessage || "Gagal menyempurnakan teks dengan AI." });
    }
  });

  // API Route: AI-driven Conflict Detector for Calendar Events
  app.post("/api/calendar/detect-conflicts", async (req, res) => {
    try {
      const { newEvent, existingEvents } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        const report = generateFallbackConflictReport(newEvent, existingEvents);
        return res.json(report);
      }

      const prompt = `
        Tugas Anda adalah memetakan dan mendeteksi konflik penjadwalan sekolah (Lembaga PAUD/TK) serta memberikan rekomendasi ditenagai kecerdasan buatan (Conflict Detection & Recommendations).

        Acara yang ingin diajukan:
        - Judul: ${newEvent.title}
        - Tanggal: ${newEvent.date}
        - Jam: ${newEvent.startTime} - ${newEvent.endTime}
        - Kategori: ${newEvent.category} (Asesmen / Rapat Wali Murid / Event Sekolah)
        - Deskripsi: ${newEvent.description}

        Daftar Agenda Sekolah yang Sudah Ada Pada Tanggal Tersebut atau Dekat dengan Tanggal Tersebut:
        ${existingEvents.map((e: any) => `- ${e.title} (${e.date}, ${e.startTime}-${e.endTime}, Kategori: ${e.category || 'Umum'})`).join("\n")}

        Tugas Anda:
        1. Bandingkan acara baru dengan acara yang sudah ada. Tentukan apakah ada konflik mutlak (overlapping jam pada hari yang sama) ATAU konflik pedagogik/operasional (misalnya, ada dua sesi interaksi orang tua di hari yang sama, jadwal ujian berturut-turut, atau kepadatan agenda bagi anak PAUD).
        2. Berikan analisis singkat dalam Bahasa Indonesia yang profesional namun ramah (maksimal 3 kalimat).
        3. Berikan saran berupa rekomendasi preventif atau alternatif jam/tanggal jika mendeteksi potensi kelelahan agenda (schedule congestion).
        4. Tentukan status level keparahan konflik: "aman" (safe), "peringatan" (warning - padat/perlu penyesuaian), atau "konflik" (conflict - tabrakan jam secara langsung).

        Kirimkan output dalam format JSON murni:
        {
          "status": "aman" | "peringatan" | "konflik",
          "reason": "Analisis dari kecerdasan buatan mengenai overlap atau kepadatan jadwal...",
          "recommendation": "Saran dari AI agar penjadwalan berjalan optimal..."
        }
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text() || "{}";
      const cleanedText = cleanJsonResponse(responseText);
      res.json(JSON.parse(cleanedText));
    } catch (error: any) {
      console.log("Calendar background check: Applying local offline predictive fallback system.");
      const report = generateFallbackConflictReport(req.body.newEvent, req.body.existingEvents);
      res.json(report);
    }
  });

  // API Route: AI Insights for Learning Patterns & Weekly Focus
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { metrics } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        const report = generateFallbackInsights(metrics);
        return res.json(report);
      }

      const prompt = `
        Tugas Anda adalah menganalisis data capaian perkembangan anak usia dini (PAUD/TK) secara agregat dan menghasilkan ringkasan pola belajar ("AI Insights") dalam Bahasa Indonesia yang indah, profesional, ramah, dan bernilai pedagogis tinggi.

        Data Statistik Kelas Saat Ini:
        - Total Siswa: ${metrics?.totalStudents || 0}
        - Total Penilaian Diinput: ${metrics?.totalAssessments || 0}
        - Distribusi Kelayakan Nilai: BB=${metrics?.scaleCounts?.BB || 0}, MB=${metrics?.scaleCounts?.MB || 0}, BSH=${metrics?.scaleCounts?.BSH || 0}, BSB=${metrics?.scaleCounts?.BSB || 0}

        Capaian per Aspek Perkembangan:
        ${(metrics?.aspectSummaries || []).map((a: any) => `- ${a.aspectName}: BB=${a.BB || 0}, MB=${a.MB || 0}, BSH=${a.BSH || 0}, BSB=${a.BSB || 0}`).join("\n")}

        Tugas Anda:
        1. Berikan Analisis Pola Belajar Singkat (Summary) mengenai tren tumbuh kembang anak di sekolah secara umum (maksimal 3 kalimat).
        2. Cari 1-2 Aspek Kekuatan (Strengths) utama di mana persentase BSH+BSB paling dominan. Sebutkan nama aspek, metrik singkat, dan arti pedagogisnya.
        3. Cari 1-2 Aspek Kebutuhan Fasilitasi (Concerns/Challenges) di mana persentase BB+MB butuh perhatian ekstra. Sebutkan nama aspek, metrik singkat, dan stimulasinya.
        4. Rekomendasikan 2 Fokus Area Pembelajaran (Focus Areas) konkret, praktis, dan kreatif untuk guru terapkan di kelas pada MINGGU DEPAN.
        5. Berikan 1 Tip Mingguan Pedagogis (weeklyTip) singkat yang ramah dan inspiratif bagi guru PAUD untuk menstimulasi semangat belajar anak.

        Format Respon HARUS Berupa JSON Murni Seperti Contoh Berikut:
        {
          "summary": "Teks analisis umum...",
          "strengths": [
            {
              "aspectName": "Bahasa",
              "metric": "85% Siswa Capai BSH/BSB",
              "analysis": "Sebagian besar siswa telah berani menceritakan kembali cerita mini dengan alur yang runut."
            }
          ],
          "concerns": [
            {
              "aspectName": "Fisik Motorik",
              "metric": "40% Siswa Masih BB/MB",
              "analysis": "Beberapa anak masih menunjukkan kecanggungan memegang gunting mainan atau merobek kertas pola."
            }
          ],
          "focusAreas": [
            {
              "title": "Fun Motorics Zone",
              "description": "Fokuskan stimulasi otot tangan halus melingkar lewat aktivitas meremas adonan tepung warna-warni sebelum sesi inti pagi."
            }
          ],
          "weeklyTip": "Cobalah bernyanyi bersama sebelum memberikan instruksi tenang untuk fokus yang lebih optimal."
        }
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text() || "{}";
      const cleanedText = cleanJsonResponse(responseText);
      res.json(JSON.parse(cleanedText));
    } catch (error: any) {
      console.log("AI Insights background check: Applying local offline analysis fallback system.");
      const report = generateFallbackInsights(req.body.metrics);
      res.json(report);
    }
  });

  // Local fallback rule-based system for AI Insights
  function generateFallbackInsights(metrics: any) {
    const defaultSummaries = [
      "Secara umum, tumbuh kembang anak di kelompok ini menunjukkan tren positif, di mana sebagian besar siswa mulai aktif merespons stimulasi guru baik secara bahasa maupun kognitif dasar.",
      "Kelas ini memiliki interaksi sosial yang menyenangkan. Stimulasi intensif direkomendasikan pada aspek fisik motorik untuk menyelaraskan ketahanan fisik kognitif sehari-hari."
    ];

    const summariesList = metrics?.aspectSummaries || [];
    let strongestAspect = "Nilai Agama & Moral";
    let weakestAspect = "Fisik Motorik";
    let maxStrongPct = 0;
    let maxWeakPct = 0;

    summariesList.forEach((a: any) => {
      const total = (a.BB || 0) + (a.MB || 0) + (a.BSH || 0) + (a.BSB || 0);
      if (total > 0) {
        const strongPct = ((a.BSH || 0) + (a.BSB || 0)) / total;
        const weakPct = ((a.BB || 0) + (a.MB || 0)) / total;
        if (strongPct > maxStrongPct) {
          maxStrongPct = strongPct;
          strongestAspect = a.aspectName;
        }
        if (weakPct > maxWeakPct) {
          maxWeakPct = weakPct;
          weakestAspect = a.aspectName;
        }
      }
    });

    const mockStrengths = [
      {
        aspectName: strongestAspect,
        metric: `${Math.round(maxStrongPct * 100) || 75}% Siswa Berkembang Sesuai Harapan (BSH/BSB)`,
        analysis: `Sebagian besar anak telah terbiasa mengeksplorasi potensi diri dalam ranah ini dengan antusias dan kemandirian tinggi.`
      }
    ];

    const mockConcerns = [
      {
        aspectName: weakestAspect,
        metric: `${Math.round(maxWeakPct * 100) || 30}% Siswa Masih Mulai Berkembang (BB/MB)`,
        analysis: `Beberapa anak membutuhkan pendampingan personal secara berkala untuk merespon dan berpartisipasi penuh dalam aktivitas pembiasaan harian.`
      }
    ];

    const mockFocusAreas = [
      {
        title: `Peningkatan Kompetensi ${weakestAspect}`,
        description: `Rencanakan 2 aktivitas terarah berdurasi pendek sehari (sekitar 10-15 menit) guna memicu kemauan fungsional anak di ranah ${weakestAspect}.`
      },
      {
        title: "Pembiasaan Jurnal Positif Harian",
        description: "Catat minat konkret anak setiap pagi untuk merancang alat peraga edukatif yang tepat sasaran dengan keunikan personal murid."
      }
    ];

    return {
      summary: defaultSummaries[0],
      strengths: mockStrengths,
      concerns: mockConcerns,
      focusAreas: mockFocusAreas,
      weeklyTip: "Mulailah hari pembelajaran dengan pelukan hangat atau jabat tangan kreatif untuk membangun rasa aman (sense of security) pada anak."
    };
  }

  // Local rule-based fallback conflict detection if API has errors or no API key is specified
  function generateFallbackConflictReport(newEvent: any, existingEvents: any[]) {
    const sameDayEvents = existingEvents.filter((e: any) => e.date === newEvent.date);
    let status: "aman" | "peringatan" | "konflik" = "aman";
    let reason = "Jadwal ini terpantau senggang dan belum ada agenda terdaftar di tanggal terpilih. Aman untuk dijadwalkan.";
    let recommendation = "Silakan lanjutkan penjadwalan agenda.";

    if (sameDayEvents.length > 0) {
      const hasTimeOverlap = sameDayEvents.some((e: any) => {
        if (!newEvent.startTime || !newEvent.endTime || !e.startTime || !e.endTime) return false;
        const [nsH, nsM] = newEvent.startTime.split(":").map(Number);
        const [neH, neM] = newEvent.endTime.split(":").map(Number);
        const [esH, esM] = e.startTime.split(":").map(Number);
        const [eeH, eeM] = e.endTime.split(":").map(Number);

        const newStart = nsH * 60 + nsM;
        const newEnd = neH * 60 + neM;
        const existingStart = esH * 60 + esM;
        const existingEnd = eeH * 60 + eeM;

        return (newStart < existingEnd && newEnd > existingStart);
      });

      if (hasTimeOverlap) {
        status = "konflik";
        reason = `Terjadi konflik mutlak dengan agenda "${sameDayEvents[0].title}" yang dijadwalkan pada waktu yang sama (${sameDayEvents[0].startTime} - ${sameDayEvents[0].endTime}).`;
        recommendation = "Harap geser jam pelaksanaan agar tidak bertumpukan secara langsung.";
      } else {
        status = "peringatan";
        reason = `Terdapat ${sameDayEvents.length} agenda lain pada hari yang sama (${sameDayEvents.map((e: any) => e.title).join(", ")}). Aktivitas beruntun dapat memicu kepadatan kegiatan bagi siswa.`;
        recommendation = "Pastikan jeda waktu antar-acara mencukupi untuk persiapan transisi anak PAUD.";
      }
    }

    return { status, reason, recommendation };
  }

  // Helper function to safely clean JSON block from Gemini
  function cleanJsonResponse(rawText: string): string {
    let textClean = rawText.trim();
    if (textClean.startsWith("```json")) {
      textClean = textClean.substring(7);
    } else if (textClean.startsWith("```")) {
      textClean = textClean.substring(3);
    }
    if (textClean.endsWith("```")) {
      textClean = textClean.substring(0, textClean.length - 3);
    }
    textClean = textClean.trim();
    if (textClean.endsWith("]")) {
      textClean = textClean.slice(0, -1) + "}";
    }
    return textClean;
  }

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
