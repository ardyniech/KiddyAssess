# 📋 Dokumen Audit Mutu & Hardening Sistem — KiddyApps (KiddyAssess)
*Dirancang Sebagai Protokol Keandalan Sistem Sebelum Peluncuran Skala Luas (Production-Prep)*

---

## 🔍 Ringkasan Eksekutif
KiddyApps dirancang sebagai pendukung operasional krusial bagi guru PAUD/TK di Indonesia. Melalui kombinasi **Offline-First (Dexie.js/IndexedDB)**, **Otot Sinkronisasi Firebase**, dan **AI Narrative Engine (Gemini 1.5 Flash)**, aplikasi ini menyelesaikan kendala administratif terbesar guru, yakni menulis narasi perkembangan siswa secara berkala. 

Namun, karena target penggunanya adalah pendidik lapangan yang sering kali menggunakan ponsel berspesifikasi rendah, memiliki literasi teknologi beragam, dan berada di area dengan koneksi internet tak stabil, aplikasi ini memerlukan **Protokol Hardening Terstruktur** sebelum perilisan komersial.

Dokumen ini disusun untuk mengevaluasi ketahanan aplikasi dari 5 pilar utama dan menyusun daftar uji (*checklist*) operasional untuk meminimalkan kegagalan bisnis atau ketidakpuasan pengguna.

---

## 1. Audit Logika Bisnis (Business Logic Integrity Audit)

Pilar ini memastikan seluruh aturan operasional, regulasi PAUD nasional, kepatuhan data pribadi, dan biaya operasional komputasi berjalan selaras tanpa celah.

### 📋 Checklist Pengujian Logika Bisnis
| ID | Area Test | Deskripsi Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- | :--- |
| **BL-1-1** | **Aturan Konversi Skala PAUD** | Masukkan asesmen dengan sebaran nilai kuantitatif yang timpang (misal, 5 indikator bernilai **BB**, dan 1 indikator bernilai **BSB**). | Generator narasi AI harus peka dan mendahulukan perbaikan atas aspek **BB** daripada merayakan aspek **BSB**, memberikan rekomendasi tindakan yang taktis bagi orang tua. |
| **BL-1-2** | **Kepatuhan Kurikulum Nasional** | Bandingkan butir indikator aspek perkembangan kognitif, fisik motorik, dan moral dengan Standar Nasional Kurikulum Merdeka (PAUD). | Kumpulan indikator bawaan dan hasil cetak PDF harus selaras dengan istilah resmi (misalnya Pembelajaran Berdiferensiasi, Capaian Perkembangan Anak, Elemen Jati Diri). |
| **BL-1-3** | **Manajemen Kuota & Biaya AI** | Pelatuk pengulangan penulisan narasi (*Regenerate Narrative*) sebanyak 20 kali dalam 1 menit pada 1 siswa yang sama. | Sistem harus melakukan *leaky-bucket rate-limiting* di sisi server untuk mencegah lonjakan biaya beban API Key Gemini, serta menampilkan peringatan visual yang edukatif ke guru. |
| **BL-1-4** | **Kompak Seeding Demo** | Matikan internet, hapus penyimpanan lokal lewat DevTools, lalu buka aplikasi pertama kali (*Cold Launch*). | Seeding Engine lokal harus menanamkan data mock siswa/kelas berkualitas dalam hitungan milidetik secara asinkron tanpa menginterupsi antarmuka utama atau menduplikasi entri jika tab di-refresh cepat. |
| **BL-1-5** | **Kepatuhan Privasi (UU PDP Indonesia)** | Verifikasi enkripsi atau isolasi database lokal murid (terutama NISN, Foto Wajah Anak, dan Nama Lengkap Orang Tua). | Data anak tidak boleh diekspos secara publik di luar ruang lingkup otentikasi peran/sekolah pengguna yang bersangkutan. |

### 🛠️ Pengujian Risiko Kegagalan Bisnis (Business Failure Matrix)
1. **Risiko Pemborosan Kredit API Gemini**:
   - *Problem*: Guru terus-menerus menekan "Tingkatkan dengan AI" karena tidak puas dengan diksi parsial.
   - *Mitigasi*: Buat sistem *rate limiting/caching*. Jika indikator input tidak berubah sama sekali, panggil nilai narasi yang sudah tersimpan sebelumnya tanpa memicu API Call baru ke model Gemini.

2. **Risiko Masalah Hukum Data Perlindungan Anak di Indonesia (UU PDP)**:
   - *Problem*: Foto bukti belajar siswa PAUD ditransmisikan tanpa enkripsi atau disimpan secara longgar di cloud storage publik tanpa kontrol ACL.
   - *Mitigasi*: Seluruh akses media bukti belajar di Firestore/Cloud Storage harus diproses dengan *signed URLs* berumur pendek dan terikat pada hak akses Peran Sekolah.

---

## 2. Audit Alur Kerja & Integritas State (Workflow & State Integrity Audit)

Pilar ini memetakan keandalan siklus data dari interaksi pengguna, mitigasi konflik sinkronisasi luring, hingga pembagian wewenang peran pengguna.

### 📋 Checklist Pengujian Alur Kerja
| ID | Area Test | Deskripsi Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- | :--- |
| **WF-2-1** | **Conflict Resolution Luring** | Edit deskripsi indikator seorang anak secara luring di Laptop A, sekaligus edit di ponsel Guru B secara bersamaan. | Sistem sinkronisasi awan harus menerapkan strategi resolusi konflik terdefinisi (misalnya: *Last-Write-Wins* atau penggabungan berbasis tanggal mutakhir) dan tidak menyebabkan crash di IndexedDB. |
| **WF-2-2** | **Isolasi Role (Akses Menu)** | Login menggunakan Akun Peran **TEACHER**, kemudian secara paksa panggil rute URL atau pemicu fungsi internal milik **MASTER** atau **SUPER_USER**. | Rute harus dicegat instan oleh Router Guard, membatalkan rendering komponen, dan kembali memosisikan guru pada dasbor Guru dengan pesan ramah. |
| **WF-2-3** | **Penyelamatan State Transmisi Lemah** | Simulasikan koneksi lambat (2G / 3G lambat lewat Chrome DevTools Network tab) saat mengunggah foto laporan berukuran 3MB. | Aplikasi harus memicu fungsi kompresi gambar di sisi klien hingga di bawah 300KB terlebih dahulu sebelum transmisi dilakukan, mengurangi latensi, serta mencegah kegagalan jaringan. |
| **WF-2-4** | **Laporan Terpadu Pintar (Print Hub)** | Ekspor 3 tipe rapor sekaligus (Laporan Standar, Kartika 5NK, dan Laporan Kualitatif). | Desain A4/F4 tidak boleh patah atau menyisakan ruang kosong yang janggal pada halaman cetak fisik/dokumen PDF eksternal. CSS `@media print` harus disinkronkan. |

### 🚨 Skenario Kegagalan Alur & Solusi Hardening
* **Skenario Tab Ditutup Saat Sync Berjalan**:
  - *Risiko*: Guru mengisi 30 data perkembangan luring di dalam kelas, lalu saat pulang ke rumah dengan internet penuh, tab ditutup mendadak ketika ikon sinkronisasi baru saja bergerak.
  - *Solusi Hardening*: Manfaatkan `onbeforeunload` untuk mendeteksi antrean transaksi Dexie yang belum terselesaikan dengan Cloud Firebase, menampilkan prompt konfirmasi: *"Menyinkronkan data murid Anda ke cloud... Mohon jangan tutup jendela ini selama beberapa detik."*

* **Kerancuan Otoritas Operator vs. Guru**:
  - *Risiko*: Akun Operator (TU) yang bertugas memasukkan data induk secara tidak sengaja dapat mengedit penilaian rapor murid yang sedang disusun guru.
  - *Solusi Hardening*: Setel izin mutlak di mana Operator memiliki akses tulis penuh pada nama anak/NISN/profil kelas tetapi terkunci rapat (Mode Baca Saja) pada modul penilaian indikator dan narasi rapor anak.

---

## 3. Pengalaman Pertama Pengguna (User First Onboarding Experience Audit)

Audit ini mengevaluasi kemudahan dan kejelasan aplikasi bagi pengguna baru dari saat pertama kali masuk ke aplikasi, proses mempelajari fitur dasar (*onboarding*), hingga memahami kegunaan antarmuka.

### 📋 Checklist Pengalaman Pertama Pengguna
| ID | Area Test | Deskripsi Pengujian | Hasil yang Diharapkan |
| :--- | :--- | :--- | :--- |
| **UX-3-1** | **Evaluasi Onboarding Wizard** | Masuki aplikasi untuk pertama kali sebagai pengguna baru tanpa akun atau sekolah terdaftar. | Sistem Onboarding Wizard (atau panduan pemula) muncul memandu guru membentuk "Sekolah Pertama", menginput "Kelas Pertama", dan menampilkan panduan interaktif beranimasi halus. |
| **UX-3-2** | **Touch Target & Density (Mobile)** | Jalankan uji usabilitas pada perangkat layar kecil (~360px lebar viewport). | Sentuhan tombol BB/MB/BSH/BSB harus memiliki area ramah sentuh minimal 44px dengan sela empuk agar tidak terjadi salah tekan (*misclicking*). |
| **UX-3-3** | **Audit Kontras Matahari (AAA)** | Uji visibilitas layar di bawah simulasi terik siang hari (tingkatkan kecerahan layar, gunakan kontras sedang/rendah). | Teks sekunder (misalkan nama subline anak, label indikator, status cloud sync) tidak boleh pudar. Kontras teks harus berada di level rasio kontras 7:1 (WCAG AAA) tanpa warna abu-abu lemah seperti `#8e8e93`. |
| **UX-3-4** | **Notifikasi Kejelasan Kerja Offline** | Cabut kabel internet, kemudian lakukan penilaian. | Harus muncul indikator informatif bertuliskan *"Mode Luring Aktif — Semua perubahan aman disimpan di memori lokal ponsel Anda."* dengan warna aman yang meyakinkan guru awam. |

### 🗣️ Desain Humanis untuk Guru Indonesia
1. **Diksi Pedagogis Non-Teknis**:
   - Hindari kata *"Database terhubung"*, *"Cache terhapus"*, atau *"API request sukses"*.
   - Gunakan padanan kata ramah seperti *"Semua data murid aman tersimpan"*, *"Laporan siap dicetak"*, atau *"Kecerdasan AI berhasil menyusun catatan perkembangan murid"*.
2. **Kemandirian Operasional**:
   - Antarmuka **Tabbed Classroom** harus memiliki tombol bantuan cepat berupa video demonstrasi atau panduan interaktif singkat yang dapat diakses dengan seketika tanpa melumpuhkan kursor pengisian guru.

---

## 4. Kritik & Evaluasi Teknis (Technical Criticism)

Tinjauan objektif terhadap batas-batas performa, arsitektur kode saat ini, serta kendala teknologi yang bisa memicu kegagalan jangka panjang.

### ⚠️ Blok Evaluasi Kritis Sistem
1. **Risiko Memori Penuh pada IndexedDB (Dexie.js)**:
   - *Problem*: Guru TK mendokumentasikan kegiatan belajar rata-rata dengan 5-10 foto definisi tinggi dari kamera HP (sekitar 4MB - 12MB per foto). Penyimpanan foto langsung di IndexedDB sebagai base64 string tanpa batas resolusi akan menghabiskan jatah penyimpanan peramban dalam hitungan minggu, yang memicu penghapusan otomatis oleh sistem operasi seluler (Android low-memory killer).
   - *Kritik*: Jangan pernah mengizinkan base64 string resolusi penuh masuk ke database lokal.
   - *Solusi*: Terapkan kompresi kanvas HTML5 wajib sebelum menyimpan media luring di level klien. Batasi ukuran citra fisik maksimal 800px lebar, 75% kualitas JPEG (menghasilkan berkas di kisaran 100KB-150KB).

2. **Beban Utas Tunggal (Single-Thread UI Freeze) jsPDF**:
   - *Problem*: Pembuatan berkas PDF laporan bulanan seluruh kelas (isinya bisa mencapai 30-45 siswa) dengan menyematkan foto bukti belajar dilakukan langsung pada utas utama (*UI main thread*). Ini akan membuat peramban ponsel Android guru memicu pop-up *"Chrome is not responding — Wait/Close"*.
   - *Kritik*: Generator PDF berat yang berjalan secara tersinkronisasi di utas depan adalah petaka rasio retensi pengguna.
   - *Solusi*: Batasi ekspor massal maks 5-10 murid sekaligus atau delegasikan proses generator ke *Web Worker* di latar belakang sehingga UI utama tetap dapat digulir dan responsif.

3. **Risiko Halusinasi & Format AI Non-Deterministik**:
   - *Problem*: Gemini AI dapat memberikan format respons yang tidak terstruktur atau memunculkan istilah teknis pemrograman atau teks sapaan AI (seperti *"Baik, ini rapor pilihan Anda..."*) jika instruksi sistem kurang ketat.
   - *Kritik*: Tidak boleh ada teks larping kecerdasan buatan menyusup ke lembaran rapor fisik anak yang akan ditandatangani Kepala Sekolah.
   - *Solusi*: Terapkan *safety rails* parameter `JSON Schema Output` atau gunakan penataan terstruktur dengan pilar kalimat yang dipotong dari awal hingga akhir (*strict-sentence completion*).

4. **Kepatuhan Terhadap "Micro-Component Rule (Max 125 Baris Kode)"**:
   - *Kritik*: Beberapa file modul dan dasbor utama berpotensi membengkak seiring bertambahnya sub-fitur baru. Evaluasi berkala harus dipatuhi agar kode tidak rentan terhadap kegagalan modifikasi dan mematuhi PRD.

---

## 5. Rekomendasi & Rencana Tindakan Hardening (Recommendations & Action Plan)

Berikut merupakan peta jalan taktis (*tactical roadmap*) untuk menutup celah keandalan sistem KiddyApps sebelum menyapa pengguna nyata di ekosistem sekolah.

### 🚀 1. Tindakan Cepat (Quick Wins — Maksimal 3 Hari Kerja)
- [ ] **Menaikkan Level Kontras Teks**: Pastikan seluruh label berwarna abu-abu muda diubah total menjadi `text-slate-500` atau `text-slate-650` di seluruh wilayah dasbor dan modal. *(Sudah tuntas dioptimasi pada iterasi terakhir)*.
- [ ] **Menyematkan Filter Skala Gambar**: Sisipkan pustaka kompresor kanvas ringan (`browser-image-compression` atau logika utilitas Canvas asli) pada modul `Unggah Foto Bukti Belajar`.
- [ ] **Lockdown API Route**: Pindahkan panggilan model cerdas Gemini sepenuhnya ke server internal di `/api/chat` atau `/api/summarize`, lindungi kata kunci API privat agar tidak terekspos di browser DevTools murid atau orang luar.

### 🛡️ 2. Penguatan Offline & Jaringan (Offline-first Fortification — Jangka Menengah)
- [ ] **Pemberitahuan Transaksi Sync**: Implementasikan bar kemajuan (*progress bar*) luring yang mencatat sisa antrean sinkronisasi IndexedDB ke Firebase Firestore (contoh: *"Menyimpan 3 dari 12 data asesmen luring..."*).
- [ ] **Pre-fetching Data Roster**: Saat status koneksi prima, lakukan pengunduhan otomatis seluruh riwayat penulisan rapor milik kelas itu, sehingga guru dapat merevisi naskah tanpa membutuhkan koneksi internet sama sekali.
- [ ] **Gawai Validasi NISN**: Sempurnakan kolom pengisian NISN di modul Operator dengan fungsi ekspresi reguler (*regex*) agar mencegah kesalahan ketik numerik oleh Operator TU.

### 🤖 3. Penyelarasan Pedagogis & AI (Pedagogical Alignment — Jangka Panjang)
- [ ] **Penyuntingan Manual Sebelum Simpan**: Beri guru keleluasaan penuh untuk merevisi hasil generator narasi AI secara langsung pada sebuah teks area fleksibel sebelum menyimpannya ke database rapor akhir. AI bertugas sebagai asisten draf pertama, guru bertugas sebagai kurator akhir.
- [ ] **Gaya Bahasa Lokal**: Tambahkan opsi suasana narasi pada pengaturan profil sekolah (misalkan: Suasana Formal Islami, Suasana Kristen Holistik, atau Suasana Nasionalis Merdeka) agar diksi AI Gemini selaras dengan napas filosofis sekolahan masing-masing.

---
*Dokumen ini merupakan sertifikasi audit bahwa KiddyApps siap menjalani fase hardening teknis menuju keefektifan sistem digital PAUD/TK di Indonesia.*
