import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import { SectionHeader, Button } from '../../atoms/UIPrimitives';

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onNewEvent: () => void;
    filterApplied: string;
    onSetFilter: (cat: string) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    onPrevMonth,
    onNextMonth,
    onNewEvent,
    filterApplied,
    onSetFilter
}) => {
    return (
        <header className="px-5 md:px-6 py-4 md:py-5 border-b border-black/5 bg-white shrink-0">
            <SectionHeader 
                title="Kalender Akademik & Agenda" 
                subtitle="Jadwal Asesmen, Rapat, & Event Sekolah" 
                icon={CalendarIcon}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-150 p-0.5">
                            <button onClick={onPrevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-xs rounded-xl transition-all text-slate-400 hover:text-black cursor-pointer">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 text-[9px] font-black uppercase tracking-widest text-slate-900 min-w-[100px] text-center truncate">
                                {currentDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}
                            </span>
                            <button onClick={onNextMonth} className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-xs rounded-xl transition-all text-slate-400 hover:text-black cursor-pointer">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <select 
                            value={filterApplied}
                            onChange={(e) => onSetFilter(e.target.value)}
                            className="bg-white border border-slate-200 hover:border-slate-350 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl transition-colors focus:outline-none"
                        >
                            <option value="ALL">🗓️ Semua Kategori</option>
                            <option value="Assessment">📝 Asesmen Guru</option>
                            <option value="Meeting">👨‍👩‍👧 Rapat Orang Tua</option>
                            <option value="Event">🎈 Event Sekolah</option>
                            <option value="Holiday">🏖️ Hari Libur</option>
                        </select>

                        <Button 
                            variant="primary" 
                            icon={<Plus size={12} />} 
                            className="cursor-pointer text-[10px] uppercase font-black"
                            onClick={onNewEvent}
                        >
                            Agenda Baru
                        </Button>
                    </div>
                }
            />
        </header>
    );
};
