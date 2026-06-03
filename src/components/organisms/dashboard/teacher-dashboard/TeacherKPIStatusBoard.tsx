import React from 'react';

interface TeacherKPIStatusBoardProps {
    studentCount: number;
    fullyAssessed: number;
}

export const TeacherKPIStatusBoard = ({ studentCount, fullyAssessed }: TeacherKPIStatusBoardProps) => {
    return (
        <div id="teacher_kpi_responsibilities_card" className="bg-white rounded-3xl p-5 border border-black/5 text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <span className="text-[8px] font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                        Pekerjaan & Target Utama
                    </span>
                    <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Status Kinerja Pengajaran Semester Ganjil</h3>
                </div>
                <div className="bg-[#9EE493] text-emerald-950 px-2 py-0.5 text-[9px] font-black rounded uppercase">
                    AKTIF
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-[#AEE6FF]/10 p-3 rounded-xl border border-[#AEE6FF]/30 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Isi Indikator</span>
                    <div className="mt-2 text-indigo-950 font-mono font-black text-lg">
                        {fullyAssessed} / {studentCount} Siswa
                    </div>
                    <div className="w-full bg-slate-150 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-[#7EC8E3] h-full" style={{ width: `${studentCount ? (fullyAssessed / studentCount) * 100 : 0}%` }} />
                    </div>
                </div>

                <div className="bg-[#FFE699]/15 p-3 rounded-xl border border-[#FFE699]/40 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Narasi AI Rapor Beres</span>
                    <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                        {fullyAssessed} Draft Rapor
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Wewenang Editor Bersertifikasi AI</span>
                </div>

                <div className="bg-[#FFB3B3]/10 p-3 rounded-xl border border-[#FFB3B3]/30 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Rasio Absensi Rata-rata</span>
                    <div className="mt-2 text-rose-700 font-mono font-black text-lg">
                        94.2% Tertib
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Penetapan harian diperbarui oleh Guru</span>
                </div>
            </div>
        </div>
    );
};
