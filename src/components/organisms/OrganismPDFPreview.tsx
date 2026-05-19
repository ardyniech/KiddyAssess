import { AtomText, AtomBadge, AtomInput } from "../atoms/CommonAtoms";
import { Aspect, Student, ScoreData, SchoolProfile } from "../../types";
import { Download, Sparkles, Loader2, FileText, Settings, School, UserCheck, MapPin, Phone, Mail, Upload, Image as ImageIcon, Zap, ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";
import { useState, ChangeEvent, useRef, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
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
  const [paperSize, setPaperSize] = useState<'A4' | 'F4'>('A4');
  const [showPhotos, setShowPhotos] = useState(false);
  const [pendingShare, setPendingShare] = useState<{file: File, name: string} | null>(null);
  const [profile, setProfile] = useState<SchoolProfile | null>(null);

  const [isLoadingResources, setIsLoadingResources] = useState(true);

  const loadResources = useCallback(async () => {
    setIsLoadingResources(true);
    try {
      const photos = await db.photos.where('studentId').equals(student.id).toArray();
      const schoolP = await getSchoolProfile();
      
      // Convert logo to base64 for PDF stability if it exists
      if (schoolP?.logoUrl && !schoolP.logoUrl.startsWith('data:')) {
        try {
          const resp = await fetch(schoolP.logoUrl, { mode: 'cors' });
          const blob = await resp.blob();
          const reader = new FileReader();
          schoolP.logoUrl = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn("Failed to convert logo to base64:", e);
        }
      }
      
      setProfile(schoolP);
      setShowPhotos(schoolP?.showPhotos !== false);
      
      // Use base64 stored in previewUrl or convert blobs to base64 for absolute stability with html2canvas/PDF
      const processedPhotos = await Promise.all(photos.map(async (photo) => {
        if (photo.previewUrl && photo.previewUrl.startsWith('data:')) {
            return photo;
        }
        return new Promise<AssessmentPhoto>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              ...photo,
              previewUrl: reader.result as string
            });
          };
          reader.onerror = () => reject(new Error("Failed to read blob"));
          reader.readAsDataURL(photo.blob);
        }).catch(() => photo);
      }));
      
      setStudentPhotos(processedPhotos);
    } finally {
      setIsLoadingResources(false);
    }
  }, [student.id]);

  useEffect(() => {
    loadResources();
    
    // Populate with system offline narratives on first load to save API calls
    const hasAnyScore = Object.values(allScores).some(scoreMap => Object.keys(scoreMap).length > 0);
    if (hasAnyScore && Object.keys(narratives).length === 0) {
        const newNarratives: typeof narratives = {};
        for (const asp of aspects) {
           const scores = allScores[asp.id] || {};
           if (Object.keys(scores).length > 0) {
               newNarratives[asp.id] = generateIndependentNarrative(student.name, asp, scores);
           }
        }
        setNarratives(newNarratives);
    }
  }, [student.id, allScores, profile?.useAINarrative, loadResources]);

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
        // ALWAYS use local independent generation for the parent advice!
        const localResult = generateIndependentNarrative(student.name, aspect, scores);
        
        setNarratives(prev => ({
          ...prev,
          [aspect.id]: { 
            narrative: result.narrative, 
            advice: localResult.advice 
          }
        }));
      }
    } catch (err: any) {
      console.warn("AI Single Generation failed, applying offline fallback:", err.message);
      // Fallback
      const scores = allScores[aspect.id] || {};
      const fallbackResult = generateIndependentNarrative(student.name, aspect, scores);
      setNarratives(prev => ({
          ...prev,
          [aspect.id]: fallbackResult
      }));
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
          try {
            const result = await generateStudentNarrative(
              student.name, 
              asp.name, 
              asp.indicators, 
              scores as Record<string, string>
            );
            if (result) {
              const localResult = generateIndependentNarrative(student.name, asp, scores);
              newNarratives[asp.id] = { 
                narrative: result.narrative, 
                advice: localResult.advice 
              };
            }
          } catch (apiErr: any) {
             console.warn("AI Generation specific failed for aspect, applying offline fallback:", apiErr.message);
             // Apply fallback directly without disrupting the rest of the loops
             newNarratives[asp.id] = generateIndependentNarrative(student.name, asp, scores);
          }
        }
      }
      setNarratives(newNarratives);
    } catch (err: any) {
      console.error("AI All Generation failed:", err);
      // Fallback for any aspects that haven't been generated yet during error
      const newNarratives: typeof narratives = { ...narratives };
      for (const asp of aspects) {
          const scores = allScores[asp.id] || {};
          if (Object.keys(scores).length > 0 && !newNarratives[asp.id]) {
               newNarratives[asp.id] = generateIndependentNarrative(student.name, asp, scores);
          }
      }
      setNarratives(newNarratives);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = async (triggerShare: boolean = false) => {
    setIsExporting(true);
    // Force a re-render cycle to ensure zoom: 1 for capturing
    setZoom(1);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use selected paper size dimensions in mm
    const paperDimensions = paperSize === 'A4' ? [210, 297] : [210, 330];
    const pdf = new jsPDF("p", "mm", paperDimensions);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    try {
      const aspectsToExport = aspects;
      for (let i = 0; i < aspectsToExport.length; i++) {
        const aspect = aspectsToExport[i];
        const element = document.getElementById(`pdf-page-${aspect.id}`);
        if (!element) continue;

        // Ensure all images are loaded
        const images = Array.from(element.querySelectorAll('img'));
        await Promise.all(images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); 
          });
        }));

        const canvas = await html2canvas(element, {
          scale: 4, // High DPI for production quality
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 15000,
          allowTaint: false,
          scrollX: -window.scrollX,
          scrollY: -window.scrollY,
          windowWidth: document.documentElement.clientWidth,
          windowHeight: document.documentElement.clientHeight,
        });
        
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        
        if (i > 0) pdf.addPage(paperDimensions);
        // Map canvas exactly to paper
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
      
      const fileName = `Raport_${student.name.replace(/\s+/g, '_')}_${aspects.length}Hal.pdf`;
      const pdfBlob = pdf.output('blob');

      if (triggerShare && navigator.share) {
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          setPendingShare({ file, name: fileName });
      } else {
          pdf.save(fileName);
      }
    } catch (error) {
      console.error("PDF Export Failed:", error);
      alert("Gagal membuat PDF. Pastikan koneksi stabil.");
    } finally {
      setIsExporting(false);
      fitToWidth(); // Back to responsive zoom
    }
  };

  const handleShareConfirm = async () => {
    if (!pendingShare) return;
    try {
        if (navigator.canShare && navigator.canShare({ files: [pendingShare.file] })) {
            await navigator.share({
                files: [pendingShare.file],
                title: pendingShare.name,
                text: 'Berikut adalah laporan perkembangan anak.'
            });
        } else {
            // Fallback download if share not supported for this file
            const url = URL.createObjectURL(pendingShare.file);
            const a = document.createElement('a');
            a.href = url;
            a.download = pendingShare.name;
            a.click();
            URL.revokeObjectURL(url);
        }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
             console.warn("Share failed:", error);
        }
    } finally {
        setPendingShare(null);
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

  const aspectsToRender = aspects;

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
          
          <div className="flex-1 lg:flex-none flex items-center gap-2">
            <button
              onClick={() => setShowPhotos(!showPhotos)}
              className={cn("flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all border-black/5 flex-1 sm:flex-none", showPhotos ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "glass-card hover:bg-black/10 dark:hover:bg-white/10 text-slate-800 dark:text-white")}
            >
              <ImageIcon size={16} />
              <span className="hidden sm:inline">Foto Dok.</span>
            </button>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as 'A4' | 'F4')}
              className="px-4 py-2.5 glass-card outline-none border-0 box-border focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold tracking-tight text-slate-800 dark:text-white transition-all cursor-pointer"
            >
              <option value="A4" className="text-slate-800">Kertas A4</option>
              <option value="F4" className="text-slate-800">Kertas F4</option>
            </select>
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-2 px-4 py-2.5 glass-card hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-sm font-bold tracking-tight transition-all border-black/5"
            >
              <Settings className="text-slate-600 dark:text-white" size={16} />
              <span className="text-slate-800 dark:text-white hidden sm:inline">Setting Kop</span>
            </button>
          </div>
          {profile?.useAINarrative !== false && (
            <button
              onClick={generateAllNarratives}
              disabled={isGenerating || totalCompletedIndicators < 1}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-black tracking-tight shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate AI Semua
            </button>
          )}
          <div className="flex gap-2">
            <button
                onClick={loadResources}
                disabled={isLoadingResources}
                className="flex items-center justify-center p-2.5 glass-card hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all border-black/5"
                title="Refresh Foto & Data"
            >
                <RefreshCw size={16} className={cn(isLoadingResources && "animate-spin")} />
            </button>
            <button
                onClick={() => exportPDF(false)}
                disabled={isExporting || isLoadingResources || totalCompletedIndicators < 1}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-black tracking-tight shadow-md disabled:opacity-50 transition-all active:scale-95"
            >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Unduh
            </button>
            <button
                onClick={() => exportPDF(true)}
                disabled={isExporting || totalCompletedIndicators < 1}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black tracking-tight shadow-2xl disabled:opacity-50 transition-all active:scale-95 hover:bg-slate-800 dark:hover:bg-slate-100"
            >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Siap Kirim
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex flex-col gap-8 md:gap-16 items-center w-full py-8 overflow-x-hidden">
        {aspectsToRender.map((aspect) => {
          const content = narratives[aspect.id] || { narrative: "", advice: "" };
          const pWidth = 210; // mm
          const pHeight = paperSize === 'A4' ? 297 : 330; // mm
          
          return (
            <div key={aspect.id} className="relative group w-full flex flex-col items-center">
              <div className="mb-4 flex items-center gap-4">
                 <div className="px-4 py-1.5 bg-sky-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">Lembar {aspects.indexOf(aspect) + 1}: {aspect.name}</div>
              </div>
              
              <div 
                className="w-full glass-card rounded-3xl md:rounded-[2.5rem] p-4 relative flex justify-center custom-scrollbar overflow-hidden"
                style={{ 
                  height: `${pHeight * zoom + 120}mm`,
                  transition: 'height 0.3s ease'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent pointer-events-none" />
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 py-20 px-4">
                  <div 
                    className="flex flex-col justify-between gap-6 px-[18mm] py-[25mm] md:px-[22mm] md:py-[30mm] shrink-0 pdf-font-fix pdf-compat overflow-hidden relative bg-white" 
                    id={`pdf-page-${aspect.id}`} 
                    style={{ 
                      width: `${pWidth}mm`, 
                      minHeight: `${pHeight}mm`,
                      maxHeight: `${pHeight}mm`,
                      height: `${pHeight}mm`, 
                      color: '#1e293b',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 40px 100px -20px rgba(15, 23, 42, 0.4)',
                      transform: isExporting ? 'none' : `scale(${zoom})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                
                  {/* PROFESSIONAL KOP SURAT */}
                  <div className="flex items-center gap-6 border-b-2 pb-3 shrink-0" style={{ borderColor: '#0f172a' }}>
                    <div className="w-16 h-16 flex items-center justify-center shrink-0">
                      {profile.logoUrl ? (
                        <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" crossOrigin="anonymous" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-200" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                          <School size={32} style={{ color: '#cbd5e1' }} />
                        </div>
                      )}
                    </div>
                    <div className="grow text-center pr-16">
                        <h1 className="text-xl font-black uppercase tracking-tight leading-none" style={{ color: '#0f172a' }}>{profile.name}</h1>
                        <p className="text-[10px] font-bold mt-1.5 uppercase tracking-widest leading-loose" style={{ color: '#64748b' }}>{profile.address}</p>
                        <div className="flex justify-center gap-4 mt-2 text-[9px] font-bold" style={{ color: '#94a3b8' }}>
                          <span className="flex items-center gap-1 uppercase tracking-tighter"><Phone size={8} /> {profile.phone}</span>
                          <span className="flex items-center gap-1 uppercase tracking-tighter"><Mail size={8} /> {profile.email}</span>
                        </div>
                    </div>
                  </div>
   
                  {/* Title and Identity Group */}
                  <div className="shrink-0 flex flex-col gap-4 mt-2">
                    <div className="text-center">
                      <h2 className="text-base font-black uppercase tracking-[0.25em]" style={{ color: '#0f172a' }}>Laporan Perkembangan Anak</h2>
                      <div className="h-1 w-24 bg-sky-500 mx-auto mt-2 rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3" style={{ color: '#0284c7' }}>ASPEK: {aspect.name}</p>
                    </div>
    
                    {/* Identity Table */}
                    <div className="p-3 rounded-2xl grid grid-cols-2 gap-y-2 text-[10px] font-black border-2 border-slate-50" style={{ backgroundColor: '#f8fafc' }}>
                      <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#38bdf8' }} />
                        <span className="uppercase tracking-widest text-[#94a3b8]">Nama Murid</span>
                      </div>
                      <div className="uppercase tracking-wider text-[#0f172a]">: {student.name}</div>
                      
                      <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#e2e8f0' }} />
                        <span className="uppercase tracking-widest text-[#94a3b8]">Kelas / SMT</span>
                      </div>
                      <div className="uppercase tracking-wider text-[#0f172a]">: {student.class} / Semester {student.semester}</div>
                    </div>
                  </div>
   
                  <div className="relative group/narrative flex flex-col justify-center shrink overflow-hidden min-h-[60mm]">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <FileText size={14} style={{ color: '#0f172a' }} />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#0f172a' }}>Capaian Belajar</h3>
                        </div>
                    </div>
                    <div className="text-[11px] leading-[1.8] text-justify font-medium px-4 border-l-2 whitespace-pre-wrap overflow-hidden" style={{ color: '#334155', borderColor: '#f1f5f9', maxHeight: '75mm' }}>
                      {content.narrative || "Laporan sedang disusun otomatis..."}
                    </div>
                  </div>
                  
                  {/* Photo Documentation Section */}
                  {showPhotos && (
                    <div className="shrink-0 mt-2">
                       <div className="flex items-center justify-between mb-3 shrink-0">
                          <div className="flex items-center gap-2.5">
                              <ImageIcon size={14} style={{ color: '#0f172a' }} />
                              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#0f172a' }}>Bukti Belajar</h3>
                          </div>
                      </div>
                      <div className="flex justify-evenly items-center gap-4 mx-auto w-full px-2">
                          {(() => {
                            const aspectPhotos = studentPhotos.filter(p => p.aspectId === aspect.id).slice(0, 3);
                            return [0, 1, 2].map((idx) => {
                              const photo = aspectPhotos[idx];
                                return (
                                <div key={idx} className="w-24 aspect-[4/5] rounded-[1.25rem] flex flex-col items-center justify-center overflow-hidden relative border border-slate-100 shrink-0 shadow-sm" style={{ backgroundColor: '#fcfdfe' }}>
                                  {photo ? (
                                    <img 
                                      src={photo.previewUrl} 
                                      className="w-full h-full object-cover" 
                                      alt="Documentation"
                                      crossOrigin="anonymous"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <>
                                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mb-1">
                                        <ImageIcon size={14} style={{ color: '#e2e8f0' }} />
                                      </div>
                                      <span className="text-[7px] font-black uppercase tracking-tighter" style={{ color: '#cbd5e1' }}>Foto {idx + 1}</span>
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
                  <div className="p-4 rounded-3xl border border-sky-50 relative shrink-0 mt-2" style={{ backgroundColor: '#f0f9ff' }}>
                    <p className="text-[10px] leading-relaxed italic font-bold" style={{ color: '#0369a1' }}>
                        "{content.advice || "Sarankan pendampingan rutin di rumah."}"
                    </p>
                  </div>
   
                  {/* Footer Group */}
                  <div className="shrink-0 flex flex-col gap-6 mt-auto">
                    {/* Digital Signatures Area */}
                    {profile.showSignature !== false && (
                      <div className="shrink-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-6 text-right" style={{ color: '#64748b' }}>
                          {profile.address ? profile.address.split(",")[1] || "Jakarta" : "Jakarta"}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        
                        <div className="grid grid-cols-3 gap-0 text-center">
                          {/* 1. Wali Murid */}
                          <div className="flex flex-col justify-between min-h-[70px]">
                            <p className="text-[8px] font-black uppercase tracking-widest leading-relaxed text-[#94a3b8]">
                              Orang Tua / Wali
                            </p>
                            <div className="pt-2">
                              <p className="text-[10px] font-black" style={{ color: '#cbd5e1' }}>( ................................ )</p>
                            </div>
                          </div>
   
                          {/* 2. Kepala Sekolah */}
                          <div className="flex flex-col justify-between min-h-[70px]">
                            <p className="text-[8px] font-black uppercase tracking-widest leading-relaxed text-[#94a3b8]">
                              Kepala Sekolah
                            </p>
                            <div className="pt-2 px-1">
                              <p className="text-[10px] font-black underline decoration-slate-200 underline-offset-4" style={{ color: '#0f172a' }}>
                                {profile.principalName || "................................"}
                              </p>
                            </div>
                          </div>
   
                          {/* 3. Guru Kelas */}
                          <div className="flex flex-col justify-between min-h-[70px]">
                            <p className="text-[8px] font-black uppercase tracking-widest leading-relaxed text-[#94a3b8]">
                              Guru Kelas
                            </p>
                            <div className="pt-2 px-1">
                              <p className="text-[10px] font-black underline decoration-sky-100 underline-offset-4" style={{ color: '#0f172a' }}>
                                {profile.teacherName || "................................"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
   
                    <div className="pt-2 text-[7px] text-center font-black uppercase tracking-[0.4em] opacity-30" style={{ color: '#0f172a' }}>
                      DIGITAL REPORT • KIDDYASSESS PRO • PAGE {aspects.indexOf(aspect) + 1}/{aspects.length}
                    </div>
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

      <AnimatePresence>
        {pendingShare && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center space-y-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                <FileText size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">PDF Siap Dibagikan!</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Dokumen laporan atas nama <strong className="text-slate-700 dark:text-slate-300">{student.name}</strong> telah berhasil dibuat dan siap untuk dikirim.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
                <button
                  onClick={() => setPendingShare(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleShareConfirm}
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  Bagikan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
