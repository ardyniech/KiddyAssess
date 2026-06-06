import React from 'react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../atoms/UIPrimitives';
import { Event } from './types';

interface CalendarGridProps {
    currentDate: Date;
    selectedDate: string | null;
    onSelectDate: (dateStr: string) => void;
    events: Event[];
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentDate,
    selectedDate,
    onSelectDate,
    events
}) => {
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    // Render blank day elements
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-16 sm:h-20 md:h-24 border-b border-r border-slate-100 bg-slate-50/20" />);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const getBadgeVariant = (category: string) => {
        if (category === 'Assessment') return 'warning'; // Orange / Amber
        if (category === 'Meeting') return 'success'; // Emerald
        if (category === 'Holiday') return 'error'; // Rose / Red
        return 'indigo';
    };

    for (let day = 1; day <= numDays; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = todayStr === dateStr;
        const isSelected = selectedDate === dateStr;
        const dayEvents = events.filter(e => e.date === dateStr);

        days.push(
            <div 
                key={day} 
                onClick={() => onSelectDate(dateStr)}
                className={cn(
                    "h-20 sm:h-24 md:h-28 border-b border-r border-slate-150 p-1.5 transition-all cursor-pointer group relative min-w-0 flex flex-col justify-between",
                    isSelected ? "bg-slate-100/50" : "bg-white hover:bg-slate-50/70"
                )}
            >
                <div className="flex justify-between items-start">
                    <span className={cn(
                        "w-6 h-6 flex items-center justify-center rounded-lg text-[9px] font-black transition-all",
                        isToday ? "bg-black text-white hover:opacity-90" : 
                        isSelected ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 group-hover:text-black group-hover:bg-slate-100"
                    )}>
                        {day}
                    </span>
                    {dayEvents.length > 0 && (
                        <div className="w-2 h-2 justify-center bg-indigo-500 rounded-full animate-pulse mr-0.5" />
                    )}
                </div>
                
                <div className="space-y-0.5 overflow-hidden max-h-[50px] shrink-0">
                    {dayEvents.slice(0, 2).map(event => (
                        <Badge 
                            key={event.id}
                            variant={getBadgeVariant(event.category)}
                            className="w-full text-center py-0 px-1 border-none justify-start select-none max-w-full"
                        >
                            <span className="truncate text-[7px] leading-none tracking-tighter shrink font-black uppercase text-left">{event.title}</span>
                        </Badge>
                    ))}
                    {dayEvents.length > 2 && (
                        <span className="block text-[6.5px] font-black tracking-widest text-[#414144] hover:text-black uppercase pl-1">
                            +{dayEvents.length - 2} AGENDA LAIN
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-rows-[auto_1fr] flex-1 overflow-y-auto no-scrollbar min-h-0 border-r border-slate-200">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50 sticky top-0 z-20 backdrop-blur-md select-none">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                    <div key={day} className="py-2.5 text-center text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100 last:border-0 truncate">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 bg-slate-50/5">
                {days}
            </div>
        </div>
    );
};
