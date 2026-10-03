import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ml } from '../api/endpoints';
import type { ModelMetrics } from '../api/types';
import { ConfusionMatrix } from '../components/charts/ConfusionMatrix';
import { RocCurve } from '../components/charts/RocCurve';
import { FeatureImportance } from '../components/charts/FeatureImportance';
import { BrainCircuit, Target, CheckCircle, Crosshair, BarChart3 } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export default function ModelInsights() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await ml.metrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load model metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="w-64 h-8" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Unable to load model metrics</h2>
          <p className="text-sm text-slate-500">Make sure the ML service is running and models have been trained.</p>
        </div>
      </div>
    );
  }

  const bestModel = metrics.bestModel;
  const bestPerf = metrics.models[bestModel];

  // Build ROC curves from all models
  const rocCurves: Record<string, { fpr: number[]; tpr: number[] }> = {};
  for (const [name, model] of Object.entries(metrics.models)) {
    if (model.roc_curve) {
      rocCurves[name] = model.roc_curve;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            Model Insights
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 font-mono">
              {bestModel}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Performance metrics and feature analysis</p>
        </div>
      </div>

      {/* Performance KPIs */}
      {bestPerf && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { title: 'Accuracy', value: bestPerf.accuracy, icon: <Target className="w-4 h-4 text-blue-500" /> },
            { title: 'Precision', value: bestPerf.precision, icon: <Crosshair className="w-4 h-4 text-indigo-500" /> },
            { title: 'Recall', value: bestPerf.recall, icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
            { title: 'F1 Score', value: bestPerf.f1, icon: <BarChart3 className="w-4 h-4 text-purple-500" /> },
            { title: 'ROC AUC', value: bestPerf.roc_auc, icon: <BrainCircuit className="w-4 h-4 text-amber-500" /> },
          ].map((m) => (
            <div key={m.title} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium uppercase text-slate-500">{m.title}</span>
                {m.icon}
              </div>
              <div className="text-2xl font-semibold text-slate-900">
                {(m.value * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Comparison Table */}
      {Object.keys(metrics.models).length > 1 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-medium uppercase text-slate-500">Model Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Model</th>
                  <th className="px-5 py-3 text-right font-medium">Accuracy</th>
                  <th className="px-5 py-3 text-right font-medium">Precision</th>
                  <th className="px-5 py-3 text-right font-medium">Recall</th>
                  <th className="px-5 py-3 text-right font-medium">F1</th>
                  <th className="px-5 py-3 text-right font-medium">ROC AUC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.entries(metrics.models).map(([name, perf]) => (
                  <tr key={name} className={`hover:bg-slate-50 ${name === bestModel ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {name}
                      {name === bestModel && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-100 text-indigo-700">BEST</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600">{(perf.accuracy * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right text-slate-600">{(perf.precision * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right text-slate-600">{(perf.recall * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right text-slate-600">{(perf.f1 * 100).toFixed(1)}%</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-900">{(perf.roc_auc * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROC Curve + Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-sm font-medium uppercase text-slate-500">ROC Curve</h2>
            {bestPerf && (
              <div className="text-right">
                <span className="text-xs text-slate-400">AUC</span>
                <span className="ml-2 text-lg font-semibold text-indigo-600">{bestPerf.roc_auc.toFixed(3)}</span>
              </div>
            )}
          </div>
          <RocCurve curves={rocCurves} loading={false} />
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-medium uppercase text-slate-500 mb-5">Confusion Matrix</h2>
          {bestPerf && <ConfusionMatrix matrix={bestPerf.confusion_matrix} loading={false} />}
        </div>
      </div>

      {/* Feature Importance */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-medium uppercase text-slate-500 mb-5">Feature Importance</h2>
        <FeatureImportance data={metrics.featureImportance} loading={false} />
      </div>
    </motion.div>
  );
}
