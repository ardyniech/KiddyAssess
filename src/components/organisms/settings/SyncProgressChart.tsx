
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SyncLog } from '../../../services/syncAnalyticsService';

interface SyncProgressChartProps {
    logs: SyncLog[];
}

export const SyncProgressChart: React.FC<SyncProgressChartProps> = ({ logs }) => {
    const data = useMemo(() => {
        const dailyData: Record<string, { date: string; success: number; failed: number }> = {};
        
        // Process logs for the last 7 days
        logs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            if (!dailyData[date]) {
                dailyData[date] = { date, success: 0, failed: 0 };
            }
            if (log.status === 'success') dailyData[date].success += 1;
            else if (log.status === 'failed') dailyData[date].failed += 1;
        });

        return Object.values(dailyData).reverse().slice(-7);
    }, [logs]);

    return (
        <div className="h-[200px] w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-wider">Sync Operations (Last 7 Days)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                    <Legend wrapperStyle={{ fontSize: '9px', marginTop: '10px' }} />
                    <Bar dataKey="success" name="Success" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" name="Failed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
