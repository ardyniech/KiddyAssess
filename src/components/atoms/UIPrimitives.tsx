import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'dark' | 'ghost' | 'outline' | 'warning' | 'error' | 'success';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    fullWidth?: boolean;
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "submit" | "reset";
}

export const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    icon, 
    className, 
    fullWidth,
    ...props 
}: ButtonProps) => {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200",
        secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200",
        dark: "bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 shadow",
        ghost: "bg-slate-50 text-slate-600 hover:bg-slate-100",
        outline: "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm",
        warning: "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200",
        error: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
    };

    const sizes = {
        sm: "h-8 px-3 text-[9px]",
        md: "h-10 px-4 text-[10px]",
        lg: "h-12 px-6 text-[12px]"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
                "flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-widest transition-all cursor-pointer",
                variants[variant] || variants.primary,
                sizes[size],
                fullWidth && "w-full",
                className
            )}
            {...(props as any)}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {children && <span className="truncate">{children}</span>}
        </motion.button>
    );
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hover?: boolean;
    padding?: boolean;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    key?: React.Key;
}

export const Card = ({ children, className, hover = true, padding = true, ...props }: CardProps) => (
    <div 
        className={cn(
            "bg-white border border-slate-100 rounded-2xl md:rounded-3xl shadow-sm transition-all",
            hover && "hover:shadow-md hover:border-slate-200",
            padding && "p-5 md:p-6",
            className
        )}
        {...props}
    >
        {children}
    </div>
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'indigo' | 'outline';
    className?: string;
    key?: React.Key;
}

export const Badge = ({ children, variant = 'default', className, ...props }: BadgeProps) => {
    const variants = {
        default: "bg-slate-100 text-slate-500 border-slate-200",
        success: "bg-emerald-50 text-emerald-600 border-emerald-100",
        warning: "bg-amber-50 text-amber-600 border-amber-100",
        error: "bg-rose-50 text-rose-600 border-rose-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        outline: "bg-white border border-slate-200 text-slate-500"
    };

    return (
        <span 
            className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-current bg-opacity-10 shrink-0",
                variants[variant] || variants.default,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export const SectionHeader = ({ title, subtitle, icon: Icon, actions }: { title: string, subtitle: string, icon?: any, actions?: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
            {Icon && (
                <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow shadow-indigo-100">
                    <Icon size={24} className="md:w-7 md:h-7" />
                </div>
            )}
            <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">{title}</h1>
                <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{subtitle}</p>
            </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
);
