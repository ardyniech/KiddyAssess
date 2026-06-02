import React from 'react';
import { Cpu } from 'lucide-react';
import { Student } from '../../../types';
import { MasterSystemKPI } from './master-dashboard/MasterSystemKPI';
import { MasterActionGrid } from './master-dashboard/MasterActionGrid';
import { MasterControlBlocks } from './master-dashboard/MasterControlBlocks';
import { MasterStatusPanel } from './master-dashboard/MasterStatusPanel';

interface MasterDashboardProps {
    setView?: (view: string) => void;
    students?: Student[];
    events?: any[];
    tasks?: any[];
    aspects?: any[];
    assessments?: Record<string, any>;
    users?: any[];
}

export const MasterDashboard = ({ setView, students = [], events = [], tasks = [], users = [] }: MasterDashboardProps) => {
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
    const pendingTasks = tasks.filter(t => t.status !== 'DONE').length;
    const userCount = users.length;

    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            <div className="bg-white border-b border-black/5 shrink-0 px-4 sm:px-6 md:px-8 py-6 sm:py-8 relative overflow-hidden">
                <div className="absolute top-4 right-16 opacity-10 select-none text-4xl animate-bounce-slow">⚙️</div>
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 text-left">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-extrabold tracking-widest text-[#7EC8E3] uppercase bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                Ruang Kontrol Utama Master
                            </span>
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">Sistem Utama KiddyApps 🚀</h2>
                        <p className="text-xs text-slate-500 tracking-wide mt-1 font-medium italic">
                            Administrator Sistem: Akses kendali inti, autentikasi, hak akses, dan mesin AI.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 bg-indigo-50 p-2 rounded-2xl border border-indigo-100 text-xs text-left">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                            <Cpu size={20} />
                        </div>
                        <div className="pr-4">
                            <span className="text-[8px] font-black text-indigo-800 block leading-tight">SYSTEM HEALTH</span>
                            <span className="text-[11px] font-black text-indigo-950 uppercase mt-0.5">100% ONLINE / SAFE</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">
                <div id="master_permission_guide_card" className="bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold leading-normal text-left flex items-start gap-3 transition-colors animate-pulse-slow">
                    <span className="text-xl shrink-0">🟢</span>
                    <div>
                        <p className="font-black text-[#1A365D] text-xs uppercase tracking-wider mb-0.5">Catatan Hak Akses Master Super-Admin (Core System Root)</p>
                        <p className="text-[11px] text-slate-800 leading-tight">
                            Anda masuk dengan hak <strong>MASTER ADMINISTRATOR (ROOT)</strong>. Anda memiliki kendali penuh di atas segala aspek: <strong>mengonfigurasi otorisasi sistem/role</strong>, <strong>melakukan audit status sinkronisasi IndexedDB/Firestore</strong>, serta <strong>memonitor ketersediaan mesin narasi AI Gemini</strong>.
                        </p>
                    </div>
                </div>

                <MasterSystemKPI studentCount={students.length} />
                <MasterActionGrid userCount={userCount} />
                <MasterControlBlocks setView={setView} />
                <MasterStatusPanel studentCount={students.length} upcomingEventsCount={upcomingEvents} pendingTasksCount={pendingTasks} events={events} />
            </main>
        </div>
    );
};
