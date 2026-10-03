import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Search, Filter } from 'lucide-react';
import type { Customer } from '../api/types';
import { customers, exportApi } from '../api/endpoints';

const Badge = ({ risk }: { risk?: string | null }) => {
  if (!risk) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500">No prediction</span>;
  
  const colors: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-emerald-100 text-emerald-700',
  };
  
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colors[risk] || 'bg-slate-100 text-slate-500'}`}>
      {risk}
    </span>
  );
};

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    risk: searchParams.get('risk') || '',
    contract: searchParams.get('contract') || '',
    page: parseInt(searchParams.get('page') || '0', 10)
  });

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customers.list({
        search: filters.search || undefined,
        risk: filters.risk || undefined,
        contract: filters.contract || undefined,
        page: filters.page,
        size: 10,
      });
      setData(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string | number) => {
    const newFilters = { ...filters, [key]: value, page: key === 'page' ? (value as number) : 0 };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v || v === 0) params.set(k, String(v));
    });
    setSearchParams(params);
  };

  const handleExport = async () => {
    try {
      const blob = await exportApi.exportCustomers({
        risk: filters.risk || undefined,
        search: filters.search || undefined,
      }) as unknown as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading…' : `${totalElements.toLocaleString()} total customers`}
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Customer code..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-48">
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Risk Level</label>
          <select 
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            value={filters.risk}
            onChange={(e) => updateFilter('risk', e.target.value)}
          >
            <option value="">All Risks</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Contract</label>
          <select 
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            value={filters.contract}
            onChange={(e) => updateFilter('contract', e.target.value)}
          >
            <option value="">All Contracts</option>
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">One year</option>
            <option value="Two year">Two year</option>
          </select>
        </div>
        
        <button 
          onClick={() => {
            setFilters({ search: '', risk: '', contract: '', page: 0 });
            setSearchParams(new URLSearchParams());
          }}
          className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Customer Code</th>
                <th className="px-6 py-4">Contract</th>
                <th className="px-6 py-4">Tenure</th>
                <th className="px-6 py-4">Monthly Charges</th>
                <th className="px-6 py-4">Risk</th>
                <th className="px-6 py-4">Probability</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{cust.customerCode}</td>
                    <td className="px-6 py-4 text-slate-600">{cust.contract}</td>
                    <td className="px-6 py-4 text-slate-600">{cust.tenure} mos</td>
                    <td className="px-6 py-4 text-slate-600">${cust.monthlyCharges.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <Badge risk={cust.latestPrediction?.riskLevel} />
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {cust.latestPrediction
                        ? `${(cust.latestPrediction.probability * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/app/customers/${cust.id}`} 
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Filter className="w-8 h-8 text-slate-300" />
                      <p className="text-base font-medium text-slate-900">No customers found</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{(filters.page * 10) + 1}</span> to <span className="font-medium text-slate-900">{Math.min((filters.page + 1) * 10, totalElements)}</span> of <span className="font-medium text-slate-900">{totalElements}</span> results
            </p>
            <div className="flex gap-2">
              <button 
                disabled={filters.page === 0}
                onClick={() => updateFilter('page', filters.page - 1)}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                disabled={filters.page >= totalPages - 1}
                onClick={() => updateFilter('page', filters.page + 1)}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
