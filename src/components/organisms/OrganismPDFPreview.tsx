import { AtomText, AtomBadge, AtomInput } from "../atoms/CommonAtoms";
import { Aspect, Student, ScoreData, SchoolProfile } from "../../types";
import { Download, Sparkles, Loader2, FileText, Settings, School, UserCheck, MapPin, Phone, Mail, Upload, Image as ImageIcon, Zap, ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";
import { useState, ChangeEvent, useRef, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { generateStudentNarrative } from "../../services/aiService";
import { generateIndependentNarrative } from "../../services/narrativeService";
import { db, AssessmentPhoto } from "../../lib/db";
import { getSchoolProfile } from "../../services/settingsService";
import { syncService } from "../../lib/firebaseService";

interface OrganismPDFPreviewProps {
  student: Student;
  aspects: Aspect[];
  allScores: { [aspectId: string]: ScoreData };
  globalProgress?: number;
  onOpenSettings?: () => void;
}

export function OrganismPDFPreview({ student, aspects, allScores, globalProgress = 0, onOpenSettings }: OrganismPDFPreviewProps) {
  const [narratives, setNarratives] = useState<{ [aspectId: string]: { narrative: string; advice: string } }>({});
  const [studentPhotos, setStudentPhotos] = useState<AssessmentPhoto[]>([]);
  const [zoom, setZoom] = useState(0.8); 
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [profile, setProfile] = useState<SchoolProfile | null>(null);

  useEffect(() => {
    async function loadResources() {
      const photos = await db.photos.where('studentId').equals(student.id).toArray();
      const schoolP = await getSchoolProfile();
      setProfile(schoolP);
      
      // Convert blobs to base64 for absolute stability with html2canvas/PDF
      const processedPhotos = await Promise.all(photos.map(async (photo) => {
        return new Promise<AssessmentPhoto>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              ...photo,
              previewUrl: reader.result as string
            });
          };
          reader.readAsDataURL(photo.blob);
        });
      }));
      
      setStudentPhotos(processedPhotos);
    }
    loadResources();
    
    // Auto-generate narratives if scores exist but narratives are empty and AI is enabled
    const hasAnyScore = Object.values(allScores).some(scoreMap => Object.keys(scoreMap).length > 0);
    if (hasAnyScore && Object.keys(narratives).length === 0 && profile?.useAINarrative !== false) {
        generateAllNarratives();
    }
  }, [student.id, allScores, profile?.useAINarrative]);

  const [generatingAspects, setGeneratingAspects] = useState<Record<string, boolean>>({});

  const generateSingleAINarrative = async (aspect: Aspect) => {
    if (profile?.useAINarrative === false) return;
    
    setGeneratingAspects(prev => ({ ...prev, [aspect.id]: true }));
    try {
      const scores = allScores[aspect.id] || {};
      if (Object.keys(scores).length === 0) return;
      
      const result = await generateStudentNarrative(
        student.name, 
        aspect.name, 
        aspect.indicators, 
        scores as Record<string, string>
      );
      
      if (result) {
        setNarratives(prev => ({
          ...prev,
          [aspect.id]: { 
            narrative: result.narrative, 
            advice: result.parentAdvice 
          }
        }));
      }
    } catch (err) {
      console.error("AI Single Generation failed:", err);
    } finally {
      setGeneratingAspects(prev => ({ ...prev, [aspect.id]: false }));
    }
  };

  const generateAllNarratives = async () => {
    if (profile?.useAINarrative === false) return;
    setIsGenerating(true);
    
    try {
      const newNarratives: typeof narratives = { ...narratives };
      for (const asp of aspects) {
        const scores = allScores[asp.id] || {};
        if (Object.keys(scores).length > 0) {
          // If real AI enabled, use it
          const result = await generateStudentNarrative(
            student.name, 
            asp.name, 
            asp.indicators, 
            scores as Record<string, string>
          );
          if (result) {
            newNarratives[asp.id] = { 
              narrative: result.narrative, 
              advice: result.parentAdvice 
            };
          }
        }
      }
      setNarratives(newNarratives);
    } catch (err) {
      console.error("AI All Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    // Use custom F4 dimensions [210, 330] in mm
    const pdf = new jsPDF("p", "mm", [210, 330]);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    try {
      const aspectsToExport = aspects.slice(0, 3);
      for (let i = 0; i < aspectsToExport.length; i++) {
        const aspect = aspectsToExport[i];
        const element = document.getElementById(`pdf-page-${aspect.id}`);
        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 3, // Very high resolution for professional print
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 0,
          allowTaint: true,
        });
        
        const imgData = canvas.toDataURL("image/png");
        
        if (i > 0) pdf.addPage([210, 330]);
        // Cover full page width and height for ready-to-print result
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`Raport_F4_${student.name}.pdf`);
    } catch (error) {
      console.error("PDF Export Failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const totalPossibleIndicators = aspects.reduce((acc, curr) => acc + curr.indicators.length, 0);
  const totalCompletedIndicators = aspects.reduce((acc, curr) => {
    return acc + Object.keys(allScores[curr.id] || {}).length;
  }, 0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  
  const fitToWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth - 48; // Padding
      const pdfWidthPx = 210 * 3.78; // 210mm to px (~794px)
      const newZoom = Math.min(containerWidth / pdfWidthPx, 1);
      setZoom(newZoom);
    }
  }, []);

  useEffect(() => {
    // Initial fit
    const timer = setTimeout(fitToWidth, 300);
    
    const handleResize = () => fitToWidth();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [fitToWidth]);

  if (!profile) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-sky-500" size={40} />
        <AtomText variant="body">Mempersiapkan Lembar Raport...</AtomText>
    </div>
  );

  const aspectsToRender = aspects.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto py-1 md:py-1.5 space-y-1.5 md:space-y-4 px-1.5 md:px-2">
      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 md:gap-3 glass-card p-3 md:p-5 rounded-2xl md:rounded-[2rem] border-black/5">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <AtomText variant="h2" className="font-black tracking-tight text-2xl md:text-3xl text-slate-900 dark:text-white">Review Raport {aspectsToRender.length} Halaman</AtomText>
             <div className="bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20">
                <span className="text-xs md:text-sm font-black text-sky-500">{Math.round(globalProgress)}%</span>
             </div>
          </div>
          <div className="flex items-center gap-2 opacity-70">
            <School className="w-4 h-4 text-sky-500" />
            <AtomText variant="body" className="font-bold text-xs md:text-sm text-slate-600 dark:text-slate-300">{profile.name} • {student.name}</AtomText>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-xl px-2 gap-1 mr-2 border border-black/5">
            <button 
              onClick={handleZoomOut} 
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Zoom Keluar"
            >
              <ZoomOut size={16} />
            </button>
            <div className="min-w-[45px] text-center">
              <span className="text-[10px] font-black text-slate-500">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button 
              onClick={handleZoomIn} 
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Zoom Masuk"
            >
              <ZoomIn size={16} />
            </button>
            <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />
            <button 
              onClick={fitToWidth} 
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Fit to Card"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          
          <button
            onClick={onOpenSettings}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 glass-card hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-sm font-bold tracking-tight transition-all border-black/5"
          >
            <Settings className="text-slate-600 dark:text-white" size={16} />
            <span className="text-slate-800 dark:text-white">Setting Kop</span>
          </button>
          {profile?.useAINarrative !== false && (
            <button
              onClick={generateAllNarratives}
              disabled={isGenerating || totalCompletedIndicators < 1}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-black tracking-tight shadow-xl shadow-sky-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh Narasi
            </button>
          )}
          <button
            onClick={exportPDF}
            disabled={isExporting || totalCompletedIndicators < 1}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black tracking-tight shadow-2xl disabled:opacity-50 transition-all active:scale-95 hover:bg-slate-800 dark:hover:bg-slate-100"
          >
             {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Ekspor Semua Halaman
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex flex-col gap-8 md:gap-16 items-center w-full py-8 overflow-x-hidden">
        {aspectsToRender.map((aspect) => {
          const content = narratives[aspect.id] || { narrative: "", advice: "" };
          const pWidth = 210; // mm
          const pHeight = 330; // mm (F4 Size)
          
          return (
            <div key={aspect.id} className="relative group w-full flex flex-col items-center">
              <div className="mb-4 flex items-center gap-4">
                 <div className="px-4 py-1.5 bg-sky-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">Lembar {aspects.indexOf(aspect) + 1}: {aspect.name}</div>
              </div>
              
              <div 
                className="w-full glass-card rounded-3xl md:rounded-[2.5rem] p-4 relative flex justify-center custom-scrollbar overflow-hidden"
                style={{ 
                  height: narratives[aspect.id] ? `${pHeight * zoom + 120}mm` : 'auto',
                  transition: 'height 0.3s ease'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent pointer-events-none" />
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 py-20 md:py-24">
                  <div 
                    className="bg-white p-10 md:p-14 lg:p-16 shadow-2xl rounded-[2px] shrink-0 pdf-font-fix shadow-black/20" 
                    id={`pdf-page-${aspect.id}`} 
                    style={{ 
                      width: `${pWidth}mm`, 
                      minHeight: `${pHeight}mm`, 
                      color: '#1e293b',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                
                  {/* PROFESSIONAL KOP SURAT */}
                  <div className="flex items-center gap-4 md:gap-8 border-b-4 border-double border-slate-900 pb-4 md:pb-6 mb-6 md:mb-10">
                    <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center shrink-0">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                          <School size={48} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="grow text-center pr-24">
                        <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: '#0f172a' }}>{profile.name}</h1>
                        <p className="text-[11px] font-bold mt-1 text-slate-500 uppercase tracking-widest">{profile.address}</p>
                        <div className="flex justify-center gap-4 mt-2 text-[10px] font-medium text-slate-400">
                          <span className="flex items-center gap-1"><Phone size={10} /> {profile.phone}</span>
                          <span className="flex items-center gap-1"><Mail size={10} /> {profile.email}</span>
                        </div>
                    </div>
                  </div>
  
                  <div className="text-center mb-10">
                    <h2 className="text-xl font-black uppercase tracking-[0.2em]" style={{ color: '#0f172a' }}>Laporan Perkembangan Anak</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-1 text-sky-600">Aspek: {aspect.name}</p>
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
                  </div>
  
                  {/* Assessment Content */}
                  <div className="mb-6 min-h-[350px] relative group/narrative">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FileText size={16} className="text-slate-900" />
                            <h3 className="text-xs font-black uppercase tracking-[0.1em] border-b-2 border-slate-900 pb-1">Ulasan Capaian {aspect.name}</h3>
                        </div>
                        {profile.useAINarrative !== false && (
                          <button 
                            onClick={() => generateSingleAINarrative(aspect)}
                            disabled={generatingAspects[aspect.id] || Object.keys(allScores[aspect.id] || {}).length === 0}
                            className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-white text-[9px] font-black uppercase rounded-lg shadow-lg shadow-cyan-500/20 transition-all opacity-0 group-hover/narrative:opacity-100 disabled:opacity-30"
                          >
                            {generatingAspects[aspect.id] ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                            AI Regene
                          </button>
                        )}
                    </div>
                    <div className="text-[13px] leading-[1.8] text-justify font-medium px-4 border-l-2 border-slate-200 whitespace-pre-wrap" style={{ color: '#334155', tabSize: 4 }}>
                      {content.narrative || "Sedang memproses narasi penilaian... Mohon berikan 1 indikator skor terlebih dahulu jika belum."}
                    </div>
                  </div>

                  {/* Photo Documentation Section */}
                  {profile.showPhotos !== false && (
                    <div className="mb-10">
                      <div className="flex items-center gap-3 mb-4">
                          <ImageIcon size={16} className="text-slate-900" />
                          <h3 className="text-xs font-black uppercase tracking-[0.1em] border-b-2 border-slate-900 pb-1">Dokumentasi Kegiatan</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3 h-[130px]">
                          {(() => {
                            const aspectPhotos = studentPhotos.filter(p => p.aspectId === aspect.id).slice(0, 3);
                            return [0, 1, 2].map((idx) => {
                              const photo = aspectPhotos[idx];
                              return (
                                <div key={idx} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                                  {photo ? (
                                    <img 
                                      src={photo.previewUrl} 
                                      className="w-full h-full object-cover" 
                                      alt="Documentation"
                                      crossOrigin="anonymous"
                                      referrerPolicy="no-referrer"
                                      style={{ imageRendering: 'auto' }}
                                    />
                                  ) : (
                                    <>
                                      <ImageIcon size={24} className="text-slate-200" />
                                      <span className="text-[8px] font-black uppercase text-slate-300 tracking-tighter">Foto {idx + 1}</span>
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent" />
                                    </>
                                  )}
                                </div>
                              );
                            });
                          })()}
                      </div>
                    </div>
                  )}
  
                  {/* Parent Advice Section */}
                  <div className="mb-14 p-8 bg-sky-50/50 rounded-2xl border-2 border-dotted border-sky-200 relative">
                    <div className="absolute -top-3 left-6 bg-white px-3 flex items-center gap-2">
                        <Sparkles size={14} className="text-sky-500" />
                        <span className="text-[10px] font-black uppercase text-sky-600 tracking-widest">Pesan Edukasi</span>
                    </div>
                    <p className="text-[12px] leading-relaxed italic font-semibold text-slate-600">
                        {content.advice || "Saran pola asuh akan muncul setelah narasi diproses."}
                    </p>
                  </div>
  
                  {/* Digital Signatures Area */}
                  {profile.showSignature !== false && (
                    <div className="mt-auto pt-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-right text-slate-400">
                        {profile.address.split(",")[1] || "Jakarta"}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        {/* 1. Kepala Sekolah */}
                        <div className="flex flex-col justify-between min-h-[140px]">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
                            Mengetahui,<br/>Kepala Sekolah
                          </p>
                          <div className="pt-4">
                            <p className="text-[11px] font-black text-slate-900 underline underline-offset-4 decoration-slate-200">
                              {profile.principalName || "........................................"}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">NIP. .........................</p>
                          </div>
                        </div>

                        {/* 2. Wali Murid */}
                        <div className="flex flex-col justify-between min-h-[140px]">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
                            Tanda Tangan,<br/>Orang Tua / Wali
                          </p>
                          <div className="pt-4">
                            <p className="text-[11px] font-black text-slate-400">( ........................................ )</p>
                            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Wali Murid</p>
                          </div>
                        </div>

                        {/* 3. Guru Kelas */}
                        <div className="flex flex-col justify-between min-h-[140px]">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
                            Disusun Oleh,<br/>Guru Kelas
                          </p>
                          <div className="pt-4">
                            <p className="text-[11px] font-black text-slate-900 underline underline-offset-4 decoration-sky-300">
                              {profile.teacherName || "........................................"}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Pendidik</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {profile.reportNote && (
                    <div className="mt-8 text-[9px] text-center font-medium italic text-slate-400">
                      {profile.reportNote}
                    </div>
                  )}
  
                  <div className="mt-12 pt-8 border-t text-[7px] text-center font-black uppercase tracking-[0.5em] text-slate-200">
                    Official Academic Record • KiddyAssess v2.5 • Page {aspects.indexOf(aspect) + 1} of {aspects.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
        <div className="text-center text-slate-500 text-xs italic pb-20">
          Akhir dari Pratinjau Raport. Pastikan semua lembar telah terisi narasi sebelum ekspor.
        </div>
      </div>
    </div>
  );
}
