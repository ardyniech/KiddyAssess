import React, { useRef } from 'react';
import { School, Upload } from 'lucide-react';
import { SchoolProfile } from '../../../types';
import { MoleculeIdentityInput } from '../../molecules/SettingsMolecules';

interface SettingsIdentityTabProps {
    schoolProfile: SchoolProfile;
    setSchoolProfile: (profile: SchoolProfile) => void;
}

export const SettingsIdentityTab: React.FC<SettingsIdentityTabProps> = ({ 
    schoolProfile, 
    setSchoolProfile 
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800/20 flex flex-col md:flex-row items-center gap-6">
                <div className="shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
                         {schoolProfile.logoUrl ? (
                             <img src={schoolProfile.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                         ) : (
                             <School size={32} className="text-slate-400" />
                         )}
                         <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                         >
                             <Upload size={20} className="text-white" />
                         </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                                 if (typeof reader.result === 'string') {
                                     setSchoolProfile({ ...schoolProfile, logoUrl: reader.result });
                                 }
                            };
                            reader.readAsDataURL(file);
                        }
                    }} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-sm font-black tracking-widest text-slate-900 dark:text-white uppercase">Logo Satuan Pendidikan</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight mt-1">Logo ini akan muncul pada KOP surat resmi satuan pendidikan Anda.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <MoleculeIdentityInput label="Nama Institusi" value={schoolProfile.name} onChange={v => setSchoolProfile({ ...schoolProfile, name: v })} placeholder="TK Tunas Harapan" />
                <MoleculeIdentityInput label="Email Official" value={schoolProfile.email} onChange={v => setSchoolProfile({ ...schoolProfile, email: v })} placeholder="info@sekolah.com" />
                <div className="md:col-span-2">
                    <MoleculeIdentityInput label="Alamat Operasional" value={schoolProfile.address} onChange={v => setSchoolProfile({ ...schoolProfile, address: v })} placeholder="Alamat lengkap sekolah..." isTextArea />
                </div>
                <MoleculeIdentityInput label="Telp" value={schoolProfile.phone} onChange={v => setSchoolProfile({ ...schoolProfile, phone: v })} placeholder="021-..." />
                <MoleculeIdentityInput label="Kepala Sekolah" value={schoolProfile.principalName} onChange={v => setSchoolProfile({ ...schoolProfile, principalName: v })} placeholder="Nama & Gelar" />
                <MoleculeIdentityInput label="Guru Kelas" value={schoolProfile.teacherName} onChange={v => setSchoolProfile({ ...schoolProfile, teacherName: v })} placeholder="Nama Pengajar" />
            </div>
        </div>
    );
};
