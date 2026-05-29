import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Clock, 
    MapPin, 
    MoreVertical,
    X,
    Filter,
    CalendarDays,
    Bell
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button, Card, Badge, SectionHeader } from '../../atoms/UIPrimitives';

interface Event {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    category: 'Academic' | 'Holiday' | 'Event' | 'Holiday Staff';
    description: string;
}

export const CalendarModule = ({ events, setEvents }: any) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
    const [showMobileDetails, setShowMobileDetails] = useState(false);

    // Calendar logic
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const numDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-20 sm:h-24 md:h-32 border-b border-r border-slate-50 bg-slate-50/20" />);
        }

        for (let day = 1; day <= numDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const isSelected = selectedDate === dateStr;
            const dayEvents = events.filter(e => e.date === dateStr);

            days.push(
                <div 
                    key={day} 
                    onClick={() => {
                        setSelectedDate(dateStr);
                        setShowMobileDetails(true);
                    }}
                    className={cn(
                        "h-20 sm:h-24 md:h-32 border-b border-r border-slate-100 p-2 sm:p-3 transition-all cursor-pointer group relative min-w-0 select-none",
                        isSelected ? "bg-indigo-50/30" : "bg-white hover:bg-slate-50"
                    )}
                >
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                        <span className={cn(
                            "w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black transition-all",
                            isToday ? "bg-black text-white shadow-lg" : 
                            isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100"
                        )}>
                            {day}
                        </span>
                        {dayEvents.length > 0 && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-pulse shadow-lg shadow-indigo-200" />}
                    </div>
                    
                    <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map(event => (
                            <Badge 
                                key={event.id}
                                variant={event.category === 'Academic' ? 'success' : event.category === 'Holiday' ? 'error' : 'indigo'}
                                className="w-full justify-start py-0.5 px-1.5 sm:px-2 border-none max-w-full"
                            >
                                <span className="truncate text-[7px] sm:text-[8px] leading-none shrink">{event.title}</span>
                            </Badge>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

    const addEvent = () => {
        const title = prompt("Judul Agenda / Catatan");
        if (!title) return;
        
        const newEvent: Event = {
            id: `ev_${Date.now()}`,
            title,
            date: selectedDate || new Date().toISOString().split('T')[0],
            startTime: '08:00',
            endTime: '09:00',
            location: 'Lembaga / Gedung Cabang',
            category: 'Event',
            description: 'Agenda otomatis ditambahkan.'
        };

        // Use functional updaters for state to avoid stale closure issues
        setEvents((prev: Event[]) => {
            const updated = [...prev, newEvent];
            return updated;
        });
        
        // Show immediate visual feedback
        setSelectedDate(newEvent.date);
    };

    return (
        <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden relative">
            {/* Header */}
            <header className="px-5 md:px-8 py-5 md:py-6 border-b border-black/5 bg-white shrink-0">
                <SectionHeader 
                    title="Kalender Kampus" 
                    subtitle="Penjadwalan & Agenda Kelembagaan" 
                    icon={CalendarIcon}
                    actions={
                        <>
                            <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 p-1 mr-1 sm:mr-4">
                                <button onClick={prevMonth} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-black cursor-pointer">
                                    <ChevronLeft size={14} />
                                </button>
                                <div className="px-2 sm:px-6 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 min-w-[100px] sm:min-w-[150px] text-center truncate">
                                    {currentDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}
                                </div>
                                <button onClick={nextMonth} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-black cursor-pointer">
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                            <Button variant="outline" icon={<Filter size={12} />} className="hidden sm:flex cursor-pointer" onClick={() => console.log('Saring')}>Saring</Button>
                            <Button variant="primary" icon={<Plus size={12} />} className="cursor-pointer" onClick={addEvent}>Agenda Baru</Button>
                        </>
                    }
                />
            </header>

            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Main Calendar Grid */}
                <div className="flex-1 overflow-y-auto border-r border-slate-50 custom-scrollbar grid grid-rows-[auto_1fr] min-h-0">
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20 backdrop-blur-md select-none">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                            <div key={day} className="py-3 text-center text-[8px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 border-r border-slate-50 last:border-0 truncate">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 bg-slate-50/10">
                        {renderCalendar()}
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="hidden lg:flex w-[380px] bg-slate-50/30 flex-col shrink-0 border-l border-slate-50 overflow-y-auto custom-scrollbar">
                    <div className="p-8 border-b border-slate-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">Jadwal: {selectedDate}</h3>
                                <div className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Agenda Harian</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                                <CalendarDays size={24} />
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                            {events.filter(e => e.date === selectedDate).length > 0 ? (
                                events.filter(e => e.date === selectedDate).map(event => (
                                    <motion.div 
                                        key={event.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group"
                                    >
                                        <Card className="hover:border-black transition-all p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <Badge variant={event.category === 'Academic' ? 'success' : event.category === 'Holiday' ? 'error' : 'indigo'}>
                                                    {event.category}
                                                </Badge>
                                                <button className="text-slate-300 hover:text-black transition-all">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight mb-4 uppercase leading-snug">{event.title}</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                                        <Clock size={14} className="text-indigo-400" />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{event.startTime} - {event.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                                        <MapPin size={14} className="text-emerald-400" />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate">{event.location}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-8 sm:py-16 px-4 sm:px-8 rounded-2xl sm:rounded-[2rem] border-2 border-dashed border-slate-100">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                                        <X size={24} />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Pemberitahuan: Belum ada agenda untuk hari ini</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white">
                                <Bell size={14} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Agenda Mendatang</h3>
                        </div>
                        <div className="space-y-4">
                            {events.slice(0, 5).map(event => (
                                <div key={event.id} className="flex gap-5 p-2 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:bg-indigo-600 transition-colors">
                                        <span className="text-[11px] font-black text-indigo-600 leading-none group-hover:text-white">{new Date(event.date).getDate()}</span>
                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/70">{new Date(event.date).toLocaleString('id-ID', { month: 'short' })}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate mb-1 group-hover:text-indigo-600 transition-colors">{event.title}</h5>
                                        <Badge variant="default" className="bg-transparent border-none p-0 text-slate-400">{event.category}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Actions Drawer Slide Up Sheet */}
            <AnimatePresence>
                {showMobileDetails && selectedDate && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setShowMobileDetails(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm shadow-xl"
                        />
                        <motion.div 
                            initial={{ y: "100%" }} 
                            animate={{ y: 0 }} 
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="relative w-full bg-white rounded-t-[2.5rem] p-6 max-h-[70vh] overflow-y-auto flex flex-col shadow-2xl z-10"
                        >
                            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
                            <div className="flex justify-between items-start mb-6 shrink-0">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{selectedDate}</span>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase mt-1">Agenda Hari Ini</h3>
                                </div>
                                <button 
                                    onClick={() => setShowMobileDetails(false)}
                                    className="p-2 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <div className="space-y-4 overflow-y-auto pb-6">
                                {events.filter(e => e.date === selectedDate).length > 0 ? (
                                    events.filter(e => e.date === selectedDate).map(event => (
                                        <Card key={event.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                                            <Badge variant={event.category === 'Academic' ? 'success' : event.category === 'Holiday' ? 'error' : 'indigo'} className="mb-3">
                                                {event.category}
                                            </Badge>
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3 leading-none">{event.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{event.description}</p>
                                            <div className="space-y-2.5 pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <Clock size={12} className="text-indigo-500" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">{event.startTime} - {event.endTime}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-400">
                                                    <MapPin size={12} className="text-emerald-500" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider truncate">{event.location}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tidak Ada Agenda</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
