import { AtomText, AtomBadge, AtomInput } from "../atoms/CommonAtoms";
import { Aspect, Student, ScoreData, SchoolProfile } from "../../types";
import {
  Download,
  Sparkles,
  Loader2,
  FileText,
  Settings,
  School,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Upload,
  Image as ImageIcon,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import React, { useState, ChangeEvent, useRef, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { generateStudentNarrative, refineStudentText } from "../../services/aiService";
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
  savedNarratives: Record<
    string,
    {
      narrative: string;
      advice: string;
      tone?: string;
      customNotes?: string;
      lengthTarget?: "short" | "standard";
    }
  >;
  onNarrativesChange: (
    narratives: Record<
      string,
      {
        narrative: string;
        advice: string;
        tone?: string;
        customNotes?: string;
        lengthTarget?: "short" | "standard";
      }
    >,
  ) => void;
}

export function OrganismPDFPreview({
  student,
  aspects,
  allScores,
  globalProgress = 0,
  onOpenSettings,
  savedNarratives,
  onNarrativesChange,
}: OrganismPDFPreviewProps) {
  const [activeMode, setActiveMode] = useState<"editor" | "preview">("editor");
  const narratives = savedNarratives;
  const setNarratives = (updater: any) => {
    if (typeof updater === "function") {
      onNarrativesChange(updater(savedNarratives));
    } else {
      onNarrativesChange(updater);
    }
  };

  const updateAspectNarrative = (
    aspectId: string,
    fields: Partial<(typeof savedNarratives)[string]>,
  ) => {
    const existing = savedNarratives[aspectId] || {
      narrative: "",
      advice: "",
      tone: "default",
      customNotes: "",
      lengthTarget: "standard",
    };
    setNarratives((prev: any) => ({
      ...prev,
      [aspectId]: {
        ...existing,
        ...fields,
      },
    }));
  };

  const [refiningFields, setRefiningFields] = useState<Record<string, boolean>>({});

  const refineTextHandler = async (
    aspectId: string,
    aspectName: string,
    field: "narrative" | "advice",
    action: "polish" | "shorten" | "constructive"
  ) => {
    const key = `${aspectId}-${field}`;
    const currentText = (savedNarratives[aspectId] as any)?.[field] || "";
    if (!currentText.trim()) return;

    setRefiningFields((prev) => ({ ...prev, [key]: true }));
    try {
      const refined = await refineStudentText(
        currentText,
        `${aspectName} (${field === "advice" ? "Saran Orang Tua" : "Narasi Capaian"})`,
        action
      );
      if (refined) {
        updateAspectNarrative(aspectId, { [field]: refined });
      }
    } catch (err) {
      console.error("Gagal melakukan penyempurnaan teks:", err);
    } finally {
      setRefiningFields((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getAspectShortName = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("agama")) return "Agama & Moral";
    if (lower.includes("jati diri")) return "Jati Diri";
    if (lower.includes("literasi") || lower.includes("steam")) return "Literasi STEAM";
    return name.split(/[,&]/)[0].trim();
  };

  const scrollToAspect = (aspectId: string) => {
    const elementId = activeMode === "editor"
      ? `aspect-editor-${aspectId}`
      : `aspect-preview-${aspectId}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const [studentPhotos, setStudentPhotos] = useState<AssessmentPhoto[]>([]);
  const [zoom, setZoom] = useState(0.8);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [paperSize, setPaperSize] = useState<"A4" | "F4">("A4");
  const [showPhotos, setShowPhotos] = useState(false);
  const [pendingShare, setPendingShare] = useState<{
    file: File;
    name: string;
  } | null>(null);
  const [profile, setProfile] = useState<SchoolProfile | null>(null);

  const [isLoadingResources, setIsLoadingResources] = useState(true);

  const loadResources = useCallback(async () => {
    setIsLoadingResources(true);
    try {
      const photos = await db.photos
        .where("studentId")
        .equals(student.id)
        .toArray();
      const schoolP = await getSchoolProfile();

      // Convert logo to base64 for PDF stability if it exists
      if (schoolP?.logoUrl && !schoolP.logoUrl.startsWith("data:")) {
        try {
          const resp = await fetch(schoolP.logoUrl, { mode: "cors" });
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
      const processedPhotos = await Promise.all(
        photos.map(async (photo) => {
          if (photo.previewUrl && photo.previewUrl.startsWith("data:")) {
            return photo;
          }
          return new Promise<AssessmentPhoto>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                ...photo,
                previewUrl: reader.result as string,
              });
            };
            reader.onerror = () => reject(new Error("Failed to read blob"));
            reader.readAsDataURL(photo.blob);
          }).catch(() => photo);
        }),
      );

      setStudentPhotos(processedPhotos);
    } finally {
      setIsLoadingResources(false);
    }
  }, [student.id]);

  useEffect(() => {
    loadResources();

    // Populate with system offline narratives on first load to save API calls
    const hasAnyScore = Object.values(allScores).some(
      (scoreMap) => Object.keys(scoreMap).length > 0,
    );
    if (hasAnyScore && Object.keys(narratives).length === 0) {
      const newNarratives: typeof narratives = {};
      for (const asp of aspects) {
        const scores = allScores[asp.id] || {};
        if (Object.keys(scores).length > 0) {
          const localResult = generateIndependentNarrative(
            student.name,
            asp,
            scores,
          );
          newNarratives[asp.id] = {
            narrative: localResult.narrative,
            advice: localResult.advice,
            tone: "default",
            customNotes: "",
            lengthTarget: "standard",
          };
        }
      }
      setNarratives(newNarratives);
    }
  }, [student.id, allScores, loadResources]);

  const [generatingAspects, setGeneratingAspects] = useState<
    Record<string, boolean>
  >({});

  const generateSingleAINarrative = async (aspect: Aspect) => {
    setGeneratingAspects((prev) => ({ ...prev, [aspect.id]: true }));
    try {
      const scores = allScores[aspect.id] || {};
      if (Object.keys(scores).length === 0) return;

      const config = savedNarratives[aspect.id] || {
        narrative: "",
        advice: "",
        tone: "default",
        customNotes: "",
        lengthTarget: "standard",
      };

      const result = await generateStudentNarrative(
        student.name,
        aspect.name,
        aspect.indicators,
        scores as Record<string, string>,
        config.tone || "default",
        config.customNotes || "",
        config.lengthTarget || "standard",
      );

      if (result) {
        setNarratives((prev) => ({
          ...prev,
          [aspect.id]: {
            ...config,
            narrative: result.narrative,
            advice:
              result.parentAdvice ||
              result.advice ||
              "Pendampingan konsisten di rumah.",
          },
        }));
      }
    } catch (err: any) {
      console.warn(
        "AI Single Generation failed, applying offline fallback:",
        err.message,
      );
      const scores = allScores[aspect.id] || {};
      const fallbackResult = generateIndependentNarrative(
        student.name,
        aspect,
        scores,
      );
      const config = savedNarratives[aspect.id] || {
        narrative: "",
        advice: "",
        tone: "default",
        customNotes: "",
        lengthTarget: "standard",
      };
      setNarratives((prev) => ({
        ...prev,
        [aspect.id]: {
          ...config,
          narrative: fallbackResult.narrative,
          advice: fallbackResult.advice,
        },
      }));
    } finally {
      setGeneratingAspects((prev) => ({ ...prev, [aspect.id]: false }));
    }
  };

  const generateAllNarratives = async () => {
    setIsGenerating(true);
    try {
      const newNarratives = { ...savedNarratives };
      for (const asp of aspects) {
        const scores = allScores[asp.id] || {};
        if (Object.keys(scores).length > 0) {
          const config = savedNarratives[asp.id] || {
            narrative: "",
            advice: "",
            tone: "default",
            customNotes: "",
            lengthTarget: "standard",
          };
          try {
            const result = await generateStudentNarrative(
              student.name,
              asp.name,
              asp.indicators,
              scores as Record<string, string>,
              config.tone || "default",
              config.customNotes || "",
              config.lengthTarget || "standard",
            );
            if (result) {
              newNarratives[asp.id] = {
                ...config,
                narrative: result.narrative,
                advice:
                  result.parentAdvice ||
                  result.advice ||
                  "Pendampingan belajar yang konsisten.",
              };
            }
          } catch (apiErr: any) {
            console.warn(
              "AI Generation specific failed for aspect, applying offline fallback:",
              apiErr.message,
            );
            const localResult = generateIndependentNarrative(
              student.name,
              asp,
              scores,
            );
            newNarratives[asp.id] = {
              ...config,
              narrative: localResult.narrative,
              advice: localResult.advice,
            };
          }
        }
      }
      setNarratives(newNarratives);
    } catch (err: any) {
      console.error("AI All Generation failed:", err);
      const newNarratives = { ...savedNarratives };
      for (const asp of aspects) {
        const scores = allScores[asp.id] || {};
        if (
          Object.keys(scores).length > 0 &&
          !newNarratives[asp.id]?.narrative
        ) {
          const localResult = generateIndependentNarrative(
            student.name,
            asp,
            scores,
          );
          newNarratives[asp.id] = {
            narrative: localResult.narrative,
            advice: localResult.advice,
            tone: "default",
            customNotes: "",
            lengthTarget: "standard",
          };
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use selected paper size dimensions in mm
    const paperDimensions = paperSize === "A4" ? [210, 297] : [210, 330];
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
        const images = Array.from(element.querySelectorAll("img"));
        await Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });
          }),
        );

        const canvas = await html2canvas(element, {
          scale: 4, // High DPI for production quality
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 15000,
          allowTaint: false,
          scrollX: 0,
          scrollY: 0,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        if (i > 0) pdf.addPage(paperDimensions);
        // Map canvas exactly to paper
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          pdfWidth,
          pdfHeight,
          undefined,
          "FAST",
        );
      }

      const fileName = `Raport_${student.name.replace(/\s+/g, "_")}_${aspects.length}Hal.pdf`;
      const pdfBlob = pdf.output("blob");

      if (triggerShare && navigator.share) {
        const file = new File([pdfBlob], fileName, { type: "application/pdf" });
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
      if (
        navigator.canShare &&
        navigator.canShare({ files: [pendingShare.file] })
      ) {
        await navigator.share({
          files: [pendingShare.file],
          title: pendingShare.name,
          text: "Berikut adalah laporan perkembangan anak.",
        });
      } else {
        // Fallback download if share not supported for this file
        const url = URL.createObjectURL(pendingShare.file);
        const a = document.createElement("a");
        a.href = url;
        a.download = pendingShare.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.warn("Share failed:", error);
      }
    } finally {
      setPendingShare(null);
    }
  };

  const totalPossibleIndicators = aspects.reduce(
    (acc, curr) => acc + curr.indicators.length,
    0,
  );
  const totalCompletedIndicators = aspects.reduce((acc, curr) => {
    return acc + Object.keys(allScores[curr.id] || {}).length;
  }, 0);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.3));

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
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [fitToWidth]);

  if (!profile)
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-sky-500" size={40} />
        <AtomText variant="body">Mempersiapkan Lembar Raport...</AtomText>
      </div>
    );

  const aspectsToRender = aspects;

  return (
    <div className="max-w-7xl mx-auto py-1 md:py-1.5 space-y-4 px-1.5 md:px-2">
      {/* Mode Switcher Buttons */}
      <div className="flex items-center p-1 bg-slate-150/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md mx-auto shadow-sm">
        <button
          onClick={() => setActiveMode("editor")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
            activeMode === "editor"
              ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 shadow-md font-bold"
              : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Edit & Generator Narasi
        </button>
        <button
          onClick={() => setActiveMode("preview")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
            activeMode === "preview"
              ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 shadow-md font-bold"
              : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Pratinjau Kertas Raport
        </button>
      </div>

      {/* Sticky Fast Aspect Jump Navigation */}
      <div className="sticky top-0 z-40 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-sm py-2 border-y border-slate-200 dark:border-slate-850 -mx-1.5 px-3 md:-mx-2 md:px-4 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex items-center gap-1.5 shadow-xs transition-all">
        <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider bg-slate-200/50 dark:bg-slate-800/60 px-2 py-1 rounded-lg shrink-0">
          Loncat Halaman:
        </span>
        {aspectsToRender.map((aspect, idx) => {
          const content = savedNarratives[aspect.id] || { narrative: "", advice: "" };
          const aspectScores = allScores[aspect.id] || {};
          
          const hasScore = Object.keys(aspectScores).length > 0;
          const hasNarrative = !!content.narrative?.trim();
          const hasAdvice = !!content.advice?.trim();
          
          let statusColor = "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900";
          let badgeColor = "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
          
          if (hasNarrative && hasAdvice && hasScore) {
            statusColor = "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20";
            badgeColor = "bg-emerald-600 text-white";
          } else if (hasNarrative || hasAdvice || hasScore) {
            statusColor = "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20";
            badgeColor = "bg-amber-500 text-white";
          }
          
          return (
            <button
              key={aspect.id}
              onClick={() => scrollToAspect(aspect.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-xl text-xs font-bold tracking-tight border shrink-0 transition-all duration-150 hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs",
                statusColor
              )}
            >
              <span className={cn("inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black shrink-0", badgeColor)}>
                {idx + 1}
              </span>
              <span className="truncate text-[11px] font-extrabold">{getAspectShortName(aspect.name)}</span>
            </button>
          );
        })}
      </div>

      {activeMode === "editor" ? (
        /* ==================== NARRATIVE GENERATOR & EDITOR WORKSPACE ==================== */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-950 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-500">
                Workspace Narasi
              </span>
              <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-white">
                {student.name}
              </h2>
              <p className="text-[11px] text-slate-500 font-bold">
                Sesuaikan nada, panjang, atau edit langsung teks capaian raport
                semester ini.
              </p>
            </div>
            {profile?.useAINarrative !== false && (
              <button
                onClick={generateAllNarratives}
                disabled={isGenerating || totalCompletedIndicators < 1}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-xs font-black tracking-tight shadow-md disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate AI Semua
              </button>
            )}
          </div>

          <div className="space-y-4">
            {aspectsToRender.map((aspect) => {
              const content = savedNarratives[aspect.id] || {
                narrative: "",
                advice: "",
                tone: "default",
                customNotes: "",
                lengthTarget: "standard",
              };
              const aspectScores = allScores[aspect.id] || {};
              const isGeneratingThis = generatingAspects[aspect.id];

              const wordCount = content.narrative
                ? content.narrative.length
                : 0;
              const isOutOfLimit = wordCount > 450;

              const adviceCount = content.advice ? content.advice.length : 0;
              const isAdviceOutOfLimit = adviceCount > 200;

              return (
                <div
                  key={aspect.id}
                  id={`aspect-editor-${aspect.id}`}
                  className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col gap-3 shadow-sm scroll-mt-28"
                >
                  {/* Aspect Header */}
                  <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Aspek {aspects.indexOf(aspect) + 1}
                      </span>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {aspect.name}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                        Object.keys(aspectScores).length > 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {Object.keys(aspectScores).length > 0
                        ? `${Object.keys(aspectScores).length} Indikator Dinilai`
                        : "Belum Dinilai"}
                    </span>
                  </div>

                  {/* Score Indicators Summary */}
                  {Object.keys(aspectScores).length > 0 && (
                    <div className="flex flex-wrap gap-1 md:gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                      {aspect.indicators.map((ind) => {
                        const score = aspectScores[ind.id];
                        if (!score) return null;
                        return (
                          <div
                            key={ind.id}
                            className="flex items-center gap-1.5 bg-white dark:bg-slate-850 border border-black/5 dark:border-white/5 px-2 py-0.5 rounded-lg text-[9px] font-bold"
                          >
                            <span className="text-slate-550 dark:text-slate-400 line-clamp-1 max-w-[150px]">
                              {ind.text}
                            </span>
                            <span
                              className={cn(
                                "px-1 py-0.2 rounded text-[7px] font-black text-white",
                                score === "BSB"
                                  ? "bg-blue-500"
                                  : score === "BSH"
                                    ? "bg-emerald-500"
                                    : score === "MB"
                                      ? "bg-orange-500"
                                      : "bg-red-500",
                              )}
                            >
                              {score}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* AI Generator Controls option panel */}
                  {profile?.useAINarrative !== false && (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/10 rounded-xl space-y-3">
                      <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                        <Sparkles size={14} className="animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          Konfigurasi Narasi Kemajuan AI
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Tone Choice */}
                        <div>
                          <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            Nada Bahasa
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { id: "default", label: "Formal" },
                              { id: "appreciative", label: "Apresiatif" },
                              { id: "constructive", label: "Konstruktif" },
                            ].map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() =>
                                  updateAspectNarrative(aspect.id, {
                                    tone: t.id as any,
                                  })
                                }
                                className={cn(
                                  "text-[9px] font-black px-2 py-1 rounded-md transition-all border border-transparent cursor-pointer",
                                  content.tone === t.id ||
                                    (!content.tone && t.id === "default")
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300",
                                )}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Length Choice */}
                        <div>
                          <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            Target Panjang Narasi
                          </label>
                          <div className="flex gap-1">
                            {[
                              { id: "standard", label: "Standar (~450)" },
                              { id: "short", label: "Ringkas (~250)" },
                            ].map((len) => (
                              <button
                                key={len.id}
                                type="button"
                                onClick={() =>
                                  updateAspectNarrative(aspect.id, {
                                    lengthTarget: len.id as any,
                                  })
                                }
                                className={cn(
                                  "flex-1 text-[9px] font-black px-2 py-1 rounded-md transition-all border border-transparent cursor-pointer",
                                  content.lengthTarget === len.id ||
                                    (!content.lengthTarget &&
                                      len.id === "standard")
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300",
                                )}
                              >
                                {len.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Custom Notes */}
                      <div>
                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 font-sans">
                          Catatan Tambahan Khusus Guru (Opsional)
                        </label>
                        <input
                          type="text"
                          value={content.customNotes || ""}
                          onChange={(e) =>
                            updateAspectNarrative(aspect.id, {
                              customNotes: e.target.value,
                            })
                          }
                          placeholder="Masukkan catatan khusus anak (contoh: sangat antusias saat menceritakan kembali cerita)"
                          className="w-full text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white font-semibold"
                        />
                        {/* Quick Presets Vocabulary Booster */}
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <span className="text-[7px] font-black uppercase text-slate-400 self-center tracking-widest mr-1">Bantuan Kata:</span>
                          {[
                            "Sangat mandiri",
                            "Fokus konsisten",
                            "Aktif bekerja sama",
                            "Santun berbicara",
                            "Berpikir kreatif",
                            "Berani tampil",
                            "Butuh bimbingan mandiri",
                            "Perlu stimulus fokus"
                          ].map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => {
                                const current = content.customNotes || "";
                                const sep = current ? ", " : "";
                                updateAspectNarrative(aspect.id, { customNotes: current + sep + term });
                              }}
                              className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded border border-black/5 dark:border-white/5 transition-colors cursor-pointer"
                            >
                              + {term}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => generateSingleAINarrative(aspect)}
                        disabled={
                          isGeneratingThis ||
                          Object.keys(aspectScores).length === 0
                        }
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow duration-150 disabled:opacity-50 active:scale-98 cursor-pointer"
                      >
                        {isGeneratingThis ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Menyusun Narasi AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Generate Narasi dengan AI
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Narrative text fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Narasi Capaian Belajar
                        </label>
                        <span
                          className={cn(
                            "text-[8px] font-black px-1.5 py-0.2 rounded",
                            isOutOfLimit
                              ? "bg-red-500/10 text-red-500 font-bold animate-pulse"
                              : "text-slate-400",
                          )}
                        >
                          {wordCount} / 450 Karakter
                        </span>
                      </div>
                      <textarea
                        value={content.narrative || ""}
                        onChange={(e) =>
                          updateAspectNarrative(aspect.id, {
                            narrative: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded-xl border border-black/5 dark:border-white/5 focus:ring-1 focus:ring-sky-500 outline-none resize-y min-h-[110px]"
                        placeholder="Tulis narasi capaian belajar perkembangan murid..."
                      />
                      
                      {/* Premium AI Refiner / Polisher Toolbar */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5 p-1 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                        <span className="text-[7.5px] font-black uppercase text-slate-455 dark:text-slate-400 tracking-wider px-1">Poles AI:</span>
                        {[
                          { action: "polish" as const, label: "Santun Formal" },
                          { action: "constructive" as const, label: "Lebih Konstruktif" },
                          { action: "shorten" as const, label: "Persingkat" }
                        ].map((opt) => {
                          const isRefiningThis = refiningFields[`${aspect.id}-narrative`];
                          return (
                            <button
                              key={opt.action}
                              type="button"
                              disabled={!content.narrative?.trim() || isRefiningThis}
                              onClick={() => refineTextHandler(aspect.id, aspect.name, "narrative", opt.action)}
                              className="text-[7.5px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                            >
                              {isRefiningThis && opt.action === "polish" && (
                                <Loader2 className="w-2 h-2 animate-spin text-indigo-500" />
                              )}
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {isOutOfLimit && (
                        <div className="flex items-center justify-between p-1.5 mt-2 bg-red-500/5 border border-red-500/15 rounded-lg">
                          <span className="text-[7.5px] text-red-500 font-extrabold uppercase tracking-wider">
                            * Karakter melebihi batas 450! Narasi akan terpotong saat ekspor.
                          </span>
                          <button
                            type="button"
                            disabled={refiningFields[`${aspect.id}-narrative`]}
                            onClick={() => refineTextHandler(aspect.id, aspect.name, "narrative", "shorten")}
                            className="px-1.5 py-0.5 bg-red-500 hover:bg-red-600 text-white rounded text-[7px] font-black uppercase tracking-widest cursor-pointer shadow flex items-center gap-1"
                          >
                            {refiningFields[`${aspect.id}-narrative`] && <Loader2 className="w-1.5 h-1.5 animate-spin" />}
                            Kompres AI
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Saran & Rekomendasi di Rumah
                        </label>
                        <span
                          className={cn(
                            "text-[8px] font-black px-1.5 py-0.2 rounded",
                            isAdviceOutOfLimit
                              ? "bg-red-500/10 text-red-500 font-bold animate-pulse"
                              : "text-slate-400",
                          )}
                        >
                          {adviceCount} / 200 Karakter
                        </span>
                      </div>
                      <textarea
                        value={content.advice || ""}
                        onChange={(e) =>
                          updateAspectNarrative(aspect.id, {
                            advice: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 rounded-xl border border-black/5 dark:border-white/5 focus:ring-1 focus:ring-sky-500 outline-none resize-y min-h-[110px]"
                        placeholder="Tulis rekomendasi praktis bagi orang tua pendamping di rumah..."
                      />

                      {/* Premium AI Refiner / Polisher Toolbar for Advice */}
                      <div className="flex flex-wrap items-center gap-1 mt-1.5 p-1 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                        <span className="text-[7.5px] font-black uppercase text-slate-455 dark:text-slate-400 tracking-wider px-1">Poles AI:</span>
                        {[
                          { action: "polish" as const, label: "Santun Formal" },
                          { action: "constructive" as const, label: "Lebih Konstruktif" },
                          { action: "shorten" as const, label: "Persingkat" }
                        ].map((opt) => {
                          const isRefiningThis = refiningFields[`${aspect.id}-advice`];
                          return (
                            <button
                              key={opt.action}
                              type="button"
                              disabled={!content.advice?.trim() || isRefiningThis}
                              onClick={() => refineTextHandler(aspect.id, aspect.name, "advice", opt.action)}
                              className="text-[7.5px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                            >
                              {isRefiningThis && opt.action === "polish" && (
                                <Loader2 className="w-2 h-2 animate-spin text-indigo-500" />
                              )}
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {isAdviceOutOfLimit && (
                        <div className="flex items-center justify-between p-1.5 mt-2 bg-red-500/5 border border-red-500/15 rounded-lg">
                          <span className="text-[7.5px] text-red-500 font-extrabold uppercase tracking-wider">
                            * Karakter melebihi batas 200! Saran dapat meluber ke halaman lain.
                          </span>
                          <button
                            type="button"
                            disabled={refiningFields[`${aspect.id}-advice`]}
                            onClick={() => refineTextHandler(aspect.id, aspect.name, "advice", "shorten")}
                            className="px-1.5 py-0.5 bg-red-500 hover:bg-red-600 text-white rounded text-[7px] font-black uppercase tracking-widest cursor-pointer shadow flex items-center gap-1"
                          >
                            {refiningFields[`${aspect.id}-advice`] && <Loader2 className="w-1.5 h-1.5 animate-spin" />}
                            Kompres AI
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================== ORIGINAL PREVIEW & PDF CONTAINER ==================== */
        <div className="space-y-4">
          {/* Header & Main Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 md:gap-3 glass-card p-3 md:p-5 rounded-2xl md:rounded-[2rem] border-black/5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <AtomText
                  variant="h2"
                  className="font-black tracking-tight text-2xl md:text-3xl text-slate-900 dark:text-white"
                >
                  Review Raport {aspectsToRender.length} Halaman
                </AtomText>
                <div className="bg-sky-500/10 px-2 py-1 rounded-lg border border-sky-500/20">
                  <span className="text-xs md:text-sm font-black text-sky-500">
                    {Math.round(globalProgress)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-70">
                <School className="w-4 h-4 text-sky-500" />
                <AtomText
                  variant="body"
                  className="font-bold text-xs md:text-sm text-slate-600 dark:text-slate-300"
                >
                  {profile.name} • {student.name}
                </AtomText>
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
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all border-black/5 flex-1 sm:flex-none cursor-pointer",
                    showPhotos
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                      : "glass-card hover:bg-black/10 dark:hover:bg-white/10 text-slate-800 dark:text-white",
                  )}
                >
                  <ImageIcon size={16} />
                  <span className="hidden sm:inline">Foto Dok.</span>
                </button>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as "A4" | "F4")}
                  className="px-4 py-2.5 glass-card outline-none border-0 box-border focus:ring-2 focus:ring-sky-500 rounded-xl text-sm font-bold tracking-tight text-slate-800 dark:text-white transition-all cursor-pointer bg-white"
                >
                  <option value="A4" className="text-slate-800">
                    Kertas A4
                  </option>
                  <option value="F4" className="text-slate-800">
                    Kertas F4
                  </option>
                </select>
                <button
                  onClick={onOpenSettings}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 glass-card hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-sm font-bold tracking-tight transition-all border-black/5 cursor-pointer"
                >
                  <Settings
                    className="text-slate-600 dark:text-white"
                    size={16}
                  />
                  <span className="text-slate-800 dark:text-white hidden sm:inline">
                    Setting Kop
                  </span>
                </button>
              </div>
              {profile?.useAINarrative !== false && (
                <button
                  onClick={generateAllNarratives}
                  disabled={isGenerating || totalCompletedIndicators < 1}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-black tracking-tight shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate AI Semua
                </button>
              )}
              <div className="flex gap-2">
                <button
                  onClick={loadResources}
                  disabled={isLoadingResources}
                  className="flex items-center justify-center p-2.5 glass-card hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all border-black/5 cursor-pointer"
                  title="Refresh Foto & Data"
                >
                  <RefreshCw
                    size={16}
                    className={cn(isLoadingResources && "animate-spin")}
                  />
                </button>
                <button
                  onClick={() => exportPDF(false)}
                  disabled={
                    isExporting ||
                    isLoadingResources ||
                    totalCompletedIndicators < 1
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-xl text-xs font-black tracking-tight shadow-md disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Unduh
                </button>
                <button
                  onClick={() => exportPDF(true)}
                  disabled={isExporting || totalCompletedIndicators < 1}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black tracking-tight shadow-2xl disabled:opacity-50 transition-all active:scale-95 hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Siap Kirim
                </button>
              </div>
            </div>
          </div>

          <div
            ref={containerRef}
            className="flex flex-col gap-8 md:gap-16 items-center w-full py-8 overflow-x-hidden"
          >
            {aspectsToRender.map((aspect) => {
              const content = narratives[aspect.id] || {
                narrative: "",
                advice: "",
              };
              const pWidth = 210; // mm
              const pHeight = paperSize === "A4" ? 297 : 330; // mm

              return (
                <div
                  key={aspect.id}
                  id={`aspect-preview-${aspect.id}`}
                  className="relative group w-full flex flex-col items-center scroll-mt-28"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="px-4 py-1.5 bg-sky-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                      Lembar {aspects.indexOf(aspect) + 1}: {aspect.name}
                    </div>
                  </div>

                  <div
                    className="w-full glass-card rounded-[2.5rem] p-4 sm:p-6 lg:p-8 relative flex flex-col items-center justify-center overflow-visible select-none"
                    style={{
                      height: `${pHeight * zoom + 48}mm`,
                      transition: "height 0.3s ease",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent pointer-events-none rounded-[2.5rem]" />
                    <div 
                      className="relative"
                      style={{
                        width: `${pWidth * zoom}mm`,
                        height: `${pHeight * zoom}mm`,
                        transition: "width 0.3s ease, height 0.3s ease",
                      }}
                    >
                      <div
                        className="flex flex-col justify-between gap-2 px-[18mm] pt-[17mm] pb-[15mm] shrink-0 pdf-font-fix pdf-compat overflow-hidden absolute top-0 left-0 bg-white"
                        id={`pdf-page-${aspect.id}`}
                        style={{
                          width: `${pWidth}mm`,
                          minHeight: `${pHeight}mm`,
                          maxHeight: `${pHeight}mm`,
                          height: `${pHeight}mm`,
                          color: profile.pdfHighContrast
                            ? "#000000"
                            : "#1e293b",
                          backgroundColor: "#ffffff",
                          boxShadow: isExporting
                            ? "none"
                            : "0 20px 55px -12px rgba(15, 23, 42, 0.25)",
                          transform: isExporting ? "none" : `scale(${zoom})`,
                          transformOrigin: "top left",
                          transition: "transform 0.3s ease",
                        }}
                      >
                        {/* PROFESSIONAL KOP SURAT */}
                        <div
                          className="flex items-center gap-4 border-b-2 pb-2 shrink-0"
                          style={{
                            borderColor: profile.pdfHighContrast
                              ? "#000000"
                              : "#0f172a",
                          }}
                        >
                          <div className="w-12 h-12 flex items-center justify-center shrink-0">
                            {profile.logoUrl ? (
                              <img
                                src={profile.logoUrl}
                                alt="Logo"
                                className={cn(
                                  "w-full h-full object-contain",
                                  profile.pdfHighContrast &&
                                    "grayscale contrast-150",
                                )}
                                crossOrigin="anonymous"
                              />
                            ) : (
                              <div
                                className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center border-2 border-slate-200"
                                style={{
                                  backgroundColor: "#f8fafc",
                                  borderColor: "#e2e8f0",
                                }}
                              >
                                <School
                                  size={24}
                                  style={{ color: "#cbd5e1" }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="grow text-center pr-12">
                            <h1
                              className="text-lg font-black uppercase tracking-tight leading-none"
                              style={{
                                color: profile.pdfHighContrast
                                  ? "#000000"
                                  : "#0f172a",
                              }}
                            >
                              {profile.name}
                            </h1>
                            <p
                              className="text-[9px] font-bold mt-1 uppercase tracking-widest leading-tight"
                              style={{
                                color: profile.pdfHighContrast
                                  ? "#000000"
                                  : "#64748b",
                              }}
                            >
                              {profile.address}
                            </p>
                            <div
                              className="flex justify-center gap-3 mt-1 text-[8px] font-bold"
                              style={{
                                color: profile.pdfHighContrast
                                  ? "#000000"
                                  : "#94a3b8",
                              }}
                            >
                              <span className="flex items-center gap-1 uppercase tracking-tighter">
                                <Phone size={6} /> {profile.phone}
                              </span>
                              <span className="flex items-center gap-1 uppercase tracking-tighter">
                                <Mail size={6} /> {profile.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Title and Identity Group */}
                        <div className="shrink-0 flex flex-col gap-2 mt-2">
                          <div className="text-center">
                            <h2
                              className="text-sm font-black uppercase tracking-[0.2em]"
                              style={{
                                color: profile.pdfHighContrast
                                  ? "#000000"
                                  : "#0f172a",
                              }}
                            >
                              Laporan Perkembangan Anak
                            </h2>
                            <div
                              className="h-0.5 w-16 bg-sky-500 mx-auto mt-1 rounded-full"
                              style={{
                                backgroundColor: profile.pdfHighContrast
                                  ? "#000000"
                                  : "#0ea5e9",
                              }}
                            />
                            <p
                              className="text-[9px] font-black uppercase tracking-[0.3em] mt-2"
                              style={{
                                color: profile.pdfHighContrast
                                  ? "#000000"
                                  : "#0284c7",
                              }}
                            >
                              ASPEK: {aspect.name}
                            </p>
                          </div>

                          {/* Identity Table */}
                          <div
                            className="p-2 rounded-xl grid grid-cols-2 gap-y-1 text-[9px] font-black border border-slate-100"
                            style={{
                              backgroundColor: profile.pdfHighContrast
                                ? "#ffffff"
                                : "#f8fafc",
                              borderColor: profile.pdfHighContrast
                                ? "#000000"
                                : "#f1f5f9",
                            }}
                          >
                            <div className="flex gap-2 items-center">
                              <div
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: profile.pdfHighContrast
                                    ? "#000000"
                                    : "#38bdf8",
                                }}
                              />
                              <span
                                className="uppercase tracking-widest"
                                style={{
                                  color: profile.pdfHighContrast
                                    ? "#000000"
                                    : "#94a3b8",
                                }}
                              >
                                Nama Murid
                              </span>
                            </div>
                            <div
                              className="uppercase tracking-wider"
                              style={{ color: "#000000" }}
                            >
                              : {student.name}
                            </div>

                            <div className="flex gap-2 items-center">
                              <div
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: profile.pdfHighContrast
                                    ? "#000000"
                                    : "#e2e8f0",
                                }}
                              />
                              <span
                                className="uppercase tracking-widest"
                                style={{
                                  color: profile.pdfHighContrast
                                    ? "#000000"
                                    : "#94a3b8",
                                }}
                              >
                                Kelas / SMT
                              </span>
                            </div>
                            <div
                              className="uppercase tracking-wider"
                              style={{ color: "#000000" }}
                            >
                              : {student.class} / Semester {student.semester}
                            </div>
                          </div>
                        </div>

                        <div className="relative group/narrative flex flex-col shrink overflow-hidden min-h-[40mm]">
                          <div className="flex items-center justify-between mb-2 shrink-0">
                            <div className="flex items-center gap-2">
                              <FileText
                                size={12}
                                style={{
                                  color: profile.pdfHighContrast
                                    ? "#000000"
                                    : "#0f172a",
                                }}
                              />
                              <h3
                                className="text-[10px] font-black uppercase tracking-[0.15em]"
                                style={{
                                  color: profile.pdfHighContrast
                                    ? "#000000"
                                    : "#0f172a",
                                }}
                              >
                                Capaian Belajar
                              </h3>
                            </div>
                          </div>
                          <div
                            className="text-[9.5px] leading-[1.5] text-justify font-medium px-2.5 border-l-2 whitespace-pre-wrap overflow-hidden"
                            style={{
                              color: profile.pdfHighContrast
                                ? "#000000"
                                : "#334155",
                              borderColor: profile.pdfHighContrast
                                ? "#000000"
                                : "#f1f5f9",
                              maxHeight: showPhotos
                                ? paperSize === "A4"
                                  ? "62mm"
                                  : "78mm"
                                : paperSize === "A4"
                                ? "85mm"
                                : "105mm",
                            }}
                          >
                            {content.narrative ||
                              "Laporan sedang disusun otomatis..."}
                          </div>
                        </div>

                        {/* Photo Documentation Section */}
                        {showPhotos && (
                          <div className="shrink-0 mt-0.5">
                            <div className="flex items-center justify-between mb-1.5 shrink-0">
                              <div className="flex items-center gap-1.5">
                                <ImageIcon
                                  size={10}
                                  style={{
                                    color: profile.pdfHighContrast
                                      ? "#000000"
                                      : "#0f172a",
                                  }}
                                />
                                <h3
                                  className="text-[9px] font-black uppercase tracking-[0.12em]"
                                  style={{
                                    color: profile.pdfHighContrast
                                      ? "#000000"
                                      : "#0f172a",
                                  }}
                                >
                                  Bukti Belajar
                                </h3>
                              </div>
                            </div>
                            <div className="flex justify-center items-center gap-3 mx-auto w-full px-1">
                              {(() => {
                                const aspectPhotos = studentPhotos
                                  .filter((p) => p.aspectId === aspect.id)
                                  .slice(0, 3);
                                return [0, 1, 2].map((idx) => {
                                  const photo = aspectPhotos[idx];
                                  return (
                                    <div
                                      key={idx}
                                      className="w-16 h-16 rounded-xl flex flex-col items-center justify-center overflow-hidden relative border border-slate-100 shrink-0 shadow-xs"
                                      style={{
                                        backgroundColor: "#fcfdfe",
                                        borderColor: profile.pdfHighContrast
                                          ? "#000000"
                                          : "#f1f5f9",
                                      }}
                                    >
                                      {photo ? (
                                        <img
                                          src={photo.previewUrl}
                                          className={cn(
                                            "w-full h-full object-cover",
                                            profile.pdfHighContrast &&
                                              "grayscale brightness-110 contrast-125",
                                          )}
                                          alt="Documentation"
                                          crossOrigin="anonymous"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <>
                                          <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center mb-0.5">
                                            <ImageIcon
                                              size={10}
                                              style={{ color: "#e2e8f0" }}
                                            />
                                          </div>
                                          <span
                                            className="text-[5.5px] font-black uppercase tracking-tighter"
                                            style={{ color: "#cbd5e1" }}
                                          >
                                            Foto {idx + 1}
                                          </span>
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
                        <div
                          className="p-2 rounded-xl border border-sky-50 relative shrink-0 mt-0.5 max-h-[14mm] overflow-hidden"
                          style={{
                            backgroundColor: profile.pdfHighContrast
                              ? "#ffffff"
                              : "#f0f9ff",
                            borderColor: profile.pdfHighContrast
                              ? "#000000"
                              : "#e0f2fe",
                          }}
                        >
                          <p
                            className="text-[8.5px] leading-relaxed italic font-bold"
                            style={{
                              color: profile.pdfHighContrast
                                ? "#000000"
                                : "#0369a1",
                            }}
                          >
                            "
                            {content.advice ||
                              "Sarankan pendampingan rutin di rumah."}
                            "
                          </p>
                        </div>

                        {/* Footer Group */}
                        <div className="shrink-0 flex flex-col gap-2.5 mt-auto">
                          {/* Digital Signatures Area */}
                          {profile.showSignature !== false && (
                            <div className="shrink-0">
                              <p
                                className="text-[8px] font-bold uppercase tracking-[0.1em] mb-2 text-right"
                                style={{
                                  color: profile.pdfHighContrast
                                    ? "#000000"
                                    : "#64748b",
                                }}
                              >
                                {profile.address
                                  ? profile.address.split(",")[1]?.trim() ||
                                    "Jakarta"
                                  : "Jakarta"}
                                ,{" "}
                                {new Date().toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>

                              <div className="grid grid-cols-3 gap-0 text-center">
                                {/* 1. Wali Murid */}
                                <div className="flex flex-col justify-between min-h-[44px]">
                                  <p
                                    className="text-[7px] font-black uppercase tracking-widest leading-relaxed"
                                    style={{
                                      color: profile.pdfHighContrast
                                        ? "#000000"
                                        : "#94a3b8",
                                    }}
                                  >
                                    Orang Tua / Wali
                                  </p>
                                  <div className="pt-1">
                                    <p
                                      className="text-[9px] font-black"
                                      style={{
                                        color: profile.pdfHighContrast
                                          ? "#000000"
                                          : "#cbd5e1",
                                      }}
                                    >
                                      ( ................................ )
                                    </p>
                                  </div>
                                </div>

                                {/* 2. Kepala Sekolah */}
                                <div className="flex flex-col justify-between min-h-[44px]">
                                  <p
                                    className="text-[7px] font-black uppercase tracking-widest leading-relaxed"
                                    style={{
                                      color: profile.pdfHighContrast
                                        ? "#000000"
                                        : "#94a3b8",
                                    }}
                                  >
                                    Kepala Sekolah
                                  </p>
                                  <div className="pt-1 px-1">
                                    <p
                                      className="text-[9px] font-black underline decoration-slate-200 underline-offset-4"
                                      style={{
                                        color: "#0f172a",
                                        textDecorationColor:
                                          profile.pdfHighContrast
                                            ? "#000000"
                                            : "#e2e8f0",
                                      }}
                                    >
                                      {profile.principalName ||
                                        "................................"}
                                    </p>
                                  </div>
                                </div>

                                {/* 3. Guru Kelas */}
                                <div className="flex flex-col justify-between min-h-[44px]">
                                  <p
                                    className="text-[7px] font-black uppercase tracking-widest leading-relaxed"
                                    style={{
                                      color: profile.pdfHighContrast
                                        ? "#000000"
                                        : "#94a3b8",
                                    }}
                                  >
                                    Guru Kelas
                                  </p>
                                  <div className="pt-1 px-1">
                                    <p
                                      className="text-[9px] font-black underline decoration-sky-100 underline-offset-4"
                                      style={{
                                        color: "#0f172a",
                                        textDecorationColor:
                                          profile.pdfHighContrast
                                            ? "#000000"
                                            : "#e0f2fe",
                                      }}
                                    >
                                      {profile.teacherName ||
                                        "................................"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div
                            className="pt-2 text-[7px] text-center font-black uppercase tracking-[0.4em] opacity-30"
                            style={{ color: "#0f172a" }}
                          >
                            DIGITAL REPORT • KIDDYASSESS PRO • PAGE{" "}
                            {aspects.indexOf(aspect) + 1}/{aspects.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="text-center text-slate-500 text-xs italic pb-20">
              Akhir dari Pratinjau Raport. Pastikan semua lembar telah terisi
              narasi sebelum ekspor.
            </div>
          </div>
        </div>
      )}

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
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  PDF Siap Dibagikan!
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Dokumen laporan atas nama{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {student.name}
                  </strong>{" "}
                  telah berhasil dibuat dan siap untuk dikirim.
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
