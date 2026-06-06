import React from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Clock, MapPin, Trash2, Calendar } from 'lucide-react';
import { Card, Badge } from '../../atoms/UIPrimitives';
import { Event } from './types';

interface EventSidebarProps {
    selectedDate: string | null;
    events: Event[];
    onDeleteEvent: (id: string) => void;
}

export const EventSidebar: React.FC<EventSidebarProps> = ({
    selectedDate,
    events,
    onDeleteEvent
}) => {
    const selectedDateEvents = events.filter(e => e.date === selectedDate);
    
    // Sort events by date for upcoming overview
    const getUpcomingEvents = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        return [...events]
            .filter(e => e.date >= todayStr)
            .sort((a,b) => a.date.localeCompare(b.date))
            .slice(0, 4);
    };

    const getCategoryLabel = (category: string) => {
        if (category === 'Assessment') return 'Asesmen';
        if (category === 'Meeting') return 'Rapat Wali';
        if (category === 'Event') return 'Acara Sekolah';
        return category;
    };

    const getBadgeVariant = (category: string) => {
        if (category === 'Assessment') return 'warning';
        if (category === 'Meeting') return 'success';
        if (category === 'Holiday') return 'error';
        return 'indigo';
    };

    return (
        <div className="w-full lg:w-[350px] bg-slate-50/20 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-4 md:p-5 space-y-5">
            {/* Selected Day Agenda Box */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 font-mono">TANGGAL: {selectedDate || 'Belum dipilih'}</span>
                        <h4 className="text-xs font-black text-slate-900 uppercase">Agenda Harian</h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-150">
                        <CalendarDays size={18} />
                    </div>
                </div>

                <div className="space-y-3 max-h-[250px] overflow-y-auto no-scrollbar">
                    {selectedDateEvents.length > 0 ? (
                        selectedDateEvents.map(event => (
                            <motion.div key={event.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="group">
                                <Card className="p-3.5 hover:border-black transition-all bg-[#FCFCFC] border border-slate-150 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant={getBadgeVariant(event.category)} className="text-[7.5px] uppercase font-black tracking-wider">
                                            {getCategoryLabel(event.category)}
                                        </Badge>
                                        <button 
                                            title="Hapus Agenda"
                                            onClick={() => onDeleteEvent(event.id)}
                                            className="text-slate-300 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                    <h5 className="text-[11px] font-black text-slate-900 uppercase leading-snug tracking-tight mb-2">{event.title}</h5>
                                    {event.description && <p className="text-[9px] text-slate-500 font-bold mb-2 break-words leading-relaxed">{event.description}</p>}
                                    <div className="space-y-1.5 pt-2 border-t border-slate-100 flex flex-col">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock size={11} className="text-amber-500 shrink-0" />
                                            <span className="text-[8.5px] font-bold font-mono">{event.startTime} - {event.endTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin size={11} className="text-emerald-500 shrink-0" />
                                            <span className="text-[8.5px] font-bold truncate">{event.location}</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tidak Ada Agenda Terdaftar</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Feed */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4 shrink-0">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <Calendar size={13} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Agenda Hari Terdekat</span>
                </div>
                
                <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
                    {getUpcomingEvents().length > 0 ? (
                        getUpcomingEvents().map(event => (
                            <div key={event.id} className="flex gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 flex flex-col items-center justify-center shrink-0">
                                    <span className="text-[11px] font-black text-indigo-600 leading-none">{new Date(event.date).getDate()}</span>
                                    <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">{new Date(event.date).toLocaleString('id-ID', { month: 'short' })}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h6 className="text-[9.5px] font-black text-slate-800 uppercase tracking-tight truncate mb-0.5">{event.title}</h6>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">{getCategoryLabel(event.category)} • {event.startTime}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Belum ada agenda sekolah di kemudian hari</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
