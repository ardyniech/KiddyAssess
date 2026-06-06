import React, { useState } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { ScheduleDialog } from './ScheduleDialog';
import { Event } from './types';

interface QuickScheduleWidgetProps {
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

export const QuickScheduleWidget: React.FC<QuickScheduleWidgetProps> = ({ events, setEvents }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = (details: Omit<Event, 'id'>) => {
        const id = `ev_${Date.now()}`;
        const newEvent: Event = { id, ...details };
        setEvents((prev) => [...prev, newEvent]);
    };

    return (
        <div id="quick_calendar_ai_schedule_widget">
            <div 
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-5 rounded-3xl cursor-pointer active:scale-[0.99] transition-all duration-300 shadow-md flex flex-col justify-between h-44 relative overflow-hidden group border border-indigo-950 select-none"
            >
                {/* Visual Icon Decors */}
                <div className="absolute -top-1 -right-1 opacity-10 select-none group-hover:scale-110 transition-transform">
                    <span className="text-[72px]">🧙‍♂️</span>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black tracking-widest text-[#FFF275] uppercase bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
                            Deteksi Konflik AI
                        </span>
                        <span className="flex items-center gap-1 text-[8px] font-black tracking-widest text-emerald-300 uppercase animate-pulse">
                            <Sparkles size={8} /> Aktif
                        </span>
                    </div>
                    <h4 className="text-sm font-black text-white mt-3 uppercase tracking-tight">Jadwalkan Asesmen & Rapat</h4>
                    <p className="text-[10px] text-indigo-200 mt-1 uppercase font-bold tracking-tight">Buat agenda ujian, konsultasi orang tua, atau rapat kelulusan terbebas dari jadwal bertumpuk.</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-black text-indigo-900 bg-[#FFF275] hover:bg-[#ffe14f] px-3.5 py-2 rounded-xl shadow-sm transition-colors">
                        Mulai Menjadwalkan →
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                        <Calendar size={13} />
                        <span className="text-[9px] font-black font-mono">1-Klik Input</span>
                    </div>
                </div>
            </div>

            <ScheduleDialog 
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSave={handleSave}
                existingEvents={events}
            />
        </div>
    );
};
