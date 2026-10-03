import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Skeleton } from '../ui/Skeleton';

interface RocCurveProps {
  curves: Record<string, { fpr: number[], tpr: number[] }>;
  loading: boolean;
}

const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b'];

export const RocCurve: React.FC<RocCurveProps> = ({ curves, loading }) => {
  const data = useMemo(() => {
    if (!curves || Object.keys(curves).length === 0) return [];
    
    // We assume all curves have the same number of points for simplicity, 
    // or we construct a merged dataset
    const models = Object.keys(curves);
    if (models.length === 0) return [];

    const firstModelData = curves[models[0]];
    const length = firstModelData.fpr.length;
    
    const formattedData = [];
    for (let i = 0; i < length; i++) {
      const point: any = {};
      models.forEach(model => {
        if (curves[model] && curves[model].fpr[i] !== undefined) {
          // Recharts prefers X axis to be a single key. We'll use the FPR of the first model as approximation if they differ,
          // but typically ROC curves need scatter chart if FPRs don't align. 
          // For a LineChart, we'll map FPR as X and TPR as Y, but we need data sorted by FPR.
          point['fpr'] = curves[model].fpr[i];
          point[`${model}_tpr`] = curves[model].tpr[i];
        }
      });
      formattedData.push(point);
    }
    
    return formattedData.sort((a, b) => a.fpr - b.fpr);
  }, [curves]);

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="p-4 text-slate-500 text-sm">No ROC curve data available.</div>;
  }

  const models = Object.keys(curves);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="fpr" 
            type="number" 
            domain={[0, 1]} 
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'False Positive Rate', position: 'bottom', fill: '#475569', fontSize: 13 }}
          />
          <YAxis 
            type="number" 
            domain={[0, 1]} 
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{ value: 'True Positive Rate', angle: -90, position: 'left', fill: '#475569', fontSize: 13 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [value.toFixed(3), name.replace('_tpr', '')]}
            labelFormatter={(label: number) => `FPR: ${label.toFixed(3)}`}
            contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => value.replace('_tpr', '')} />
          
          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#94a3b8" strokeDasharray="3 3" />
          
          {models.map((model, index) => (
            <Line
              key={model}
              type="monotone"
              dataKey={`${model}_tpr`}
              name={model}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
