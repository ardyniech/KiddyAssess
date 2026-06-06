import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ClipboardList, ArrowUpRight } from 'lucide-react';
import { Student } from '../../../../types';

interface TeacherAttendanceTrendCardProps {
  students: Student[];
  setView?: (view: string) => void;
}

export const TeacherAttendanceTrendCard: React.FC<TeacherAttendanceTrendCardProps> = ({
  students = [],
  setView,
}) => {
  const chartData = useMemo(() => {
    if (students.length === 0) return [];

    const datesSet = new Set<string>();
    students.forEach(s => {
      if (s.attendanceLogs) {
        Object.keys(s.attendanceLogs).forEach(d => datesSet.add(d));
      }
    });

    const activeDates = Array.from(datesSet).sort().slice(-10); // last 10 school days

    return activeDates.map(dateKey => {
      let present = 0;
      students.forEach(s => {
        const log = s.attendanceLogs?.[dateKey];
        if (log === 'present' || log === 'late' || log === 'excused') present++;
      });
      const pct = Math.round((present / students.length) * 100);

      let label = dateKey;
      try {
        const d = new Date(dateKey);
        if (!isNaN(d.getTime())) {
          label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        }
      } catch (e) {
        // use iso key
      }

      return { key: label, count: pct };
    });
  }, [students]);

  const avgAttendance = useMemo(() => {
    if (chartData.length === 0) return 100;
    const sum = chartData.reduce((acc, current) => acc + current.count, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  return (
    <div className="border border-slate-200/80 rounded-2xl bg-white p-4 shadow-sm flex flex-col justify-between text-left space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
            <ClipboardList size={15} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider block">
              Kehadiran Bulanan 📈
            </span>
            <span className="text-[9px] font-semibold text-slate-400 block uppercase leading-none">
              Rata-rata: {avgAttendance}% Kehadiran Kelas
            </span>
          </div>
        </div>
        
        {setView && (
          <button
            onClick={() => setView('attendance')}
            className="flex items-center gap-0.5 text-[8.5px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-10 border-indigo-150 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-all cursor-pointer"
          >
            Detil <ArrowUpRight size={10} />
          </button>
        )}
      </div>

      <div className="h-24 w-full text-[9px] font-mono">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-bold capitalize">
            Satu ketukan absensi dibutuhkan...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="key" stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '8.5px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f97316"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#colorCard)"
                name="Kehadiran"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
export default TeacherAttendanceTrendCard;
