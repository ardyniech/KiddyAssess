import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { Student } from '../../../types';
import { AttendanceStatus } from './types';
import { cn } from '../../../lib/utils';

interface AttendanceQuickTapGridProps {
  students: Student[];
  date: string;
  onStatusChange: (id: string, status: AttendanceStatus) => void;
}

export const AttendanceQuickTapGrid: React.FC<AttendanceQuickTapGridProps> = ({
  students,
  date,
  onStatusChange,
}) => {
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const options: { status: AttendanceStatus; label: string; abbrev: string; activeClass: string; inactiveClass: string }[] = [
    {
      status: 'present',
      label: 'Hadir',
      abbrev: 'H',
      activeClass: 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-100',
      inactiveClass: 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50',
    },
    {
      status: 'late',
      label: 'Telat',
      abbrev: 'T',
      activeClass: 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-100',
      inactiveClass: 'bg-white border-slate-200 text-amber-600 hover:bg-amber-50',
    },
    {
      status: 'excused',
      label: 'Izin',
      abbrev: 'I',
      activeClass: 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-100',
      inactiveClass: 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50',
    },
    {
      status: 'absent',
      label: 'Alfa',
      abbrev: 'A',
      activeClass: 'bg-rose-600 border-rose-700 text-white shadow-md shadow-rose-100',
      inactiveClass: 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Cari nama murid..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all placeholder-slate-400 text-slate-800"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-white/50 p-1 border border-slate-100 rounded-3xl">
        {filtered.map(s => {
          const activeStatus = s.attendanceLogs?.[date] || 'present';

          return (
            <div
              key={s.id}
              className={cn(
                "p-3 rounded-2xl border bg-white flex flex-col justify-between gap-3 text-left transition-all hover:translate-y-[-1px]",
                "border-slate-200 shadow-xs focus-within:ring-2 focus-within:ring-indigo-200/50"
              )}
            >
              {/* Student Header Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0 text-slate-400 shadow-inner overflow-hidden">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={15} />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-tight leading-tighter">
                    {s.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 leading-none">
                      Kelompok {s.kelompok}
                    </span>
                  </div>
                </div>
              </div>

              {/* Touch grid of status options */}
              <div className="grid grid-cols-4 gap-1.5 bg-slate-50/70 p-1 rounded-xl border border-slate-150">
                {options.map(opt => {
                  const isActive = activeStatus === opt.status;
                  return (
                    <button
                      key={opt.status}
                      type="button"
                      onClick={() => onStatusChange(s.id, opt.status)}
                      className={cn(
                        "h-11 rounded-lg text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center border select-none outline-none focus:ring-1 focus:ring-offset-1 focus:ring-slate-300",
                        isActive ? opt.activeClass : opt.inactiveClass
                      )}
                      title={`Tandai ${opt.label}`}
                    >
                      <span>{opt.abbrev}</span>
                      <span className="text-[7px] font-black uppercase tracking-tighter opacity-80 mt-0.5 leading-none block">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Murid Tidak Ditemukan</p>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mt-1">Silakan cari berdasarkan nama lain</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AttendanceQuickTapGrid;
