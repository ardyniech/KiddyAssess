import { AtomText, AtomBadge, AtomInput } from "../atoms/CommonAtoms";
import { Aspect, Student, ScoreData, SchoolProfile } from "../../types";
import { Download, Sparkles, Loader2, FileText, Settings, School, UserCheck, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "motion/react";

interface OrganismPDFPreviewProps {
  student: Student;
  aspect: Aspect;
  scores: ScoreData;
}

const DEFAULT_PROFILE: SchoolProfile = {
  name: "TK TUNAS HARAPAN BANGSA",
  address: "Jl. Pendidikan No. 123, Menteng, Jakarta Pusat",
  phone: "021-555-1234",
  email: "info@tunasharapan.sch.id",
  principalName: "Hj. Siti Aminah, S.Pd",
  teacherName: "Ardy Syafii, S.Pd"
};

export function OrganismPDFPreview({ student, aspect, scores }: OrganismPDFPreviewProps) {
  const [narrative, setNarrative] = useState<string>("");
  const [parentAdvice, setParentAdvice] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState<SchoolProfile>(DEFAULT_PROFILE);

  const generateNarrative = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.name,
          aspectName: aspect.name,
          indicators: aspect.indicators,
          scores: scores,
        }),
      });
      const data = await response.json();
      setNarrative(data.narrative);
      setParentAdvice(data.parentAdvice);
    } catch (error) {
      console.error("Narrative Generation Failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById("pdf-target");
    if (!element) return;

    try {
      // Ensure the element is visible and rendered correctly for canvas
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for printing
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const finalImgHeight = canvasHeight / ratio;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(finalImgHeight, pdfHeight));
      pdf.save(`Rapor_${student.name}_${aspect.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Export Failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const completedCount = Object.keys(scores).length;

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8 px-4">
      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-card p-8 rounded-[2.5rem]">
        <div>
          <AtomText variant="h2" className="font-display uppercase tracking-tight text-3xl">Pusat Laporan & Narasi</AtomText>
          <div className="flex items-center gap-2 mt-2 opacity-60">
            <School className="w-4 h-4" />
            <AtomText variant="body" className="font-medium text-sm">{profile.name}</AtomText>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10"
          >
            <Settings className={showSettings ? "animate-spin" : ""} size={16} />
            Edit Profil Sekolah
          </button>
          <button
            onClick={generateNarrative}
            disabled={isGenerating || completedCount < 1}
            className="flex items-center gap-3 px-8 py-3.5 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Hasilkan Report (AI)
          </button>
          <button
            onClick={exportPDF}
            disabled={!narrative || isExporting}
            className="flex items-center gap-3 px-8 py-3.5 bg-white text-slate-900 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95 hover:bg-slate-100"
          >
             {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Settings Overlay / Expandable */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden glass-card rounded-[2rem] p-8 border-sky-500/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <AtomText variant="h3" className="text-sky-400 flex items-center gap-2 text-sm">
                  <School size={16} /> Identitas Sekolah
                </AtomText>
                <AtomInput label="Nama Sekolah" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                <AtomInput label="Alamat" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
              </div>
              <div className="space-y-4">
                <AtomText variant="h3" className="text-sky-400 flex items-center gap-2 text-sm">
                  <Phone size={16} /> Kontak
                </AtomText>
                <AtomInput label="Telepon" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                <AtomInput label="Email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <div className="space-y-4">
                <AtomText variant="h3" className="text-sky-400 flex items-center gap-2 text-sm">
                  <UserCheck size={16} /> Tanda Tangan
                </AtomText>
                <AtomInput label="Kepala Sekolah" value={profile.principalName} onChange={e => setProfile({...profile, principalName: e.target.value})} />
                <AtomInput label="Guru Kelas" value={profile.teacherName} onChange={e => setProfile({...profile, teacherName: e.target.value})} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-sky-500/20 p-2 rounded-xl">
                  <FileText className="w-5 h-5 text-sky-400" />
                </div>
                <AtomText variant="h3" className="font-display text-lg">Narasi Perkembangan</AtomText>
              </div>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Narasi akan muncul di sini setelah generate..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white/80 text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar focus:ring-1 focus:ring-sky-500/50"
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/20 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <AtomText variant="h3" className="font-display text-lg">Parent Advice (Saran)</AtomText>
              </div>
              <textarea
                value={parentAdvice}
                onChange={(e) => setParentAdvice(e.target.value)}
                placeholder="Saran untuk orang tua di rumah..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white/80 text-sm italic leading-relaxed focus:outline-none resize-none custom-scrollbar focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* PDF Design Preview Container */}
        <div className="lg:col-span-3">
           <div className="bg-white/5 rounded-[2.5rem] p-4 border border-white/10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent pointer-events-none" />
              
              {/* This is the actual target for PDF export */}
              <div className="bg-white p-12 lg:p-16 shadow-2xl rounded-[2px] w-full mx-auto pdf-font-fix origin-top transition-transform duration-500" id="pdf-target" style={{ width: '210mm', minHeight: '297mm', color: '#1e293b' }}>
              
                {/* PROFESSIONAL KOP SURAT */}
                <div className="flex items-center gap-8 border-b-4 border-double border-slate-900 pb-6 mb-10">
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                      <School size={48} className="text-slate-300" />
                  </div>
                  <div className="grow text-center pr-12">
                      <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: '#0f172a' }}>{profile.name}</h1>
                      <p className="text-[11px] font-bold mt-1 text-slate-500 uppercase tracking-widest">{profile.address}</p>
                      <div className="flex justify-center gap-4 mt-2 text-[10px] font-medium text-slate-400">
                        <span className="flex items-center gap-1"><Phone size={10} /> {profile.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={10} /> {profile.email}</span>
                      </div>
                  </div>
                </div>

                <div className="text-center mb-10">
                  <h2 className="text-xl font-black uppercase tracking-[0.2em]" style={{ color: '#0f172a' }}>Laporan Perkembangan Harian</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-1 text-sky-600">Learning Insights v2.0</p>
                </div>

                {/* Identity Table */}
                <div className="bg-slate-50 p-6 rounded-lg grid grid-cols-2 gap-y-3 mb-10 text-[11px] font-bold border border-slate-100">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5 shrink-0" />
                    <span className="uppercase text-slate-400 tracking-widest">Nama Murid</span>
                  </div>
                  <div className="uppercase tracking-wider" style={{ color: '#0f172a' }}>: {student.name}</div>
                  
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0" />
                    <span className="uppercase text-slate-400 tracking-widest">Kelas / SMT</span>
                  </div>
                  <div className="uppercase tracking-wider" style={{ color: '#0f172a' }}>: {student.class} / Semester {student.semester}</div>

                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0" />
                    <span className="uppercase text-slate-400 tracking-widest">Aspek Fokus</span>
                  </div>
                  <div className="uppercase tracking-wider" style={{ color: '#0f172a' }}>: {aspect.name}</div>
                </div>

                {/* Assessment Content */}
                <div className="mb-10 min-h-[300px]">
                  <div className="flex items-center gap-3 mb-4">
                      <FileText size={16} className="text-slate-900" />
                      <h3 className="text-xs font-black uppercase tracking-[0.1em] border-b-2 border-slate-900 pb-1">Deskripsi Narasi Perkembangan</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-justify font-medium px-4 border-l-2 border-slate-100" style={{ color: '#334155' }}>
                    {narrative || "Assessment notes are currently being processed. Please generate the report to see the full analysis here."}
                  </p>
                </div>

                {/* Parent Advice Section */}
                <div className="mb-14 p-8 bg-sky-50/50 rounded-2xl border-2 border-dashed border-sky-100 relative">
                  <div className="absolute -top-3 left-6 bg-white px-3 flex items-center gap-2">
                      <Sparkles size={14} className="text-sky-500" />
                      <span className="text-[10px] font-black uppercase text-sky-600 tracking-widest">Saran Untuk Orang Tua</span>
                  </div>
                  <p className="text-[12px] leading-relaxed italic font-semibold text-slate-600">
                      {parentAdvice || "Tips for home-based support will appear here once the report is generated."}
                  </p>
                </div>

                {/* Digital Signatures Area */}
                <div className="mt-auto pt-10 grid grid-cols-2 gap-32 text-center">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-16 text-slate-400">Mengetahui,<br/>Orang Tua / Wali</p>
                    <p className="text-[11px] font-black text-slate-900 border-t-2 border-slate-100 pt-2">( ........................................ )</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
                    <div className="flex flex-col gap-10">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-12 text-slate-400">Guru Kelas</p>
                          <p className="text-[11px] font-black text-slate-900 underline underline-offset-4 decoration-sky-300">{profile.teacherName}</p>
                        </div>
                        <div className="mt-8 border-t-2 border-double border-slate-100 pt-8">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-12 text-slate-400">Kepala Sekolah</p>
                          <p className="text-[11px] font-black text-slate-900">{profile.principalName}</p>
                          <p className="text-[8px] font-bold text-slate-400 mt-1">NIP. ................................</p>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t text-[7px] text-center font-black uppercase tracking-[0.5em] text-slate-200">
                  Verified Security Seal • KiddyAssess Engine • Processed: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <div className="mt-8 text-center text-slate-500 text-xs italic">
                Pratinjau Layout Desktop (Skala PDF dapat berbeda saat diunduh untuk optimalisasi cetak)
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
