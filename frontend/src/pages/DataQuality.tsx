import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ml } from '../api/endpoints';
import type { DataQualityInfo, MlHealth } from '../api/types';
import { Database, Table, Hash, ListFilter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export default function DataQuality() {
  const [quality, setQuality] = useState<DataQualityInfo | null>(null);
  const [health, setHealth] = useState<MlHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [qData, hData] = await Promise.all([
          ml.dataQuality().catch(() => null),
          ml.health().catch(() => ({ status: 'offline', model: 'unknown', trainedAt: '' }))
        ]);
        setQuality(qData as DataQualityInfo | null);
        setHealth(hData as MlHealth);
      } catch (error) {
        console.error('Failed to load data quality info', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="w-full h-16 rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!quality) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Unable to load data quality</h2>
          <p className="text-sm text-slate-500">Make sure the ML service is running and models have been trained.</p>
        </div>
      </div>
    );
  }

  const totalMissing = quality.missingValues
    ? Object.values(quality.missingValues).reduce((a: number, b: number) => a + b, 0)
    : 0;
  const isHealthy = quality.status === 'Healthy' && health?.status === 'ok';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-6 space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Data Quality</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dataset health and ML service status</p>
        </div>
        {quality.lastTrained && (
          <div className="text-sm text-slate-500">
            Last training: <span className="font-medium text-slate-700">{new Date(quality.lastTrained).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg flex items-center gap-3 ${isHealthy ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
        {isHealthy ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
        <div>
          <h3 className={`font-semibold text-sm ${isHealthy ? 'text-emerald-800' : 'text-amber-800'}`}>
            Data Quality: {isHealthy ? 'Healthy' : 'Needs Attention'}
          </h3>
          <p className={`text-xs mt-0.5 ${isHealthy ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isHealthy
              ? 'Dataset is clean. No issues detected.'
              : `${totalMissing > 0 ? `${totalMissing} missing values. ` : ''}${quality.duplicateRows > 0 ? `${quality.duplicateRows} duplicate rows.` : ''}`
            }
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Dataset Size', value: quality.rows.toLocaleString(), icon: <Database className="w-4 h-4 text-slate-400" /> },
          { title: 'Features', value: quality.featureCount, icon: <Table className="w-4 h-4 text-slate-400" /> },
          { title: 'Numerical', value: quality.numericalFeatures.length, icon: <Hash className="w-4 h-4 text-indigo-500" /> },
          { title: 'Categorical', value: quality.categoricalFeatures.length, icon: <ListFilter className="w-4 h-4 text-emerald-500" /> },
          { title: 'Missing Values', value: totalMissing === 0 ? 'None' : totalMissing, icon: <AlertTriangle className={`w-4 h-4 ${totalMissing > 0 ? 'text-amber-500' : 'text-slate-400'}`} /> },
          { title: 'Duplicate Rows', value: quality.duplicateRows, icon: <Table className="w-4 h-4 text-slate-400" /> },
        ].map((card) => (
          <div key={card.title} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase text-slate-500">{card.title}</span>
              {card.icon}
            </div>
            <div className="text-xl font-semibold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* ML Service Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-medium uppercase text-slate-500 mb-4">ML Service Status</h2>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-slate-900">
            Prediction Service {health?.status === 'ok' ? 'Online' : 'Offline'}
          </span>
          {health?.model && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {health.model}
            </span>
          )}
        </div>
      </div>

      {/* Missing Values Detail */}
      {totalMissing > 0 && quality.missingValues && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-medium uppercase text-slate-500">Missing Values Details</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Feature</th>
                <th className="px-5 py-3 text-right font-medium">Missing Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.entries(quality.missingValues)
                .filter(([, count]) => count > 0)
                .map(([col, count]) => (
                  <tr key={col} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{col}</td>
                    <td className="px-5 py-3 text-right text-amber-600 font-medium">{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Feature Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-medium uppercase text-slate-500 mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-500" />
            Numerical Features
          </h2>
          <div className="flex flex-wrap gap-2">
            {quality.numericalFeatures.map((col: string) => (
              <span key={col} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded border border-indigo-100">
                {col}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-medium uppercase text-slate-500 mb-4 flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-emerald-500" />
            Categorical Features
          </h2>
          <div className="flex flex-wrap gap-2">
            {quality.categoricalFeatures.map((col: string) => (
              <span key={col} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-100">
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
