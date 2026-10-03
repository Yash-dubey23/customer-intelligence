import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, BrainCircuit } from 'lucide-react';
import { predictions } from '../api/endpoints';
import type { Prediction } from '../api/types';

const RiskBadge = ({ risk }: { risk: 'LOW' | 'MEDIUM' | 'HIGH' }) => {
  const colors = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-emerald-100 text-emerald-700',
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[risk]}`}>{risk}</span>;
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
    {status}
  </span>
);

export default function PredictionHistory() {
  const [data, setData] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await predictions.list({
          page,
          size: 15,
          risk: riskFilter || undefined,
          search: search || undefined,
          date: dateFilter || undefined,
        });
        setData(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, riskFilter, search, dateFilter]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
            Prediction History
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading…' : `${totalElements.toLocaleString()} predictions total`}
          </p>
        </div>
        <Link 
          to="/app/predictions/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          Run New Prediction
        </Link>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer code..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="w-40">
          <select
            value={riskFilter}
            onChange={e => { setRiskFilter(e.target.value); setPage(0); }}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 bg-white"
          >
            <option value="">All Risks</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        <div className="w-48 relative">
          <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 bg-white text-slate-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Probability</th>
              <th className="px-6 py-4">Risk</th>
              <th className="px-6 py-4">Model</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  No predictions found.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-500">#{row.id}</td>
                  <td className="px-6 py-4 font-medium text-indigo-600 hover:underline">
                    <Link to={`/app/customers/${row.customerId}`}>{row.customerCode}</Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{(row.probability * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4"><RiskBadge risk={row.riskLevel} /></td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">{row.modelName}</td>
                  <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/app/predictions/${row.id}`} className="text-slate-400 hover:text-indigo-600 text-xs font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {!loading && `Showing ${Math.min(page * 15 + 1, totalElements)}–${Math.min((page + 1) * 15, totalElements)} of ${totalElements}`}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
