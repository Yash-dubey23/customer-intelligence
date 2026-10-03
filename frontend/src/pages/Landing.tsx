import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion';
import {
  ArrowRight, BarChart3, BrainCircuit, Shield, Users,
  TrendingDown, Zap, Activity, AlertTriangle, CheckCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function useParallax(value: ReturnType<typeof useScroll>['scrollYProgress'], distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function Orb({ x, y, size, color, delay = 0 }: {
  x: string; y: string; size: number; color: string; delay?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none select-none"
      style={{ left: x, top: y, width: size, height: size, background: color, filter: 'blur(80px)', opacity: 0.45 }}
      animate={{ y: [0, -24, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-driven 3D Dashboard
// This is the hero centerpiece: tilted in 3D, flattens on scroll.
// ─────────────────────────────────────────────────────────────────────────────
function ScrollDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  // Scroll 0→1 maps to rotateX 30→0, scale 0.85→1, opacity 0.4→1
  const rawRotateX = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const rawScale   = useTransform(scrollYProgress, [0, 1], [0.82, 1]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.6, 1]);
  const rawY       = useTransform(scrollYProgress, [0, 1], [60, 0]);

  const rotateX = useSpring(rawRotateX, { stiffness: 80, damping: 20 });
  const scale   = useSpring(rawScale,   { stiffness: 80, damping: 20 });

  const kpis = [
    { label: 'Customers', value: '7,043', color: 'text-white' },
    { label: 'At Risk',   value: '1,869', color: 'text-amber-400' },
    { label: 'High Risk', value: '842',   color: 'text-red-400' },
    { label: 'Churn Rate',value: '26.5%', color: 'text-white' },
  ];
  const bars = [38,52,34,60,44,72,50,66,54,76,60,82];

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto px-6"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        style={{ rotateX, scale, opacity: rawOpacity, y: rawY, transformStyle: 'preserve-3d' }}
        className="rounded-2xl overflow-hidden"
      >
        {/* Glow beneath */}
        <div className="absolute inset-x-8 bottom-0 h-16 bg-indigo-500/30 blur-2xl rounded-full translate-y-8 pointer-events-none" />

        <div className="bg-slate-950 rounded-2xl p-[2px] shadow-[0_40px_130px_-20px_rgba(79,70,229,0.5)]">
          <div className="bg-[#0d1117] rounded-2xl overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-slate-900/60">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="ml-4 flex-1 max-w-xs bg-slate-800/80 rounded px-3 py-1 text-[11px] text-slate-400">
                app.customerintelligence.io/dashboard
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-2">
                {kpis.map((k, i) => (
                  <motion.div
                    key={k.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="bg-white/5 border border-white/8 rounded-lg p-3"
                  >
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{k.label}</div>
                    <div className={`text-lg font-bold tabular-nums ${k.color}`}>{k.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-3 gap-2">
                {/* Bar chart */}
                <div className="col-span-2 bg-white/5 border border-white/8 rounded-lg p-4 h-36">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Churn Trend</div>
                  <div className="flex items-end gap-[3px] h-20">
                    {bars.map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1"
                        style={{ display: 'flex', alignItems: 'flex-end' }}
                      >
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.5 + i * 0.04, ease: 'backOut', duration: 0.5 }}
                          style={{ originY: 1, height: `${h}%`, width: '100%' }}
                          className="bg-gradient-to-t from-indigo-600 to-indigo-400/60 rounded-[2px]"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Donut */}
                <div className="bg-white/5 border border-white/8 rounded-lg p-4 h-36 flex flex-col">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Risk Split</div>
                  <div className="flex-1 flex items-center justify-center">
                    <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                      <circle cx="40" cy="40" r="28" fill="none" stroke="#1e293b" strokeWidth="10"/>
                      <motion.circle cx="40" cy="40" r="28" fill="none" stroke="#10b981" strokeWidth="10"
                        strokeDasharray="176" initial={{ strokeDashoffset: 176 }}
                        animate={{ strokeDashoffset: 44 }} transition={{ delay: 0.9, duration: 1.2, ease: 'easeOut' }}/>
                      <motion.circle cx="40" cy="40" r="28" fill="none" stroke="#f59e0b" strokeWidth="10"
                        strokeDasharray="176" initial={{ strokeDashoffset: 176 }}
                        animate={{ strokeDashoffset: 88 }} transition={{ delay: 1.1, duration: 1.2, ease: 'easeOut' }}/>
                      <motion.circle cx="40" cy="40" r="28" fill="none" stroke="#ef4444" strokeWidth="10"
                        strokeDasharray="176" initial={{ strokeDashoffset: 176 }}
                        animate={{ strokeDashoffset: 148 }} transition={{ delay: 1.3, duration: 1.2, ease: 'easeOut' }}/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Activity strip */}
              <div className="flex gap-2">
                {[
                  { icon: CheckCircle, text: 'Prediction completed: CUST-8374', c: 'text-emerald-400' },
                  { icon: AlertTriangle, text: 'CUST-2938 moved to high risk', c: 'text-red-400' },
                  { icon: Activity, text: 'Model accuracy 94.2% — retrained', c: 'text-indigo-400' },
                ].map((ev, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 + i * 0.15 }}
                    className="flex-1 flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-md px-2 py-1.5">
                    <ev.icon className={`w-3 h-3 flex-shrink-0 ${ev.c}`}/>
                    <span className="text-[9px] text-slate-400 truncate">{ev.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-driven 3D feature card — slides in from depth + side
// ─────────────────────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, index }: {
  icon: React.ReactNode; title: string; desc: string; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const even = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, z: -80, x: even ? -40 : 40, rotateY: even ? -12 : 12 }}
      animate={isInView ? { opacity: 1, z: 0, x: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={{
        z: 20,
        rotateY: even ? 3 : -3,
        rotateX: -3,
        scale: 1.02,
        transition: { duration: 0.25 },
      }}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm cursor-default"
    >
      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-driven stat counter row
// ─────────────────────────────────────────────────────────────────────────────
function StatRow() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const stats = [
    { value: '94.2%', label: 'Model accuracy' },
    { value: '< 2s', label: 'Prediction latency' },
    { value: '7k+', label: 'Customers analyzed' },
    { value: '3×', label: 'Retention improvement' },
  ];
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="text-3xl font-bold text-indigo-600">{s.value}</div>
          <div className="text-sm text-slate-500 mt-1">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ['start start', 'end end'] });

  // Parallax layers for hero text and CTA
  const heroY    = useParallax(scrollYProgress, 80);
  const heroBgY  = useParallax(scrollYProgress, 160);

  // Nav opacity: fades in solid as we scroll
  const navBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.95)']);

  return (
    <div ref={pageRef} className="min-h-screen bg-white overflow-x-hidden" style={{ perspective: '900px' }}>

      {/* ── Sticky Nav ──────────────────────────────────────────────────── */}
      <motion.nav
        style={{ backgroundColor: navBg }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-slate-100/60"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.15 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30"
            >
              <BrainCircuit className="w-4 h-4 text-white" />
            </motion.div>
            <span className="font-semibold text-slate-900">Customer Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                Get started
              </Link>
            </motion.span>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[110vh] flex flex-col items-center justify-center pt-20 overflow-hidden">
        {/* Ambient BG */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: heroBgY }}>
          <Orb x="8%"  y="10%" size={600} color="radial-gradient(circle, rgba(99,102,241,0.22), transparent)"  delay={0}   />
          <Orb x="62%" y="2%"  size={500} color="radial-gradient(circle, rgba(139,92,246,0.18), transparent)"  delay={1.5} />
          <Orb x="3%"  y="55%" size={400} color="radial-gradient(circle, rgba(79,70,229,0.14), transparent)"   delay={3}   />
          <Orb x="70%" y="50%" size={480} color="radial-gradient(circle, rgba(99,102,241,0.16), transparent)"  delay={0.8} />
        </motion.div>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.045) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />

        {/* Headline copy — scrolls up faster (parallax) */}
        <motion.div
          style={{ y: heroY, transformStyle: 'preserve-3d' }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-8"
          >
            <Zap className="w-3 h-3" /> ML-powered churn prediction
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight"
          >
            Know which customers
            <br />
            <span className="relative text-indigo-600">
              are about to leave
              <motion.svg
                className="absolute -bottom-2 left-0 w-full overflow-visible"
                viewBox="0 0 500 14" fill="none" preserveAspectRatio="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.9, duration: 1.1, ease: 'easeOut' }}
              >
                <motion.path d="M2 11 C90 3, 200 13, 300 8 C390 3, 450 11, 498 7"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"
                  strokeOpacity="0.6"
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Predict churn risk, understand the signals behind it, and take action
            before it's too late. Built for customer success teams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            className="mt-10 flex items-center justify-center gap-4 flex-wrap"
          >
            <motion.span whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                Start predicting <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.span>
            <motion.span whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                Sign in
              </Link>
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-slate-400 tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 border-slate-300 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 bg-slate-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── 3D Scroll Dashboard ──────────────────────────────────────────── */}
      <section className="pb-32 -mt-16">
        <ScrollDashboard />
      </section>

      {/* ── Stats — scroll-triggered 3D ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <StatRow />
      </section>

      {/* ── Features — scroll-triggered 3D depth reveal ──────────────────── */}
      <section className="py-24 px-6 bg-slate-50 relative" style={{ perspective: '900px' }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to reduce churn</h2>
            <p className="mt-3 text-slate-500 text-lg">From prediction to retention, one platform.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ perspective: '800px' }}>
            {[
              { icon: <BrainCircuit className="w-5 h-5"/>, title: 'ML Predictions',         desc: 'Run churn predictions using ensemble ML models. Understand which features drive risk.' },
              { icon: <Users        className="w-5 h-5"/>, title: 'Customer Intelligence',   desc: 'Full customer directory with risk profiles, prediction history, and segment analysis.' },
              { icon: <BarChart3    className="w-5 h-5"/>, title: 'Analytics Dashboard',     desc: 'Real-time KPIs, churn trends, risk distribution, and customer segment breakdowns.' },
              { icon: <Shield       className="w-5 h-5"/>, title: 'Retention Workspace',     desc: 'Track retention actions, manage outreach status, and monitor results over time.' },
              { icon: <TrendingDown className="w-5 h-5"/>, title: 'Risk Center',             desc: 'Focus on critical and rising-risk customers. Prioritize who needs attention now.' },
              { icon: <Zap          className="w-5 h-5"/>, title: 'Model Insights',          desc: 'View model performance, feature importance, ROC curves, and confusion matrices.' },
            ].map((f, i) => (
              <FeatureCard key={f.title} index={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — depth appear ───────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ perspective: '800px' }}>
        <div className="absolute inset-0 pointer-events-none">
          <Orb x="15%" y="20%" size={500} color="radial-gradient(circle, rgba(99,102,241,0.12), transparent)" delay={0}/>
          <Orb x="60%" y="10%" size={400} color="radial-gradient(circle, rgba(139,92,246,0.1), transparent)"  delay={2}/>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 48, rotateX: 14, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="max-w-xl mx-auto text-center relative z-10"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to predict churn?</h2>
          <p className="text-slate-500 mb-10 text-lg">Start analyzing your customer base in minutes.</p>
          <motion.span whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.97 }}>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-500/30"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.span>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <BrainCircuit className="w-3 h-3 text-white" />
            </div>
            Customer Intelligence
          </div>
          <div className="text-xs text-slate-400">Built with ML · Real predictions · Real data</div>
        </div>
      </footer>
    </div>
  );
}
