import React from "react";
import { cn } from "../../lib/utils";

export interface AtomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  [key: string]: any;
}

export function AtomInput({ label, className, ...props }: AtomInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-white/60 ml-1 uppercase tracking-wider">{label}</label>}
      <input
        className={cn(
          "bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md transition-all",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function AtomText({ children, className, variant = "body" }: { children: React.ReactNode, className?: string, variant?: "h1" | "h2" | "h3" | "body" | "caption" }) {
  const variants = {
    h1: "text-4xl font-bold tracking-tight text-white",
    h2: "text-2xl font-bold tracking-tight text-white/90",
    h3: "text-lg font-semibold text-white/80",
    body: "text-sm text-white/70 leading-relaxed",
    caption: "text-[10px] font-bold uppercase tracking-widest text-white/40",
  };
  
  return <p className={cn(variants[variant], className)}>{children}</p>;
}

export function AtomBadge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "success" | "warning" }) {
  const variants = {
    default: "bg-white/10 text-white/70",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  };
  
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md", variants[variant], className)}>
      {children}
    </span>
  );
}
