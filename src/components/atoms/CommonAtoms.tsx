import React from "react";
import { cn } from "../../lib/utils";

export interface AtomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  [key: string]: any;
}

export function AtomInput({ label, className, value, ...props }: AtomInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-muted ml-1 uppercase tracking-wider">{label}</label>}
      <input
        className={cn(
          "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 rounded-xl px-4 py-3 text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 backdrop-blur-md transition-all",
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
    h1: "text-4xl font-extrabold tracking-tight text-main leading-[1.1]",
    h2: "text-2xl font-bold tracking-tight text-main leading-tight",
    h3: "text-lg font-bold tracking-tight text-main",
    body: "text-base font-medium text-main leading-relaxed",
    caption: "text-xs font-bold text-muted tracking-wide uppercase",
  };
  
  return <p className={cn(variants[variant], className)}>{children}</p>;
}

export function AtomBadge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "success" | "warning" }) {
  const variants = {
    default: "bg-black/5 dark:bg-white/10 text-main shadow-sm",
    success: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
    warning: "bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30",
  };
  
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-black tracking-tight backdrop-blur-md", variants[variant], className)}>
      {children}
    </span>
  );
}
