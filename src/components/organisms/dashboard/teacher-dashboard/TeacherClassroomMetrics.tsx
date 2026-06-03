import React from 'react';

interface TeacherClassroomMetricsProps {
    studentCount: number;
    fullyAssessed: number;
    inProgress: number;
    notAssessed: number;
}

export const TeacherClassroomMetrics = ({ studentCount, fullyAssessed, inProgress, notAssessed }: TeacherClassroomMetricsProps) => {
    return (
        <div className="text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 px-1 bg-gradient-to-r from-[#AEE6FF]/10 to-[#FFE699]/10 p-4 rounded-2xl border border-black/5">
                <div>
                    <h2 className="text-base font-black text-indigo-950">Progres Perkembangan Kelas B1 🎨</h2>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        Status: <span className="font-extrabold text-slate-950">{studentCount} anak terdaftar</span>, 
                        <span className="text-emerald-800 font-extrabold ml-1">{fullyAssessed} selesai</span> diisi, 
                        <span className="text-amber-900 font-extrabold ml-1">{inProgress + notAssessed} belum selesai</span>.
                    </p>
                </div>
                <div className="text-xs opacity-80 font-semibold text-slate-600">Tahun Ajaran Aktif</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Completed Row (Green) */}
                <div className="bg-[#9EE493]/20 border-2 border-[#9EE493] rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-[#9EE493] flex items-center justify-center text-emerald-950 font-black text-lg shrink-0 shadow shadow-emerald-200/50">
                        😊
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] font-extrabold text-[#144510] uppercase tracking-wider block leading-tight">Penilaian Lengkap</span>
                        <span className="text-sm font-black text-[#144510] mt-0.5 block leading-none">{fullyAssessed} Anak Selesai</span>
                        <span className="text-[8.5px] font-bold text-emerald-700 uppercase tracking-wide mt-1 block">Rapor asisten siap cetak 🚀</span>
                    </div>
                </div>

                {/* In-Progress (Yellow) */}
                <div className="bg-[#FFE699]/30 border-2 border-[#FFE699] rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-[#FFE699] flex items-center justify-center text-amber-950 font-black text-lg shrink-0 shadow shadow-amber-100/50">
                        ✍️
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-wider block leading-tight">Sedang Berlangsung</span>
                        <span className="text-sm font-black text-amber-950 mt-0.5 block leading-none">{inProgress} Sedang Dinilai</span>
                        <span className="text-[8.5px] font-bold text-amber-700 uppercase tracking-wide mt-1 block">Kurang beberapa indikator ✏️</span>
                    </div>
                </div>

                {/* Unassessed (Pink) */}
                <div className="bg-[#FFB3B3]/25 border-2 border-[#FFB3B3] rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-[#FFB3B3] flex items-center justify-center text-rose-950 font-black text-lg shrink-0 shadow shadow-rose-100/50">
                        💤
                    </div>
                    <div className="min-w-0">
                        <span className="text-[9px] font-extrabold text-rose-800 uppercase tracking-wider block leading-tight">Belum Diisi</span>
                        <span className="text-sm font-black text-rose-950 mt-0.5 block leading-none">{notAssessed} Belum Dinilai</span>
                        <span className="text-[8.5px] font-bold text-rose-700 uppercase tracking-wide mt-1 block">Belum ada observasi masuk 💤</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
