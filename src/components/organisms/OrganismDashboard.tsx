import React from 'react';
import { Student, StudentAssessment, Aspect } from "../../types";
import { AtomText } from "../atoms/CommonAtoms";
import { 
  Users, 
  BookOpen, 
  Star, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  ArrowRight,
  ClipboardCheck,
  Award,
  BookOpenCheck,
  PieChart as PieIcon,
  Plus
} from "lucide-react";
import { motion } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface OrganismDashboardProps {
  students: Student[];
  assessments: StudentAssessment;
  aspects: Aspect[];
  onSelectStudent: (id: string | null) => void;
}

export function OrganismDashboard({ students, assessments, aspects, onSelectStudent }: OrganismDashboardProps) {
  const totalStudents = students.length;
  const totalAspects = aspects.length;
  
  // 1. Calculate student progress details
  const studentCompletion = students.map(student => {
    const studentAssessments = assessments[student.id] || {};
    let filledIndicators = 0;
    let totalIndicators = 0;
    
    aspects.forEach(aspect => {
      totalIndicators += aspect.indicators.length;
      const aspectData = studentAssessments[aspect.id] || {};
      filledIndicators += Object.keys(aspectData).length;
    });
    
    return {
      student,
      percentage: totalIndicators > 0 ? (filledIndicators / totalIndicators) * 100 : 0,
      filledIndicators,
      totalIndicators
    };
  });
  
  const classAverageCompletion = studentCompletion.length > 0 
    ? studentCompletion.reduce((a, b) => a + b.percentage, 0) / studentCompletion.length 
    : 0;

  // 2. Count of overall scores to see distribution (BSB, BSH, MB, BB)
  let scoreCounts = { BSB: 0, BSH: 0, MB: 0, BB: 0 };
  students.forEach(student => {
    const studentAssessments = assessments[student.id] || {};
    aspects.forEach(aspect => {
      const aspectData = studentAssessments[aspect.id] || {};
      Object.values(aspectData).forEach(score => {
        if (score in scoreCounts) {
          scoreCounts[score as keyof typeof scoreCounts]++;
        }
      });
    });
  });

  const totalScoresSubmitted = scoreCounts.BSB + scoreCounts.BSH + scoreCounts.MB + scoreCounts.BB;

  // 3. Aspect-specific metrics: Progress and Score Average
  const aspectMetrics = aspects.map(aspect => {
    let totalAspectIndicators = students.length * aspect.indicators.length;
    let assessedIndicators = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    students.forEach(student => {
      const studentAssessments = assessments[student.id] || {};
      const aspectData = studentAssessments[aspect.id] || {};
      assessedIndicators += Object.keys(aspectData).length;

      Object.values(aspectData).forEach(score => {
        const scoreValue = score === "BSB" ? 4 : score === "BSH" ? 3 : score === "MB" ? 2 : 1;
        scoreSum += scoreValue;
        scoreCount++;
      });
    });

    const completionRate = totalAspectIndicators > 0 ? (assessedIndicators / totalAspectIndicators) * 100 : 0;
    const averageScore = scoreCount > 0 ? scoreSum / scoreCount : 0;

    const shortName = aspect.name.toLowerCase().includes("agama") ? "Agama & Moral" :
                      aspect.name.toLowerCase().includes("jati diri") ? "Jati Diri" : "Literasi STEAM";

    return {
      id: aspect.id,
      fullName: aspect.name,
      shortName,
      completionRate,
      assessedIndicators,
      totalAspectIndicators,
      averageScore,
    };
  });

  // Recharts Chart Data: Class Score Distribution
  const distributionChartData = [
    { name: "BSB (Sangat Baik)", count: scoreCounts.BSB, color: "#10b981", desc: "Berkembang Sangat Baik" },
    { name: "BSH (Sesuai Harapan)", count: scoreCounts.BSH, color: "#0ea5e9", desc: "Berkembang Sesuai Harapan" },
    { name: "MB (Mulai Berkembang)", count: scoreCounts.MB, color: "#f59e0b", desc: "Mulai Berkembang" },
    { name: "BB (Belum Berkembang)", count: scoreCounts.BB, color: "#ef4444", desc: "Belum Berkembang" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* 1. Header & Quick Guides Panel (Compact arrangement to avoid empty vibe) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-950 rounded border border-sky-200 dark:border-sky-900">
                Pusat Kontrol Penilaian
              </span>
              <span className="text-[10px] text-slate-400 font-extrabold">TA 2025/2026</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Selamat Datang di Portal PAUD
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Kelola, analisa pencapaian murid, dan susun laporan narasi bertenaga AI dengan mudah.
            </p>
          </div>
          
          {/* Quick Stats Summary Banner */}
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-auto shrink-0 select-none">
            <div className="text-center shrink-0 border-r border-slate-200 dark:border-slate-800 pr-3 flex-1 sm:flex-none">
              <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Total Indikator</span>
              <span className="text-lg font-black text-slate-900 dark:text-white leading-none mt-1 block">
                {totalStudents > 0 ? aspects.reduce((sum, a) => sum + a.indicators.length, 0) : 0}
              </span>
            </div>
            <div className="text-center flex-1 sm:flex-none">
              <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Total Dinilai</span>
              <span className="text-lg font-black text-sky-500 leading-none mt-1 block">
                {totalScoresSubmitted}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Teacher Checklist - Guide workflow (Actionable, compact, zero empty space) */}
        <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5 text-sky-500" /> Alur Persiapan Berkas Raport Murid
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              {
                step: "1",
                title: "Daftarkan Murid",
                desc: "Masukkan identitas anak & kelas di menu kiri.",
                status: totalStudents > 0 ? "complete" : "pending",
              },
              {
                step: "2",
                title: "Nilai Indikator",
                desc: "Klik murid, isi rubrik BSB/BSH/MB/BB.",
                status: totalScoresSubmitted > 0 ? "complete" : totalStudents > 0 ? "active" : "pending",
              },
              {
                step: "3",
                title: "Olahan Narasi AI",
                desc: "Hasilkan komentar & saran cerdas per aspek.",
                status: totalScoresSubmitted > 5 ? "active" : "pending",
              },
              {
                step: "4",
                title: "Ekspor 3-Halaman PDF",
                desc: "Unduh file pratinjau siap cetak ukuran A4.",
                status: classAverageCompletion > 30 ? "active" : "pending"
              }
            ].map((item, idx) => {
              const isActive = item.status === "active";
              const isDone = item.status === "complete";
              return (
                <div 
                  key={idx}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isDone 
                      ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                      : isActive 
                        ? "bg-sky-500/5 dark:bg-sky-950/20 border-sky-500/40 text-sky-900 dark:text-sky-300 font-bold"
                        : "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 shadow-xs ${
                      isDone 
                        ? "bg-emerald-500 text-white"
                        : isActive 
                          ? "bg-sky-500 text-white" 
                          : "bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-450"
                    }`}>
                      {item.step}
                    </span>
                    <span className="text-[11px] font-black tracking-tight">{item.title}</span>
                  </div>
                  <p className="text-[9.5px] leading-relaxed opacity-85 font-semibold">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Sleek Metrics Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <MetricCard 
          icon={<Users className="text-sky-500" />} 
          label="Siswa Terdaftar" 
          value={`${totalStudents} Murid`} 
          subValue="Aktif Semester Ini"
          themeColor="sky"
        />
        <MetricCard 
          icon={<TrendingUp className="text-emerald-500" />} 
          label="Penyelesaian Rata-Rata" 
          value={`${Math.round(classAverageCompletion)}%`} 
          subValue="Menuju Raport Siap Ekspor"
          themeColor="emerald"
        />
        <MetricCard 
          icon={<BookOpen className="text-indigo-500" />} 
          label="Cakupan Kurikulum" 
          value={`${totalAspects} Aspek`} 
          subValue="IKP & Capaian Fase Fondasi"
          themeColor="indigo"
        />
        <MetricCard 
          icon={<Star className="text-amber-500" />} 
          label="Status Kesiapan" 
          value={classAverageCompletion === 100 ? "Lengkap" : classAverageCompletion > 50 ? "Sedang Diisi" : "Tahap Awal"} 
          subValue="Monitoring Capaian Siswa"
          themeColor="amber"
        />
      </div>

      {/* 3. High Density Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Aspect Assessment Density Progress Tracking (High Density curriculum map) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-850 pb-2">
              <div>
                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest block">Kemajuan Kurikulum</span>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
                  Distribusi Progres Per Aspek Belajar
                </h3>
              </div>
              <BookOpenCheck className="w-4 h-4 text-indigo-500" />
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-4 leading-relaxed">
              Persentase keterisian seluruh indikator penilaian di seluruh murid Anda. Pastikan semua aspek seimbang untuk hasil evaluasi menyeluruh.
            </p>

            <div className="space-y-3.5">
              {aspectMetrics.map((aspect, idx) => {
                const colors = [
                  "bg-gradient-to-r from-teal-500 to-indigo-500",
                  "bg-gradient-to-r from-orange-400 to-amber-500",
                  "bg-gradient-to-r from-indigo-500 to-pink-500"
                ];
                return (
                  <div key={aspect.id} className="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-850">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0">
                        <span className="text-[9px] font-black text-slate-400 tracking-wider block uppercase">ASPEK {idx+1}</span>
                        <span className="text-[11.5px] font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                          {aspect.fullName}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10.5px] font-black text-indigo-500 block">
                          {Math.round(aspect.completionRate)}%
                        </span>
                        <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wide">
                          {aspect.assessedIndicators}/{aspect.totalAspectIndicators} Skor
                        </span>
                      </div>
                    </div>
                    
                    {/* Compact customized track bar with neon touch */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500 shadow-sm`}
                        style={{ width: `${aspect.completionRate}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-[8.5px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wider">
                      <span>Rata-Rata Kelas:</span>
                      <span className="text-slate-800 dark:text-white bg-slate-200/60 dark:bg-slate-800 px-1 py-0.5 rounded">
                        {aspect.averageScore > 0 ? `${aspect.averageScore.toFixed(1)} / 4.0` : "Belum diisi"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-850 pb-2">
              <div>
                <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest block">Statistik Penilaian</span>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
                  Penyebaran Skala Rubrik
                </h3>
              </div>
              <PieIcon className="w-4 h-4 text-sky-500" />
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-3 leading-relaxed">
              Visualisasi kuantitas skor BSB, BSH, MB, dan BB yang telah diinput di seluruh aspek murid.
            </p>

            {totalScoresSubmitted > 0 ? (
              <div className="space-y-2.5">
                {distributionChartData.map((item, idx) => {
                  const barPercentage = totalScoresSubmitted > 0 ? (item.count / totalScoresSubmitted) * 100 : 0;
                  return (
                    <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-150 dark:border-slate-850/80">
                      <div className="flex items-center justify-between text-[10px] font-black tracking-tight mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{item.name}</span>
                        </div>
                        <span className="text-slate-900 dark:text-white">{item.count} Kali ({Math.round(barPercentage)}%)</span>
                      </div>
                      
                      {/* Compact colored progress tracking */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${barPercentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5 block">
                        {item.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-4">
                <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Belum Ada Nilai di-Input
                </p>
                <p className="text-[9px] text-slate-500 max-w-[180px] mt-1">
                  Mulai dengan mengeklik salah satu murid di bawah untuk mengisi rubrik penilaian harian.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Roster & Readiness Status Board (Dense arrangement, high contrast text) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-150 dark:border-slate-850">
          <div>
            <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest block">Daftar Kelengkapan</span>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
              Kelayakan Raport Murid & Akses Cepat
            </h3>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-extrabold self-start sm:self-center">
            Total Siswa: {totalStudents} Anak
          </span>
        </div>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((student, idx) => {
              const compInfo = studentCompletion.find(sc => sc.student.id === student.id) || {
                percentage: 0,
                filledIndicators: 0,
                totalIndicators: 0
              };
              
              const progressVal = Math.round(compInfo.percentage);
              const isReady = progressVal >= 100;

              return (
                <div 
                  key={student.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl transition-all duration-150 group flex flex-col justify-between"
                >
                  <div>
                    {/* Student Avatar + Basic details */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-sky-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm uppercase">
                          {student.name.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[12px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                            {student.name}
                          </h4>
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-wide">
                            Absen {idx + 1} • Kelas {student.class}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status indicator bubble with high-contrast badge styling */}
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        isReady 
                          ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900" 
                          : "bg-amber-550/10 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-900"
                      }`}>
                        {isReady ? "Selesai" : `${progressVal}%`}
                      </span>
                    </div>

                    <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-semibold mb-3">
                      Telah mengisi {compInfo.filledIndicators} dari {compInfo.totalIndicators} penilaian indikator aspek.
                    </p>

                    {/* Highly legible and optimized custom track item */}
                    <div className="flex items-center gap-2 mb-3.5 bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-850">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider shrink-0">Progres:</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/30 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isReady ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                          style={{ width: `${progressVal}%` }} 
                        />
                      </div>
                      <span className={`text-[9.5px] font-black shrink-0 ${isReady ? 'text-emerald-500' : 'text-sky-500'}`}>
                        {progressVal}%
                      </span>
                    </div>
                  </div>

                  {/* Immediate Action CTA for Agile jumps */}
                  <button
                    type="button"
                    onClick={() => onSelectStudent(student.id)}
                    className={`w-full py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isReady 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.01] active:scale-95 shadow-sm"
                        : "bg-sky-500 hover:bg-sky-600 text-white hover:scale-[1.01] active:scale-95 shadow-sm"
                    }`}
                  >
                    <span>{isReady ? "Tinjau Berkas Raport" : "Mulai Isi Penilaian"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2.5 animate-pulse" />
            <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
              Belum Ada Data Siswa
            </h4>
            <p className="text-[10px] text-slate-500 max-w-[280px] mt-1.5 leading-relaxed">
              Silakan klik tombol menu di pojok kiri atas lantas pilih <strong className="text-slate-700 dark:text-slate-300">"Tambah Murid Baru"</strong> untuk menginisiasi sistem evaluasi kelas.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

// Optimized MetricCard component for clean contrast and no raw icons
interface MetricCardCompProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
  themeColor: "sky" | "emerald" | "indigo" | "amber";
}

function MetricCard({ icon, label, value, subValue, themeColor }: MetricCardCompProps) {
  const borderStyles = {
    sky: "border-sky-500/15 dark:border-sky-500/10 bg-white dark:bg-slate-900 hover:border-sky-500/30",
    emerald: "border-emerald-500/15 dark:border-emerald-500/10 bg-white dark:bg-slate-900 hover:border-emerald-500/30",
    indigo: "border-indigo-500/15 dark:border-indigo-500/10 bg-white dark:bg-slate-900 hover:border-indigo-500/30",
    amber: "border-amber-500/15 dark:border-amber-500/10 bg-white dark:bg-slate-900 hover:border-amber-500/30"
  };

  const iconBgStyles = {
    sky: "bg-sky-50 dark:bg-sky-950/55 text-sky-600 dark:text-sky-300 border-sky-100 dark:border-sky-900",
    emerald: "bg-emerald-50 dark:bg-emerald-950/55 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900",
    indigo: "bg-indigo-50 dark:bg-indigo-950/55 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900",
    amber: "bg-amber-50 dark:bg-amber-950/55 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-900"
  };

  const textColors = {
    sky: "text-sky-600 dark:text-sky-455",
    emerald: "text-emerald-600 dark:text-emerald-455",
    indigo: "text-indigo-600 dark:text-indigo-455",
    amber: "text-amber-605 dark:text-amber-455"
  };

  return (
    <div className={`p-3 rounded-2xl border ${borderStyles[themeColor]} transition-colors flex flex-col justify-between shadow-xs select-none min-h-[90px]`}>
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="text-[8.5px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest truncate">
          {label}
        </span>
        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${iconBgStyles[themeColor]} shadow-xs`}>
          {React.cloneElement(icon as React.ReactElement, { size: 12 })}
        </div>
      </div>
      <div>
        <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
          {value}
        </h3>
        <p className="text-[8.5px] font-extrabold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tight truncate leading-none">
          {subValue}
        </p>
      </div>
    </div>
  );
}
