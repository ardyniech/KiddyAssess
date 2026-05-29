import React from 'react';
import { Users, FileText, Image, ChevronRight, UploadCloud, DownloadCloud, Trash2 } from 'lucide-react';
import { MoleculeSettingsSection, MoleculeSettingItem } from '../../molecules/SettingsMolecules';
import { MoleculeStatsCard } from '../../molecules/DashboardMolecules';

interface SettingsAdvanceTabProps {
    dbStats: {
        students: number;
        assessments: number;
        photos: number;
    };
    exportData: () => void;
    importData: () => void;
    clearDb: () => void;
    resetVisuals: () => void;
}

export const SettingsAdvanceTab: React.FC<SettingsAdvanceTabProps> = ({ 
    dbStats,
    exportData,
    importData,
    clearDb,
    resetVisuals
}) => {
    return (
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MoleculeSettingsSection title="System Information" subtitle="Status basis data & resource usage">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MoleculeStatsCard icon={<Users size={18} />} label="Total Murid" value={dbStats.students} color="bg-blue-500" />
                    <MoleculeStatsCard icon={<FileText size={18} />} label="Reports" value={dbStats.assessments} color="bg-emerald-500" />
                    <MoleculeStatsCard icon={<Image size={18} />} label="Photos" value={dbStats.photos} color="bg-amber-500" />
                </div>
            </MoleculeSettingsSection>

            <MoleculeSettingsSection title="Master Controls" subtitle="Powerful utilities for system management">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4 shadow-sm group">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-sky-500 transition-colors">Data Portability</h4>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={exportData}
                                className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-sky-500/10 text-slate-800 dark:text-slate-200 group/btn transition-all border border-transparent hover:border-sky-500/20"
                            >
                                <div className="flex items-center gap-3">
                                    <DownloadCloud size={16} className="text-slate-400 group-hover/btn:text-sky-500" />
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-tight">Export Database</div>
                                        <div className="text-[8px] opacity-50 font-bold uppercase text-slate-500">Back up all data to JSON</div>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover/btn:translate-x-0" />
                            </button>

                            <button 
                                onClick={importData}
                                className="flex items-center justify-between w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-emerald-500/10 text-slate-800 dark:text-slate-200 group/btn transition-all border border-transparent hover:border-emerald-500/20"
                            >
                                <div className="flex items-center gap-3">
                                    <UploadCloud size={16} className="text-slate-400 group-hover/btn:text-emerald-500" />
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-tight">Import Database</div>
                                        <div className="text-[8px] opacity-50 font-bold uppercase text-slate-500">Restore from JSON file</div>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover/btn:translate-x-0" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4 shadow-sm group">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500 transition-colors">Danger Zone</h4>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={clearDb}
                                className="flex items-center justify-between w-full p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-600 transition-all border border-transparent hover:border-red-500/20 group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 size={16} className="text-red-400" />
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-tight">Factory Reset</div>
                                        <div className="text-[8px] opacity-50 font-bold uppercase">Wipe all students & data</div>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover/btn:translate-x-0" />
                            </button>

                            <button 
                                onClick={resetVisuals}
                                className="flex items-center justify-between w-full p-3 rounded-xl bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 transition-all border border-transparent hover:border-orange-500/20 group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <DownloadCloud size={16} className="text-orange-400" />
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-tight">Reset Visuals</div>
                                        <div className="text-[8px] opacity-50 font-bold uppercase">Back to factory defaults</div>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover/btn:translate-x-0" />
                            </button>
                        </div>
                    </div>
                </div>
            </MoleculeSettingsSection>
        </div>
    );
};
