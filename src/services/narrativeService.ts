import { Aspect, ScoreData } from "../types";

const narrativeTemplates = {
  BSB: [
    "{student} menunjukkan kepiawaian yang luar biasa saat {indicator}. Kelancaran dan kemandiriannya menjadi inspirasi nyata bagi teman-temannya.",
    "Dalam hal {indicator}, ananda {student} telah mencapai level penguasaan yang sangat matang, menunjukkan inisiatif yang muncul secara alami.",
    "Alhamdulillah, {student} tampak begitu percaya diri ketika {indicator}. Ia mengekspresikan kemampuannya dengan penuh konsistensi dan kegembiraan.",
    "Kami melihat pancaran bakat yang kuat saat {student} {indicator}. Ia melakukan setiap tahapannya dengan sangat rapi dan mandiri.",
    "Kualitas fokus {student} saat {indicator} layak mendapatkan apresiasi tinggi; ananda melakukannya nyaris tanpa arahan lagi.",
    "Sangat mengesankan melihat bagaimana {student} {indicator} dengan penuh gairah dan ketelitian di setiap langkahnya.",
    "{student} memperlihatkan kematangan emosional dan teknis yang luar biasa saat terlibat dalam {indicator}.",
    "Kemampuan ananda dalam {indicator} sudah sangat solid, mencerminkan dedikasi dan minatnya yang besar terhadap aktivitas tersebut.",
  ],
  BSH: [
    "{student} sudah sangat terbiasa dan mampu {indicator} dengan baik. Hal ini menunjukkan perkembangan yang sangat sehat sesuai usianya.",
    "Ananda memperlihatkan kesiapan mental yang stabil saat {indicator}, menuntaskan setiap bagiannya dengan penuh tanggung jawab.",
    "Dalam pelaksanaan {indicator}, {student} terlihat sangat nyaman. Ia memahami setiap instruksi dan menjalankannya dengan runtut.",
    "Sangat membahagiakan melihat {student} sudah mandiri dalam hal {indicator}. Capaian ini merupakan fondasi yang baik untuk tahap selanjutnya.",
    "Ketekunan {student} saat {indicator} membuahkan hasil yang memuaskan, di mana ia mampu melakukannya tanpa kendala berarti.",
    "Terlihat kemajuan yang konsisten pada {student} saat mengikuti sesi {indicator} di kelas bersama teman-temannya.",
    "Ananda {student} menunjukkan adaptasi yang sangat baik terhadap tuntutan kegiatan {indicator} dengan hasil yang positif.",
    "Kecakapan {student} dalam {indicator} terus meningkat, mencerminkan pemahaman yang baik atas setiap arahan yang diberikan.",
  ],
  MB: [
    "{student} mulai menaruh minat yang besar untuk mencoba {indicator}. Kami terus memberikan dorongan positif agar ia semakin mantap.",
    "Proses eksplorasi {student} dalam {indicator} sedang berkembang. Sesekali ia masih membutuhkan bimbingan lembut untuk meningkatkan kepercayaan dirinya.",
    "Munculnya keberanian {student} saat {indicator} adalah sinyal positif. Stimulasi yang berkelanjutan akan membantunya mencapai kemandirian penuh.",
    "Ada progress yang cukup menarik pada {student} terkait {indicator}. Ia sedang belajar untuk lebih fokus dan teliti dalam aktivitas tersebut.",
    "Ananda mulai aktif berpartisipasi dalam {indicator}, meskipun dukungan guru masih diperlukan untuk menjaga konsistensi tindakannya.",
    "Kami mengamati adanya upaya keras dari {student} untuk menuntaskan {indicator} meskipun terkadang masih butuh motivasi tambahan.",
    "Potensi {student} dalam {indicator} mulai terlihat nyata melalui keterlibatannya yang semakin intens setiap harinya.",
    "Meskipun masih dalam tahap awal, ketertarikan {student} terhadap {indicator} memberikan harapan besar bagi perkembangannya ke depan.",
  ],
  BB: [
    "Untuk saat ini, {student} masih memerlukan pendampingan yang sabar dan intensif dalam kegiatan {indicator}.",
    "Ananda sedang kami arahkan secara perlahan untuk mengenal dan menyukai {indicator}. Dukungan penuh kasih sangat krusial di tahap pengenalan ini.",
    "Dalam hal {indicator}, {student} masih membutuhkan contoh nyata dan bantuan teknis agar bisa beradaptasi dengan ritme di kelas.",
    "Fokus utama kami adalah menumbuhkan rasa nyaman {student} saat {indicator}, karena ananda terkadang masih merasa ragu untuk memulai.",
    "Kami terus mengupayakan berbagai stimulasi agar {student} lebih terbuka dan berani dalam {indicator} melalui pendekatan individu.",
    "Kesabaran dalam membimbing {student} saat {indicator} menjadi kunci utama agar ananda merasa aman dalam bereksplorasi.",
    "Ananda {student} sedang dalam proses membangun rasa percaya diri untuk mencoba hal baru seperti {indicator} di sekolah.",
    "Bantuan individu masih sangat kami prioritaskan untuk {student} agar ia dapat mengikuti aktivitas {indicator} dengan lebih lancar.",
  ],
};

const transitions = [
  "Bukan hanya itu saja,",
  "Selain pencapaian tersebut,",
  "Sejalan dengan hal itu,",
  "Ditambah lagi,",
  "Menarik juga untuk dicatat bahwa",
  "Dari sisi lain,",
  "Kemudian dalam momen lainnya,",
  "Lebih lanjut lagi,",
  "Secara paralel,",
  "Dalam kesempatan berbeda,",
  "Di sisi perkembangan lainnya,",
];

const openingPhrases = [
  "\tLaporan periode ini menunjukkan potret menarik dari {student}. ",
  "\tSepanjang semester, {student} melalui banyak momen berharga. ",
  "\tKami mengamati dinamika positif dalam perjalanan belajar {student}. ",
  "\tMelalui observasi, ananda {student} memperlihatkan antusiasme tinggi. ",
];

function getRandom(array: string[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateIndependentNarrative(studentName: string, aspect: Aspect, scores: ScoreData) {
  const name = studentName.split(' ')[0];
  
  // Create a pool to track used templates to avoid repetition
  const usedTemplates = new Set<string>();

  const getUniqueTemplate = (score: string) => {
    const options = narrativeTemplates[score as keyof typeof narrativeTemplates];
    // Filter out templates that have been used (if possible)
    const availableOptions = options.filter(t => !usedTemplates.has(t));
    const finalPool = availableOptions.length > 0 ? availableOptions : options;
    
    const template = getRandom(finalPool);
    usedTemplates.add(template);
    return template;
  };

  // Grouping indicators to form structured paragraphs
  // Filter to only indicators that have actual scores to avoid unnecessary BB noise
  const indicators = aspect.indicators.filter(ind => !!scores[ind.id]);
  
  if (indicators.length === 0) {
    return {
      narrative: `Laporan pengembangan untuk aspek ${aspect.name} belum tersedia karena belum ada indikator yang dinilai pada periode ini.`,
      advice: "Mari mulai memberikan penilaian pada aspek ini agar kami dapat memberikan ulasan yang akurat."
    };
  }

  // 1. Group indicators by score
  const highIndicators = indicators.filter(i => scores[i.id] === 'BSB' || scores[i.id] === 'BSH');
  const midIndicators = indicators.filter(i => scores[i.id] === 'MB');
  const lowIndicators = indicators.filter(i => scores[i.id] === 'BB');

  // 2. Pick up to 2 High, 2 Low, 2 Mid. 
  // We prioritize high/low to give a balanced review, then pad with mid if needed.
  let selectedIndicators = [
    ...highIndicators.slice(0, 2),
    ...lowIndicators.slice(0, 2),
    ...midIndicators.slice(0, 2)
  ];
  
  // If we have very few selected, we might want to just grab more from the others if available to reach at least 3-4 if possible
  if (selectedIndicators.length < 3) {
      const remainingHigh = highIndicators.slice(2);
      const remainingMid = midIndicators.slice(2);
      const remainingLow = lowIndicators.slice(2);
      selectedIndicators = [...selectedIndicators, ...remainingHigh, ...remainingMid, ...remainingLow].slice(0, 4);
  }

  // Sort them so the narrative flows a bit better (High -> Mid -> Low)
  selectedIndicators.sort((a, b) => {
    const order = { 'BSB': 1, 'BSH': 2, 'MB': 3, 'BB': 4 };
    return order[scores[a.id] as keyof typeof order] - order[scores[b.id] as keyof typeof order];
  });

  const processParagraph = (items: typeof aspect.indicators, isOpening: boolean = false) => {
    let narrativeParts: string[] = [];
    
    items.forEach((indicator, index) => {
      const score = scores[indicator.id] || "BB";
      const template = getUniqueTemplate(score);
      
      // Vary the subject reference to avoid repeating the student name too much
      let subject = name;
      if (index === 1) subject = "Ananda";
      if (index === 2) subject = name;
      
      let sentence = template
        .replace(/{student}/g, subject)
        .replace(/{indicator}/g, indicator.text.toLowerCase());
      
      // Sparingly add transitions
      if (index === 1 && items.length > 2) {
        const trans = getRandom(transitions);
        sentence = `${trans} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
      }
      
      narrativeParts.push(sentence);
    });

    return (isOpening ? "" : "\t") + narrativeParts.join(' ');
  };

  const opening = getRandom(openingPhrases).replace(/{student}/g, name);
  const fullNarrative = opening + processParagraph(selectedIndicators, true);

  // Advice logic (variety for advice too)
  const scoreValues = Object.values(scores).map(s => {
    if (s === "BSB") return 4;
    if (s === "BSH") return 3;
    if (s === "MB") return 2;
    return 1;
  });
  
  const avgScore = scoreValues.length > 0 
    ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length 
    : 1;

  let advice = "";
  if (avgScore >= 3.5) {
    const excellentAdvice = [
      `Secara keseluruhan, ananda ${name} adalah sosok yang sangat inspiratif. Mari kita terus pupuk rasa percayadirinya agar ia semakin bersinar di masa depan.`,
      `Pencapaian ${name} sangat membanggakan. Terus berikan ruang eksplorasi yang luas di rumah untuk menjaga semangat belajarnya tetap tinggi.`,
      `Kami sangat mengapresiasi kemandirian ${name}. Konsistensi dukungan emosional dari orang tua akan membantunya mempertahankan performa luar biasa ini.`
    ];
    advice = getRandom(excellentAdvice);
  } else if (avgScore >= 2.5) {
    const goodAdvice = [
      `Progress yang stabil telah ditunjukkan ${name}. Konsistensi stimulasi di rumah berupa apresiasi kecil namun bermakna akan sangat memperkuat fondasi belajarnya.`,
      `${name} menunjukkan potensi yang besar. Sedikit dorongan untuk lebih berani mencoba hal baru akan membantunya mencapai kematangan yang lebih optimal.`,
      `Pendampingan yang suportif saat di rumah akan sangat membantu ${name} dalam mengasah kemampuannya yang sedang berkembang saat ini.`
    ];
    advice = getRandom(goodAdvice);
  } else {
    const struggleAdvice = [
      `Dukungan penuh kasih dan kesabaran sangat dibutuhkan ${name} saat ini. Mari kita selaraskan pola bimbingan baik di sekolah maupun di rumah agar ananda merasa lebih aman dalam bereksplorasi.`,
      `${name} sedang dalam masa adaptasi yang penting. Memberikan rasa nyaman dan apresiasi atas setiap usaha kecilnya akan sangat berarti bagi perkembangan mentalnya.`,
      `Fokus kita saat ini adalah membangun rasa aman bagi ${name}. Mari jalin komunikasi intensif antara sekolah dan rumah untuk memberikan stimulasi yang tepat.`
    ];
    advice = getRandom(struggleAdvice);
  }

  return {
    narrative: fullNarrative,
    advice: advice
  };
}
