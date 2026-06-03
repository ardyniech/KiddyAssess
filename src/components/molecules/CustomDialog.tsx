import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertTriangle, HelpCircle } from 'lucide-react';

interface CustomConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function CustomConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yakin",
  cancelText = "Batal",
  variant = 'warning'
}: CustomConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-auto select-none"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Aspect Icon Badge */}
            <div className={`p-4 rounded-full ${
              variant === 'danger' 
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' 
                : variant === 'warning'
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
            }`}>
              <AlertTriangle size={28} className="animate-pulse" />
            </div>

            {/* Typography block */}
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white leading-snug">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {message}
              </p>
            </div>

            {/* Call to Actions - Side by Side Touch Friendly */}
            <div className="flex gap-2.5 w-full pt-2">
              <button
                onClick={onCancel}
                className="flex-1 min-h-[44px] px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-98 transition-all cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 min-h-[44px] px-4 py-2 text-white text-[10px] font-black uppercase tracking-wider rounded-xl active:scale-98 transition-all shadow-md cursor-pointer ${
                  variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                    : variant === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface CustomPromptModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function CustomPromptModal({
  isOpen,
  title,
  message,
  placeholder = "Masukkan nilai di sini...",
  defaultValue = "",
  onConfirm,
  onCancel,
  confirmText = "Proses",
  cancelText = "Batal"
}: CustomPromptModalProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  React.useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(inputValue);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-auto"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <HelpCircle size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Input field touch target optimized */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:border-indigo-600 outline-none transition-all dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              autoFocus
            />

            {/* Action buttons */}
            <div className="flex gap-2 w-full pt-1 select-none">
              <button
                onClick={onCancel}
                className="flex-1 min-h-[44px] px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-98 transition-all cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="flex-1 min-h-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider rounded-xl active:scale-98 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
