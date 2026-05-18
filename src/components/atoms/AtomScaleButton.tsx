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
  BB: "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-400 text-white",
  MB: "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] border-yellow-400 text-white",
  BSH: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-400 text-white",
  BSB: "bg-sky-500 shadow-[0_0_15px_rgba(56,189,248,0.5)] border-sky-400 text-white",
};

export const AtomScaleButton: React.FC<AtomScaleButtonProps> = ({ label, active, onClick, variant }) => {
  return (
    <button
      id={`btn-${variant}-${label}`}
      onClick={onClick}
      className={cn(
        "flex-1 py-1 px-1.5 md:py-1.5 md:px-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all duration-300 border border-white/5 text-slate-400 backdrop-blur-sm",
        active ? activeColors[variant] : "bg-white/5 hover:bg-white/10"
      )}
    >
      {label}
    </button>
  );
}
