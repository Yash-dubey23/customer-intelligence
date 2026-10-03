import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
import { predictions } from '../api/endpoints';
import type { Prediction } from '../api/types';

export default function PredictionDetail() {
  const { id } = useParams<{ id: string }>();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    predictions.getById(id)
      .then(res => setPrediction(res))
      .catch(() => setError('Prediction not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="bg-white border border-slate-200 rounded-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-40 w-40 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Prediction not found</h2>
          <p className="text-sm text-slate-500 mb-6">The prediction you're looking for doesn't exist or has been removed.</p>
          <Link to="/app/predictions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Back to predictions
          </Link>
        </div>
      </div>
    );
  }

  const prob = prediction.probability;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (prob * circumference);

  const strokeColor =
    prediction.riskLevel === 'HIGH' ? '#ef4444' :
    prediction.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/app/predictions" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Predictions
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">#{prediction.id}</span>
      </div>

      {/* Main Result Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-8">
        <div className="flex flex-col items-center">
          {/* Circular Gauge */}
          <div className="relative w-40 h-40 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="70" cy="70" r="60" fill="none"
                stroke={strokeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">{(prob * 100).toFixed(1)}%</span>
              <span className="text-xs text-slate-500 mt-0.5">churn probability</span>
            </div>
          </div>

          {/* Risk Level Badge */}
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold
            ${prediction.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' : ''}
            ${prediction.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : ''}
            ${prediction.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' : ''}
          `}>
            {prediction.riskLevel} RISK
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-medium uppercase text-slate-500 mb-4">Prediction Details</h3>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Prediction ID</dt>
              <dd className="text-slate-900 font-medium">#{prediction.id}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Customer</dt>
              <dd>
                <Link to={`/app/customers/${prediction.customerId}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  {prediction.customerCode}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Model</dt>
              <dd className="text-slate-900 font-medium flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                {prediction.modelName}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Status</dt>
              <dd className="flex items-center gap-1.5">
                {prediction.status === 'COMPLETED' ? (
                  <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-700 font-medium">Completed</span></>
                ) : (
                  <><XCircle className="w-3.5 h-3.5 text-red-500" /> <span className="text-red-700 font-medium">Failed</span></>
                )}
              </dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-slate-500">Date</dt>
              <dd className="text-slate-900">{new Date(prediction.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-medium uppercase text-slate-500 mb-4">What does this mean?</h3>
          <div className="text-sm text-slate-600 space-y-3">
            {prediction.riskLevel === 'HIGH' && (
              <>
                <p>This customer has a <strong className="text-red-700">high probability of churning</strong>. Immediate attention and retention actions are recommended.</p>
                <p className="text-slate-500">Consider reaching out with a personalized retention offer, reviewing their account for service issues, or escalating to customer success.</p>
              </>
            )}
            {prediction.riskLevel === 'MEDIUM' && (
              <>
                <p>This customer shows <strong className="text-amber-700">moderate risk signals</strong>. Proactive monitoring is recommended.</p>
                <p className="text-slate-500">Review their usage patterns and consider engagement activities to strengthen the relationship.</p>
              </>
            )}
            {prediction.riskLevel === 'LOW' && (
              <>
                <p>This customer currently shows <strong className="text-emerald-700">low churn risk</strong>. No immediate action needed.</p>
                <p className="text-slate-500">Continue standard engagement. Re-evaluate periodically as circumstances change.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to={`/app/customers/${prediction.customerId}`}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View Customer
        </Link>
        <Link
          to="/app/predictions/new"
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          New Prediction
        </Link>
      </div>
    </div>
  );
}
