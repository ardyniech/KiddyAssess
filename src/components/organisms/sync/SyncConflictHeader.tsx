import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const SyncConflictHeader: React.FC = () => {
  return (
    <div className="flex items-start gap-4 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
        <AlertTriangle size={20} />
      </div>
      <div className="space-y-1">
        <span className="text-[8px] font-black uppercase tracking-widest text-amber-800 font-mono">
          Sinkronisasi Terhambat
        </span>
        <h3 className="text-[12px] font-black uppercase text-slate-900 tracking-tight leading-snug">
          Konflik Perubahan Data Ganda Terdeteksi
        </h3>
        <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
          Siswa yang tercantum di bawah diperbarui secara bersamaan di perangkat lain dan perangkat lokal ini.
          Harap pilih versi data mana yang ingin Anda pertahankan agar tidak terjadi tumpang tindih data.
        </p>
      </div>
    </div>
  );
};
