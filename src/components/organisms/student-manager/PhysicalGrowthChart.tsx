import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface GrowthHistoryPoint {
  date: string;
  weight: number;
  height: number;
}

interface PhysicalGrowthChartProps {
  growthData: GrowthHistoryPoint[];
}

export const PhysicalGrowthChart: React.FC<PhysicalGrowthChartProps> = ({ growthData }) => {
  return (
    <div className="h-44 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            yAxisId="left" 
            tick={{ fill: '#4f46e5', fontSize: 9, fontWeight: 700 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fill: '#059669', fontSize: 9, fontWeight: 700 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '14px', 
              fontSize: '10px', 
              fontWeight: 'bold',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 8px 16px rgba(0,0,0,0.04)'
            }} 
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="height" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            name="TB (cm)" 
            dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 3 }} 
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="weight" 
            stroke="#059669" 
            strokeWidth={3} 
            name="BB (kg)" 
            dot={{ stroke: '#059669', strokeWidth: 2, r: 3 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
