import React from "react";
import { motion } from "motion/react";
import { LucideIcon, HelpCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  size?: "normal" | "compact" | "mini";
  className?: string;
  illustrationType?: "search" | "users" | "checklist" | "kanban" | "general" | "none";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HelpCircle,
  title,
  description,
  actionLabel,
  onActionClick,
  size = "normal",
  className,
  illustrationType = "general"
}) => {
  // Styles based on size
  const containerClasses = cn(
    "flex flex-col items-center justify-center text-center select-none",
    size === "normal" && "py-16 px-6 md:py-24 md:px-12",
    size === "compact" && "py-8 px-4",
    size === "mini" && "py-4 px-2",
    className
  );

  const iconWrapperClasses = cn(
    "flex items-center justify-center rounded-2xl relative transition-all duration-300",
    size === "normal" && "w-16 h-16 bg-slate-50 border border-slate-200 text-slate-400 mb-6 shadow-xs",
    size === "compact" && "w-12 h-12 bg-slate-50 border border-slate-200 text-slate-400 mb-4 shadow-2xs",
    size === "mini" && "w-8 h-8 bg-slate-50 border border-slate-100 text-slate-400 mb-2"
  );

  const iconSize = size === "normal" ? 24 : size === "compact" ? 18 : 14;

  // Let's create CSS illustrations using styled tailwind shapes
  const renderIllustration = () => {
    if (size === "mini" || illustrationType === "none") return null;

    const scale = size === "compact" ? "scale-75 mb-1" : "mb-4";

    return (
      <div className={cn("relative w-40 h-32 flex items-center justify-center overflow-hidden", scale)}>
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-dotted-spacing-4 bg-dotted-slate-200/40 opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_80%)]" />

        {illustrationType === "search" && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Pulsing radar rings */}
            <motion.div
              animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute w-24 h-24 rounded-full border border-slate-100/60"
            />
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1, ease: "easeInOut" }}
              className="absolute w-24 h-24 rounded-full border border-slate-200/30"
            />
            {/* magnifying glass shadow shapes */}
            <div className="absolute w-12 h-12 rounded-full bg-slate-200/50 -translate-x-3 -translate-y-3 blur-xs" />
            <motion.div 
              animate={{ y: [-3, 3, -3], x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative z-10 w-16 h-16 bg-white border border-slate-200/80 rounded-2xl shadow-md flex items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full border-3 border-indigo-400 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-2 bg-indigo-400 rounded-full rotate-45 transform origin-left" />
            </motion.div>
          </div>
        )}

        {illustrationType === "users" && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Background elements */}
            <div className="absolute w-28 h-28 bg-indigo-50/40 rounded-full -top-1 border border-indigo-100/30" />
            
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute -translate-x-10 z-10 w-12 h-12 bg-white border border-slate-100 rounded-full shadow-sm flex flex-col items-center justify-end overflow-hidden"
            >
              <div className="w-4 h-4 rounded-full bg-slate-300 mt-2" />
              <div className="w-10 h-6 rounded-t-full bg-slate-200" />
            </motion.div>

            <motion.div
              animate={{ y: [-4, 0, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute translate-x-10 z-10 w-12 h-12 bg-white border border-slate-100 rounded-full shadow-sm flex flex-col items-center justify-end overflow-hidden"
            >
              <div className="w-4 h-4 rounded-full bg-amber-300 mt-2" />
              <div className="w-10 h-6 rounded-t-full bg-amber-200/70" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative z-20 w-14 h-14 bg-white border border-slate-200 rounded-full shadow-md flex flex-col items-center justify-end overflow-hidden"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-400 mt-2" />
              <div className="w-12 h-7 rounded-t-full bg-indigo-300/60" />
            </motion.div>
          </div>
        )}

        {illustrationType === "checklist" && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-teal-50/40 rounded-full border border-teal-100/30" />
            
            {/* Sheet of paper */}
            <motion.div 
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative w-16 h-20 bg-white border border-slate-200/80 rounded-xl shadow-xs p-2 flex flex-col gap-1.5"
            >
              {/* Fake lines */}
              <div className="h-2 w-8 bg-indigo-100 rounded-xs" />
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 rounded-xs border border-teal-400 bg-teal-50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-xs" />
                </div>
                <div className="h-1.5 w-10 bg-slate-100 rounded-xs" />
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 rounded-xs border border-slate-300" />
                <div className="h-1.5 w-8 bg-slate-100 rounded-xs" />
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-2.5 h-2.5 rounded-xs border border-slate-300" />
                <div className="h-1.5 w-10 bg-slate-100 rounded-xs" />
              </div>
            </motion.div>
          </div>
        )}

        {illustrationType === "kanban" && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-32 h-20 bg-slate-150/50 rounded-xl border border-dashed border-slate-300/80 flex p-1.5 gap-2 justify-between">
              <div className="w-10 bg-white border border-slate-200/60 rounded-lg shadow-2xs p-1 flex flex-col gap-1 text-[4px]">
                <div className="h-1 w-4 bg-slate-300 rounded-xs" />
                <div className="h-1.5 w-6 bg-slate-100 rounded-xs" />
                <div className="h-1 w-3 bg-indigo-400 rounded-xs mt-auto" />
              </div>
              <div className="w-10 bg-white border border-slate-200/60 rounded-lg shadow-2xs p-1 flex flex-col gap-1 text-[4px] opacity-40">
                <div className="h-1 w-4 bg-slate-300 rounded-xs" />
                <div className="h-1.5 w-6 bg-slate-100 rounded-xs" />
              </div>
              <div className="w-10 bg-white border border-slate-200/60 rounded-lg shadow-2xs p-1 flex flex-col gap-1 text-[4px] opacity-20">
                <div className="h-1 w-4 bg-slate-300 rounded-xs" />
                <div className="h-1.5 w-6 bg-slate-100 rounded-xs" />
              </div>
            </div>
          </div>
        )}

        {illustrationType === "general" && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Beautiful visual glowing box overlayed with stars */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute w-20 h-20 rounded-full border border-dashed border-slate-200"
            />
            <div className="absolute w-16 h-16 bg-gradient-to-tr from-indigo-50/50 to-pink-50/50 rounded-3xl border border-indigo-100/50 shadow-inner flex items-center justify-center" />
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="z-10 w-12 h-12 bg-white border border-slate-200 rounded-xl shadow-md flex items-center justify-center text-slate-400"
            >
              <Icon size={24} className="text-slate-400" />
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={containerClasses}
    >
      {/* Decorative Illustration */}
      {renderIllustration()}

      {/* Basic Icon Wrapper when illustration is absent/small */}
      {(illustrationType === "none" || size === "mini") && (
        <div className={iconWrapperClasses}>
          <Icon size={iconSize} className="text-slate-400" />
        </div>
      )}

      {/* Typography Content */}
      <div className="max-w-md">
        <h5 className={cn(
          "font-black tracking-tight text-slate-900 uppercase tracking-widest",
          size === "normal" && "text-[13px] mb-1.5",
          size === "compact" && "text-xs mb-1",
          size === "mini" && "text-[10px]"
        )}>
          {title}
        </h5>
        
        {description && size !== "mini" && (
          <p className={cn(
            "text-slate-500 font-semibold leading-relaxed",
            size === "normal" && "text-[12px] md:text-sm",
            size === "compact" && "text-[11px]"
          )}>
            {description}
          </p>
        )}
      </div>

      {/* Call to action */}
      {actionLabel && onActionClick && size !== "mini" && (
        <button
          onClick={onActionClick}
          className={cn(
            "mt-5 px-4 py-2 text-[11px] font-black uppercase tracking-wider bg-slate-900 text-white rounded-xl shadow-xs cursor-pointer hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all",
            size === "compact" && "mt-4 px-3.5 py-1.5 text-[10px]"
          )}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};
