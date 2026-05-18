import React from "react";
import { cn } from "../../lib/utils";

interface AtomScaleButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  variant: "BB" | "MB" | "BSH" | "BSB";
}

const colors = {
  BB: "hover:bg-red-500/30 active:bg-red-500/50",
  MB: "hover:bg-orange-500/30 active:bg-orange-500/50",
  BSH: "hover:bg-emerald-500/30 active:bg-emerald-500/50",
  BSB: "hover:bg-blue-500/30 active:bg-blue-500/50",
};

const activeColors = {
  BB: "bg-red-500 shadow-lg border-red-400 text-white dark:shadow-red-500/40 neon-red",
  MB: "bg-amber-500 shadow-lg border-amber-400 text-white dark:shadow-amber-500/40 neon-amber",
  BSH: "bg-emerald-500 shadow-lg border-emerald-400 text-white dark:shadow-emerald-500/40 neon-emerald",
  BSB: "bg-cyan-500 shadow-lg border-cyan-400 text-white dark:shadow-cyan-500/40 neon-cyan",
};

export const AtomScaleButton: React.FC<AtomScaleButtonProps> = ({ label, active, onClick, variant }) => {
  return (
    <button
      id={`btn-${variant}-${label}`}
      onClick={onClick}
      className={cn(
        "flex-1 py-1 md:py-1.5 px-1 rounded-md md:rounded-xl text-[10px] md:text-sm font-black transition-all duration-300 border border-white/5 text-slate-500 dark:text-slate-400 backdrop-blur-sm active:scale-95",
        active ? activeColors[variant] : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}
