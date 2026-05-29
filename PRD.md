# PRD Module: KiddyApps
*Part of the KiddyApps Platform*

## 1. Visi Produk & Filosofi
KiddyApps adalah ekosistem digital terpadu untuk manajemen sekolah, penilaian kurikulum, dan administrasi pendidikan. Menghubungkan Guru, Kepala Sekolah, dan Admin dalam satu platform cerdas dengan dukungan otomasi AI, dirancang khusus untuk lingkungan TK (Taman Kanak-Kanak) dan PAUD di Indonesia.
Mengikuti filosofi **Google Developer**:
- **Fokus pada Kegunaan Nyata**: Menghilangkan seluruh elemen dekoratif, kartu raksasa (jumbo cards), grafik berlebih, dan fitur birokratis yang membingungkan orang awam.
- **Kesederhanaan Visual + Performa Luar Biasa**: Antarmuka bersih, ringan, dan sangat mobile-friendly, namun didukung oleh mesin sinkronisasi offline (IndexedDB/Dexie) dan mesin kecerdasan buatan (Gemini AI) yang sangat kuat di belakang layar.
- **Satu Klik untuk Selesai**: Membantu guru menyelesaikan tugas tersulit—menulis narasi rapor—dalam hitungan detik dengan sekali ketuk.

## 2. Target Pengguna
Guru TK/PAUD di lapangan, Kepala Sekolah, dan Administrator (Admin/TU) yang seringkali membutuhkan solusi cepat dan responsif. Dirancang dengan pendekatan mobile-first untuk mengakomodasi penggunaan HP berbasis Android dengan layar kecil serta koneksi internet yang fluktuatif di sekolah.

## 3. Fitur Utama & Kriteria Fungsional

### 3.1. Penilaian Ringkas (Compact Assessment)
- Penilaian 3 aspek perkembangan dasar anak (Agama & Moral, Fisik Motorik, Kognitif) menggunakan antarmuka tabel ringkas atau daftar geser yang ramah sentuhan.
- Skala 4 nilai yang legendaris: **BB** (Belum Berkembang), **MB** (Mulai Berkembang), **BSH** (Berkembang Sesuai Harapan), **BSB** (Sangat Baik).
- Riwayat pengisian cepat dengan indikator visual yang jernih.

### 3.2. Unggah Dokumentasi & Bukti Belajar (Foto)
- Pengunggahan foto instan dengan kompresi otomatis di sisi browser agar tidak memakan penyimpanan offline atau memperlambat aplikasi.
- Penayangan gambar langsung di bagian ringkasan perkembangan siswa.

### 3.3. Asisten Narasi Pintar (AI Narrative Engine)
- Menghubungkan secara langsung nilai kuantitatif siswa (BB/MB/BSH/BSB) menjadi narasi deskriptif yang rapi, profesional, dan empatik menggunakan **Gemini 1.5 Flash**. 
- Satu tombol pemicu saja: *"Buat Narasi Otomatis"* tanpa menyulitkan pengguna mengetik prompt AI secara manual.

### 3.4. Generator Rapor Sekali Sentuh
- Pilihan format rapor dalam satu tempat:
  1. **Laporan Aspek Perkembangan** (Standard Nasional)
  2. **Kartika 5NK** (Sinergi Rapor)
- Penghasil dokumen PDF instan langsung di perangkat tanpa membebani server (Client-side Rendering) via jsPDF.

### 3.5. Sinkronisasi Otomatis Tanpa Suara
- Data disimpan di database lokal ponsel guru (**IndexedDB via Dexie.js**) agar penilaian bisa dilakukan saat offline di ruang kelas.
- Begitu mendapatkan internet, sistem otomatis mengunggah data ke Cloud Firebase tanpa mengganggu pekerjaan guru. Dilengkapi visual progress bar saku yang elegan dan mini di pojok kanan atas.

## 4. Struktur UI & Layout Ringkas (Mobile-First)
- **Compact Layout & Spacing**: Menghindari container besar dan margin/padding masif. 
  - **Aturan Jarak/Gap**: Seluruh komponen harus menggunakan jarak minimal (`gap-2`, `gap-3`, `gap-4`) serta padding saku (`p-2.5`, `p-3`, `p-4`). Hindari `pt-6 pb-20`, `mb-8`, `mb-6` yang berlebihan agar materi pengajaran tetap padat informasi untuk mempermudah guru.
  - **Google Developer Simplicity**: Menghilangkan grid kosong, ruang kosong tak berguna, serta meminimalisir scrolling vertikal tak perlu di layar mobile.
  - **Unified Assessment Pattern**: Semua lembar kerja penilaian siswa (Aspek Perkembangan, Kokurikuler, Kartika 5NK) wajib menggunakan satu desain kartu yang seragam dan konsisten. Setiap baris indikator harus dimuat dalam kartu bergaris tipis (`border-slate-150` atau `border-slate-100`), memiliki nomor urut circular bulat kecil (`w-5 h-5 bg-slate-50`), teks indikator ramah keterbacaan berukuran `text-[14px] font-semibold text-slate-800`, dan diakhiri dengan baris tombol skala penilaian yang seragam menggunakan `MoleculeScaleSelector` (atau setara button group `min-h-[42px]` berskala seimbang) untuk menghilangkan kebingungan navigasi.
- **Aturan Warna & Kontras Tinggi**:
  - **Hindari Latar Gelap untuk Aplikasi Utama**: Warna latar belakang halaman utama (backdrop) wajib menggunakan warna terang, bersih, dan kontras tinggi seperti `bg-[#f8fafc]` (slate-50) atau `bg-[#ffffff]`. Tidak diperkenankan menggunakan warna gelap (seperti total black `bg-slate-950` atau `bg-[#09090b]`) sebagai background aplikasi utama.
  - **Kontras Teks & Latar Belakang**: Wajib menghindari kombinasi latar belakang gelap dengan teks berwarna gelap (bad contrast). Jika terdapat lencana/elemen berwarna sedang/gelap, teks di dalamnya wajib putih bersih (`text-white`) demi menjaga keterbacaan tingkat tinggi bagi guru PAUD di bawah sinar matahari.
- **Smart Quick Bar**: Header minimalis yang memuat info profil sekolah, status cloud backup mini, dan pintasan pengaturan. 
- **Tabbed Classroom**: Memudahkan guru berpindah dari daftar nama anak, input penilaian, dan ekspor lapor dalam satu ketukan tanpa harus membuka sidebar menu yang membingungkan.

## 5. Spesifikasi Teknis Sederhana
- **Frontend**: React 18 + Tailwind CSS 4 + Framer Motion.
- **Database Lokal**: Dexie.js (Offline-First).
- **Sinkronisasi Cloud**: Firebase Auth & Firestore.
- **Mesin AI**: Server-side proxy ke Gemini API dengan template prompt otomatis berbahasa Indonesia.
