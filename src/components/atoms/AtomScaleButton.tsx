import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

interface AtomScaleButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  variant: "BB" | "MB" | "BSH" | "BSB";
  customColor?: string;
  title?: string;
}

const colors = {
  BB: "hover:bg-red-500/10 active:bg-red-500/25",
  MB: "hover:bg-amber-500/10 active:bg-amber-500/25",
  BSH: "hover:bg-emerald-500/10 active:bg-emerald-500/25",
  BSB: "hover:bg-blue-500/10 active:bg-blue-500/25",
};

const activeColors = {
  BB: "bg-red-500 border-red-600 text-white shadow-sm hover:bg-red-600 ring-2 ring-red-500/15",
  MB: "bg-amber-500 border-amber-600 text-white shadow-sm hover:bg-amber-600 ring-2 ring-amber-500/15",
  BSH: "bg-emerald-500 border-emerald-600 text-white shadow-sm hover:bg-emerald-600 ring-2 ring-emerald-500/15",
  BSB: "bg-cyan-500 border-cyan-600 text-white shadow-sm hover:bg-cyan-600 ring-2 ring-cyan-500/15",
};

export const AtomScaleButton: React.FC<AtomScaleButtonProps> = ({ label, active, onClick, variant, customColor, title }) => {
  return (
    <motion.button
      id={`btn-${variant}-${label}`}
      whileTap={{ scale: 0.90, y: 1 }}
      animate={active ? { scale: [0.95, 1.05, 1], transition: { duration: 0.25 } } : { scale: 1 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className={cn(
        "w-full min-h-[30px] px-1 rounded-lg text-[11px] font-black transition-all border flex items-center justify-center text-center cursor-pointer leading-tight uppercase select-none outline-none",
        active 
          ? (customColor ? "border-transparent shadow-sm ring-1 ring-black/10 font-black text-slate-950" : activeColors[variant]) 
          : "bg-white border-slate-300 text-[#3e6aa6] hover:text-[#2c4e7d] hover:border-slate-400 hover:bg-slate-50 font-bold"
      )}
      style={active && customColor ? { backgroundColor: customColor, borderColor: customColor } : undefined}
    >
      {label}
    </motion.button>
  );
}

