import React from 'react';
import { motion } from 'motion/react';
import { School, Fingerprint, ShieldCheck, Key, Settings2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSplashProps {
    splashOnly?: boolean;
    userRole?: string | null;
}

export const LoadingSplash = ({ splashOnly, userRole }: LoadingSplashProps) => {
    let title = "Kiddy";
    let highlight = "Apps";
    let subtitle = "MEMULAI SISTEM INTI";
    let icon = School;
    let colorClass = "text-indigo-600";
    let bgBlurColorClass = "bg-indigo-50/50";
    let iconBgClass = "bg-indigo-600";
    
    if (userRole === 'MASTER') {
        title = "Master";
        highlight = "Kiddy";
        subtitle = "PENGENDALI UTAMA SISTEM";
        icon = Fingerprint;
        colorClass = "text-red-600";
        bgBlurColorClass = "bg-red-50/50";
        iconBgClass = "bg-red-600";
    } else if (userRole === 'SUPER_USER') {
        title = "Kiddy";
        highlight = "Yayasan";
        subtitle = "PANTAUAN STRATEGIK";
        icon = ShieldCheck;
        colorClass = "text-amber-600";
        bgBlurColorClass = "bg-amber-50/50";
        iconBgClass = "bg-amber-600";
    } else if (userRole === 'ADMIN') {
        title = "TK Ceria";
        highlight = "Bahagia";
        subtitle = "DASHBOARD KEPALA SEKOLAH";
        icon = Key;
        colorClass = "text-emerald-600";
        bgBlurColorClass = "bg-emerald-50/50";
        iconBgClass = "bg-emerald-600";
    } else if (userRole === 'TEACHER') {
        title = "Kiddy";
        highlight = "Apps";
        subtitle = "BELAJAR TERBANTU AI";
        icon = School;
        colorClass = "text-indigo-600";
        bgBlurColorClass = "bg-indigo-50/50";
        iconBgClass = "bg-indigo-600";
    } else if (userRole === 'OPERATOR') {
        title = "TU Kiddy";
        highlight = "Apps";
        subtitle = "TERMINAL OPERATOR DATA";
        icon = Settings2;
        colorClass = "text-purple-600";
        bgBlurColorClass = "bg-purple-50/50";
        iconBgClass = "bg-[#7E5CAD]";
    }

    if (splashOnly) subtitle = "KiddyApps v3.0";

    const IconComponent = icon;

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        },
        exit: { 
            opacity: 0,
            scale: 1.05,
            filter: "blur(10px)",
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    };

    const itemVariants: any = {
        hidden: { y: 15, opacity: 0, scale: 0.95 },
        visible: { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            transition: { type: "spring", stiffness: 200, damping: 20 }
        }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
        >
            <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className={cn("absolute inset-0 w-full h-full blur-[80px] pointer-events-none", bgBlurColorClass)} 
            />
            
            <motion.div className="flex flex-col items-center max-w-sm w-full relative z-10 px-4">
                <motion.div 
                    variants={itemVariants}
                    className={cn("w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg mb-8 relative overflow-hidden text-white", iconBgClass)}
                >
                    <IconComponent className="w-9 h-9 text-white relative z-10" />
                    <motion.div 
                        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.35, 0.15] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-white"
                    />
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 w-full">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase flex flex-wrap items-center justify-center gap-1.5 w-full">
                        <span>{title}</span>
                        <span className={colorClass}>{highlight}</span>
                    </h1>
                    
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex items-center gap-3 w-full mt-1"
                    >
                        <div className="h-[1.5px] flex-1 bg-slate-200" />
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider whitespace-nowrap px-1">
                            {subtitle}
                        </span>
                        <div className="h-[1.5px] flex-1 bg-slate-200" />
                    </motion.div>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    className="mt-10 flex items-center gap-1.5"
                >
                    {[0, 1, 2].map(i => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                            className={cn("w-2 h-2 rounded-full", iconBgClass)}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
