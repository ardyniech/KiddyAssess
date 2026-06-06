import React from 'react';
import { BadgeCheck, HelpCircle } from 'lucide-react';
import { ColumnMap } from './useCsvImporter';

interface CsvMappingSelectorProps {
  headers: string[];
  mapping: ColumnMap;
  onChange: (field: keyof ColumnMap, value: string) => void;
}

interface FieldConfig {
  key: keyof ColumnMap;
  label: string;
  required: boolean;
  desc: string;
}

const FIELDS_TO_MAP: FieldConfig[] = [
  { key: 'name', label: 'Nama Lengkap Siswa', required: true, desc: 'Identitas utama siswa (misal: Budi Santoso)' },
  { key: 'kelompok', label: 'Rombel / Kelas', required: true, desc: 'Nama rombel belajar (misal: A1, B2)' },
  { key: 'semester', label: 'Semester', required: false, desc: 'Tingkat semester (default: "1")' },
  { key: 'semesterType', label: 'Tipe Semester', required: false, desc: 'Jenis semester: Ganjil atau Genap' },
  { key: 'nisn', label: 'NISN', required: false, desc: 'Nomor Induk Siswa Nasional jika ada' },
  { key: 'height', label: 'Tinggi Badan (cm)', required: false, desc: 'Tinggi badan guna pemantauan tumbuh kembang' },
  { key: 'weight', label: 'Berat Badan (kg)', required: false, desc: 'Berat badan guna pemantauan tumbuh kembang' },
];

export const CsvMappingSelector: React.FC<CsvMappingSelectorProps> = ({ headers, mapping, onChange }) => {
  return (
    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 scrollbar-none">
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-[10px] leading-relaxed font-bold">
        📢 KiddyApps mendeteksi kolom CSV Anda secara otomatis. Silakan verifikasi atau sesuaikan pemetaan di bawah ini agar data masuk dengan benar.
      </div>

      <div className="grid gap-3.5">
        {FIELDS_TO_MAP.map((field) => {
          const selectedValue = mapping[field.key];
          const isMatched = !!selectedValue;

          return (
            <div 
              key={field.key} 
              className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 hover:border-indigo-400 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight">{field.label}</span>
                  {field.required ? (
                    <span className="text-[8px] bg-rose-100 text-rose-700 font-extrabold uppercase px-1.5 py-0.5 rounded-md">Wajib</span>
                  ) : (
                    <span className="text-[8px] bg-slate-100 text-slate-500 font-bold uppercase px-1.5 py-0.5 rounded-md">Opsional</span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-none">{field.desc}</p>
              </div>

              <div className="flex items-center gap-2 max-w-xs w-full shrink-0">
                <select
                  value={selectedValue}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold text-black focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all cursor-pointer"
                >
                  <option value="">-- Lewati bidang ini --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      Kolom: {h}
                    </option>
                  ))}
                </select>

                <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                  {isMatched ? (
                    <BadgeCheck size={18} className="text-emerald-500" />
                  ) : (
                    <HelpCircle size={18} className="text-slate-300" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
