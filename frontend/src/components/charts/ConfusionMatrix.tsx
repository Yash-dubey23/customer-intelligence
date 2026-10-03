import React from 'react';
import { Skeleton } from '../ui/Skeleton';

interface ConfusionMatrixProps {
  matrix: number[][]; // [[TN, FP], [FN, TP]]
  loading: boolean;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  if (!matrix || matrix.length !== 2 || matrix[0].length !== 2) {
    return <div className="p-4 text-slate-500">Invalid confusion matrix data.</div>;
  }

  const [tn, fp] = matrix[0];
  const [fn, tp] = matrix[1];
  
  const total = tn + fp + fn + tp;
  
  // Calculate opacities for colors (min 0.1, max 0.8)
  const getOpacity = (val: number) => Math.max(0.1, Math.min(0.8, (val / total) * 2));

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr] gap-1">
        {/* Empty top-left */}
        <div></div>
        
        {/* Column Headers */}
        <div className="text-center pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Predicted Negative
        </div>
        <div className="text-center pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Predicted Positive
        </div>
        
        {/* Row 1 */}
        <div className="flex items-center justify-end pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
          Actual Negative
        </div>
        <div 
          className="aspect-square flex flex-col items-center justify-center p-4 rounded-md relative group overflow-hidden"
          style={{ backgroundColor: `rgba(16, 185, 129, ${getOpacity(tn)})` }}
        >
          <span className="text-3xl font-bold text-emerald-900 z-10">{tn}</span>
          <span className="text-xs font-medium text-emerald-800 z-10">True Negative</span>
        </div>
        <div 
          className="aspect-square flex flex-col items-center justify-center p-4 rounded-md relative group overflow-hidden"
          style={{ backgroundColor: `rgba(239, 68, 68, ${getOpacity(fp)})` }}
        >
          <span className="text-3xl font-bold text-red-900 z-10">{fp}</span>
          <span className="text-xs font-medium text-red-800 z-10">False Positive</span>
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-end pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
          Actual Positive
        </div>
        <div 
          className="aspect-square flex flex-col items-center justify-center p-4 rounded-md relative group overflow-hidden"
          style={{ backgroundColor: `rgba(239, 68, 68, ${getOpacity(fn)})` }}
        >
          <span className="text-3xl font-bold text-red-900 z-10">{fn}</span>
          <span className="text-xs font-medium text-red-800 z-10">False Negative</span>
        </div>
        <div 
          className="aspect-square flex flex-col items-center justify-center p-4 rounded-md relative group overflow-hidden"
          style={{ backgroundColor: `rgba(16, 185, 129, ${getOpacity(tp)})` }}
        >
          <span className="text-3xl font-bold text-emerald-900 z-10">{tp}</span>
          <span className="text-xs font-medium text-emerald-800 z-10">True Positive</span>
        </div>
      </div>
    </div>
  );
};
