import { AssessmentScale } from "../../../types";

export interface KartikaIndicator {
  id: string;
  text: string;
}

export interface KartikaAspect {
  id: string;
  name: string;
  indicators: KartikaIndicator[];
}

export const KARTIKA_5NK_ASPECTS: KartikaAspect[] = [
  {
    id: "cinta_tanah_air",
    name: "I. NILAI CINTA TANAH AIR",
    indicators: [
      { id: "cta_01", text: "Menghormati bendera merah putih saat upacara" },
      { id: "cta_02", text: "Menyanyikan lagu kebangsaan Indonesia Raya" },
      { id: "cta_03", text: "Menyebutkan nama Presiden dan Wakil Presiden RI" },
      { id: "cta_04", text: "Mengenal lambang negara Garuda Pancasila" },
      { id: "cta_05", text: "Menghormati guru, orang tua dan sesama teman" }
    ]
  },
  {
    id: "disiplin",
    name: "II. NILAI DISIPLIN",
    indicators: [
      { id: "dsp_01", text: "Datang ke sekolah tepat waktu" },
      { id: "dsp_02", text: "Mengikuti kegiatan di sekolah dengan tertib" },
      { id: "dsp_03", text: "Membereskan peralatan main/belajar setelah digunakan" },
      { id: "dsp_04", text: "Menunggu giliran (antre) dengan sabar" },
      { id: "dsp_05", text: "Mematuhi tata tertib sekolah yang berlaku" }
    ]
  },
  {
    id: "berbudi_luhur",
    name: "III. NILAI BERBUDI LUHUR",
    indicators: [
      { id: "bbl_01", text: "Mengucapkan salam dan membalas salam" },
      { id: "bbl_02", text: "Menggunakan kata santun (tolong, terima kasih, maaf)" },
      { id: "bbl_03", text: "Berdoa sebelum dan sesudah melakukan kegiatan" },
      { id: "bbl_04", text: "Menyayangi tanaman dan binatang ciptaan Tuhan" },
      { id: "bbl_05", text: "Saling membantu dan berbagi dengan teman" }
    ]
  },
  {
    id: "cerdas",
    name: "IV. NILAI CERDAS",
    indicators: [
      { id: "crd_01", text: "Mampu menyelesaikan tugas tepat pada waktunya" },
      { id: "crd_02", text: "Memiliki rasa ingin tahu tinggi (gemar bertanya)" },
      { id: "crd_03", text: "Mampu mengelompokkan benda berdasarkan ciri tertentu" },
      { id: "crd_04", text: "Mampu bercerita tentang pengalaman sehari-hari" },
      { id: "crd_05", text: "Mengenal konsep lambang bilangan dan huruf" }
    ]
  },
  {
    id: "terampil",
    name: "V. NILAI TERAMPIL",
    indicators: [
      { id: "trm_01", text: "Terampil menggunakan tangan kanan dan kiri (motorik halus)" },
      { id: "trm_02", text: "Melakukan gerakan fisik secara terkoordinasi (motorik kasar)" },
      { id: "trm_03", text: "Mampu merawat diri sendiri (cuci tangan, memakai sepatu)" },
      { id: "trm_04", text: "Aktif dan bersemangat dalam kegiatan seni/olahraga" },
      { id: "trm_05", text: "Mampu mengekspresikan diri melalui karya kreatif" }
    ]
  }
];
