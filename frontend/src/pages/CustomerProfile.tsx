import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, BrainCircuit, Plus, ShieldAlert, History, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { customers, predictions, retention } from '../api/endpoints';
import type { Customer, Prediction, RetentionAction } from '../api/types';

const RiskBadge = ({ risk }: { risk: string }) => {
  const colors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700 border border-red-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
    LOW: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${colors[risk] || colors.LOW}`}>
      {risk} RISK
    </span>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between items-end gap-4 border-b border-slate-200 border-dashed pb-1">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900 text-right">{value || '-'}</span>
  </div>
);

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [predHistory, setPredHistory] = useState<Prediction[]>([]);
  const [retentionActions, setRetentionActions] = useState<RetentionAction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      customers.getById(id),
      predictions.list({ customerId: id, size: 20 }),
      retention.getByCustomer(id),
    ])
      .then(([cust, preds, actions]) => {
        setCustomer(cust);
        setPredHistory(preds.content);
        setRetentionActions(actions);
      })
      .catch(() => setError('Failed to load customer profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center py-24">
        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Customer not found</h2>
        <p className="text-slate-500 text-sm mb-6">{error || 'This customer does not exist.'}</p>
        <Link to="/app/customers" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  const latestPred = customer.latestPrediction;
  const chartData = predHistory
    .slice()
    .reverse()
    .map(p => ({
      date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      probability: +(p.probability * 100).toFixed(1),
      id: p.id,
    }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-slate-500 font-medium">
        <Link to="/app/customers" className="hover:text-indigo-600 transition-colors">Customers</Link>
        <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
        <span className="text-slate-900">{customer.customerCode}</span>
      </nav>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{customer.customerCode}</h1>
              {latestPred && <RiskBadge risk={latestPred.riskLevel} />}
            </div>
            <p className="text-slate-500 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {latestPred
                ? `Last predicted on ${new Date(latestPred.createdAt).toLocaleDateString()}`
                : 'No predictions yet'}
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            {latestPred && (
              <div className="text-center">
                <div className={`text-4xl font-black ${latestPred.riskLevel === 'HIGH' ? 'text-red-600' : latestPred.riskLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {(latestPred.probability * 100).toFixed(1)}%
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Churn Risk</div>
              </div>
            )}
            
            <div className="h-16 w-px bg-slate-200 hidden md:block" />
            
            <div className="flex flex-col gap-2">
              <Link
                to={`/app/predictions/new?customer=${customer.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
              >
                <BrainCircuit className="w-4 h-4" />
                Run Prediction
              </Link>
              <Link
                to={`/app/retention?customer=${customer.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Action
              </Link>
            </div>
          </div>
        </div>
        
        {/* Info Grid */}
        <div className="bg-slate-50 border-t border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Account</h3>
              <InfoRow label="Contract" value={customer.contract} />
              <InfoRow label="Tenure" value={`${customer.tenure} months`} />
              <InfoRow label="Monthly Charges" value={`$${customer.monthlyCharges.toFixed(2)}`} />
              <InfoRow label="Total Charges" value={`$${customer.totalCharges.toFixed(2)}`} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Services</h3>
              <InfoRow label="Internet" value={customer.internetService} />
              <InfoRow label="Phone" value={customer.phoneService} />
              <InfoRow label="TV Streaming" value={customer.streamingTv} />
              <InfoRow label="Movie Streaming" value={customer.streamingMovies} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Add-ons</h3>
              <InfoRow label="Online Security" value={customer.onlineSecurity} />
              <InfoRow label="Online Backup" value={customer.onlineBackup} />
              <InfoRow label="Device Protection" value={customer.deviceProtection} />
              <InfoRow label="Tech Support" value={customer.techSupport} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Demographics</h3>
              <InfoRow label="Gender" value={customer.gender} />
              <InfoRow label="Senior Citizen" value={customer.seniorCitizen ? 'Yes' : 'No'} />
              <InfoRow label="Partner" value={customer.partner} />
              <InfoRow label="Dependents" value={customer.dependents} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction History */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-900">Prediction History</h2>
          </div>
          
          {chartData.length > 0 ? (
            <>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="probability" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-slate-500 bg-slate-50 border-y border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Probability</th>
                      <th className="px-4 py-3 font-medium">Risk</th>
                      <th className="px-4 py-3 font-medium">Model</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {predHistory.slice().reverse().map(pred => (
                      <tr key={pred.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">{new Date(pred.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{(pred.probability * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3"><RiskBadge risk={pred.riskLevel} /></td>
                        <td className="px-4 py-3 text-slate-500">{pred.modelName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <BrainCircuit className="w-10 h-10 mb-3 text-slate-300" />
              <p className="text-sm">No predictions yet for this customer.</p>
              <Link to={`/app/predictions/new?customer=${customer.id}`} className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700">
                Run first prediction →
              </Link>
            </div>
          )}
        </div>

        {/* Retention Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-900">Retention Log</h2>
          </div>
          
          {retentionActions.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No retention actions recorded yet.</p>
          ) : (
            <div className="space-y-6">
              {retentionActions.map((action, idx) => (
                <div key={action.id} className="relative pl-6 pb-2">
                  {idx !== retentionActions.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-0 w-px bg-slate-200" />
                  )}
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-indigo-600 bg-white" />
                  
                  <div className="mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {action.status}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(action.actedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {action.notes && (
                    <p className="text-sm text-slate-700 mt-2">{action.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
