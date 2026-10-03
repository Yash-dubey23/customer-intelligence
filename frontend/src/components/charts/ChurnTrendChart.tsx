import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChurnTrendPoint } from '../../api/types';
import { Skeleton } from '../ui/Skeleton';

interface ChurnTrendChartProps {
  data: ChurnTrendPoint[];
  loading: boolean;
  activeFilter: 'all' | 'high' | 'medium' | 'low';
}

export const ChurnTrendChart: React.FC<ChurnTrendChartProps> = ({ data, loading, activeFilter }) => {
  if (loading) {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center space-y-4">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    );
  }

  const getConfig = () => {
    switch (activeFilter) {
      case 'high': return { dataKey: 'high', stroke: '#ef4444', fill: '#ef4444' };
      case 'medium': return { dataKey: 'medium', stroke: '#f59e0b', fill: '#f59e0b' };
      case 'low': return { dataKey: 'low', stroke: '#10b981', fill: '#10b981' };
      default: return { dataKey: 'total', stroke: '#4f46e5', fill: '#4f46e5' };
    }
  };

  const config = getConfig();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md text-sm border-none">
          <p className="font-medium text-slate-800 mb-1">{label}</p>
          <p style={{ color: config.stroke }}>
            Count: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`color-${config.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.fill} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={config.fill} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey={config.dataKey} 
            stroke={config.stroke} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#color-${config.dataKey})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
