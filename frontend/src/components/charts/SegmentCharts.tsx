import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SegmentData } from '../../api/types';
import { Skeleton } from '../ui/Skeleton';

interface SegmentChartsProps {
  type: 'contract' | 'tenure' | 'charges' | 'payment';
  data: SegmentData[];
  loading: boolean;
}

export const SegmentCharts = ({ type: _type, data, loading }: SegmentChartsProps) => {
  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col space-y-3 p-4">
        <Skeleton className="w-full h-8 rounded-md" />
        <Skeleton className="w-full h-8 rounded-md" />
        <Skeleton className="w-full h-8 rounded-md" />
        <Skeleton className="w-full h-8 rounded-md" />
      </div>
    );
  }

  // Calculate non-churned for stacked bar chart
  const formattedData = data.map(item => ({
    ...item,
    retained: item.total - item.churned,
    churnRate: ((item.churned / item.total) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md text-sm border border-slate-100">
          <p className="font-medium text-slate-800 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-slate-600 flex justify-between gap-4">
              <span>Retained:</span>
              <span className="font-semibold">{payload[0].value}</span>
            </p>
            <p className="text-red-500 flex justify-between gap-4">
              <span>Churned:</span>
              <span className="font-semibold">{payload[1].value}</span>
            </p>
            <div className="h-px bg-slate-100 my-1"></div>
            <p className="text-slate-800 flex justify-between gap-4">
              <span>Total:</span>
              <span className="font-semibold">{payload[0].payload.total}</span>
            </p>
            <p className="text-slate-500 text-xs mt-1 text-right">
              {payload[0].payload.churnRate}% churn rate
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={formattedData}
          margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="segment" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 12 }} 
            width={100}
          />
          <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="retained" name="Retained" stackId="a" fill="#cbd5e1" radius={[0, 0, 0, 0]} />
          <Bar dataKey="churned" name="Churned" stackId="a" fill="#fb7185" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
