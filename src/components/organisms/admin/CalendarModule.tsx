import React, { useState } from 'react';
import { CalendarHeader } from '../calendar/CalendarHeader';
import { CalendarGrid } from '../calendar/CalendarGrid';
import { EventSidebar } from '../calendar/EventSidebar';
import { ScheduleDialog } from '../calendar/ScheduleDialog';
import { Event } from '../calendar/types';

interface CalendarModuleProps {
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({ 
    events = [], 
    setEvents 
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
    const [filterApplied, setFilterApplied] = useState<string>('ALL');
    const [isAddOpen, setIsAddOpen] = useState(false);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

    const handleSaveEvent = (details: Omit<Event, 'id'>) => {
        const id = `ev_${Date.now()}`;
        const newEvent: Event = { id, ...details };
        setEvents((prev: Event[]) => [...prev, newEvent]);
        setSelectedDate(newEvent.date);
    };

    const handleDeleteEvent = (id: string) => {
        setEvents((prev: Event[]) => prev.filter((e: Event) => e.id !== id));
    };

    // Filter events based on selections
    const filteredEvents = events.filter((event: Event) => {
        if (filterApplied === 'ALL') return true;
        return event.category === filterApplied;
    });

    return (
        <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden relative">
            <CalendarHeader 
                currentDate={currentDate}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
                onNewEvent={() => setIsAddOpen(true)}
                filterApplied={filterApplied}
                onSetFilter={setFilterApplied}
            />

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                <CalendarGrid 
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    events={filteredEvents}
                />

                <EventSidebar 
                    selectedDate={selectedDate}
                    events={filteredEvents}
                    onDeleteEvent={handleDeleteEvent}
                />
            </div>

            <ScheduleDialog 
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSave={handleSaveEvent}
                existingEvents={events}
                initialDate={selectedDate || undefined}
            />
        </div>
    );
};
