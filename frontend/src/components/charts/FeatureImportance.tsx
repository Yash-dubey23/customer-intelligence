import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../ui/Skeleton';

interface FeatureImportanceProps {
  data: { feature: string; importance: number }[];
  loading: boolean;
}

export const FeatureImportance: React.FC<FeatureImportanceProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="w-full h-6 rounded" />
        ))}
      </div>
    );
  }

  // Format feature names nicely
  const prettifyFeature = (name: string) => {
    let clean = name;
    if (clean.startsWith('cat__')) clean = clean.substring(5);
    if (clean.startsWith('num__')) clean = clean.substring(5);
    
    clean = clean.replace(/_/g, ' ');
    
    // Title case
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const formattedData = [...data]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 15) // Top 15
    .map(item => ({
      ...item,
      displayName: prettifyFeature(item.feature),
      // Scale importance for better visualization if needed, but we'll use original
      importanceVal: Number(item.importance.toFixed(4))
    }))
    .reverse(); // For horizontal bar chart, we want largest at top, so reverse

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md text-sm border border-slate-100">
          <p className="font-medium text-slate-800 mb-1">{payload[0].payload.displayName}</p>
          <p className="text-indigo-600">
            Importance: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={formattedData}
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="displayName" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            width={180}
            tick={{ fontSize: 12, fill: '#475569' }}
          />
          <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
          <Bar 
            dataKey="importanceVal" 
            fill="#4f46e5" 
            radius={[0, 4, 4, 0]}
            barSize={20}
            label={{ position: 'right', fill: '#64748b', fontSize: 11 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
