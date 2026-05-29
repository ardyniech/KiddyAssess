import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Users, BookOpen, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OnboardingWizardProps {
    onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const steps = [
        { id: 1, title: 'Tambah Kelas', description: 'Buat kelas untuk memulai.', icon: BookOpen },
        { id: 2, title: 'Tambah Siswa', description: 'Daftarkan siswa ke dalam kelas.', icon: Users },
        { id: 3, title: 'Mulai Absensi', description: 'Catat kehadiran harian kelas.', icon: Clock },
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col p-6">
            <div className="flex-1 flex flex-col justify-center gap-8">
                <div className="text-center">
                    <h2 className="text-2xl font-black text-indigo-950">Selamat Datang di KiddyApps</h2>
                    <p className="text-slate-500 mt-2">Mari siapkan kelas Anda dalam 3 langkah singkat.</p>
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center"
                    >
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <currentStep.icon className="text-indigo-600" size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">{currentStep.title}</h3>
                        <p className="text-slate-600 mt-1">{currentStep.description}</p>
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-center gap-1">
                    {steps.map(s => (
                        <div key={s.id} className={cn("h-1.5 w-6 rounded-full transition-all", step === s.id ? "bg-indigo-600" : "bg-slate-200")} />
                    ))}
                </div>
            </div>

            <button
                onClick={() => step < 3 ? setStep(step + 1) : onComplete()}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-200"
            >
                {step < 3 ? 'Selanjutnya' : 'Selesai'}
                <ChevronRight size={18} />
            </button>
        </div>
    );
};
