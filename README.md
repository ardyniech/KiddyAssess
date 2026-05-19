# KiddyAssess - Guru TK

Aplikasi Web Progressive (PWA) untuk membantu guru TK/PAUD melakukan penilaian perkembangan anak didik secara digital, efisien, dan profesional.

## ✨ Fitur Utama

- **Weather-Style UI**: Antarmuka bersih dan modern dengan nuansa aplikasi cuaca (glassmorphism).
- **AI Narrative Engine**: Integrasi Gemini 3.1 Flash Lite untuk mengubah skor indikator menjadi narasi perkembangan yang bermakna secara otomatis.
- **Manajemen Bukti Foto**: Unggah dan kelola foto dokumentasi kegiatan murid per aspek perkembangan.
- **Ekspor PDF Profesional**:
  - Format 3 halaman per murid (1 halaman per aspek).
  - Kualitas ekspor tinggi (3.0x scale).
  - Margin standar cetak (A4/F4).
  - Kustomisasi Logo Sekolah & Tanda Tangan.
- **Offline-First**: Bekerja tanpa internet menggunakan IndexedDB (Dexie.js).
- **Sinkronisasi Awan**: Opsional menggunakan Firebase untuk backup data antar perangkat.

## 🚀 Teknologi

- **Frontend**: React 19, Tailwind CSS 4, Motion, Lucide Icons.
- **Backend**: Express.js (Proxy Gemini API).
- **AI**: Google Gemini 3.1 Flash Lite.
- **Storage**: IndexedDB (Local) & Firebase Firestore (Cloud).

## 🛠️ Pengembangan

1. Clone repositori.
2. Instal dependensi: `npm install`.
3. Setel environment variable di `.env`:
   - `GEMINI_API_KEY`: API Key Anda dari Google AI Studio.
4. Jalankan mode pengembangan: `npm run dev`.
5. Bangun untuk produksi: `npm run build`.

## 📜 Lisensi
Lisensi MIT - Bebas digunakan untuk membantu pendidikan anak usia dini.
