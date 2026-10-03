import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { customers, retention } from '../api/endpoints';
import type { Customer, RetentionAction } from '../api/types';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { MessageSquare, Check, Clock, Send, ShieldAlert, AlertCircle, Eye } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

const STATUSES = ['All', 'REVIEWED', 'CONTACTED', 'OFFER_SENT', 'MONITORING', 'RESOLVED'];
const STATUS_LABELS: Record<string, string> = {
  REVIEWED: 'Reviewed',
  CONTACTED: 'Contacted',
  OFFER_SENT: 'Offer Sent',
  MONITORING: 'Monitoring',
  RESOLVED: 'Resolved',
};

export default function RetentionWorkspace() {
  const [activeTab, setActiveTab] = useState('All');
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [actionsMap, setActionsMap] = useState<Record<number, RetentionAction>>({});
  const [loading, setLoading] = useState(true);
  const [notesInput, setNotesInput] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await customers.list({ risk: 'HIGH', size: 50 });
      const custs = res.content;
      setCustomerList(custs);

      const map: Record<number, RetentionAction> = {};
      for (const c of custs) {
        if (c.id) {
          try {
            const actions = await retention.getByCustomer(String(c.id));
            if (actions && actions.length > 0) {
              // Get most recent action by actedAt
              map[c.id] = actions.sort(
                (a, b) => new Date(b.actedAt).getTime() - new Date(a.actedAt).getTime()
              )[0];
            }
          } catch {
            // silently continue if no actions for this customer
          }
        }
      }
      setActionsMap(map);
    } catch (error) {
      console.error('Failed to fetch retention workspace data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (customerId: number, status: string) => {
    try {
      setSubmitting(customerId);
      const notes = notesInput[customerId] || '';
      const newAction = await retention.create({
        customerId,
        status,
        notes,
      });
      setActionsMap(prev => ({ ...prev, [customerId]: newAction }));
      setNotesInput(prev => ({ ...prev, [customerId]: '' }));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const filteredCustomers = customerList.filter(c => {
    if (activeTab === 'All') return true;
    const currentStatus = actionsMap[c.id!]?.status;
    return currentStatus === activeTab;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-6 max-w-6xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Retention Workspace</h1>
        <p className="text-slate-500 mt-1">Manage interventions for high-risk customers.</p>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 pb-px overflow-x-auto">
        {STATUSES.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab === 'All' ? 'All' : STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-full h-48 rounded-xl" />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState 
          icon={ShieldAlert} 
          title="No customers in this stage" 
          description="Check other tabs for customers requiring attention." 
        />
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map(customer => {
            const currentAction = actionsMap[customer.id!];
            const currentStatus = currentAction?.status || null;
            const prob = customer.latestPrediction?.probability ?? 0;
            
            return (
              <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6">
                
                <div className="w-full md:w-1/3 flex flex-col border-r border-slate-100 pr-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{customer.customerCode}</h3>
                    <Badge variant="high">High Risk</Badge>
                  </div>
                  
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Probability:</span>
                      <span className="font-semibold text-red-600">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tenure:</span>
                      <span className="font-medium text-slate-700">{customer.tenure} mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly:</span>
                      <span className="font-medium text-slate-700">${customer.monthlyCharges}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Current Status:</span>
                      <Badge variant={currentStatus ? 'success' : 'default'}>
                        {currentStatus ? STATUS_LABELS[currentStatus] || currentStatus : 'No action taken'}
                      </Badge>
                    </div>
                    {currentAction && (
                      <div className="text-xs text-slate-400 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(currentAction.actedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {currentAction?.notes && (
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 mb-4 border border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 mb-1">Previous Note:</span>
                      {currentAction.notes}
                    </div>
                  )}

                  <div className="mt-auto space-y-3">
                    <input 
                      type="text" 
                      placeholder="Add an update note..." 
                      className="w-full text-sm p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={notesInput[customer.id!] || ''}
                      onChange={(e) => setNotesInput(prev => ({ ...prev, [customer.id!]: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      {(['REVIEWED', 'CONTACTED', 'OFFER_SENT', 'MONITORING', 'RESOLVED'] as const).map(action => (
                        <button
                          key={action}
                          onClick={() => handleAction(customer.id!, action)}
                          disabled={submitting === customer.id || currentStatus === action}
                          className={`text-xs font-medium px-3 py-1.5 rounded flex items-center transition-colors ${
                            currentStatus === action 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300'
                          }`}
                        >
                          {action === 'REVIEWED' && <Eye size={14} className="mr-1.5" />}
                          {action === 'CONTACTED' && <MessageSquare size={14} className="mr-1.5" />}
                          {action === 'OFFER_SENT' && <Send size={14} className="mr-1.5" />}
                          {action === 'MONITORING' && <AlertCircle size={14} className="mr-1.5" />}
                          {action === 'RESOLVED' && <Check size={14} className="mr-1.5" />}
                          {STATUS_LABELS[action]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
