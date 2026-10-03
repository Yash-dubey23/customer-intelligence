import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from './auth/AuthGuard';
import { AppShell } from './components/layout/AppShell';

// Lazy-loaded pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./auth/Login'));
const Register = React.lazy(() => import('./auth/Register'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// App pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Customers = React.lazy(() => import('./pages/Customers'));
const CustomerProfile = React.lazy(() => import('./pages/CustomerProfile'));
const PredictionHistory = React.lazy(() => import('./pages/PredictionHistory'));
const NewPrediction = React.lazy(() => import('./pages/NewPrediction'));
const PredictionDetail = React.lazy(() => import('./pages/PredictionDetail'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const RiskCenter = React.lazy(() => import('./pages/RiskCenter'));
const RetentionWorkspace = React.lazy(() => import('./pages/RetentionWorkspace'));
const ModelInsights = React.lazy(() => import('./pages/ModelInsights'));
const DataQuality = React.lazy(() => import('./pages/DataQuality'));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        <span className="text-sm text-slate-500">Loading…</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/app" element={<AuthGuard><AppShell /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerProfile />} />
          <Route path="predictions" element={<PredictionHistory />} />
          <Route path="predictions/new" element={<NewPrediction />} />
          <Route path="predictions/:id" element={<PredictionDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="risk-center" element={<RiskCenter />} />
          <Route path="retention" element={<RetentionWorkspace />} />
          <Route path="model" element={<ModelInsights />} />
          <Route path="data-quality" element={<DataQuality />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
