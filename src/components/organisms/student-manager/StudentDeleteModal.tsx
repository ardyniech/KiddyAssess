import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { Student } from '../../../types';

interface StudentDeleteModalProps {
  student: Student;
  onClose: () => void;
  onConfirm: () => void;
}

export function StudentDeleteModal({ student, onClose, onConfirm }: StudentDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-50"
      >
        <div className="p-6 text-center space-y-4">
           <div className="mx-auto w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-2">
              <AlertTriangle size={28} />
           </div>
           
           <div>
              <h2 className="text-sm font-black text-black uppercase tracking-tight mb-1">Konfirmasi Hapus</h2>
              <p className="text-[10px] font-medium text-slate-400">Anda yakin ingin menghapus data <span className="font-black text-red-500">{student.name}</span>? Data penilaian yang terkait juga akan hilang.</p>
           </div>
        </div>

        <div className="p-3 bg-slate-50 flex gap-2 border-t border-slate-100">
           <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
           >
              Batal
           </button>
           <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
           >
              Ya, Hapus
           </button>
        </div>
      </motion.div>
    </div>
  );
}
