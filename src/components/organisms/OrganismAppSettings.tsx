import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, Type, Smartphone, RotateCcw, Info, Check, School, ShieldCheck, Database, Download, Upload, Trash2, Save, Sparkles } from 'lucide-react';
import { useAppTheme } from '../../context/ThemeContext';
import { AtomText, AtomInput } from '../atoms/CommonAtoms';
import { getSchoolProfile, saveSchoolProfile } from '../../services/settingsService';
import { SchoolProfile } from '../../types';
import { db } from '../../lib/db';
import { cn } from '../../lib/utils';

export const OrganismAppSettings: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, updateTheme, resetTheme } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'theme' | 'layout' | 'content' | 'school' | 'data'>('theme');
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSchoolProfile().then(setSchoolProfile);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const colorOptions = [
    { name: 'iOS Blue', value: '#007aff' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Slate', value: '#475569' },
  ];

  const handleSaveProfile = async () => {
    if (schoolProfile) {
      setIsSaving(true);
      const updated = { ...schoolProfile, updatedAt: Date.now() };
      await saveSchoolProfile(updated);
      
      // If cloud sync is enabled, also save to firestore
      if (updated.enableCloudSync) {
        try {
            const { syncService } = await import('../../lib/firebaseService');
            await syncService.saveSettings(updated);
        } catch (err) {
            console.error("Cloud settings sync failed:", err);
        }
      }
      
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const exportAllData = async () => {
    const students = await db.students.toArray();
    const assessments = await db.assessments.get('current');
    const settings = await db.settings.toArray();
    // We don't export photos directly in JSON usually as they are blobs, but we could base64 them.
    // For now, metadata only.
    
    const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        students,
        assessments: assessments?.data || {},
        settings
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiddy_assess_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const clearAllData = async () => {
    if (confirm("ANDA YAKIN? Semua data murid, nilai, dan FOTO akan dihapus permanen.")) {
        await db.students.clear();
        await db.assessments.clear();
        await db.photos.clear();
        window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl h-[90vh] glass-card rounded-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border-white/20"
        >
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-black/5 dark:bg-white/5 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 flex flex-col">
            <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5">
                <AtomText variant="h2" className="text-xl font-black mb-1">Settings</AtomText>
                <AtomText variant="caption" className="text-sky-500">Konfigurasi Sistem</AtomText>
            </div>
            
            <div className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
                <button 
                  onClick={() => setActiveTab('theme')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-xs shrink-0",
                    activeTab === 'theme' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                    <Palette size={18} />
                    Colors & Fonts
                </button>
                <button 
                  onClick={() => setActiveTab('layout')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-xs shrink-0",
                    activeTab === 'layout' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                    <Smartphone size={18} />
                    Layout & FX
                </button>
                <button 
                  onClick={() => setActiveTab('content')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-xs shrink-0",
                    activeTab === 'content' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                    <Type size={18} />
                    Banner Content
                </button>
                <button 
                  onClick={() => setActiveTab('school')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-xs shrink-0",
                    activeTab === 'school' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                    <School size={18} />
                    Profil Sekolah
                </button>
                <button 
                  onClick={() => setActiveTab('data')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-xs shrink-0",
                    activeTab === 'data' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                    <Database size={18} />
                    Manajemen Data
                </button>
            </div>

            <div className="p-6 border-t border-black/5 dark:border-white/5 hidden md:block">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Local-First Storage</span>
                </div>
                <p className="text-[10px] text-muted leading-relaxed">Semua data disimpan di memory lokal browser Anda. Aman & Privat.</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 bg-white/30 dark:bg-black/10">
            <div className="p-6 md:p-8 flex items-center justify-between">
                <AtomText variant="h2" className="text-lg md:text-xl font-black italic uppercase italic tracking-tighter">
                    {activeTab === 'theme' && "Kustomisasi Warna & Tipografi"}
                    {activeTab === 'layout' && "Efek Visual & Layout"}
                    {activeTab === 'content' && "Konten Banner Utama"}
                    {activeTab === 'school' && "Identitas Raport"}
                    {activeTab === 'data' && "Backup & Reset"}
                </AtomText>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all scale-100 active:scale-90"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 custom-scrollbar">
                {activeTab === 'layout' && (
                    <div className="space-y-8">
                        <section className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Gradient Background (Modern)</span>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 glass-panel rounded-3xl border-black/5">
                                <div className="space-y-2">
                                    <span className="text-[9px] font-bold opacity-50 uppercase">Start Color</span>
                                    <input type="color" value={theme.gradients.from} onChange={e => updateTheme({ gradients: { ...theme.gradients, from: e.target.value } })} className="w-full h-10 rounded-xl cursor-pointer border-none" />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[9px] font-bold opacity-50 uppercase">Via Color</span>
                                    <input type="color" value={theme.gradients.via} onChange={e => updateTheme({ gradients: { ...theme.gradients, via: e.target.value } })} className="w-full h-10 rounded-xl cursor-pointer border-none" />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[9px] font-bold opacity-50 uppercase">End Color</span>
                                    <input type="color" value={theme.gradients.to} onChange={e => updateTheme({ gradients: { ...theme.gradients, to: e.target.value } })} className="w-full h-10 rounded-xl cursor-pointer border-none" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Kepadatan Card Opacity ({Math.round((theme.layout.cardOpacity) * 100)}%)</span>
                            <div className="p-5 glass-panel rounded-3xl border-black/5">
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="1" 
                                    step="0.05" 
                                    value={theme.layout.cardOpacity} 
                                    onChange={e => updateTheme({ layout: { ...theme.layout, cardOpacity: parseFloat(e.target.value) } })}
                                    className="w-full accent-sky-500"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Transparent</span>
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Opaque</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Card Font Settings ({theme.layout.cardFontSize}px)</span>
                            <div className="p-5 glass-panel rounded-3xl border-black/5 space-y-4">
                                <input 
                                    type="range" 
                                    min="10" 
                                    max="24" 
                                    step="1" 
                                    value={theme.layout.cardFontSize} 
                                    onChange={e => updateTheme({ layout: { ...theme.layout, cardFontSize: parseInt(e.target.value) } })}
                                    className="w-full accent-sky-500"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold opacity-60">Warna Teks Card</span>
                                    <input type="color" value={theme.layout.cardFontColor} onChange={e => updateTheme({ layout: { ...theme.layout, cardFontColor: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Card Blur Intensity ({theme.layout.cardBlur}px)</span>
                            <div className="p-5 glass-panel rounded-3xl border-black/5">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="64" 
                                    step="4" 
                                    value={theme.layout.cardBlur} 
                                    onChange={e => updateTheme({ layout: { ...theme.layout, cardBlur: parseInt(e.target.value) } })}
                                    className="w-full accent-sky-500"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Sharp</span>
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Frosted</span>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-2 gap-6">
                            <section className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Padding Scale (Global)</span>
                                <div className="p-5 glass-panel rounded-3xl border-black/5">
                                    <input 
                                        type="range" 
                                        min="0.5" 
                                        max="2" 
                                        step="0.1" 
                                        value={theme.layout.paddingScale} 
                                        onChange={e => updateTheme({ layout: { ...theme.layout, paddingScale: parseFloat(e.target.value) } })}
                                        className="w-full accent-sky-500"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[8px] font-bold opacity-40 uppercase">Compact</span>
                                        <span className="text-[8px] font-bold opacity-40 uppercase">Spacious</span>
                                    </div>
                                </div>
                            </section>
                            <section className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Margin Scale (Global)</span>
                                <div className="p-5 glass-panel rounded-3xl border-black/5">
                                    <input 
                                        type="range" 
                                        min="0.5" 
                                        max="2" 
                                        step="0.1" 
                                        value={theme.layout.marginScale} 
                                        onChange={e => updateTheme({ layout: { ...theme.layout, marginScale: parseFloat(e.target.value) } })}
                                        className="w-full accent-emerald-500"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <span className="text-[8px] font-bold opacity-40 uppercase">Tight</span>
                                        <span className="text-[8px] font-bold opacity-40 uppercase">Loose</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <section className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Banner Title</label>
                            <AtomInput 
                                value={theme.content.bannerTitle}
                                onChange={e => updateTheme({ content: { ...theme.content, bannerTitle: e.target.value } })}
                                placeholder="Judul besar di dashboard..."
                            />
                        </section>
                        <section className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Banner Subtitle</label>
                            <textarea 
                                value={theme.content.bannerSubtitle}
                                onChange={e => updateTheme({ content: { ...theme.content, bannerSubtitle: e.target.value } })}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 min-h-[120px]"
                                placeholder="Deskripsi di bawah judul banner..."
                            />
                        </section>
                        <div className="p-6 glass-panel rounded-[2rem] border-sky-500/10 bg-sky-500/5">
                            <h4 className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-2">Live Preview Text</h4>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black">{theme.content.bannerTitle}</h2>
                                <p className="text-sm opacity-60 italic leading-relaxed">{theme.content.bannerSubtitle}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'theme' && (
                    <div className="space-y-8">
                         <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-3xl flex gap-3">
                            <Sparkles className="text-sky-500 shrink-0" size={20} />
                            <p className="text-xs font-medium text-sky-600 dark:text-sky-400 leading-relaxed">
                                Kustomisasi ini berdampak pada kenyamanan visual saat melakukan penilaian.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Palette size={16} className="text-muted" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted">Warna Aksen Aplikasi</span>
                            </div>
                            <div className="flex flex-wrap gap-3 p-4 glass-panel rounded-[2rem] border-black/5">
                                {colorOptions.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => updateTheme({ primaryColor: color.value })}
                                    className="w-10 h-10 rounded-2xl border-2 transition-all flex items-center justify-center scale-100 hover:scale-110 active:scale-90"
                                    style={{ 
                                    backgroundColor: color.value, 
                                    borderColor: theme.primaryColor === color.value ? 'white' : 'transparent',
                                    boxShadow: theme.primaryColor === color.value ? `0 8px 15px ${color.value}40` : 'none'
                                    }}
                                >
                                    {theme.primaryColor === color.value && <Check size={16} className="text-white" />}
                                </button>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Mode Terang Font</span>
                                <div className="space-y-3 glass-panel p-5 rounded-3xl border-black/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Text Utama</span>
                                        <input type="color" value={theme.light.textMain ?? '#0f172a'} onChange={e => updateTheme({ light: { ...theme.light, textMain: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Text Muted</span>
                                        <input type="color" value={theme.light.textMuted ?? '#64748b'} onChange={e => updateTheme({ light: { ...theme.light, textMuted: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Judul Aspek</span>
                                        <input type="color" value={theme.light.aspectTitle ?? '#0f172a'} onChange={e => updateTheme({ light: { ...theme.light, aspectTitle: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Text Indikator</span>
                                        <input type="color" value={theme.light.indicatorText ?? '#64748b'} onChange={e => updateTheme({ light: { ...theme.light, indicatorText: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Background</span>
                                        <input type="color" value={theme.light.background} onChange={e => updateTheme({ light: { ...theme.light, background: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Card Base</span>
                                        <input type="color" value={theme.light.cardBg.startsWith('rgba') ? '#ffffff' : theme.light.cardBg} onChange={e => updateTheme({ light: { ...theme.light, cardBg: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                </div>
                            </section>
                            <section className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Mode Gelap Font</span>
                                <div className="space-y-3 glass-panel p-5 rounded-3xl border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Text Utama</span>
                                        <input type="color" value={theme.dark.textMain ?? '#f8fafc'} onChange={e => updateTheme({ dark: { ...theme.dark, textMain: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Text Muted</span>
                                        <input type="color" value={theme.dark.textMuted ?? '#94a3b8'} onChange={e => updateTheme({ dark: { ...theme.dark, textMuted: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Judul Aspek</span>
                                        <input type="color" value={theme.dark.aspectTitle ?? '#f8fafc'} onChange={e => updateTheme({ dark: { ...theme.dark, aspectTitle: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Text Indikator</span>
                                        <input type="color" value={theme.dark.indicatorText ?? '#94a3b8'} onChange={e => updateTheme({ dark: { ...theme.dark, indicatorText: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Background</span>
                                        <input type="color" value={theme.dark.background} onChange={e => updateTheme({ dark: { ...theme.dark, background: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold opacity-60">Card Base</span>
                                        <input type="color" value={theme.dark.cardBg.startsWith('rgba') ? '#1e293b' : theme.dark.cardBg} onChange={e => updateTheme({ dark: { ...theme.dark, cardBg: e.target.value } })} className="w-8 h-8 rounded-lg cursor-pointer border-none" />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <section className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Tipografi Sistem</span>
                            <div className="grid grid-cols-2 gap-3 p-4 glass-panel rounded-3xl border-black/5">
                                {[
                                    { name: 'Jakarta Sans', family: '"Plus Jakarta Sans", sans-serif' },
                                    { name: 'Inter UI', family: '"Inter", sans-serif' },
                                    { name: 'Outfit', family: '"Outfit", sans-serif' },
                                    { name: 'Space Grotesk', family: '"Space Grotesk", sans-serif' }
                                ].map((font) => (
                                    <button
                                        key={font.family}
                                        onClick={() => updateTheme({ fontFamily: font.family })}
                                        className={cn(
                                            "px-4 py-3 rounded-xl border text-xs font-bold transition-all text-left truncate flex items-center justify-between",
                                            theme.fontFamily === font.family ? "bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20" : "bg-black/5 dark:bg-white/5 border-transparent opacity-60"
                                        )}
                                        style={{ fontFamily: font.family }}
                                    >
                                        {font.name}
                                        {theme.fontFamily === font.family && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Kepadatan Glassmorphism ({Math.round((theme.glassOpacity ?? 0.7) * 100)}%)</span>
                            <div className="p-4 glass-panel rounded-3xl border-black/5">
                                <input 
                                    type="range" 
                                    min="0.1" 
                                    max="1" 
                                    step="0.05" 
                                    value={theme.glassOpacity ?? 0.7} 
                                    onChange={e => updateTheme({ glassOpacity: parseFloat(e.target.value) })}
                                    className="w-full accent-sky-500"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Minimal</span>
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Solid</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Skala Font Sistem ({theme.systemFontSize ?? 16}px)</span>
                            <div className="p-4 glass-panel rounded-3xl border-black/5">
                                <input 
                                    type="range" 
                                    min="12" 
                                    max="24" 
                                    step="1" 
                                    value={theme.systemFontSize ?? 16} 
                                    onChange={e => updateTheme({ systemFontSize: parseInt(e.target.value) })}
                                    className="w-full accent-sky-500"
                                />
                                <div className="flex justify-between mt-2">
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Compact</span>
                                    <span className="text-[8px] font-bold opacity-40 uppercase">Besar</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted block ml-1">Radius Kontainer UI</span>
                            <div className="flex gap-4 p-4 glass-panel rounded-3xl border-black/5">
                                <button 
                                    onClick={() => updateTheme({ borderRadius: '0.75rem' })}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                        theme.borderRadius === '0.75rem' ? "bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20" : "bg-black/5 dark:bg-white/5 border-transparent opacity-60"
                                    )}
                                >
                                    Modern Boxy
                                </button>
                                <button 
                                    onClick={() => updateTheme({ borderRadius: '2rem' })}
                                    className={cn(
                                        "flex-1 py-3 rounded-[1.5rem] border text-[10px] font-black uppercase tracking-widest transition-all",
                                        theme.borderRadius === '2rem' ? "bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20" : "bg-black/5 dark:bg-white/5 border-transparent opacity-60"
                                    )}
                                >
                                    Playful Soft
                                </button>
                            </div>
                        </section>

                        <button 
                            onClick={resetTheme}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-500 transition-colors ml-1"
                        >
                            <RotateCcw size={12} />
                            Kembalikan ke Default Pabrik
                        </button>
                    </div>
                )}

                {activeTab === 'school' && schoolProfile && (
                    <div className="space-y-6">
                         <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex gap-3">
                            <Info className="text-emerald-500 shrink-0" size={20} />
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 leading-relaxed">
                                Data ini akan muncul secara otomatis pada KOP Surat dan bagian Tanda Tangan Raport PDF.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 flex flex-col items-center justify-center p-6 glass-panel rounded-3xl border-black/5 gap-4">
                                <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-black/10 transition-all hover:border-sky-500 relative group">
                                    {schoolProfile.logoUrl ? (
                                        <img src={schoolProfile.logoUrl} className="w-full h-full object-contain" alt="School Logo" />
                                    ) : (
                                        <School className="text-muted" size={40} />
                                    )}
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                        <Upload className="text-white" size={20} />
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setSchoolProfile({ ...schoolProfile, logoUrl: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1">Logo Satuan Pendidikan</span>
                                    <span className="text-[9px] font-medium opacity-40">Format PNG/JPG, Maks 1MB</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Nama Satuan Pendidikan</label>
                                <AtomInput 
                                    value={schoolProfile.name || ''}
                                    onChange={e => setSchoolProfile({ ...schoolProfile, name: e.target.value })}
                                    placeholder="Contoh: TK Tunas Bangsa"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email Sekolah</label>
                                <AtomInput 
                                    value={schoolProfile.email || ''}
                                    onChange={e => setSchoolProfile({ ...schoolProfile, email: e.target.value })}
                                    placeholder="sekolah@domain.com"
                                />
                            </div>
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Alamat Lengkap</label>
                                <textarea 
                                    value={schoolProfile.address || ''}
                                    onChange={e => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 min-h-[80px]"
                                    placeholder="Alamat sekolah..."
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Nomor Telepon</label>
                                <AtomInput 
                                    value={schoolProfile.phone || ''}
                                    onChange={e => setSchoolProfile({ ...schoolProfile, phone: e.target.value })}
                                    placeholder="021-xxxx"
                                />
                            </div>
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Nama Kepala Sekolah</label>
                                <AtomInput 
                                    value={schoolProfile.principalName || ''}
                                    onChange={e => setSchoolProfile({ ...schoolProfile, principalName: e.target.value })}
                                    placeholder="Nama & Gelar"
                                />
                            </div>
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Nama Guru Kelas</label>
                                <AtomInput 
                                    value={schoolProfile.teacherName || ''}
                                    onChange={e => setSchoolProfile({ ...schoolProfile, teacherName: e.target.value })}
                                    placeholder="Nama & Gelar"
                                />
                            </div>

                            <div className="md:col-span-2 pt-4 border-t border-black/5 dark:border-white/5 space-y-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 italic">Konfigurasi Output Raport</span>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setSchoolProfile({ ...schoolProfile, showSignature: !schoolProfile.showSignature })}
                                        className={cn(
                                            "p-4 rounded-2xl border flex items-center justify-between transition-all",
                                            schoolProfile.showSignature ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-black/5 dark:bg-white/5 border-transparent opacity-60"
                                        )}
                                    >
                                        <div className="text-left">
                                            <div className="text-xs font-black uppercase tracking-widest">Garis Tanda Tangan</div>
                                            <div className="text-[9px] font-bold opacity-70">Munculkan di akhir PDF</div>
                                        </div>
                                        {schoolProfile.showSignature && <Check size={16} />}
                                    </button>

                                    <button 
                                        onClick={() => setSchoolProfile({ ...schoolProfile, showPhotos: !schoolProfile.showPhotos })}
                                        className={cn(
                                            "p-4 rounded-2xl border flex items-center justify-between transition-all",
                                            schoolProfile.showPhotos ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-black/5 dark:bg-white/5 border-transparent opacity-60"
                                        )}
                                    >
                                        <div className="text-left">
                                            <div className="text-xs font-black uppercase tracking-widest">Lampiran Foto</div>
                                            <div className="text-[9px] font-bold opacity-70">Sertakan bukti belajar</div>
                                        </div>
                                        {schoolProfile.showPhotos && <Check size={16} />}
                                    </button>

                                    <button 
                                        onClick={() => setSchoolProfile({ ...schoolProfile, useAINarrative: !schoolProfile.useAINarrative })}
                                        className={cn(
                                            "p-4 rounded-2xl border flex items-center justify-between transition-all",
                                            schoolProfile.useAINarrative !== false ? "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400" : "bg-black/5 dark:bg-white/5 border-transparent opacity-60"
                                        )}
                                    >
                                        <div className="text-left">
                                            <div className="text-xs font-black uppercase tracking-widest">AI Narrator</div>
                                            <div className="text-[9px] font-bold opacity-70">Narasi otomatis cerdas</div>
                                        </div>
                                        {schoolProfile.useAINarrative !== false && <Check size={16} />}
                                    </button>

                                    <button 
                                        onClick={() => setSchoolProfile({ ...schoolProfile, enableCloudSync: !schoolProfile.enableCloudSync })}
                                        className={cn(
                                            "p-4 rounded-2xl border flex items-center justify-between transition-all",
                                            schoolProfile.enableCloudSync ? "bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-600 dark:text-fuchsia-400" : "bg-black/5 dark:bg-white/5 border-transparent opacity-60"
                                        )}
                                    >
                                        <div className="text-left">
                                            <div className="text-xs font-black uppercase tracking-widest">Cloud Sync</div>
                                            <div className="text-[9px] font-bold opacity-70">Simpan ke Firebase</div>
                                        </div>
                                        {schoolProfile.enableCloudSync && <Check size={16} />}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Catatan Kaki Report (Opsional)</label>
                                    <textarea 
                                        value={schoolProfile.reportNote || ''}
                                        onChange={e => setSchoolProfile({ ...schoolProfile, reportNote: e.target.value })}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 min-h-[60px]"
                                        placeholder="Teks ini akan muncul di bagian paling bawah raport..."
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? <Check size={20} className="animate-bounce" /> : <Save size={20} />}
                            {isSaving ? "Tersimpan Aman" : "Simpan Profil Sekolah"}
                        </button>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="space-y-8">
                         <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl flex gap-3">
                            <Info className="text-amber-500 shrink-0" size={20} />
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 leading-relaxed">
                                Kelola persistensi data Anda. Sebaiknya lakukan Backup rutin jika data murid sudah banyak.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-panel p-6 rounded-[2rem] border-black/5 flex flex-col justify-between h-full">
                                <div>
                                    <Download className="text-sky-500 mb-4" size={32} />
                                    <h4 className="font-black text-lg mb-2">Export Backup</h4>
                                    <p className="text-[11px] text-muted leading-relaxed mb-6">Unduh seluruh data murid dan nilai (.json). File ini dapat di-import kembali di perangkat lain.</p>
                                </div>
                                <button 
                                    onClick={exportAllData}
                                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                >
                                    Download JSON
                                </button>
                            </div>

                            <div className="glass-panel p-6 rounded-[2rem] border-black/5 flex flex-col justify-between h-full opacity-50 cursor-not-allowed">
                                <div>
                                    <Upload className="text-emerald-500 mb-4" size={32} />
                                    <h4 className="font-black text-lg mb-2">Import Data</h4>
                                    <p className="text-[11px] text-muted leading-relaxed mb-6">Kembalikan data dari file backup sebelumnya. Versi ini mendukung restorasi metadata basic.</p>
                                </div>
                                <button className="w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                                    Unggah File (Soon)
                                </button>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] border-2 border-dashed border-red-500/20 bg-red-500/5">
                            <div className="flex items-center gap-3 mb-4">
                                <Trash2 className="text-red-500" size={24} />
                                <h4 className="font-black text-red-500 italic">Bahaya: Factory Reset</h4>
                            </div>
                            <p className="text-[11px] text-red-600/70 font-medium mb-6">Menghapus seluruh database aplikasi termasuk foto bukti belajar. Tindakan ini tidak dapat dibatalkan.</p>
                            <button 
                                onClick={clearAllData}
                                className="px-6 py-3 border-2 border-red-500/30 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                Hapus Seluruh Database
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

