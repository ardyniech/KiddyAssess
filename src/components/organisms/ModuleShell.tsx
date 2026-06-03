import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppModule } from '../../types';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';
import { usePermissions } from '../../context/PermissionContext';
import { UnauthorizedMessage, StudentSelector } from './module-shell/ModuleShellSubComponents';

interface ModuleShellProps {
    activeModule: AppModule;
    moduleProps: any;
    isLoading?: boolean;
    error?: string | null;
}

/**
 * ModuleShell: The second layer of the platform.
 * It provides a standardized environment for any plug-and-play module.
 */
export const ModuleShell: React.FC<ModuleShellProps> = ({ 
    activeModule, 
    moduleProps, 
    isLoading = false,
    error = null 
}) => {
    const Component = activeModule.component;
    const { student, students = [] } = moduleProps;
    const { canAccessModule, userRole } = usePermissions();

    const isAuthorized = canAccessModule(activeModule.id, activeModule.requiredRoles);

    return (
        <div className="flex-1 flex flex-col relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeModule.id}
                    initial={{ opacity: 0, y: 10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 1.01 }}
                    transition={{ 
                        duration: 0.4, 
                        ease: [0.23, 1, 0.32, 1] 
                    }}
                    className="flex-1 flex flex-col"
                >
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-100/30 backdrop-blur-md">
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 180, 360]
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full mb-6"
                            />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Mounting Environment</span>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-rose-50/30">
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-6 font-bold shadow-lg shadow-rose-500/10">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-tighter">Module Error</h3>
                            <p className="text-[10px] text-slate-500 font-bold max-w-xs text-center leading-relaxed">
                                {error}
                            </p>
                        </div>
                    ) : !isAuthorized ? (
                        <UnauthorizedMessage userRole={userRole} moduleName={activeModule.name} />
                    ) : activeModule.requiresStudent && !student ? (
                        <StudentSelector 
                            students={students}
                            activeModule={activeModule}
                            moduleProps={moduleProps}
                        />
                    ) : (
                        <div className={cn(
                            "flex-1 flex flex-col",
                            activeModule.category === 'core' ? "bg-white" : "bg-slate-50/30"
                        )}>
                            <Component {...moduleProps} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
