import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface GrowthTrendPoint {
  name: string;
  progress: number;
}

interface AcademicGrowthTrendProps {
  data: GrowthTrendPoint[];
}

export const AcademicGrowthTrend: React.FC<AcademicGrowthTrendProps> = ({ data }) => {
  return (
    <div className="h-44 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProgressDetail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
            dy={8}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1.5px solid #e2e8f0', 
              borderRadius: '14px', 
              fontSize: '11px', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.04)', 
              fontWeight: 'bold' 
            }}
            itemStyle={{ color: '#4f46e5' }}
          />
          <Area 
            type="monotone" 
            dataKey="progress" 
            stroke="#4f46e5" 
            strokeWidth={3.5} 
            fillOpacity={1} 
            fill="url(#colorProgressDetail)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
