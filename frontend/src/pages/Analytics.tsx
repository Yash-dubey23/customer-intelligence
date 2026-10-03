import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { analytics } from '../api/endpoints';
import type { ChurnTrendPoint, SegmentData, RiskDistribution as RiskDistType } from '../api/types';
import { ChurnTrendChart } from '../components/charts/ChurnTrendChart';
import { SegmentCharts } from '../components/charts/SegmentCharts';
import { RiskDistribution } from '../components/charts/RiskDistribution';
import { EmptyState } from '../components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export default function Analytics() {
  const navigate = useNavigate();
  const [trendData, setTrendData] = useState<ChurnTrendPoint[]>([]);
  const [segmentData, setSegmentData] = useState<SegmentData[]>([]);
  const [riskData, setRiskData] = useState<RiskDistType[]>([]);

  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingSegments, setLoadingSegments] = useState(true);
  const [loadingRisk, setLoadingRisk] = useState(true);

  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    analytics.churnTrend()
      .then(data => setTrendData(data))
      .catch(err => console.error('Failed to load trends', err))
      .finally(() => setLoadingTrends(false));

    analytics.segments()
      .then(data => setSegmentData(data))
      .catch(err => console.error('Failed to load segments', err))
      .finally(() => setLoadingSegments(false));

    analytics.riskDistribution()
      .then(data => setRiskData(data))
      .catch(err => console.error('Failed to load risk', err))
      .finally(() => setLoadingRisk(false));
  }, []);

  // Group segment data by type for display
  const contractData = segmentData.filter(s => ['Month-to-month', 'One year', 'Two year'].includes(s.label));
  const paymentData = segmentData.filter(s =>
    ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'].includes(s.label)
  );
  const tenureData = segmentData.filter(s => s.label.includes('months') || s.label.includes('yr'));
  const chargesData = segmentData.filter(s => s.label.startsWith('$'));

  // If no grouping is possible, just split evenly for display
  const hasGroupedData = contractData.length > 0 || paymentData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-6 space-y-8"
    >
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Customer churn characteristics and trends</p>
      </div>

      {/* Section 1: Trends */}
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
          <h2 className="text-sm font-medium uppercase text-slate-500 tracking-wide">Customer Trends</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg mt-3 sm:mt-0">
            {(['all', 'high', 'medium', 'low'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeFilter === f
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loadingTrends ? (
          <Skeleton className="h-72" />
        ) : trendData.length > 0 ? (
          <ChurnTrendChart data={trendData} loading={false} activeFilter={activeFilter} />
        ) : (
          <EmptyState icon={BarChart3} title="No trend data" description="Run predictions over time to see trends." />
        )}
      </section>

      {/* Section 2: Segments */}
      <section>
        <h2 className="text-sm font-medium uppercase text-slate-500 tracking-wide mb-4">Customer Characteristics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Churn by Contract Type</h3>
            {loadingSegments ? <Skeleton className="h-48" /> : (
              <SegmentCharts type="contract" data={hasGroupedData ? contractData : segmentData.slice(0, 3)} loading={false} />
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Churn by Payment Method</h3>
            {loadingSegments ? <Skeleton className="h-48" /> : (
              <SegmentCharts type="payment" data={hasGroupedData ? paymentData : segmentData.slice(3, 7)} loading={false} />
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Churn by Tenure</h3>
            {loadingSegments ? <Skeleton className="h-48" /> : (
              <SegmentCharts type="tenure" data={tenureData.length > 0 ? tenureData : segmentData.slice(7, 13)} loading={false} />
            )}
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Churn by Monthly Charges</h3>
            {loadingSegments ? <Skeleton className="h-48" /> : (
              <SegmentCharts type="charges" data={chargesData.length > 0 ? chargesData : segmentData.slice(13, 17)} loading={false} />
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Risk Distribution */}
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-medium uppercase text-slate-500 tracking-wide mb-5">Risk Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-3">
            {[
              { level: 'HIGH', label: 'High Risk', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', value: 'text-red-700' },
              { level: 'MEDIUM', label: 'Medium Risk', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', value: 'text-amber-700' },
              { level: 'LOW', label: 'Low Risk', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', value: 'text-emerald-700' },
            ].map(r => (
              <div key={r.level} className={`p-3 ${r.bg} rounded-lg border ${r.border}`}>
                <p className={`text-xs font-medium ${r.text}`}>{r.label}</p>
                <p className={`text-xl font-bold ${r.value}`}>
                  {riskData.find(d => d.level === r.level)?.count || 0}
                </p>
              </div>
            ))}
          </div>
          <div className="md:col-span-2">
            {loadingRisk ? (
              <Skeleton className="h-64" />
            ) : riskData.length > 0 ? (
              <RiskDistribution
                data={riskData}
                loading={false}
                onSegmentClick={(level) => navigate(`/app/customers?risk=${level}`)}
              />
            ) : (
              <EmptyState icon={BarChart3} title="No risk data" description="Run predictions to see risk distribution." />
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
