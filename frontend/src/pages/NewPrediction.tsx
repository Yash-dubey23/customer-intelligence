import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, BrainCircuit, AlertTriangle } from 'lucide-react';

const STEPS = [
  { id: 'customer', title: 'Customer Profile' },
  { id: 'services', title: 'Services' },
  { id: 'billing', title: 'Billing' },
  { id: 'review', title: 'Review & Predict' }
];

export default function NewPrediction() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    gender: 'Female', seniorCitizen: '0', partner: 'Yes', dependents: 'No', tenure: '24',
    phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic',
    onlineSecurity: 'No', onlineBackup: 'Yes', deviceProtection: 'No', techSupport: 'No',
    streamingTv: 'Yes', streamingMovies: 'No',
    contract: 'Month-to-month', paperlessBilling: 'Yes', paymentMethod: 'Electronic check',
    monthlyCharges: '89.50', totalCharges: '2150.00'
  });

  const updateForm = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(curr => curr + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
  };

  const handlePredict = () => {
    setIsPredicting(true);
    // Simulate ML API call
    setTimeout(() => {
      setIsPredicting(false);
      setResult({ probability: 78, risk: 'HIGH' });
    }, 2000);
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center"
        >
          <div className="bg-slate-50 py-10 px-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Prediction Complete</h2>
            <p className="text-slate-500">The ML model has evaluated this profile.</p>
          </div>
          
          <div className="py-12 px-6 flex flex-col items-center">
            {/* Simple CSS-based gauge */}
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={result.risk === 'HIGH' ? '#ef4444' : result.risk === 'MEDIUM' ? '#f59e0b' : '#10b981'} 
                  strokeWidth="8"
                  strokeDasharray={`${(result.probability / 100) * 283} 283`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-900">{result.probability}%</span>
              </div>
            </div>
            
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-4
              ${result.risk === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {result.risk} RISK
            </div>
            
            <p className="max-w-md text-slate-600 text-sm leading-relaxed">
              This customer has a {result.probability}% likelihood of churning based on historical patterns. 
              {result.risk === 'HIGH' && " Immediate retention action is highly recommended."}
            </p>
          </div>
          
          <div className="bg-slate-50 p-6 flex justify-center gap-4 border-t border-slate-200">
             <button onClick={() => { setResult(null); setCurrentStep(0); }} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
               Run Another
             </button>
             <Link to="/app/customers" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
               View Customers
             </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Run New Prediction</h1>
        <p className="text-slate-500 text-sm mt-1">Evaluate a customer profile using the latest ML model.</p>
      </header>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}></div>
        
        <div className="relative z-10 flex justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300
                ${idx < currentStep ? 'bg-indigo-600 text-white' : 
                  idx === currentStep ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-white border-2 border-slate-200 text-slate-400'}`}
              >
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs font-medium absolute top-10 whitespace-nowrap ${idx <= currentStep ? 'text-indigo-900' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isPredicting ? (
            <motion.div key="predicting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
               <BrainCircuit className="w-16 h-16 text-indigo-500 animate-pulse mb-6" />
               <h3 className="text-xl font-semibold text-slate-900">Analyzing Profile...</h3>
               <p className="text-slate-500 mt-2">Running data through XGBoost model</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Demographics & Profile</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <SelectField label="Gender" value={formData.gender} onChange={(v) => updateForm('gender', v)} options={['Female', 'Male']} />
                    <SelectField label="Senior Citizen" value={formData.seniorCitizen} onChange={(v) => updateForm('seniorCitizen', v)} options={['0', '1']} />
                    <SelectField label="Partner" value={formData.partner} onChange={(v) => updateForm('partner', v)} options={['Yes', 'No']} />
                    <SelectField label="Dependents" value={formData.dependents} onChange={(v) => updateForm('dependents', v)} options={['Yes', 'No']} />
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tenure (months)</label>
                      <input type="number" value={formData.tenure} onChange={(e) => updateForm('tenure', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Active Services</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <SelectField label="Internet Service" value={formData.internetService} onChange={(v) => updateForm('internetService', v)} options={['Fiber optic', 'DSL', 'No']} />
                    <SelectField label="Phone Service" value={formData.phoneService} onChange={(v) => updateForm('phoneService', v)} options={['Yes', 'No']} />
                    <SelectField label="Multiple Lines" value={formData.multipleLines} onChange={(v) => updateForm('multipleLines', v)} options={['Yes', 'No', 'No phone service']} />
                    <SelectField label="Online Security" value={formData.onlineSecurity} onChange={(v) => updateForm('onlineSecurity', v)} options={['Yes', 'No', 'No internet service']} />
                    <SelectField label="Online Backup" value={formData.onlineBackup} onChange={(v) => updateForm('onlineBackup', v)} options={['Yes', 'No', 'No internet service']} />
                    <SelectField label="Device Protection" value={formData.deviceProtection} onChange={(v) => updateForm('deviceProtection', v)} options={['Yes', 'No', 'No internet service']} />
                    <SelectField label="Tech Support" value={formData.techSupport} onChange={(v) => updateForm('techSupport', v)} options={['Yes', 'No', 'No internet service']} />
                    <SelectField label="Streaming TV" value={formData.streamingTv} onChange={(v) => updateForm('streamingTv', v)} options={['Yes', 'No', 'No internet service']} />
                    <SelectField label="Streaming Movies" value={formData.streamingMovies} onChange={(v) => updateForm('streamingMovies', v)} options={['Yes', 'No', 'No internet service']} />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Billing & Account</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <SelectField label="Contract Type" value={formData.contract} onChange={(v) => updateForm('contract', v)} options={['Month-to-month', 'One year', 'Two year']} />
                    </div>
                    <SelectField label="Payment Method" value={formData.paymentMethod} onChange={(v) => updateForm('paymentMethod', v)} options={['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']} />
                    <SelectField label="Paperless Billing" value={formData.paperlessBilling} onChange={(v) => updateForm('paperlessBilling', v)} options={['Yes', 'No']} />
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Charges ($)</label>
                      <input type="number" step="0.01" value={formData.monthlyCharges} onChange={(e) => updateForm('monthlyCharges', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Total Charges ($)</label>
                      <input type="number" step="0.01" value={formData.totalCharges} onChange={(e) => updateForm('totalCharges', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">Verify data before running prediction. Generating a prediction will log an event in the system.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm bg-slate-50 p-6 rounded-lg border border-slate-200">
                     <div className="col-span-2 border-b border-slate-200 pb-2 mb-2 font-semibold text-slate-900">Summary</div>
                     <SummaryRow label="Contract" value={formData.contract} />
                     <SummaryRow label="Tenure" value={`${formData.tenure} months`} />
                     <SummaryRow label="Internet" value={formData.internetService} />
                     <SummaryRow label="Charges" value={`$${formData.monthlyCharges}/mo`} />
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                <button 
                  onClick={handleBack} 
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${currentStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                
                {currentStep < STEPS.length - 1 ? (
                  <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handlePredict} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md">
                    <BrainCircuit className="w-4 h-4" /> Run ML Prediction
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const SelectField = ({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const SummaryRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between border-b border-slate-200 border-dashed pb-1">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900">{value}</span>
  </div>
);
