import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../components/ui/Toast';

function FloatingCard({ x, y, w, h, rotate, delay }: {
  x: string; y: string; w: number; h: number; rotate: number; delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm pointer-events-none"
      style={{ left: x, top: y, width: w, height: h, rotate }}
      animate={{ y: [0, -14, 0], rotate: [rotate, rotate + 3, rotate] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

export default function Login() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success('Successfully logged in');
      navigate('/app');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ perspective: '900px' }}>

      {/* ── Left panel: animated 3D scene ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-950 items-center justify-center overflow-hidden">
        {/* Deep-space gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950" />

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Glowing orbs */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 400, height: 400, left: '10%', top: '10%', background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent)', filter: 'blur(60px)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 300, height: 300, right: '5%', bottom: '15%', background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent)', filter: 'blur(50px)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Floating 3D cards (decorative) */}
        <FloatingCard x="8%"  y="12%" w={140} h={80}  rotate={-8}  delay={0}   />
        <FloatingCard x="65%" y="8%"  w={100} h={60}  rotate={12}  delay={1.2} />
        <FloatingCard x="5%"  y="62%" w={120} h={70}  rotate={5}   delay={0.6} />
        <FloatingCard x="70%" y="68%" w={90}  h={55}  rotate={-10} delay={2.1} />
        <FloatingCard x="30%" y="78%" w={160} h={45}  rotate={3}   delay={1.8} />

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative z-10 text-center px-12 max-w-md"
        >
          <motion.div
            animate={{ rotateY: [0, 8, 0, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-20 h-20 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/20"
          >
            <BrainCircuit className="w-10 h-10 text-indigo-300" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-3">Customer Intelligence</h2>
          <p className="text-indigo-300/80 text-sm leading-relaxed">
            ML-powered churn prediction & retention platform. Understand your customer risk in real time.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 text-left">
            {[
              { label: 'Accuracy',  value: '94.2%' },
              { label: 'Customers', value: '7,000+' },
              { label: 'Latency',   value: '< 2 sec' },
              { label: 'Uptime',    value: '99.9%' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div className="text-[10px] text-indigo-400/70 uppercase tracking-widest">{s.label}</div>
                <div className="text-lg font-bold text-white mt-0.5">{s.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right panel: login form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50 relative overflow-hidden">
        {/* Subtle 3D bg tilt */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.08), transparent)',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Logo (mobile) */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Customer Intelligence</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-500/25"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
