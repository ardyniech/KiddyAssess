import React from 'react';

export const PrincipalPermissionGuide = () => {
    return (
        <div id="principal_permission_guide_card" className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold leading-normal text-left flex items-start gap-3 transition-colors">
            <span className="text-xl shrink-0">🟢</span>
            <div>
                <p className="font-black text-[#1A365D] text-xs uppercase tracking-wider mb-0.5">Catatan Hak Akses Kepala Sekolah (Supervisi Read-Only)</p>
                <p className="text-[11px] text-slate-800 leading-tight">
                    Anda masuk sebagai <strong>Kepala Sekolah (ADMIN)</strong>. Sesuai kebijakan pengawasan sekolah, peran utama Anda adalah <strong>Read-Only supervisi</strong>: memonitor kelengkapan berkas, mendata absensi ekstrim, serta mengontrol SDM guru. Penambahan murid atau manipulasi indikator nilai dibatasi pada Guru Kelas/Wali Kelas demi kepatuhan data.
                </p>
            </div>
        </div>
    );
};
