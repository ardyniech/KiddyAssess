import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Edit2, User, Camera } from 'lucide-react';
import { Student } from '../../../types';

interface StudentEditModalProps {
  student: Student;
  onClose: () => void;
  onSubmit: (student: Student) => void;
}

export function StudentEditModal({ student, onClose, onSubmit }: StudentEditModalProps) {
  const [formData, setFormData] = useState<Student>({ ...student });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Modal Header */}
        <div className="bg-black p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Edit2 size={16} />
            <h2 className="text-xs font-black uppercase tracking-widest">Edit Record Siswa</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
           {/* Profile Preview */}
           <div className="flex flex-col items-center mb-6">
              <div className="relative">
                 <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                    {formData.photoUrl ? (
                       <img src={formData.photoUrl} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                       <User size={32} className="text-slate-200" />
                    )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white border-2 border-white shadow-lg">
                    <Camera size={14} />
                 </div>
              </div>
           </div>

           <div className="space-y-3">
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nama Lengkap Siswa</label>
                 <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Muhammad Ali"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-black focus:border-black outline-none transition-all"
                 />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Kelompok/Kelas</label>
                  <input 
                      value={formData.kelompok}
                      onChange={e => setFormData({...formData, kelompok: e.target.value})}
                      placeholder="B2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-black focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Semester</label>
                  <select 
                      value={formData.semester}
                      onChange={e => setFormData({...formData, semester: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-black focus:border-black outline-none transition-all appearance-none"
                  >
                     <option value="I (Satu)">Semester I</option>
                     <option value="II (Dua)">Semester II</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">URL Foto (Optional)</label>
                <input 
                  value={formData.photoUrl || ''}
                  onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-black focus:border-black outline-none transition-all"
                />
              </div>
           </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 flex items-center gap-2 border-t border-slate-100">
           <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
           >
              Batal
           </button>
           <button 
              onClick={() => onSubmit(formData)}
              className="flex-[1.5] px-4 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
           >
              Simpan Perubahan
           </button>
        </div>
      </motion.div>
    </div>
  );
}
