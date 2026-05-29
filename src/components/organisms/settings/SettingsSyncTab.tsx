import React, { useEffect, useState } from 'react';
import { SyncProgressChart } from './SyncProgressChart';
import { Cloud, Shield, Users, FileText, Archive, History, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { SchoolProfile } from '../../../types';
import { MoleculeSettingsSection, MoleculeSettingItem, MoleculeToggleButton } from '../../molecules/SettingsMolecules';
import { MoleculeStatsCard } from '../../molecules/DashboardMolecules';
import { syncAnalyticsService, SyncLog } from '../../../services/syncAnalyticsService';

interface SettingsSyncTabProps {
    schoolProfile: SchoolProfile | null;
    setSchoolProfile: React.Dispatch<React.SetStateAction<SchoolProfile | null>>;
    dbStats: {
        students: number;
        assessments: number;
        photos: number;
    };
}

export const SettingsSyncTab: React.FC<SettingsSyncTabProps> = ({ 
    schoolProfile, 
    setSchoolProfile,
    dbStats
}) => {
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [lastSuccessfulSync, setLastSuccessfulSync] = useState<SyncLog | null>(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        const history = await syncAnalyticsService.getLogs();
        const last = await syncAnalyticsService.getLastSync();
        setLogs(history);
        setLastSuccessfulSync(last);
    };

    return (
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MoleculeSettingsSection title="Cloud Integration" subtitle="Sinkronisasi infrastruktur awan">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <MoleculeSettingItem 
                        label="Cloud Protection" 
                        description="Auto-backup ke Google Cloud"
                        icon={<Cloud size={14} />}
                    >
                        <MoleculeToggleButton 
                            active={schoolProfile?.enableCloudSync ? true : false} 
                            onClick={() => setSchoolProfile(p => p ? ({ ...p, enableCloudSync: !p.enableCloudSync }) : null)} 
                        />
                    </MoleculeSettingItem>
                    <MoleculeSettingItem label="Engine Status" icon={<Shield size={14}/>}>
                        <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded text-[8px] font-black uppercase">Active</div>
                    </MoleculeSettingItem>
                 </div>
            </MoleculeSettingsSection>

            {schoolProfile?.enableCloudSync && (
                <MoleculeSettingsSection title="Dashboard Analytics" subtitle="Riwayat sinkronisasi data">
                    <SyncProgressChart logs={logs} />
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Sync Status Log</span>
                            </div>
                            {lastSuccessfulSync && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg">
                                    <CheckCircle2 size={10} className="text-emerald-600" />
                                    <span className="text-[9px] font-bold text-emerald-700 uppercase">
                                        Last: {new Date(lastSuccessfulSync.timestamp).toLocaleTimeString('id-ID')}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                            {logs.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {logs.map((log) => (
                                        <div key={log.id} className="p-3 flex items-start justify-between hover:bg-slate-100/50 transition-colors">
                                            <div className="flex gap-3">
                                                <div className={`mt-0.5 p-1 rounded-md ${log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {log.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                </div>
                                                 <div>
                                                     <p className="text-[10px] font-bold text-slate-800 leading-none mb-1">{log.message}</p>
                                                     <div className="flex items-center gap-2 text-[9px] text-slate-500 font-medium tracking-tight">
                                                         <Clock size={10} />
                                                         {new Date(log.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                         {log.itemsCount && <span className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 text-[8px]">{log.itemsCount} Items</span>}
                                                     </div>

                                                     {/* Sync Timeline View */}
                                                     {log.actions && log.actions.length > 0 && (
                                                         <div className="mt-3 space-y-2 bg-white/50 p-2 rounded-xl border border-slate-100">
                                                             <div className="flex items-center gap-2 mb-1">
                                                                 <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                     <div 
                                                                         className={`h-full transition-all duration-500 ${
                                                                             log.status === 'success' ? 'bg-emerald-500' : 
                                                                             log.status === 'failed' ? 'bg-rose-500' : 'bg-indigo-500'
                                                                         }`}
                                                                         style={{ 
                                                                             width: `${(log.actions.filter(a => a.status === 'success').length / log.actions.length) * 100}%` 
                                                                         }}
                                                                     />
                                                                 </div>
                                                                 <span className="text-[8px] font-black text-slate-400">
                                                                     {Math.round((log.actions.filter(a => a.status === 'success').length / log.actions.length) * 100)}%
                                                                 </span>
                                                             </div>
                                                             <div className="space-y-1">
                                                                 {log.actions.map((action) => (
                                                                     <div key={action.id} className="flex items-center justify-between text-[9px]">
                                                                         <div className="flex items-center gap-2">
                                                                             <div className={`w-1 h-1 rounded-full ${
                                                                                 action.status === 'success' ? 'bg-emerald-500' : 
                                                                                 action.status === 'failed' ? 'bg-rose-500' : 'bg-slate-300'
                                                                             }`} />
                                                                             <span className="font-medium text-slate-600">{action.label}</span>
                                                                         </div>
                                                                         <div className="flex items-center gap-1">
                                                                             {action.status === 'failed' && action.error && (
                                                                                 <span className="text-rose-500 italic mr-1 text-[8px]">{action.error}</span>
                                                                             )}
                                                                             {action.status === 'success' ? (
                                                                                 <CheckCircle2 size={10} className="text-emerald-500" />
                                                                             ) : action.status === 'failed' ? (
                                                                                 <AlertCircle size={10} className="text-rose-500" />
                                                                             ) : (
                                                                                 <div className="w-2 h-2 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
                                                                             )}
                                                                         </div>
                                                                     </div>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     )}
                                                 </div>
                                            </div>
                                            <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {log.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                                        <Cloud size={18} />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Belum ada riwayat sinkronisasi</p>
                                </div>
                            )}
                        </div>
                    </div>
                </MoleculeSettingsSection>
            )}

            <MoleculeSettingsSection title="System Health Stats" subtitle="Aset tersimpan di perangkat">
                <div className="grid grid-cols-3 gap-3">
                    <MoleculeStatsCard icon={<Users size={14} />} label="Students" value={dbStats.students} color="bg-blue-500" />
                    <MoleculeStatsCard icon={<FileText size={14} />} label="Reports" value={dbStats.assessments} color="bg-emerald-500" />
                    <MoleculeStatsCard icon={<Archive size={14} />} label="Photos" value={dbStats.photos} color="bg-amber-500" />
                </div>
            </MoleculeSettingsSection>
        </div>
    );
};

