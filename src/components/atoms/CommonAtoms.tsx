import React from "react";
import { cn } from "../../lib/utils";

export interface AtomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  [key: string]: any;
}

export function AtomInput({ label, className, value, ...props }: AtomInputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase tracking-widest">{label}</label>}
      <input
        className={cn(
          "bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-medium text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all shadow-xs",
          className
        )}
        value={value ?? ""}
        {...props}
      />
    </div>
  );
}

export function AtomText({ children, className, variant = "body" }: { children: React.ReactNode, className?: string, variant?: "h1" | "h2" | "h3" | "body" | "caption" }) {
  const variants = {
    h1: "text-3xl font-black tracking-tight text-black leading-none",
    h2: "text-xl font-extrabold tracking-tight text-black leading-tight",
    h3: "text-[15px] font-bold tracking-tight text-black",
    body: "text-[13px] font-medium text-black leading-snug",
    caption: "text-[10px] font-black text-slate-500 tracking-widest uppercase",
  };
  
  return <p className={cn(variants[variant], className)}>{children}</p>;
}

export function AtomBadge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "success" | "warning" }) {
  const variants = {
    default: "bg-slate-100 text-black border border-slate-200",
    success: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
    warning: "bg-orange-500/10 text-orange-700 border border-orange-500/20",
  };
  
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black tracking-tight", variants[variant], className)}>
      {children}
    </span>
  );
}
