import React from 'react';
import { Users, UsersRound, CheckCircle2, CalendarCheck } from 'lucide-react';

interface PrincipalKPIBoardProps {
    averageProgress: number;
    kelompokA: number;
    kelompokB: number;
    chronicAbsentCount: number;
    totalStudents: number;
}

export const PrincipalKPIBoard = ({ averageProgress, kelompokA, kelompokB, chronicAbsentCount, totalStudents }: PrincipalKPIBoardProps) => {
    return (
        <>
            <div id="principal_kpi_responsibilities_card" className="bg-white rounded-3xl p-5 border border-black/5 text-left shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className="text-[8px] font-black tracking-widest text-[#FF8000] uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Target Kinerja Kepala Sekolah (SLA)
                        </span>
                        <h3 className="text-sm font-black text-indigo-950 tracking-tight mt-1">Metrik Pengawasan Kualitas Lembaga</h3>
                    </div>
                    <div className="bg-[#9EE493] text-emerald-950 px-2 py-0.5 text-[9px] font-black rounded uppercase">
                        AKTIF
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-[#AEE6FF]/10 p-3 rounded-xl border border-[#AEE6FF]/30 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Kesiapan Rapor Kelas</span>
                        <div className="mt-2 text-indigo-950 font-mono font-black text-lg">
                            {averageProgress}% Terisi Rata-Rata
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Target Verifikasi: 100% Akhir Pekan</span>
                    </div>

                    <div className="bg-[#FFE699]/15 p-3 rounded-xl border border-[#FFE699]/40 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Kontrol Rombongan Belajar</span>
                        <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                            2 Rombel Utama
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Kelompok A: {kelompokA} | Kelompok B: {kelompokB}</span>
                    </div>

                    <div className="bg-[#FFB3B3]/10 p-3 rounded-xl border border-[#FFB3B3]/30 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Siswa Rawan Kehadiran</span>
                        <div className="mt-2 text-[#FF8000] font-mono font-black text-lg">
                            {chronicAbsentCount} Siswa Diatasi
                        </div>
                        <span className="text-[8px] text-slate-400 mt-1 uppercase font-black block">Tingkat Absen Melampaui 15%</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                    { label: 'Total Anak Terdaftar', val: `${totalStudents} Siswa`, sub: `Ke. A: ${kelompokA} | Ke. B: ${kelompokB}`, icon: Users, color: '#AEE6FF', textColor: '#0F3C4B' },
                    { label: 'Staf Pengajar (Guru)', val: '4 Guru Cahaya', sub: '2 Wali Kelas, 2 Pendamping', icon: UsersRound, color: '#9EE493', textColor: '#144510' },
                    { label: 'Rata-rata Kelengkapan', val: `${averageProgress}% Isi`, sub: 'Progres Pengisian Rapor', icon: CheckCircle2, color: '#FFE699', textColor: '#4D3E00' },
                    { label: 'Siswa Rawan Absensi', val: `${chronicAbsentCount} Siswa`, sub: 'Kehadiran di bawah 85%', icon: CalendarCheck, color: '#FFB3B3', textColor: '#521010' }
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl p-4 border border-black/5 flex flex-col gap-3 text-left shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: stat.color, color: stat.textColor }}
                            >
                                <stat.icon size={18} className="shrink-0" />
                            </div>
                            <div className="text-[8px] font-black opacity-10 select-none">KID_ID</div>
                        </div>
                        <div className="min-w-0">
                            <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">{stat.label}</span>
                            <span className="text-base font-black text-indigo-950 mt-1 block leading-tight">{stat.val}</span>
                            <span className="text-[9px] font-semibold text-slate-500 mt-0.5 block leading-tight truncate">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};
