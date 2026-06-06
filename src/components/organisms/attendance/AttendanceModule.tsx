import React, { useState } from 'react';
import { ClipboardCheck, Calendar, BarChart3, Clock, AlertCircle } from 'lucide-react';
import { Student } from '../../../types';
import { useAttendance } from './useAttendance';
import { AttendanceStatsBar } from './AttendanceStatsBar';
import { AttendanceQuickTapGrid } from './AttendanceQuickTapGrid';
import { AttendanceTrendChart } from './AttendanceTrendChart';

interface AttendanceModuleProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  students = [],
  onEditStudent,
}) => {
  const {
    date,
    setDate,
    filterClass,
    setFilterClass,
    classes,
    filteredStudents,
    handleStatusChange,
    dayStats,
    feedback,
  } = useAttendance(students, onEditStudent);

  const [activeTab, setActiveTab] = useState<'record' | 'trends'>('record');

  return (
    <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
      {/* Top Workspace Header */}
      <div className="bg-white border-b border-black/5 shrink-0 px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-100">
                PENCATATAN HARIAN & ANALITIK
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
              Presensi Siswa <ClipboardCheck size={16} className="text-indigo-600" />
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-150 text-xs text-slate-700 font-bold shrink-0 self-start sm:self-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tanggal</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-black border-none bg-transparent outline-none cursor-pointer text-slate-800"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4 text-left">
        {/* Real-time stats row */}
        <AttendanceStatsBar stats={dayStats} />

        {/* Filter Row & Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Class Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none max-w-full">
            <button
              onClick={() => setFilterClass('all')}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all select-none cursor-pointer whitespace-nowrap border ${
                filterClass === 'all'
                  ? 'bg-slate-900 border-slate-950 text-white'
                  : 'bg-white border-slate-205 text-slate-500 hover:border-slate-300'
              }`}
            >
              Semua Rombel
            </button>
            {classes.map(cls => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all select-none cursor-pointer whitespace-nowrap border ${
                  filterClass === cls
                    ? 'bg-slate-900 border-slate-950 text-white'
                    : 'bg-white border-slate-205 text-slate-500 hover:border-slate-300'
                }`}
              >
                Kelas {cls}
              </button>
            ))}
          </div>

          {/* Module Mode Selector Tabs */}
          <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl max-w-xs shrink-0 self-end sm:self-center">
            <button
              onClick={() => setActiveTab('record')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider select-none transition-all cursor-pointer ${
                activeTab === 'record' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock size={12} /> Grid Input
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider select-none transition-all cursor-pointer ${
                activeTab === 'trends' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 size={12} /> Tren Grafik
            </button>
          </div>
        </div>

        {/* Feedback Alert Pill */}
        {feedback && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-250 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider text-emerald-800 w-fit select-none animate-bounce">
            <AlertCircle size={12} /> {feedback}
          </div>
        )}

        {/* Active Content rendering */}
        {activeTab === 'record' ? (
          <AttendanceQuickTapGrid
            students={filteredStudents}
            date={date}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <AttendanceTrendChart students={filteredStudents} />
        )}
      </main>
    </div>
  );
};
export default AttendanceModule;
