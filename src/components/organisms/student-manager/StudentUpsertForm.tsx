import React from 'react';
import { MoleculeFormInput } from '../../molecules/Molecules';
import { MoleculeHelpTooltip } from '../../molecules/MoleculeHelpTooltip';
import { Student } from '../../../types';

interface StudentUpsertFormProps {
    editingStudent: Student | null;
    formData: Omit<Student, "id" | "updatedAt">;
    setFormData: (data: Omit<Student, "id" | "updatedAt">) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export const StudentUpsertForm: React.FC<StudentUpsertFormProps> = ({ 
    editingStudent, 
    formData, 
    setFormData, 
    onSubmit, 
    onCancel 
}) => {
    return (
        <div className="flex-1 p-3 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-black text-black uppercase tracking-widest mb-4 text-center">
                {editingStudent ? "Ubah Entri" : "Pengaturan Entri Baru"}
            </div>
            <form onSubmit={onSubmit} className="space-y-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <MoleculeFormInput 
                    label="Nama Lengkap" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Muhammad Al-Fatih"
                />
                <div className="grid grid-cols-2 gap-3">
                    <MoleculeFormInput 
                        label="Nomor Induk / NISN" 
                        value={formData.nisn || ""} 
                        onChange={e => setFormData({ ...formData, nisn: e.target.value })}
                        placeholder="N I S N"
                    />
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Kelas</label>
                        <select 
                            value={formData.kelompok} 
                            onChange={e => setFormData({ ...formData, kelompok: e.target.value })}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-black text-black focus:outline-none focus:border-black appearance-none"
                        >
                            <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option><option value="B2">B2</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                        <select 
                            value={formData.semester} 
                            onChange={e => setFormData({ ...formData, semester: e.target.value })}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-black text-black focus:outline-none focus:border-black appearance-none"
                        >
                            <option value="1">1</option><option value="2">2</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe</label>
                        <select 
                            value={formData.semesterType} 
                            onChange={e => setFormData({ ...formData, semesterType: e.target.value as any })}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-black text-black focus:outline-none focus:border-black appearance-none"
                        >
                            <option value="Ganjil">Ganjil</option><option value="Genap">Genap</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <MoleculeFormInput label="Tinggi (cm)" value={formData.height ? formData.height.toString() : ""} onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })} placeholder="100" />
                    <MoleculeFormInput label="Berat (kg)" value={formData.weight ? formData.weight.toString() : ""} onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })} placeholder="15" />
                </div>
                <MoleculeFormInput label="URL Foto Profil" value={formData.photoUrl || ""} onChange={e => setFormData({ ...formData, photoUrl: e.target.value })} placeholder="https://..." />
                <div className="flex gap-2 pt-3">
                    <button type="button" onClick={onCancel} className="flex-1 py-1.5 text-[9px] font-black text-slate-400 hover:text-black transition-colors uppercase">Batal</button>
                    <button type="submit" className="flex-1 py-1.5 bg-black rounded-lg text-[9px] font-black text-white hover:bg-slate-800 transition-all uppercase tracking-widest">
                        {editingStudent ? "Perbarui" : "Konfirmasi"}
                    </button>
                </div>
            </form>
        </div>
    );
};
