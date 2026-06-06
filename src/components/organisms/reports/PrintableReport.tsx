import React, { forwardRef } from 'react';
import { Student, Aspect } from '../../../types';
import { SavedNarrative } from '../../../lib/db';
import { PDFTemplateConfig } from './PDFPreviewBuilder';

interface PrintableReportProps {
  student: Student;
  aspects: Aspect[];
  savedNarratives: Record<string, SavedNarrative>;
  kartikaComments?: { kesimpulan?: string, catatanWali?: string, catatanOrtu?: string };
  config?: PDFTemplateConfig;
}

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ student, aspects, savedNarratives, kartikaComments, config }, ref) => {
    
    // Default styles if no config provided yet
    const theme = config?.theme || 'standard';
    const isElegant = theme === 'elegant';
    const isModern = theme === 'modern';
    
    // Convert margin config to Tailwind sizes
    const paddingClass = config?.margins === 'compact' ? 'p-6' : config?.margins === 'wide' ? 'p-12' : 'p-8 md:p-10';
    
    // Font sizes
    const fontSizeBody = config?.fontSize === 'sm' ? 'text-xs' : config?.fontSize === 'lg' ? 'text-base' : 'text-sm';
    const fontSizeHeading = config?.fontSize === 'sm' ? 'text-base' : config?.fontSize === 'lg' ? 'text-xl' : 'text-lg';

    const sectionOrder = config?.sectionOrder || ['header', 'title', 'aspects', 'kokurikulum', 'kartika', 'signatures'];

    const renderHeader = () => {
        if (!config?.showSchoolHeader) return null;
        return (
              <div key="header" className={`flex items-center justify-between mb-6 border-b-2 ${isElegant ? 'border-double border-b-4' : 'border-solid'} pb-4`} style={{ borderColor: config.primaryColor || '#000000' }}>
                <div style={{ width: config?.logoSize || 80 }} className="shrink-0">
                    {config?.logoPosition === 'left' && config?.logoUrl && (
                        <img src={config.logoUrl} alt="Logo" style={{ width: config?.logoSize || 80, height: config?.logoSize || 80 }} className="object-contain" />
                    )}
                </div>
                
                <div className="flex-1 text-center flex flex-col items-center justify-center">
                    {config?.logoPosition === 'center' && config?.logoUrl && (
                        <img src={config.logoUrl} alt="Logo" style={{ width: (config?.logoSize || 80) * 0.8, height: (config?.logoSize || 80) * 0.8 }} className="object-contain mb-3" />
                    )}
                    <h1 className={`font-black uppercase tracking-widest ${isElegant ? 'font-serif text-2xl' : 'text-xl'} mb-1`} style={{ color: config?.primaryColor || '#000000' }}>{config.schoolName}</h1>
                    <p className="text-xs font-medium text-gray-800">{config.schoolAddress}</p>
                    <p className="text-xs font-medium text-gray-800">Telp: {config.schoolPhone}</p>
                </div>

                <div style={{ width: config?.logoSize || 80 }} className="shrink-0 flex justify-end">
                    {config?.logoPosition === 'right' && config?.logoUrl && (
                        <img src={config.logoUrl} alt="Logo" style={{ width: config?.logoSize || 80, height: config?.logoSize || 80 }} className="object-contain" />
                    )}
                </div>
              </div>
        );
    };

    const renderTitle = () => (
          <div key="title" className={`text-center mb-8 ${!config?.showSchoolHeader ? 'border-b-2 pb-4' : ''}`} style={{ borderColor: !config?.showSchoolHeader ? (config?.primaryColor || '#000000') : undefined }}>
             <h2 
                className={`font-bold uppercase tracking-wider mb-2 ${isModern ? 'text-2xl border inline-block px-4 py-1 rounded-lg' : 'text-xl'}`}
                style={{ 
                    color: isModern ? config?.primaryColor : '#000000',
                    borderColor: isModern ? `${config?.primaryColor}40` : 'transparent',
                    backgroundColor: isModern ? `${config?.primaryColor}10` : 'transparent'
                }}
             >
                Laporan Perkembangan Anak
             </h2>
             <div className="flex justify-center gap-6 mt-4">
                 <div className="text-left">
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-0.5">Nama Siswa</p>
                     <p className="text-base font-bold">{student.name}</p>
                 </div>
                 <div className="text-left">
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-0.5">Kelompok</p>
                     <p className="text-base font-bold">{student.kelompok || '-'}</p>
                 </div>
             </div>
          </div>
    );

    const renderAspects = () => (
          <div key="aspects" className={`space-y-6 mb-6 ${sectionOrder.indexOf('aspects') === sectionOrder.length - 1 ? 'flex-1' : ''}`}>
            {aspects.map(aspect => (
              <div key={aspect.id} className="avoid-page-break">
                <h3 
                  className={`font-bold ${fontSizeHeading} ${isElegant ? 'border-b border-gray-400' : isModern ? 'border-b-2' : 'border-b border-gray-300'} mb-2 pb-1 uppercase tracking-wide`}
                  style={isModern ? { borderColor: `${config?.primaryColor}40`, color: config?.primaryColor } : { color: (config?.primaryColor !== '#000000' && !isElegant) ? config?.primaryColor : undefined }}
                >
                    {aspect.name}
                </h3>
                <p className={`whitespace-pre-wrap leading-relaxed text-gray-800 ${fontSizeBody} text-justify`}>
                  {savedNarratives[aspect.id]?.narrative || 'Belum ada narasi.'}
                </p>
                {savedNarratives[aspect.id]?.advice && (
                  <div 
                     className={`mt-3 ${fontSizeBody} p-3 rounded-r-lg ${isModern ? 'border-l-4' : 'bg-gray-50 border-l-2 border-gray-400'}`}
                     style={isModern ? { backgroundColor: `${config?.primaryColor}10`, borderColor: config?.primaryColor } : {}}
                  >
                    <span className="font-bold block mb-1 uppercase tracking-wider text-[10px] text-gray-500">Capaian & Saran</span>
                    <p className="whitespace-pre-wrap">{savedNarratives[aspect.id]?.advice}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
    );

    const renderKokurikulum = () => {
        if (!savedNarratives['kokurikulum']?.narrative) return null;
        return (
              <div key="kokurikulum" className="avoid-page-break mb-6">
                <h3 
                  className={`font-bold ${fontSizeHeading} ${isElegant ? 'border-b border-gray-400' : isModern ? 'border-b-2' : 'border-b border-gray-300'} mb-2 pb-1 uppercase tracking-wide`}
                  style={isModern ? { borderColor: `${config?.primaryColor}40`, color: config?.primaryColor } : { color: (config?.primaryColor !== '#000000' && !isElegant) ? config?.primaryColor : undefined }}
                >
                  Ekstrakurikuler & Projek (Kokurikulum)
                </h3>
                <p className={`whitespace-pre-wrap leading-relaxed text-gray-800 ${fontSizeBody} text-justify`}>
                  {savedNarratives['kokurikulum']?.narrative}
                </p>
              </div>
        );
    };

    const renderKartika = () => {
        if (!kartikaComments?.kesimpulan) return null;
        return (
              <div key="kartika" className="avoid-page-break mb-6">
                <h3 
                  className={`font-bold ${fontSizeHeading} ${isElegant ? 'border-b border-gray-400' : isModern ? 'border-b-2' : 'border-b border-gray-300'} mb-2 pb-1 uppercase tracking-wide`}
                  style={isModern ? { borderColor: `${config?.primaryColor}40`, color: config?.primaryColor } : { color: (config?.primaryColor !== '#000000' && !isElegant) ? config?.primaryColor : undefined }}
                >
                  Nilai Karakter Kebangsaan Kartika 5NK
                </h3>
                <p className={`whitespace-pre-wrap leading-relaxed text-gray-800 ${fontSizeBody} text-justify`}>
                  {kartikaComments.kesimpulan}
                </p>
                {kartikaComments.catatanWali && (
                  <div className={`mt-3 ${fontSizeBody}`}>
                    <span className="font-bold block mb-1 uppercase tracking-wider text-[10px] text-gray-500">Catatan Guru PKn:</span>
                    <p className="whitespace-pre-wrap italic">{kartikaComments.catatanWali}</p>
                  </div>
                )}
              </div>
        );
    };

    const renderSignatures = () => (
             <div key="signatures" className="avoid-page-break grid grid-cols-2 gap-8 text-center pt-8 pb-8 mt-auto">
              <div>
                <p className={`font-semibold mb-16 ${fontSizeBody}`}>Guru Kelas / Wali</p>
                <div className="border-b-2 border-black border-dashed w-48 mx-auto"></div>
              </div>
              <div>
                <p className={`font-semibold mb-16 ${fontSizeBody}`}>Orang Tua / Wali Murid</p>
                <div className="border-b-2 border-black border-dashed w-48 mx-auto"></div>
              </div>
            </div>
    );

    const sectionElements: Record<string, React.ReactNode> = {
        header: renderHeader(),
        title: renderTitle(),
        aspects: renderAspects(),
        kokurikulum: renderKokurikulum(),
        kartika: renderKartika(),
        signatures: renderSignatures()
    };

    return (
      <div 
        ref={ref} 
        className={`${paddingClass} bg-white text-black min-h-[297mm] w-full relative printable-report`} 
        style={{ color: 'black' }}
      >
        <style type="text/css" media="print">
          {`
            @page { size: A4 portrait; margin: 0; }
            .printable-report { display: block !important; width: 100%; min-height: 100vh; padding: 20mm !important; }
            body * { visibility: hidden; }
            .printable-report, .printable-report * { visibility: visible; }
            .printable-report { position: absolute; left: 0; top: 0; }
            .no-print { display: none !important; }
            .avoid-page-break { break-inside: avoid; page-break-inside: avoid; }
          `}
        </style>
        
        {config?.watermark && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0 overflow-hidden">
                <span className="text-[120px] font-black uppercase tracking-[0.2em] -rotate-45 whitespace-nowrap text-black">{config.watermarkText || 'DRAFT'}</span>
            </div>
        )}

        <div className="relative z-10 w-full h-full flex flex-col">
            {sectionOrder.map(sectionId => sectionElements[sectionId])}
        </div>
      </div>
    );
  }
);

