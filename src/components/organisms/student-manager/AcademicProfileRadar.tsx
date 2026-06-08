import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';

interface DomainMetric {
  shortName: string;
  name: string;
  percentage: number;
  progress: number;
  scaleLabel: string;
}

interface AcademicProfileRadarProps {
  data: DomainMetric[];
}

export const AcademicProfileRadar: React.FC<AcademicProfileRadarProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-[10px] uppercase font-bold text-slate-400">
        Belum Ada Data Sektoral
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis 
            dataKey="shortName" 
            tick={{ fill: '#334155', fontSize: 9, fontWeight: 800 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#94a3b8', fontSize: 8 }} 
          />
          <Radar 
            name="Capaian Domain" 
            dataKey="percentage" 
            stroke="#4f46e5" 
            fill="#4f46e5" 
            fillOpacity={0.15} 
            strokeWidth={2} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1.5px solid #e2e8f0', 
              borderRadius: '14px', 
              fontSize: '10px', 
              fontWeight: 'bold', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.04)' 
            }} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
