import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Palette, Type, Smartphone, RotateCcw, Info, Check, 
  School, ShieldCheck, Database, Download, Upload, 
  Trash2, Save, Sparkles, Layout, FileText, Cloud, 
  Settings as SettingsIcon, AlertTriangle, Eye, Monitor,
  Languages, Fingerprint, Activity, Clock, Users, Archive, Image, Shield,
  Sun, Moon, Zap, Book
} from 'lucide-react';
import { useAppTheme } from '../../context/ThemeContext';
import { AtomText, AtomInput } from '../atoms/CommonAtoms';
import { CurriculumEditor } from './CurriculumEditor';
import { getSchoolProfile, saveSchoolProfile } from '../../services/settingsService';
import { getCurriculum, saveCurriculum } from '../../services/curriculumService';
import { SchoolProfile, Aspect } from '../../types';
import { db } from '../../lib/db';
import { cn } from '../../lib/utils';

// Sub-components for Settings Groups
const SettingsSection: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="space-y-3 mb-6 md:mb-8">
        <div className="ml-1">
            <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">{title}</h4>
            {subtitle && <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">{subtitle}</p>}
        </div>
        <div className="space-y-3 md:space-y-4">
            {children}
        </div>
    </div>
);

const SettingItem: React.FC<{ icon?: React.ReactNode; label: string; description?: string; children: React.ReactNode; danger?: boolean }> = ({ icon, label, description, children, danger }) => (
    <div className={cn(
        "p-2 md:p-3 rounded-lg md:rounded-xl border transition-all flex flex-row items-center justify-between gap-2 md:gap-3 shadow-xs",
        danger ? "bg-red-500/10 border-red-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10"
    )}>
        <div className="flex gap-2 md:gap-3 items-center min-w-0">
            {icon && (
                <div className={cn(
                    "w-8 h-8 md:w-9 md:h-9 rounded-md md:rounded-lg flex items-center justify-center shrink-0 border",
                    danger ? "bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-400" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-sky-500"
                )}>
                    {React.cloneElement(icon as React.ReactElement, { size: 14 })}
                </div>
            )}
            <div className="min-w-0">
                <h5 className={cn("text-[10px] md:text-[11px] font-bold uppercase tracking-tight truncate", danger ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white")}>{label}</h5>
                {description && <p className="text-[9px] md:text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug truncate">{description}</p>}
            </div>
        </div>
        <div className="shrink-0 flex items-center">
            {children}
        </div>
    </div>
);

export const OrganismAppSettings: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, updateTheme, resetTheme } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'visual' | 'pedagogy' | 'identity' | 'curriculum' | 'sync' | 'advance'>('visual');
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [curriculum, setCurriculum] = useState<Aspect[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dbStats, setDbStats] = useState({ students: 0, assessments: 0, photos: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      getSchoolProfile().then(setSchoolProfile);
      import('../../services/curriculumService').then(s => s.getCurriculum().then(setCurriculum));
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    const s = await db.students.count();
    const a = await db.assessments.get('current');
    const p = await db.photos.count();
    setDbStats({ 
        students: s, 
        assessments: a ? Object.keys(a.data).length : 0, 
        photos: p 
    });
  };

  if (!isOpen) return null;

  const handleSaveProfile = async () => {
    if (schoolProfile) {
      setIsSaving(true);
      const updated = { ...schoolProfile, updatedAt: Date.now() };
      await saveSchoolProfile(updated);
      
      if (curriculum) {
        await saveCurriculum(curriculum);
      }
      
      if (updated.enableCloudSync) {
        try {
            const { syncService } = await import('../../lib/firebaseService');
            await syncService.saveSettings(updated);
        } catch (err) {
            console.error("Cloud settings sync failed:", err);
        }
      }
      
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const exportData = async () => {
    const students = await db.students.toArray();
    const assessments = await db.assessments.get('current');
    const settings = await db.settings.toArray();
    
    const downloadData = {
        app: 'KiddyAssess Pro',
        version: '3.0',
        exportDate: new Date().toISOString(),
        payload: { students, assessments: assessments?.data || {}, settings }
    };

    const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KA_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const clearData = async () => {
    if (confirm("KONFIRMASI KRITIKAL: Hapus semua data murid dan penilaian? Tindakan ini tidak bisa dibatalkan.")) {
        await db.students.clear();
        await db.assessments.clear();
        await db.photos.clear();
        window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 lg:p-24 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div
           layoutId="settings-modal"
           initial={{ scale: 0.98, opacity: 0, y: 10 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           exit={{ scale: 0.98, opacity: 0, y: 10 }}
           className="relative w-full max-w-4xl h-full md:h-auto md:max-h-[80vh] bg-slate-50 dark:bg-slate-950 rounded-none md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border md:border-white/10"
        >
          {/* NAVIGATION SIDEBAR */}
          <div className="w-full md:w-56 bg-slate-100/80 dark:bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0">
             <div className="p-3 md:p-6 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-sky-500 rounded-lg md:rounded-xl shadow-lg shadow-sky-500/20 text-white">
                        <SettingsIcon size={16} />
                    </div>
                    <AtomText variant="h2" className="text-[12px] md:text-sm font-black tracking-widest leading-none uppercase text-slate-900 dark:text-white">Settings</AtomText>
                </div>
             </div>

             <div className="flex-1 p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible custom-scrollbar">
                <TabButton 
                    active={activeTab === 'visual'} 
                    onClick={() => setActiveTab('visual')} 
                    icon={<Palette size={18} />} 
                    label="Visual Styling" 
                    desc="Colors & Appearance"
                />
                <TabButton 
                    active={activeTab === 'pedagogy'} 
                    onClick={() => setActiveTab('pedagogy')} 
                    icon={<Sparkles size={18} />} 
                    label="Fitur & AI" 
                    desc="Pro Utilities"
                />
                <TabButton 
                    active={activeTab === 'identity'} 
                    onClick={() => setActiveTab('identity')} 
                    icon={<School size={18} />} 
                    label="School Profile" 
                    desc="Official Branding"
                />
                <TabButton 
                    active={activeTab === 'curriculum'} 
                    onClick={() => setActiveTab('curriculum')} 
                    icon={<Book size={18} />} 
                    label="Curriculum" 
                    desc="Aspects & Indicators"
                />
                <TabButton 
                    active={activeTab === 'sync'} 
                    onClick={() => setActiveTab('sync')} 
                    icon={<Cloud size={18} />} 
                    label="Cloud Backup" 
                    desc="Data Storage"
                />
                <TabButton 
                    active={activeTab === 'advance'} 
                    onClick={() => setActiveTab('advance')} 
                    icon={<Activity size={18} />} 
                    label="System Stats" 
                    desc="Database Tools"
                />
             </div>

             <div className="p-8 border-t border-slate-200 dark:border-white/5 hidden md:block">
                <div className="p-5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-sky-500" />
                        <span className="text-[10px] font-black uppercase text-sky-500">Auto-Save Active</span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tighter">Perubahan pada styling disimpan otomatis ke memori lokal.</p>
                </div>
             </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-transparent overflow-hidden">
             <header className="px-3 py-2 md:px-5 md:py-3 flex items-center justify-between shrink-0 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">
                        {activeTab === 'visual' && "Tampilan & Visual"}
                        {activeTab === 'pedagogy' && "AI & Pelaporan"}
                        {activeTab === 'identity' && "Profil Sekolah"}
                        {activeTab === 'curriculum' && "Kurikulum Sekolah"}
                        {activeTab === 'sync' && "Cloud Sync"}
                        {activeTab === 'advance' && "System Admin"}
                    </h2>
                </div>
                <button 
                   onClick={onClose}
                   className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-100 transition-all font-bold shadow-sm"
                >
                    <X size={14} />
                </button>
             </header>

             <div className="flex-1 overflow-y-auto p-3 md:p-5 custom-scrollbar bg-slate-50 dark:bg-slate-900/40">
                {activeTab === 'visual' && (
                    <div className="max-w-4xl space-y-8">
                        <SettingsSection title="Global Branding" subtitle="Warna utama untuk tombol & aksen aplikasi">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SettingItem label="App Mode" description="Light, Dark, atau Auto" icon={<Monitor size={16}/>}>
                                    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-black/5">
                                        {(['light', 'dark', 'system'] as const).map(m => (
                                            <button 
                                                key={m}
                                                onClick={() => updateTheme({ appearance: m })}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all flex items-center justify-center min-w-[50px]",
                                                    theme.appearance === m ? "bg-white dark:bg-slate-800 shadow-sm text-sky-500" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {m === 'light' && <Sun size={12} className="mr-1" />}
                                                {m === 'dark' && <Moon size={12} className="mr-1" />}
                                                {m === 'system' && <Monitor size={12} className="mr-1" />}
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </SettingItem>

                                <SettingItem label="Monochrome Mode" description="Simple black & white theme" icon={<Monitor size={16}/>}>
                                    <ToggleButton 
                                        active={theme.isMonochrome} 
                                        onClick={() => updateTheme({ isMonochrome: !theme.isMonochrome })} 
                                    />
                                </SettingItem>

                                <SettingItem label="Accent Primary" description="Warna tema utama" icon={<Palette size={16}/>}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-black/5">
                                            {['#38bdf8', '#6366f1', '#f43f5e', '#10b981'].map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => updateTheme({ primaryColor: c })}
                                                    className={cn(
                                                        "w-6 h-6 rounded-lg transition-all",
                                                        theme.primaryColor === c ? "ring-2 ring-slate-400 dark:ring-white scale-110 shadow-lg shadow-black/20" : "opacity-40 hover:opacity-100"
                                                    )}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <input 
                                            type="color" 
                                            value={theme.primaryColor} 
                                            onChange={e => updateTheme({ primaryColor: e.target.value })}
                                            className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border border-slate-200 dark:border-white/10 p-0"
                                        />
                                    </div>
                                </SettingItem>
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Background & FX" subtitle="Kontrol kedalaman interface">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SettingItem label="Dynamic Gradient" description="Warna latar belakang">
                                    <div className="flex gap-2">
                                        <input type="color" value={theme.gradients.from} onChange={e => updateTheme({ gradients: { ...theme.gradients, from: e.target.value } })} className="w-6 h-6 rounded-md cursor-pointer" title="Start" />
                                        <input type="color" value={theme.gradients.via} onChange={e => updateTheme({ gradients: { ...theme.gradients, via: e.target.value } })} className="w-6 h-6 rounded-md cursor-pointer" title="Mid" />
                                        <input type="color" value={theme.gradients.to} onChange={e => updateTheme({ gradients: { ...theme.gradients, to: e.target.value } })} className="w-6 h-6 rounded-md cursor-pointer" title="End" />
                                    </div>
                                </SettingItem>

                                <SettingItem label="Glass Transparency" description="Intensitas kaca blur">
                                    <div className="flex items-center gap-3 w-32">
                                        <input 
                                            type="range" min="0" max="64" step="4" 
                                            value={theme.layout.cardBlur} 
                                            onChange={e => updateTheme({ layout: { ...theme.layout, cardBlur: parseInt(e.target.value) } })}
                                            className="flex-1 accent-sky-500"
                                        />
                                        <span className="text-[9px] font-black w-6">{theme.layout.cardBlur}</span>
                                    </div>
                                </SettingItem>

                                <SettingItem label="Opacity" description="Kepadatan warna card">
                                    <div className="flex items-center gap-3 w-32">
                                        <input 
                                            type="range" min="0.1" max="1" step="0.05" 
                                            value={theme.layout.cardOpacity} 
                                            onChange={e => updateTheme({ layout: { ...theme.layout, cardOpacity: parseFloat(e.target.value) } })}
                                            className="flex-1 accent-sky-500"
                                        />
                                        <span className="text-[9px] font-black w-6">{Math.round(theme.layout.cardOpacity * 100)}%</span>
                                    </div>
                                </SettingItem>

                                <div className="md:col-span-2">
                                    <SettingItem label="UI Border Radius" description="Kelengkungan sudut elemen">
                                        <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-black/5">
                                            {['0.75rem', '1.5rem', '2.5rem', '3.5rem'].map((r, idx) => (
                                                <button 
                                                    key={r}
                                                    onClick={() => updateTheme({ borderRadius: r })}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                                                        theme.borderRadius === r ? "bg-white dark:bg-slate-800 shadow-sm text-sky-500" : "text-slate-400"
                                                    )}
                                                >
                                                    {idx === 0 ? "S" : idx === 1 ? "M" : idx === 2 ? "L" : "XL"}
                                                </button>
                                            ))}
                                        </div>
                                    </SettingItem>
                                </div>
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Typography Control" subtitle="Kenyamanan membaca">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SettingItem label="Font Family" description="Karakter tipografi">
                                        <select 
                                            value={theme.fontFamily}
                                            onChange={e => updateTheme({ fontFamily: e.target.value })}
                                            className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest"
                                        >
                                        <option value='"Plus Jakarta Sans", sans-serif'>Jakarta</option>
                                        <option value='"Inter", sans-serif'>Inter</option>
                                        <option value='"Outfit", sans-serif'>Outfit</option>
                                    </select>
                                </SettingItem>

                                <SettingItem label="System Font Scale" description="Ukuran dasar teks">
                                    <div className="flex items-center gap-3 w-32">
                                        <input 
                                            type="range" min="12" max="22" step="1" 
                                            value={theme.systemFontSize} 
                                            onChange={e => updateTheme({ systemFontSize: parseInt(e.target.value) })}
                                            className="flex-1 accent-sky-500"
                                        />
                                        <span className="text-[11px] font-black w-6">{theme.systemFontSize}</span>
                                    </div>
                                </SettingItem>
                            </div>
                        </SettingsSection>
                    </div>
                )}

                {activeTab === 'pedagogy' && (
                    <div className="max-w-4xl space-y-6">
                         <SettingsSection title="Pedagogy & AI Engine" subtitle="Konfigurasi asisten naratif pintar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <SettingItem label="Engine Narasi" description="Aktifkan bantuan AI Smart Narrative" icon={<Sparkles size={14}/>}>
                                     <ToggleButton 
                                        active={schoolProfile?.useAINarrative !== false} 
                                        onClick={() => setSchoolProfile(p => p ? ({ ...p, useAINarrative: !p.useAINarrative }) : null)} 
                                     />
                                 </SettingItem>

                                 <SettingItem label="Narrative Style" description="Karakter output AI" icon={<Zap size={14}/>}>
                                     <select 
                                        value={schoolProfile?.aiTone || 'Formal & Profesional'}
                                        onChange={e => setSchoolProfile(p => p ? ({ ...p, aiTone: e.target.value }) : null)}
                                        className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-tight"
                                     >
                                         <option>Edukatif & Motivasi</option>
                                         <option>Formal & Profesional</option>
                                         <option>Ramah & Interaktif</option>
                                         <option>To the Point (Singkat)</option>
                                     </select>
                                 </SettingItem>

                                 <SettingItem label="Auto-Correction" description="Koreksi otomatis tanda baca" icon={<Check size={14}/>}>
                                     <ToggleButton 
                                        active={schoolProfile?.autoCorrect !== false} 
                                        onClick={() => setSchoolProfile(p => p ? ({ ...p, autoCorrect: !p.autoCorrect }) : null)} 
                                     />
                                 </SettingItem>

                                 <SettingItem label="AI Sensitivity" description="Kedalaman narasi" icon={<Activity size={14}/>}>
                                    <select 
                                        className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-tight"
                                    >
                                        <option>Standard Balanced</option>
                                        <option>High Detail Flow</option>
                                        <option>Minimalist Summary</option>
                                    </select>
                                </SettingItem>
                            </div>
                         </SettingsSection>

                         <SettingsSection title="PDF Pro Generation" subtitle="Optimasi dokumen raport digital">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                 <SettingItem label="Foto Bukti" description="Lampirkan foto kegiatan" icon={<Image size={14}/>}>
                                     <ToggleButton 
                                        active={schoolProfile?.showPhotos !== false} 
                                        onClick={() => setSchoolProfile(p => p ? ({ ...p, showPhotos: !p.showPhotos }) : null)} 
                                     />
                                 </SettingItem>
                                 
                                 <SettingItem label="Tanda Tangan" description="Area tanda tangan resmi" icon={<Fingerprint size={14}/>}>
                                     <ToggleButton 
                                        active={schoolProfile?.showSignature !== false} 
                                        onClick={() => setSchoolProfile(p => p ? ({ ...p, showSignature: !p.showSignature }) : null)} 
                                     />
                                 </SettingItem>

                                 <SettingItem label="Layout Mode" description="Format sebaran halaman" icon={<Layout size={14}/>}>
                                    <select className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-[9px] font-black uppercase">
                                        <option>One Page per Aspect</option>
                                        <option>Compact (Combined)</option>
                                        <option>Detailed List</option>
                                    </select>
                                 </SettingItem>

                                 <SettingItem label="High Contrast" description="Teks hitam pekat (Print)" icon={<Eye size={14}/>}>
                                     <ToggleButton 
                                        active={schoolProfile?.pdfHighContrast === true} 
                                        onClick={() => setSchoolProfile(p => p ? ({ ...p, pdfHighContrast: !p.pdfHighContrast }) : null)} 
                                     />
                                 </SettingItem>

                                 <SettingItem label="Quality Export" description="Resolusi gambar dokumen" icon={<Shield size={14}/>}>
                                    <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded text-[8px] font-black uppercase">HD 300DPI</div>
                                 </SettingItem>
                            </div>
                         </SettingsSection>
                    </div>
                )}

                {activeTab === 'curriculum' && curriculum && (
                     <div className="max-w-4xl">
                        <CurriculumEditor aspects={curriculum} onChange={setCurriculum} />
                     </div>
                 )}

                 {activeTab === 'identity' && schoolProfile && (
                    <div className="max-w-4xl space-y-4">
                        <div className="flex gap-6 items-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="relative group shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 relative">
                                     {schoolProfile.logoUrl ? (
                                         <img src={schoolProfile.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                                     ) : (
                                         <School size={32} className="text-slate-400" />
                                     )}
                                     <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                                     >
                                         <Upload size={20} className="text-white" />
                                     </div>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (re) => {
                                             if (typeof reader.result === 'string') {
                                                 setSchoolProfile({ ...schoolProfile, logoUrl: reader.result });
                                             }
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black tracking-widest text-slate-900 dark:text-white uppercase">Logo Satuan Pendidikan</h3>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight mt-1">Logo ini akan muncul pada KOP surat hasil export PDF raport murid.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <IdentityInput label="Nama Institusi" value={schoolProfile.name} onChange={v => setSchoolProfile({ ...schoolProfile, name: v })} placeholder="TK Tunas Harapan" />
                            <IdentityInput label="Email Official" value={schoolProfile.email} onChange={v => setSchoolProfile({ ...schoolProfile, email: v })} placeholder="info@sekolah.com" />
                            <div className="md:col-span-2">
                                <IdentityInput label="Alamat Operasional" value={schoolProfile.address} onChange={v => setSchoolProfile({ ...schoolProfile, address: v })} placeholder="Alamat lengkap sekolah..." isTextArea />
                            </div>
                            <IdentityInput label="Telp" value={schoolProfile.phone} onChange={v => setSchoolProfile({ ...schoolProfile, phone: v })} placeholder="021-..." />
                            <IdentityInput label="Kepala Sekolah" value={schoolProfile.principalName} onChange={v => setSchoolProfile({ ...schoolProfile, principalName: v })} placeholder="Nama & Gelar" />
                            <IdentityInput label="Guru Kelas" value={schoolProfile.teacherName} onChange={v => setSchoolProfile({ ...schoolProfile, teacherName: v })} placeholder="Nama Pengajar" />
                        </div>
                    </div>
                )}

                {activeTab === 'sync' && (
                    <div className="max-w-4xl space-y-4">
                        <SettingsSection title="Cloud Integration" subtitle="Sinkronisasi infrastruktur awan">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SettingItem 
                                    label="Cloud Protection" 
                                    description="Auto-backup ke Google Cloud"
                                    icon={<Cloud size={14} />}
                                >
                                    <ToggleButton 
                                        active={schoolProfile?.enableCloudSync ? true : false} 
                                        onClick={() => setSchoolProfile(p => p ? ({ ...p, enableCloudSync: !p.enableCloudSync }) : null)} 
                                    />
                                </SettingItem>
                                <SettingItem label="Engine Status" icon={<Shield size={14}/>}>
                                    <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded text-[8px] font-black uppercase">Active</div>
                                </SettingItem>
                             </div>
                        </SettingsSection>

                        <SettingsSection title="System Health Stats" subtitle="Aset tersimpan di perangkat">
                            <div className="grid grid-cols-3 gap-3">
                                <StatsCard icon={<Users size={14} />} label="Students" value={dbStats.students} color="bg-blue-500" />
                                <StatsCard icon={<FileText size={14} />} label="Reports" value={dbStats.assessments} color="bg-emerald-500" />
                                <StatsCard icon={<Archive size={14} />} label="Photos" value={dbStats.photos} color="bg-amber-500" />
                            </div>
                        </SettingsSection>
                    </div>
                )}

                {activeTab === 'advance' && (
                    <div className="max-w-4xl space-y-6">
                        <SettingsSection title="Maintenance & Utility" subtitle="Manajemen database tingkat lanjut">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SettingItem 
                                    label="Export Full" 
                                    description="Download JSON backup"
                                    icon={<Download size={14} />}
                                >
                                    <button onClick={exportData} className="px-4 py-1.5 bg-sky-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                                        JSON Backup
                                    </button>
                                </SettingItem>
                                
                                <SettingItem 
                                    label="Reset Visual" 
                                    description="Kembalikan reset tema"
                                    icon={<RotateCcw size={14} />}
                                >
                                    <button onClick={resetTheme} className="px-4 py-1.5 bg-amber-500/10 text-amber-600 rounded-lg text-[8px] font-black uppercase">
                                        Reset
                                    </button>
                                </SettingItem>

                                <div className="md:col-span-2">
                                    <SettingItem 
                                        icon={<ShieldCheck size={14} />}
                                        label="Nuclear Wipe" 
                                        description="Hapus seluruh database lokal secara permanen"
                                        danger
                                    >
                                        <button onClick={clearData} className="px-6 py-2 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">
                                            Execute Wipe
                                        </button>
                                    </SettingItem>
                                </div>
                            </div>
                        </SettingsSection>
                    </div>
                )}
             </div>

             <footer className="px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Stable v3.0</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={onClose}
                        className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-4 py-1.5 md:px-8 md:py-2.5 bg-sky-500 text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {isSaving ? <Activity size={12} className="animate-spin" /> : <Save size={12} />}
                        {isSaving ? "Simpan..." : "Simpan"}
                    </button>
                </div>
             </footer>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// UI ATOMS FOR SETTINGS
const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; desc: string }> = ({ active, onClick, icon, label, desc }) => (
    <button 
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl transition-all text-left group shrink-0",
            active ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/10" : "hover:bg-slate-200/50 dark:hover:bg-white/5"
        )}
    >
        <div className={cn(
            "w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg flex items-center justify-center shrink-0 border transition-all",
            active ? "bg-sky-500 border-sky-400 text-white shadow-sm shadow-sky-500/20" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 group-hover:text-sky-500"
        )}>
            {React.cloneElement(icon as React.ReactElement, { size: 12 })}
        </div>
        <div className="min-w-0">
            <h4 className={cn("text-[8px] md:text-[11px] font-black uppercase tracking-widest transition-colors leading-none", active ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>{label}</h4>
            <p className={cn("text-[7px] md:text-[9px] font-bold uppercase tracking-tight mt-0.5 truncate", active ? "text-sky-500" : "text-slate-400")}>{desc}</p>
        </div>
    </button>
);

const ToggleButton: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
    <button 
        onClick={onClick}
        className={cn(
            "w-12 h-7 rounded-full relative transition-all duration-300",
            active ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200 dark:bg-white/10"
        )}
    >
        <div className={cn(
            "absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md",
            active ? "left-6" : "left-1"
        )} />
    </button>
);

const IdentityInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder: string; isTextArea?: boolean }> = ({ label, value, onChange, placeholder, isTextArea }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">{label}</label>
        {isTextArea ? (
            <textarea 
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-[12px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 min-h-[100px] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
        ) : (
            <input 
                type="text"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
        )}
    </div>
);

const StatsCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg", color)}>
            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{value}</div>
        <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</div>
    </div>
);

// MISSING ICONS IMPORT FIX
// Handled at top now
