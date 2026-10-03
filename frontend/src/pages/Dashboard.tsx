import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  AlertOctagon,
  TrendingDown,
  BrainCircuit,
  Gauge,
  CheckCircle,
  UserPlus,
  Shield,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import type { OverviewData, Customer, Event } from '../api/types';
import { analytics, customers, events } from '../api/endpoints';

const KpiCard = ({ title, value, icon, tooltip, loading }: {
  title: string;
  value?: string | number;
  icon: React.ReactNode;
  tooltip?: string;
  loading?: boolean;
}) => (
  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col" title={tooltip}>
    <div className="flex justify-between items-start text-slate-500 mb-2">
      <span className="text-sm font-medium uppercase tracking-wide">{title}</span>
      {icon}
    </div>
    {loading ? (
      <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
    ) : (
      <div className="text-2xl font-semibold text-slate-900">{value ?? '–'}</div>
    )}
  </div>
);

const RiskBadge = ({ risk }: { risk: string }) => {
  let color = 'bg-slate-100 text-slate-700';
  if (risk === 'HIGH') color = 'bg-red-100 text-red-700';
  if (risk === 'MEDIUM') color = 'bg-amber-100 text-amber-700';
  if (risk === 'LOW') color = 'bg-emerald-100 text-emerald-700';
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
      {risk}
    </span>
  );
};

// Static chart data — would need dedicated analytics endpoints to be dynamic
const trendData = [
  { date: 'Jan', high: 24, medium: 40, low: 336 },
  { date: 'Feb', high: 28, medium: 45, low: 337 },
  { date: 'Mar', high: 32, medium: 50, low: 343 },
  { date: 'Apr', high: 35, medium: 48, low: 357 },
  { date: 'May', high: 40, medium: 55, low: 355 },
  { date: 'Jun', high: 45, medium: 60, low: 355 },
];

const distributionData = [
  { level: 'High', count: 45, color: '#ef4444' },
  { level: 'Medium', count: 60, color: '#f59e0b' },
  { level: 'Low', count: 355, color: '#10b981' }
];

export default function Dashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [highRiskCustomers, setHighRiskCustomers] = useState<Customer[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, custRes, eventsRes] = await Promise.allSettled([
          analytics.overview(),
          customers.list({ size: 10, risk: 'HIGH' }),
          events.list({ size: 10 }),
        ]);

        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
        if (custRes.status === 'fulfilled') setHighRiskCustomers(custRes.value.content);
        if (eventsRes.status === 'fulfilled') setRecentEvents(eventsRes.value.content);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PREDICTION_COMPLETED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'CUSTOMER_ADDED': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'MOVED_TO_HIGH_RISK': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'RETENTION_ACTION': return <Shield className="w-4 h-4 text-indigo-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard 
          title="Total Customers" 
          value={overview?.totalCustomers.toLocaleString()} 
          icon={<Users className="w-5 h-5" />} 
          loading={loading} 
        />
        <KpiCard 
          title="At-Risk Customers" 
          value={overview?.atRiskCustomers.toLocaleString()} 
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} 
          loading={loading} 
        />
        <KpiCard 
          title="High-Risk Customers" 
          value={overview?.highRiskCustomers.toLocaleString()} 
          icon={<AlertOctagon className="w-5 h-5 text-red-500" />} 
          loading={loading} 
        />
        <KpiCard 
          title="Churn Rate" 
          value={overview ? `${overview.churnRate.toFixed(1)}%` : undefined} 
          icon={<TrendingDown className="w-5 h-5" />} 
          loading={loading} 
        />
        <KpiCard 
          title="Predictions This Month" 
          value={overview?.predictionsThisMonth.toLocaleString()} 
          icon={<BrainCircuit className="w-5 h-5 text-indigo-500" />} 
          loading={loading} 
        />
        <KpiCard 
          title="Avg Churn Probability" 
          value={overview ? `${overview.avgChurnProbability.toFixed(1)}%` : undefined} 
          icon={<Gauge className="w-5 h-5" />} 
          loading={loading} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500 mb-6">Churn Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" name="High Risk" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase text-slate-500 mb-6">Risk Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ fontSize: '13px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-medium uppercase text-slate-500">Customers Needing Attention</h2>
            <Link to="/app/customers?risk=HIGH" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 font-medium">Prob.</th>
                  <th className="px-5 py-3 font-medium">Tenure</th>
                  <th className="px-5 py-3 font-medium">Charges</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <>
                    {highRiskCustomers.map(cust => (
                      <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-900">{cust.customerCode}</td>
                        <td className="px-5 py-4">
                          <RiskBadge risk={cust.latestPrediction?.riskLevel || 'UNKNOWN'} />
                        </td>
                        <td className="px-5 py-4 font-medium text-red-600">
                          {cust.latestPrediction?.probability != null
                            ? `${(cust.latestPrediction.probability * 100).toFixed(1)}%`
                            : '-'}
                        </td>
                        <td className="px-5 py-4 text-slate-600">{cust.tenure}m</td>
                        <td className="px-5 py-4 text-slate-600">${cust.monthlyCharges}</td>
                        <td className="px-5 py-4 text-right">
                          <Link to={`/app/customers/${cust.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {highRiskCustomers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-500">No high-risk customers found.</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-1 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-medium uppercase text-slate-500">Recent Activity</h2>
          </div>
          <div className="p-5">
            <div className="space-y-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 w-4 bg-slate-100 rounded animate-pulse flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {recentEvents.map(event => (
                    <div key={event.id} className="flex gap-4">
                      <div className="mt-0.5">{getEventIcon(event.type)}</div>
                      <div>
                        <p className="text-sm text-slate-700">{event.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(event.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {recentEvents.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
