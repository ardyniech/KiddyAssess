import React, { forwardRef } from 'react';
import { Student, Aspect } from '../../../types';
import { SavedNarrative } from '../../../lib/db';

interface PrintableReportProps {
  student: Student;
  aspects: Aspect[];
  savedNarratives: Record<string, SavedNarrative>;
  kartikaComments?: { kesimpulan?: string, catatanWali?: string, catatanOrtu?: string };
}

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ student, aspects, savedNarratives, kartikaComments }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black hidden print:block print:w-full printable-report" style={{ color: 'black' }}>
        <style type="text/css" media="print">
          {`
            @page { size: auto; margin: 20mm; }
            .printable-report { display: block !important; width: 100%; }
            body * { visibility: hidden; }
            .printable-report, .printable-report * { visibility: visible; }
            .printable-report { position: absolute; left: 0; top: 0; }
          `}
        </style>
        
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Laporan Perkembangan Anak</h1>
          <h2 className="text-lg font-semibold">{student.name}</h2>
          <p className="text-sm text-gray-700 font-medium">Kelompok: {student.kelompok || '-'}</p>
        </div>

        <div className="space-y-6">
          {aspects.map(aspect => (
            <div key={aspect.id} className="avoid-page-break">
              <h3 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1 uppercase">{aspect.name}</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {savedNarratives[aspect.id]?.narrative || 'Belum ada narasi.'}
              </p>
              {savedNarratives[aspect.id]?.advice && (
                <div className="mt-2 text-sm bg-gray-50 p-2 border-l-2 border-gray-400">
                  <span className="font-semibold block mb-1">Capaian & Saran:</span>
                  <p className="whitespace-pre-wrap">{savedNarratives[aspect.id]?.advice}</p>
                </div>
              )}
            </div>
          ))}

          {savedNarratives['kokurikulum']?.narrative && (
            <div className="avoid-page-break">
              <h3 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1 uppercase">Ekstrakurikuler & Projek (Kokurikulum)</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {savedNarratives['kokurikulum']?.narrative}
              </p>
            </div>
          )}

          {kartikaComments?.kesimpulan && (
            <div className="avoid-page-break mt-6">
              <h3 className="font-bold text-lg border-b border-gray-300 mb-2 pb-1 uppercase">Nilai Karakter Kebangsaan Kartika 5NK</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {kartikaComments.kesimpulan}
              </p>
              {kartikaComments.catatanWali && (
                <div className="mt-2 text-sm">
                  <span className="font-semibold block mb-1">Catatan Guru:</span>
                  <p className="whitespace-pre-wrap italic">{kartikaComments.catatanWali}</p>
                </div>
              )}
            </div>
          )}

          <div className="avoid-page-break mt-12 grid grid-cols-2 gap-8 text-center pt-16">
            <div>
              <p className="font-semibold mb-16">Guru Kelas / Wali</p>
              <div className="border-b border-black w-48 mx-auto"></div>
            </div>
            <div>
              <p className="font-semibold mb-16">Orang Tua / Wali Murid</p>
              <div className="border-b border-black w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
