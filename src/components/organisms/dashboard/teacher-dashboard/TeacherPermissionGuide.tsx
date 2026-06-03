import React from 'react';

export const TeacherPermissionGuide = () => {
    return (
        <div id="teacher_permission_guide_card" className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold leading-normal text-left flex items-start gap-3 transition-colors mt-8">
            <span className="text-xl shrink-0">🟢</span>
            <div>
                <p className="font-black text-[#1A365D] text-xs uppercase tracking-wider mb-0.5">Catatan Hak Akses Guru Kelas (Full Access)</p>
                <p className="text-[11px] text-slate-800 leading-tight">
                    Anda masuk sebagai <strong>Guru Utama</strong>. Anda memiliki wewenang penuh untuk: <strong>mengisi & mengedit data nilai siswa</strong>, <strong>menambahkan siswa baru</strong>, <strong>melakukan koreksi presensi</strong>, serta <strong>menghasilkan evaluasi Narasi AI</strong>. Hak ini dikecualikan bagi Yayasan & Kepala Sekolah yang bersifat Read-Only demi keandalan data.
                </p>
            </div>
        </div>
    );
};
