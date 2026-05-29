import React, { useState } from 'react';
import { motion } from 'motion/react';
import { School } from 'lucide-react';
import { signInWithGoogle } from '../../lib/firebase';
import { AuditPinModal } from './settings/AuditPinModal';

export const LandingPage: React.FC = () => {
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const handleAuditSuccess = () => {
        localStorage.setItem('kiddyapps_audit_mode', 'true');
        localStorage.setItem('kiddyapps_audit_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString()); // 24 hours
        window.location.reload();
    };

    return (
        <div className="h-screen w-full bg-white flex flex-col items-center justify-center p-6 sm:p-24 overflow-hidden relative selection:bg-black selection:text-white">
           {/* Background Noise/Grid (Subtle) */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px), radial-gradient(#000 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />

           <motion.div 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }}
             className="w-full max-w-xl space-y-12 relative z-10"
           >
              <div className="space-y-4">
                 <div className="w-12 h-12 bg-black rounded flex items-center justify-center mb-8 shadow-2xl">
                    <School className="w-6 h-6 text-white" />
                 </div>
                 
                 <h1 className="text-6xl sm:text-8xl font-black text-black tracking-tighter leading-[0.85] uppercase">
                    Kiddy<br /><span className="opacity-20">Apps</span>
                 </h1>
                 
                 <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.4em] max-w-xs">
                    Manajemen Akademik Minimalis untuk Pendidik Progresif.
                 </p>
              </div>

              <div className="space-y-4 max-w-sm">
                <button 
                    onClick={signInWithGoogle}
                    className="w-full py-5 bg-black text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-2xl"
                >
                    Masuk dengan Google
                </button>
                <button 
                    onClick={() => setIsPinModalOpen(true)}
                    className="w-full py-3 bg-slate-100 text-slate-600 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all"
                >
                    Audit Access (PIN)
                </button>
              </div>
           </motion.div>

           <div className="absolute bottom-12 left-12">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-10">Workspace v3.0</span>
           </div>

           <AuditPinModal 
                isOpen={isPinModalOpen} 
                onClose={() => setIsPinModalOpen(false)} 
                onSuccess={handleAuditSuccess} 
           />
        </div>
    );
};

