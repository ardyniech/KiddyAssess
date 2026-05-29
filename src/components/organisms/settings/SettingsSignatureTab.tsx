import React, { useRef, useState } from 'react';
import { FileDown, Image, Sparkles, Trash2, Upload, PenTool } from 'lucide-react';
import { SchoolProfile } from '../../../types';

interface SettingsSignatureTabProps {
    schoolProfile: SchoolProfile;
    setSchoolProfile: (profile: SchoolProfile) => void;
}

export const SettingsSignatureTab: React.FC<SettingsSignatureTabProps> = ({ 
    schoolProfile, 
    setSchoolProfile 
}) => {
    const teacherSigRef = useRef<HTMLInputElement>(null);
    const principalSigRef = useRef<HTMLInputElement>(null);
    const stampRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    // Canvas state for manual drawing pad
    const [isDrawing, setIsDrawing] = useState(false);
    const [activePad, setActivePad] = useState<'teacher' | 'principal' | null>(null);
    const scratchContext = useRef<CanvasRenderingContext2D | null>(null);

    const handleFileChange = (field: 'teacherSignatureUrl' | 'principalSignatureUrl' | 'schoolStampUrl', file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
             if (typeof reader.result === 'string') {
                  setSchoolProfile({ ...schoolProfile, [field]: reader.result });
             }
        };
        reader.readAsDataURL(file);
    };

    const handleToggle = (field: 'enableDigitalSignature' | 'enableDigitalStamp') => {
        setSchoolProfile({
            ...schoolProfile,
            [field]: !schoolProfile[field]
        });
    };

    const handleClearField = (field: 'teacherSignatureUrl' | 'principalSignatureUrl' | 'schoolStampUrl') => {
        setSchoolProfile({ ...schoolProfile, [field]: undefined });
    };

    // Digital Canvas pad handlers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        setIsDrawing(true);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.strokeStyle = "#1e3a8a"; // Deep navy blue ink
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const rect = canvas.getBoundingClientRect();
        let clientX = 0, clientY = 0;
        
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        scratchContext.current = ctx;
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !scratchContext.current || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = scratchContext.current;
        const rect = canvas.getBoundingClientRect();
        
        let clientX = 0, clientY = 0;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        scratchContext.current = null;
    };

    const openDrawingPad = (padType: 'teacher' | 'principal') => {
        setActivePad(padType);
        setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // Draw dummy guideline
                    ctx.strokeStyle = '#e2e8f0';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(10, 110);
                    ctx.lineTo(290, 110);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
        }, 100);
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas || !activePad) return;
        
        // Convert canvas back to image
        const dataUrl = canvas.toDataURL('image/png');
        const field = activePad === 'teacher' ? 'teacherSignatureUrl' : 'principalSignatureUrl';
        
        setSchoolProfile({
            ...schoolProfile,
            [field]: dataUrl,
            enableDigitalSignature: true // Enable signature layout on save
        });
        
        setActivePad(null);
    };

    return (
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Callout Info */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 flex gap-3 text-slate-800 dark:text-slate-200">
                <Sparkles className="text-emerald-500 shrink-0" size={18} />
                <div className="text-xs font-semibold leading-relaxed uppercase tracking-tighter">
                    <p className="font-bold">Setup Tanda Tangan & Stempel Resmi (Satu Kali Setup)</p>
                    <p className="text-slate-500 mt-0.5 normal-case font-medium">Unggah atau gambarkan tanda tangan & stempel sekolah Anda agar otomatis terlampir di bagian bawah lembar rapor. Sangat mudah, aman, dan meningkatkan produktivitas!</p>
                </div>
            </div>

            {/* Global Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Lampirkan Tanda Tangan</h4>
                        <p className="text-[10px] text-slate-500 leading-none mt-1 font-medium">Sematkan ttd guru & kepsek di rapor</p>
                    </div>
                    <button 
                        onClick={() => handleToggle('enableDigitalSignature')}
                        className={`w-12 h-6 rounded-full transition-all relative flex items-center p-1 cursor-pointer ${schoolProfile.enableDigitalSignature ? 'bg-sky-500' : 'bg-slate-200'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-all transform ${schoolProfile.enableDigitalSignature ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Lampirkan Stempel Resmi</h4>
                        <p className="text-[10px] text-slate-500 leading-none mt-1 font-medium">Sematkan cap basah lembaga di rapor</p>
                    </div>
                    <button 
                        onClick={() => handleToggle('enableDigitalStamp')}
                        className={`w-12 h-6 rounded-full transition-all relative flex items-center p-1 cursor-pointer ${schoolProfile.enableDigitalStamp ? 'bg-sky-500' : 'bg-slate-200'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-all transform ${schoolProfile.enableDigitalStamp ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Upload Area for Signatures & Stamp */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Guru Kelas Signature */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between min-h-[220px]">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Tanda Tangan Guru</span>
                            <span className="bg-sky-100 text-[8px] font-black uppercase text-sky-600 px-1.5 py-0.5 rounded-full">Kelompok B2</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mb-3">Tanda tangan guru kelas kelompok B2.</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center">
                        {schoolProfile.teacherSignatureUrl ? (
                            <div className="relative w-full h-24 bg-white rounded-lg border border-slate-200 p-2 flex items-center justify-center group overflow-hidden">
                                <img src={schoolProfile.teacherSignatureUrl} className="max-h-full max-w-full object-contain" alt="Signature" />
                                <button 
                                    onClick={() => handleClearField('teacherSignatureUrl')}
                                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-bold text-xs gap-1 rounded-lg"
                                >
                                    <Trash2 size={14} /> Hapus
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => teacherSigRef.current?.click()} 
                                    className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 text-[10px] font-bold gap-1 cursor-pointer shadow-sm"
                                >
                                    <Upload size={14} /> Upload Image
                                </button>
                                <button 
                                    onClick={() => openDrawingPad('teacher')} 
                                    className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-sky-600 border-sky-200 text-[10px] font-bold gap-1 cursor-pointer shadow-sm"
                                >
                                    <PenTool size={14} /> Draw Pad
                                </button>
                            </div>
                        )}
                        <input ref={teacherSigRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileChange('teacherSignatureUrl', f);
                        }} />
                    </div>
                </div>

                {/* 2. Kepala Sekolah Signature */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between min-h-[220px]">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Tanda Tangan Kepsek</span>
                            <span className="bg-emerald-100 text-[8px] font-black uppercase text-emerald-600 px-1.5 py-0.5 rounded-full">Principal</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mb-3">Tanda tangan Kepala TK Kartika IV-80.</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center">
                        {schoolProfile.principalSignatureUrl ? (
                            <div className="relative w-full h-24 bg-white rounded-lg border border-slate-200 p-2 flex items-center justify-center group overflow-hidden">
                                <img src={schoolProfile.principalSignatureUrl} className="max-h-full max-w-full object-contain" alt="Principal Signature" />
                                <button 
                                    onClick={() => handleClearField('principalSignatureUrl')}
                                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-bold text-xs gap-1 rounded-lg"
                                >
                                    <Trash2 size={14} /> Hapus
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => principalSigRef.current?.click()} 
                                    className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 text-[10px] font-bold gap-1 cursor-pointer shadow-sm"
                                >
                                    <Upload size={14} /> Upload Image
                                </button>
                                <button 
                                    onClick={() => openDrawingPad('principal')} 
                                    className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-sky-600 border-sky-200 text-[10px] font-bold gap-1 cursor-pointer shadow-sm"
                                >
                                    <PenTool size={14} /> Draw Pad
                                </button>
                            </div>
                        )}
                        <input ref={principalSigRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileChange('principalSignatureUrl', f);
                        }} />
                    </div>
                </div>

                {/* 3. Stempel Resmi */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between min-h-[220px]">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Stempel Lembaga</span>
                            <span className="bg-red-100 text-[8px] font-black uppercase text-red-600 px-1.5 py-0.5 rounded-full">Stempel</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mb-3">Stempel dinas resmi TK Kartika IV-80.</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center">
                        {schoolProfile.schoolStampUrl ? (
                            <div className="relative w-full h-24 bg-white rounded-lg border border-slate-200 p-2 flex items-center justify-center group overflow-hidden">
                                <img src={schoolProfile.schoolStampUrl} className="max-h-full max-w-full object-contain" alt="Stempel" />
                                <button 
                                    onClick={() => handleClearField('schoolStampUrl')}
                                    className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-bold text-xs gap-1 rounded-lg"
                                >
                                    <Trash2 size={14} /> Hapus
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => stampRef.current?.click()} 
                                className="p-4 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 text-[10px] font-bold gap-2 cursor-pointer shadow-sm"
                            >
                                <Upload size={16} /> Upload Gambar Stempel
                            </button>
                        )}
                        <input ref={stampRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileChange('schoolStampUrl', f);
                        }} />
                    </div>
                </div>
            </div>

            {/* Drawing Canvas Modal/Overlay */}
            {activePad && (
                <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-inner flex flex-col items-center gap-3">
                    <div className="flex justify-between items-center w-full">
                        <span className="text-[11px] font-bold uppercase text-slate-700 flex items-center gap-1.5">
                            <PenTool size={14} className="text-sky-500" />
                            Gambarkan Tanda Tangan Anda ({activePad === 'teacher' ? 'Guru' : 'Kepsek'})
                        </span>
                        <button onClick={() => setActivePad(null)} className="text-xs text-red-500 hover:text-red-700 font-bold">X Tutup</button>
                    </div>
                    <canvas 
                        ref={canvasRef}
                        width={300}
                        height={140}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 cursor-crosshair touch-none"
                    />
                    <div className="flex gap-2 w-full justify-end">
                        <button 
                            onClick={() => openDrawingPad(activePad)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-extrabold uppercase"
                        >
                            Reset Canvas
                        </button>
                        <button 
                            onClick={saveDrawing}
                            className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-[10px] font-extrabold uppercase shadow-sm"
                        >
                            Simpan Coretan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
