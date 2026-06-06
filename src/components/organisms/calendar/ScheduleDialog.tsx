import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { Button } from '../../atoms/UIPrimitives';
import { ConflictReport, Event } from './types';
import { ConflictReportCard } from './ConflictReportCard';

interface ScheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newEvent: Omit<Event, 'id'>) => void;
    existingEvents: Event[];
    initialDate?: string;
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    existingEvents,
    initialDate = new Date().toISOString().split('T')[0]
}) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(initialDate);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');
    const [category, setCategory] = useState<Event['category']>('Assessment');
    const [location, setLocation] = useState('Gedung Utama / Kelas');
    const [description, setDescription] = useState('');
    const [conflictReport, setConflictReport] = useState<ConflictReport | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setDate(initialDate);
    }, [isOpen, initialDate]);

    // Check conflict when structural scheduling parameters are changed
    useEffect(() => {
        if (!isOpen || !date || !startTime || !endTime) return;

        const handler = setTimeout(async () => {
            setIsAnalyzing(true);
            try {
                const response = await fetch('/api/calendar/detect-conflicts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        newEvent: { title, date, startTime, endTime, category, description },
                        existingEvents
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    setConflictReport(data);
                }
            } catch (err) {
                console.error("Failed conflict check", err);
            } finally {
                setIsAnalyzing(false);
            }
        }, 600);

        return () => clearTimeout(handler);
    }, [isOpen, date, startTime, endTime, category, title]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave({ title, date, startTime, endTime, category, location, description });
        setTitle('');
        setDescription('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-3xl p-5 md:p-6 shadow-2xl z-10 overflow-y-auto max-h-[90vh] custom-scrollbar border border-slate-100">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-700 font-mono">Penjadual Cerdas AI</span>
                            <h3 className="text-sm font-black text-slate-950 uppercase mt-0.5">Jadwalkan Agenda Baru</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 border border-slate-150 rounded-xl cursor-pointer">
                            <X size={15} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Judul Agenda *</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Misal: Penilaian Harian Motorik, Rapat Komite" required className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Kategori Agenda</label>
                                <select value={category} onChange={e => setCategory(e.target.value as Event['category'])} className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:border-indigo-500 outline-none">
                                    <option value="Assessment">Asesmen / Capaian Nilai</option>
                                    <option value="Meeting">Rapat Orang Tua / Konsultasi</option>
                                    <option value="Event">Acara Sekolah / Outbound</option>
                                    <option value="Academic">Kegiatan Akademis</option>
                                    <option value="Holiday">Hari Libur Siswa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Tanggal</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Jam Mulai</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Jam Selesai</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Lokasi</label>
                            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Misal: Ruang Kelas B, Aula Utama" className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Deskripsi Tambahan</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Masukkan deskripsi penjelas di sini..." className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none resize-none" />
                        </div>

                        <ConflictReportCard report={conflictReport} isValidating={isAnalyzing} />

                        <div className="flex gap-2 pt-2 justify-end">
                            <Button type="button" variant="outline" className="text-[10px] uppercase font-black tracking-widest cursor-pointer px-4" onClick={onClose}>Batal</Button>
                            <Button type="submit" variant="primary" className="text-[10px] uppercase font-black tracking-widest cursor-pointer px-4" disabled={conflictReport?.status === 'konflik'}>
                                {category === 'Assessment' ? 'Daftarkan Asesmen' : category === 'Meeting' ? 'Jadwalkan Konsultasi' : 'Daftarkan Agenda'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
