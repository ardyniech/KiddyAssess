# KiddyApps - Platform Manajemen Sekolah Terpadu

KiddyApps adalah ekosistem digital terpadu untuk manajemen sekolah, penilaian kurikulum, dan administrasi pendidikan. Dirancang untuk menghubungkan Guru, Kepala Sekolah, dan Admin dalam satu platform cerdas dengan dukungan otomasi AI.

## ✨ Fitur Utama

- **Database Siswa Terpadu**: Manajemen data murid dengan Pop-up Edit & Konfirmasi Hapus yang aman.
- **Smart Dashboard**: Ringkasan statistik, filter kelas, dan pencarian cepat siswa.
- **AI Narrative Engine**: Integrasi Gemini AI untuk mengubah skor indikator menjadi narasi perkembangan otomatis.
- **Manajemen Bukti Foto**: Dokumentasi kegiatan murid dengan penampil terintegrasi.
- **Unified Reporting System**: Sistem pelaporan modular mencakup:
  - Laporan Aspek Perkembangan (Standard)
  - Laporan Kartika 5NK (PDF Khusus)
  - Fitur Download PDF & Cetak A4/F4 dengan layout presisi.
- **Offline-First & Sinkronisasi**: Data disimpan lokal (IndexedDB) dengan opsi sinkronisasi awan.
- **Pengaturan Personalisasi**: Pengaturan sekolah dan UI yang dapat disesuaikan.

## 🛠️ Persyaratan Sistem

- Node.js versi 18+ (LTS disarankan)
- npm versi 9+

## 🚀 Instalasi & Pengembangan

1. **Clone** repositori Anda.
2. **Instal dependensi**:
   ```bash
   npm install
   ```
3. **Konfigurasi Environment**:
   Salin `.env.example` ke `.env` dan isi variabel berikut:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Jalankan mode pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

5. **Bangun untuk produksi**:
   ```bash
   npm run build
   ```
   Hasil build akan berada di direktori `dist/`.

## 📦 Deployment Mandiri (Self-Hosting)

Untuk mendeploy aplikasi pada server/mesin sendiri (VPS, Docker, dsb):

1. Pastikan Node.js terinstal.
2. Jalankan `npm install`.
3. Setel environment variable `GEMINI_API_KEY`.
4. Jalankan `npm run build`.
5. Mulai server: `npm run start` (atau gunakan `pm2` untuk memantau proses Node.js).

## 📜 Lisensi
Lisensi MIT - Dibuat untuk mendukung pendidikan anak usia dini.
