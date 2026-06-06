import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../atoms/UIPrimitives';
import { Student } from '../../../types';

interface AttendanceTrendChartProps {
  students: Student[];
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ students }) => {
  const trendData = useMemo(() => {
    if (students.length === 0) return [];

    // Find all date keys in students logs
    const allDates = new Set<string>();
    students.forEach(s => {
      if (s.attendanceLogs) {
        Object.keys(s.attendanceLogs).forEach(d => allDates.add(d));
      }
    });

    // Sort dates
    const sortedDates = Array.from(allDates).sort().slice(-15); // get last 15 active school days

    return sortedDates.map(dateKey => {
      let present = 0, late = 0, excused = 0, absent = 0;
      students.forEach(s => {
        const log = s.attendanceLogs?.[dateKey];
        if (log === 'present') present++;
        else if (log === 'late') late++;
        else if (log === 'excused') excused++;
        else if (log === 'absent') absent++;
        else present++; // default
      });

      const total = students.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;
      
      // format date label "2026-06-04" -> "04 Jun"
      let dayLabel = dateKey;
      try {
        const d = new Date(dateKey);
        if (!isNaN(d.getTime())) {
          dayLabel = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        }
      } catch (e) {
        // preserve key
      }

      return {
        date: dayLabel,
        'Hadir (%)': rate,
        'Terlambat (Anak)': late,
        'Izin (Anak)': excused,
        'Alfa (Anak)': absent,
      };
    });
  }, [students]);

  return (
    <Card 
      padding={false} 
      className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs text-left"
    >
      <div className="mb-4">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider leading-none">
          Grafik Tren Kehadiran Bulanan 📈
        </h4>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1 block">
          Tingkat Kehadiran Harian (%) Dibandingkan Kasus Terlambat/Alfa Selama 15 Hari Terakhir
        </span>
      </div>

      <div className="h-60 w-full text-[10px] font-mono">
        {trendData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 capitalize font-bold">
            Simpan beberapa absen terlebih dahulu untuk memicu visualisasi tren.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis domain={[40, 100]} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: 'none', 
                  borderRadius: '12px', 
                  color: '#fff', 
                  fontSize: '10px' 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="Hadir (%)" 
                stroke="#0284c7" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorPresent)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-3 text-[8.5px] font-black uppercase text-slate-400 tracking-wider select-none">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-500" /> Hadir (%)
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Terlambat
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500" /> Izin
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> Alfa
        </div>
      </div>
    </Card>
  );
};
export default AttendanceTrendChart;
