import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { AtomText } from '../../atoms/CommonAtoms';
import { Student } from '../../../types';

interface DeleteConfirmationDialogProps {
    student: Student;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ 
    student, 
    onConfirm, 
    onCancel 
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm glass-card p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] bg-card-bg dark:bg-slate-900 shadow-2xl border-black/5 flex flex-col items-center text-center"
            >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6"><Trash2 size={24} /></div>
                <AtomText variant="h3" className="mb-2 text-slate-900 dark:text-white font-black tracking-tight">Hapus Data Murid?</AtomText>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Apakah Anda yakin ingin menghapus data <span className="font-black text-slate-900 dark:text-white">"{student.name}"</span>? 
                    Seluruh data penilaian murid ini akan ikut terhapus secara permanen.
                </p>
                <div className="flex gap-3 w-full">
                    <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all">Batal</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-500/20 transition-all">Hapus</button>
                </div>
            </motion.div>
        </div>
    );
};
