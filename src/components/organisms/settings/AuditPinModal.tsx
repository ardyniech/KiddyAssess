import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';
import { AUDIT_PIN } from '../../../constants';

interface AuditPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AuditPinModal: React.FC<AuditPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === AUDIT_PIN) {
            setError(false);
            onSuccess();
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
                                <ShieldCheck size={16} /> Audit Access
                            </h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-black"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter PIN"
                                className="w-full text-center py-4 bg-slate-50 rounded-lg text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-black"
                                maxLength={4}
                                autoFocus
                            />
                            {error && <p className="text-[10px] text-red-500 font-bold uppercase text-center">Invalid PIN</p>}
                            <button type="submit" className="w-full py-4 bg-black text-white rounded-lg font-black text-xs uppercase tracking-[0.2em]">
                                Verify PIN
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
