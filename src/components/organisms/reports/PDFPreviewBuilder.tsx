import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Printer, Settings, Palette, ArrowLeft, Image as ImageIcon, Type, Layout } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Student, Aspect } from '../../../types';
import { SavedNarrative } from '../../../lib/db';
import { PrintableReport } from './PrintableReport';
import { AtomText } from '../../atoms/CommonAtoms';

interface PDFPreviewBuilderProps {
  student: Student;
  aspects: Aspect[];
  savedNarratives: Record<string, SavedNarrative>;
  kartikaComments?: { kesimpulan?: string, catatanWali?: string, catatanOrtu?: string };
  onClose: () => void;
}

export type LayoutTheme = 'standard' | 'modern' | 'elegant';

export interface PDFTemplateConfig {
  theme: LayoutTheme;
  primaryColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  showSchoolHeader: boolean;
  schoolName: string;
  schoolAddress: string;
  schoolPhone: string;
  watermark: boolean;
  watermarkText?: string;
  margins: 'normal' | 'compact' | 'wide';
  logoUrl?: string;
  logoPosition?: 'left' | 'center' | 'right' | 'hidden';
  logoSize?: number;
  sectionOrder?: string[];
}

export function PDFPreviewBuilder({
  student,
  aspects,
  savedNarratives,
  kartikaComments,
  onClose
}: PDFPreviewBuilderProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const [config, setConfig] = useState<PDFTemplateConfig>({
    theme: 'standard',
    primaryColor: '#000000',
    fontSize: 'md',
    showSchoolHeader: true,
    schoolName: 'TK Kartika 5NK',
    schoolAddress: 'Jl. Pendidikan No. 1, Kota Pelajar',
    schoolPhone: '(021) 1234567',
    watermark: false,
    watermarkText: 'DRAFT',
    margins: 'normal',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/2048px-User_icon_2.svg.png', // Default placeholder
    logoPosition: 'left',
    logoSize: 80,
    sectionOrder: ['header', 'title', 'aspects', 'kokurikulum', 'kartika', 'signatures']
  });

  const [activeTab, setActiveTab] = useState<'style' | 'header' | 'layout'>('style');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handlePrint = useReactToPrint({
    documentTitle: `Laporan_Perkembangan_${student.name.replace(/\s+/g, '_')}`,
    contentRef: componentRef,
  });

  const generatePDFWithLoading = async () => {
    setIsProcessing(true);
    setProgress(5);
    setStatusText('Memulai rendering tata letak...');
    setToastMsg('Memulai pembuatan dokumen PDF...');
    setShowToast(true);

    await new Promise(r => setTimeout(r, 600));
    setProgress(30);
    setStatusText('Penyelarasan komposisi halaman A4...');
    setToastMsg('Menyusun halaman rapor...');

    await new Promise(r => setTimeout(r, 750));
    setProgress(65);
    setStatusText('Memproses tanda air & data instrumen...');
    
    await new Promise(r => setTimeout(r, 550));
    setProgress(95);
    setStatusText('Menjalankan driver cetak sistem...');
    setToastMsg('Membuka antarmuka cetak...');

    await new Promise(r => setTimeout(r, 300));
    setProgress(100);

    // Call actual print
    handlePrint();

    setTimeout(() => {
        setIsProcessing(false);
        setToastMsg('Rapor berhasil dirender & siap diunduh!');
        setTimeout(() => {
            setShowToast(false);
        }, 4000);
    }, 1500);
  };

  const updateConfig = (key: keyof PDFTemplateConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50 overflow-hidden relative">
      {/* Configuration Sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col z-10 shadow-xl overflow-hidden shrink-0 h-full">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between no-print">
            <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
            >
                <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Preview & Builder</h2>
            <div className="w-9"></div> {/* spacer for centering */}
        </div>

        <div className="flex border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex justify-center items-center gap-1.5 ${activeTab === 'style' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
                <Palette size={14} /> Gaya
            </button>
            <button 
                onClick={() => setActiveTab('header')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex justify-center items-center gap-1.5 ${activeTab === 'header' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
                <Layout size={14} /> Kop & Layout
            </button>
            <button 
                onClick={() => setActiveTab('layout')}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex justify-center items-center gap-1.5 ${activeTab === 'layout' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
            >
                <Settings size={14} /> Tata Letak
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <AnimatePresence mode="wait">
                {activeTab === 'style' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                    >
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Layout size={14} /> Tema Visual / Template
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'standard', name: 'Formal Dinas', desc: 'Sesuai standar administrasi', color: '#0f172a' },
                                    { id: 'modern', name: 'Modern Minimalis', desc: 'Bersih & menonjolkan aksen', color: '#4f46e5' },
                                    { id: 'elegant', name: 'Klasik Elegan', desc: 'Klasik, garis ganda eksklusif', color: '#166534' }
                                ].map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => {
                                            updateConfig('theme', t.id as LayoutTheme);
                                            updateConfig('primaryColor', t.color);
                                        }}
                                        className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${config.theme === t.id ? 'border-indigo-600 bg-indigo-50/50 shadow-md scale-[1.02]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        <div className="w-full h-16 rounded-lg bg-white border border-slate-200/50 flex flex-col p-2 gap-1.5 shadow-sm">
                                            {/* Mini skeleton to represent layout */}
                                            {t.id === 'standard' && (
                                                <>
                                                    <div className="w-3/4 h-2 bg-slate-200 rounded mx-auto" />
                                                    <div className="w-full h-px bg-slate-300 my-1" />
                                                    <div className="space-y-1 mt-1">
                                                        <div className="w-1/2 h-1.5 bg-slate-200 rounded" />
                                                        <div className="w-full h-1 bg-slate-100 rounded" />
                                                    </div>
                                                </>
                                            )}
                                            {t.id === 'modern' && (
                                                <>
                                                    <div className="w-full h-3 rounded" style={{ backgroundColor: `${t.color}20` }} />
                                                    <div className="w-1/2 h-2 rounded mt-2" style={{ backgroundColor: t.color }} />
                                                    <div className="w-full h-1 mt-1 rounded bg-slate-100" />
                                                </>
                                            )}
                                            {t.id === 'elegant' && (
                                                <>
                                                    <div className="w-3/4 h-2 rounded mx-auto mb-1" style={{ backgroundColor: t.color }} />
                                                    <div className="w-full border-t-2 border-b-2 h-1 mb-1" style={{ borderColor: t.color }} />
                                                    <div className="w-1/3 h-1.5 rounded bg-slate-200" />
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 block leading-tight">{t.name}</span>
                                            <span className="text-[8px] font-bold text-slate-500 leading-tight mt-0.5 block">{t.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Palette size={14} /> Warna Aksen (Primary Color)
                            </label>
                            <div className="flex gap-2">
                                {['#000000', '#4f46e5', '#0f172a', '#166534', '#991b1b', '#0284c7'].map(c => (
                                    <button 
                                        key={c}
                                        onClick={() => updateConfig('primaryColor', c)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${config.primaryColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: c }}
                                    >
                                        {config.primaryColor === c && <div className="w-full h-full flex items-center justify-center text-white"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Type size={14} /> Ukuran Font (Narasi)
                            </label>
                            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                                {['sm', 'md', 'lg'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => updateConfig('fontSize', s)}
                                        className={`flex-1 py-2 text-[10px] rounded-lg font-black uppercase tracking-widest transition-all ${config.fontSize === s ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                                    >
                                        {s === 'sm' ? 'Kecil' : s === 'md' ? 'Sedang' : 'Besar'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Settings size={14} /> Margin Halaman
                            </label>
                            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                                {['compact', 'normal', 'wide'].map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => updateConfig('margins', m)}
                                        className={`flex-1 py-2 text-[10px] rounded-lg font-black uppercase tracking-widest transition-all ${config.margins === m ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                                    >
                                        {m === 'compact' ? 'Sempit' : m === 'normal' ? 'Standar' : 'Lebar'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={config.watermark}
                                    onChange={(e) => updateConfig('watermark', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">Tampilkan Watermark</span>
                            </label>
                            {config.watermark && (
                                <input 
                                    type="text" 
                                    value={config.watermarkText || ''}
                                    onChange={(e) => updateConfig('watermarkText', e.target.value)}
                                    placeholder="Teks Watermark..."
                                    className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-600 outline-none"
                                />
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'header' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        className="space-y-5"
                    >
                        <label className="flex items-center gap-2 cursor-pointer group p-3 border border-slate-200 rounded-xl bg-slate-50">
                            <input 
                                type="checkbox" 
                                checked={config.showSchoolHeader}
                                onChange={(e) => updateConfig('showSchoolHeader', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">Tampilkan Kop Sekolah</span>
                        </label>

                        {config.showSchoolHeader && (
                            <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Posisi Logo Sekolah</label>
                                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                                        {['hidden', 'left', 'center', 'right'].map(pos => (
                                            <button 
                                                key={pos}
                                                onClick={() => updateConfig('logoPosition', pos)}
                                                className={`flex-1 py-1.5 text-[9px] rounded-lg font-black uppercase tracking-widest transition-all ${config.logoPosition === pos ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                                            >
                                                {pos === 'hidden' ? 'Sembunyi' : pos === 'left' ? 'Kiri' : pos === 'center' ? 'Tengah' : 'Kanan'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {config.logoPosition !== 'hidden' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">URL Logo Sekolah</label>
                                        <input 
                                            type="text" 
                                            placeholder="https://..."
                                            value={config.logoUrl}
                                            onChange={(e) => updateConfig('logoUrl', e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-600 outline-none"
                                        />
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nama Instansi/Sekolah</label>
                                    <input 
                                        type="text" 
                                        value={config.schoolName}
                                        onChange={(e) => updateConfig('schoolName', e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Alamat</label>
                                    <input 
                                        type="text" 
                                        value={config.schoolAddress}
                                        onChange={(e) => updateConfig('schoolAddress', e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-600 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Telepon / Kontak</label>
                                    <input 
                                        type="text" 
                                        value={config.schoolPhone}
                                        onChange={(e) => updateConfig('schoolPhone', e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-600 outline-none"
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className="p-4 bg-indigo-50 text-indigo-800 rounded-xl text-[10px] font-bold leading-relaxed border border-indigo-100">
                             Konfigurasi kop surat akan dirender di halaman pertama PDF rapor. Anda dapat menyimpannya sebagai preset nanti.
                        </div>
                    </motion.div>
                )}

                {activeTab === 'layout' && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                    >
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <ImageIcon size={14} /> Ukuran Logo Sekolah
                            </label>
                            <input 
                                type="range" 
                                min="40" 
                                max="160" 
                                value={config.logoSize || 80} 
                                onChange={(e) => updateConfig('logoSize', parseInt(e.target.value))}
                                className="w-full accent-indigo-600"
                            />
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>Kecil</span>
                                <span>{config.logoSize}px</span>
                                <span>Besar</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Layout size={14} /> Urutan Bagian (Drag & Drop)
                            </label>
                            
                            <Reorder.Group 
                                axis="y" 
                                values={config.sectionOrder || []} 
                                onReorder={(newOrder) => updateConfig('sectionOrder', newOrder)}
                                className="space-y-2"
                            >
                                {(config.sectionOrder || []).map((sectionId) => {
                                    const sectionNames: Record<string, string> = {
                                        header: 'Kop Sekolah',
                                        title: 'Prolog & Info Siswa',
                                        aspects: 'Narasi Aspek Penilaian',
                                        kokurikulum: 'Ekstrakurikuler',
                                        kartika: 'Karakter Kartika 5NK',
                                        signatures: 'Kolom Tanda Tangan'
                                    };
                                    
                                    return (
                                        <Reorder.Item 
                                            key={sectionId} 
                                            value={sectionId}
                                            className="bg-white border rounded-xl p-3 flex justify-between items-center text-xs font-bold text-slate-700 cursor-grab active:cursor-grabbing shadow-sm hover:border-indigo-300 transition-colors"
                                        >
                                            <span className="uppercase tracking-wider">{sectionNames[sectionId] || sectionId}</span>
                                            <svg className="text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="p-5 border-t border-slate-200 bg-white no-print">
            <button 
                onClick={generatePDFWithLoading}
                disabled={isProcessing}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
                <Printer size={16} /> {isProcessing ? 'Memproses PDF...' : 'Print / Simpan PDF'}
            </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-200/50 p-4 md:p-8 overflow-y-auto no-print relative flex flex-col items-center custom-scrollbar">
          <div className="absolute top-4 right-8 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Preview A4</span>
          </div>
          
          {/* Virtual Paper Container */}
          <div className="w-full max-w-[210mm] bg-white shadow-2xl transition-all origin-top sm:origin-top scale-95 sm:scale-100 mx-auto group">
              <PrintableReport 
                  ref={componentRef}
                  student={student}
                  aspects={aspects}
                  savedNarratives={savedNarratives}
                  kartikaComments={kartikaComments}
                  config={config}
              />
          </div>
          
          <div className="h-16"></div> {/* Bottom spacer */}
      </div>

      {/* Visual PDF Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-950 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Printer size={16} className="animate-spin" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-200">Merender PDF</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Fase Rendering & Pengolahan</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-300">
                  <span>Progres</span>
                  <span>{progress}%</span>
                </div>
                
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300 shadow-md"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <p className="text-[10px] font-bold text-slate-300 text-center italic mt-1 leading-none">
                  {statusText}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-indigo-950 border border-indigo-800 text-white text-[11px] font-black uppercase tracking-wider py-3.5 px-5 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
