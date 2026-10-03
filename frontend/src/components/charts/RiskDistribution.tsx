import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RiskDistribution as RiskDistributionType } from '../../api/types';
import { Skeleton } from '../ui/Skeleton';

interface RiskDistributionProps {
  data: RiskDistributionType[];
  loading: boolean;
  onSegmentClick?: (level: string) => void;
}

const COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

export const RiskDistribution: React.FC<RiskDistributionProps> = ({ data, loading, onSegmentClick }) => {
  if (loading) {
    return (
      <div className="w-full h-72 flex items-center justify-center">
        <Skeleton className="w-48 h-48 rounded-full" />
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-md text-sm">
          <p className="font-medium text-slate-800">{data.level} Risk</p>
          <p className="text-slate-600 mt-1">
            Count: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {((data.count / total) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center text-sm text-slate-600">
            <span 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium mr-1">{entry.value}</span>
            <span className="text-slate-400">({entry.payload.count})</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={2}
            dataKey="count"
            nameKey="level"
            onClick={(e) => onSegmentClick && e?.level && onSegmentClick(e.level)}
            className={onSegmentClick ? "cursor-pointer" : ""}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.level] || '#cbd5e1'} 
                className="hover:opacity-80 transition-opacity outline-none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-3xl font-bold text-slate-800">{total}</p>
        <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
      </div>
    </div>
  );
};
