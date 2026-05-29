import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ChevronDown, Sparkles, BookOpen, Settings, Download, Printer, Loader2, Menu } from 'lucide-react';
import { AtomText } from '../atoms/CommonAtoms';

export interface BannerAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

interface SmartBannerProps {
  title: string;
  subtitle: string;
  activePath: string;
  navigation: { label: string; id: string; icon: React.ReactNode }[];
  onNavigate: (id: string) => void;
  actions: BannerAction[];
  onMenuClick?: () => void;
  globalNavigation?: { label: string; id: string; icon: React.ReactNode; description: string }[];
}

export function SmartBanner({ title, subtitle, activePath, navigation, onNavigate, actions, onMenuClick, globalNavigation }: SmartBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGlobal, setShowGlobal] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setShowGlobal(false);
  };

  const toggleGlobal = () => {
    setIsExpanded(!isExpanded);
    setShowGlobal(true);
    onMenuClick?.();
  };

  return (
    <div className="sticky top-0 z-50 w-full px-2 py-2 no-print">
      <motion.div 
        layout
        className={cn(
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden transition-all duration-500",
          isExpanded ? "p-4" : "px-4 py-2"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <button 
                onClick={toggleGlobal}
                className={cn(
                    "p-2 rounded-xl transition-all",
                    showGlobal && isExpanded ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                )}
            >
                <Menu size={18} />
            </button>
            
            <button 
              onClick={toggleExpanded}
              className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-xl transition-all overflow-hidden",
                  !showGlobal && isExpanded ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-900"
              )}
            >
              <div className="truncate text-left shrink">
                <AtomText variant="h2" className="text-sm font-black truncate">{title}</AtomText>
                <AtomText variant="caption" className="text-[10px] opacity-60 truncate">{subtitle}</AtomText>
              </div>
              <motion.div animate={{ rotate: isExpanded && !showGlobal ? 180 : 0 }}>
                <ChevronDown size={14} className="text-slate-400" />
              </motion.div>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
             {actions.slice(0, 2).map((action, i) => (
                <button
                    key={i}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 text-slate-600 dark:text-slate-400"
                >
                    {action.icon}
                </button>
             ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key={showGlobal ? 'global' : 'local'}
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-4"
            >
                {showGlobal && globalNavigation ? (
                    <div className="grid grid-cols-1 gap-2">
                        <div className="px-1 mb-1">
                            <AtomText variant="h3" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Global Navigation</AtomText>
                        </div>
                        {globalNavigation.map((nav) => (
                            <button
                                key={nav.id}
                                onClick={() => { onNavigate(nav.id); setIsExpanded(false); }}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                                    {nav.icon}
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-black uppercase tracking-wider">{nav.label}</div>
                                    <div className="text-[10px] opacity-50 font-bold">{nav.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {navigation.map((nav) => (
                                <button
                                    key={nav.id}
                                    onClick={() => { onNavigate(nav.id); setIsExpanded(false); }}
                                    className={cn(
                                        "flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                        activePath === nav.id
                                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                    )}
                                >
                                    {nav.icon}
                                    {nav.label}
                                </button>
                            ))}
                        </div>
                        {actions.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                                {actions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                            action.variant === 'primary' ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800"
                                        )}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
