import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { customers, analytics } from '../api/endpoints';
import type { Customer, RiskDistribution } from '../api/types';
import { Badge } from '../components/ui/Badge';
import { AlertCircle, TrendingUp, TrendingDown, Eye, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KpiCard } from '../components/ui/KpiCard';

export default function RiskCenter() {
  const [criticalCustomers, setCriticalCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskStats, setRiskStats] = useState<RiskDistribution[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, statsRes] = await Promise.all([
          customers.list({ risk: 'HIGH', size: 20 }),
          analytics.riskDistribution()
        ]);
        setCriticalCustomers(customersRes.content);
        setRiskStats(statsRes);
      } catch (error) {
        console.error('Failed to fetch risk center data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStat = (level: string) => riskStats.find(s => s.level === level)?.count || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Risk Center</h1>
        <p className="text-slate-500 mt-1">Operational view of high-risk customers requiring intervention.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard 
          title="Critical Risk" 
          value={getStat('HIGH')} 
          icon={AlertCircle}
          trend={{ value: 12, direction: 'up' }}
          loading={loading}
        />
        <KpiCard 
          title="At Risk" 
          value={getStat('MEDIUM')} 
          icon={Activity}
          loading={loading}
        />
        <KpiCard 
          title="Stable" 
          value={getStat('LOW')} 
          icon={TrendingDown}
          loading={loading}
        />
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Critical Priority Queue</h2>
          <Badge variant="high">High Risk Only</Badge>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : criticalCustomers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No critical risk customers found.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Probability</th>
                  <th className="px-6 py-3 font-medium">Tenure (mo)</th>
                  <th className="px-6 py-3 font-medium">Contract</th>
                  <th className="px-6 py-3 font-medium">Monthly Charges</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalCustomers.map(row => {
                  const prob = row.latestPrediction?.probability ?? 0;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{row.customerCode}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.tenure}</td>
                      <td className="px-6 py-4 text-slate-600">{row.contract}</td>
                      <td className="px-6 py-4 text-slate-600">${row.monthlyCharges?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Link to={`/app/customers/${row.id}`} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                            <Eye size={18} />
                          </Link>
                          <Link to={`/app/retention?customer=${row.id}`} className="text-xs font-medium bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors">
                            Action
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center h-64 text-center">
          <TrendingUp className="text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-700">Rising Risk Tracker</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Rising risk tracking requires multiple predictions per customer over time. Insufficient historical data available.
          </p>
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center h-64 text-center">
          <TrendingDown className="text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-700">Recently Improved</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Requires multiple predictions per customer to identify decreasing risk trends.
          </p>
        </section>
      </div>
    </motion.div>
  );
}
