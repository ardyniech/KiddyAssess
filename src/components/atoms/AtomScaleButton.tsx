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

const activeColors = {
  BB: "bg-red-500 border-red-600 text-white shadow-sm hover:bg-red-600 ring-2 ring-red-500/15",
  MB: "bg-amber-500 border-amber-600 text-white shadow-sm hover:bg-amber-600 ring-2 ring-amber-500/15",
  BSH: "bg-emerald-500 border-emerald-600 text-white shadow-sm hover:bg-emerald-600 ring-2 ring-emerald-500/15",
  BSB: "bg-cyan-500 border-cyan-600 text-white shadow-sm hover:bg-cyan-600 ring-2 ring-cyan-500/15",
};

const inactiveColors = {
  BB: "bg-white border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 hover:text-red-600 font-bold",
  MB: "bg-white border-amber-300 text-amber-500 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 font-bold",
  BSH: "bg-white border-emerald-300 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 font-bold",
  BSB: "bg-white border-cyan-300 text-cyan-500 hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-600 font-bold",
};

export const AtomScaleButton: React.FC<AtomScaleButtonProps> = ({ label, active, onClick, variant, customColor, title }) => {
  const isCustomHex = customColor?.startsWith('#');
  const isTailwindClass = customColor?.startsWith('bg-');

  let activeClass = activeColors[variant];
  if (isTailwindClass) {
    activeClass = `${customColor} border-transparent text-white shadow-sm ring-2 ring-black/10`;
  } else if (isCustomHex) {
    activeClass = "border-transparent text-white shadow-sm ring-1 ring-black/10 font-black";
  }

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
        active ? activeClass : inactiveColors[variant]
      )}
      style={active && isCustomHex ? { backgroundColor: customColor, borderColor: customColor } : undefined}
    >
      {label}
    </motion.button>
  );
}

