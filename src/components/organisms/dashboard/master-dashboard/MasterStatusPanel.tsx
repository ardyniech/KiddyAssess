import React from 'react';
import { Badge } from '../../../atoms/UIPrimitives';
import { cn } from '../../../../lib/utils';
import { MasterBranchMonitor } from './MasterBranchMonitor';

interface MasterStatusPanelProps {
    studentCount: number;
    upcomingEventsCount: number;
    pendingTasksCount: number;
    events: any[];
}

export const MasterStatusPanel = ({ studentCount, upcomingEventsCount, pendingTasksCount, events }: MasterStatusPanelProps) => {
    const statusNodes = [
        { name: 'IndexDB Client Storage', status: 'Optimal', detail: `${studentCount} record terindeks`, color: 'emerald' },
        { name: 'Autentikasi Pengguna', status: 'Aktif', detail: 'Firebase Auth', color: 'indigo' },
        { name: 'Agenda & Event', status: 'Sinkron', detail: `${upcomingEventsCount} Agenda Mendatang`, color: 'sky' },
        { name: 'Kanban & Tugas', status: 'Tertata', detail: `${pendingTasksCount} Tugas Aktif`, color: 'amber' }
    ];

    return (
        <div className="bg-white rounded-[32px] p-6 border border-black/5 text-left shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-xs font-black uppercase text-indigo-950 tracking-widest">
                        Panel Monitor Kesehatan Sistem Digital
                    </h4>
                </div>
                <Badge variant="outline" className="text-[8px]">Aktualisasi Terakhir: {new Date().toLocaleTimeString()}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                {statusNodes.map((node) => (
                    <div key={node.name} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                        <span className="text-[11px] text-indigo-950 font-black truncate uppercase tracking-tight">{node.name}</span>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[9px] font-bold text-slate-400">{node.detail}</span>
                            <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-lg uppercase shadow-sm",
                                node.color === 'emerald' ? "bg-emerald-500 text-white" :
                                node.color === 'indigo' ? "bg-indigo-500 text-white" :
                                node.color === 'sky' ? "bg-sky-500 text-white" :
                                "bg-amber-500 text-white"
                            )}>{node.status}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <MasterBranchMonitor events={events} />
        </div>
    );
};
