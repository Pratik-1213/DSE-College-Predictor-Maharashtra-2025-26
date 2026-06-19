import React from 'react';
import { ArrowRight, CheckCircle, Brain, BarChart2, ShieldAlert, Layers, Download, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onStartPredicting: () => void;
}

export default function HeroSection({ onStartPredicting }: HeroSectionProps) {
  const stats = [
    { value: '682+', label: 'Engineering Colleges', desc: 'Across Maharashtra' },
    { value: '90+', label: 'Branches / Courses', desc: 'Direct Second Year' },
    { value: '2,010', label: 'CAP Cutoff Records', desc: 'AY 2024‑25 Data' },
    { value: '100%', label: 'Free & Accurate', desc: 'No Login Required' }
  ];

  const features = [
    {
      icon: <Brain className="w-5 h-5 text-blue-500" />,
      title: 'Smart College Prediction',
      desc: 'Probability models map your diploma percentage to previous year CAP Round I cutoffs dynamically.'
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-violet-500" />,
      title: 'Cutoff Analysis',
      desc: 'Deep review of CAP closing percentiles per category — OPEN, OBC, SEBC, EWS, SC, ST, NT and more.'
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-emerald-500" />,
      title: 'Safe · Moderate · Dream Split',
      desc: 'Colleges classified by admission likelihood so you can build a balanced options strategy.'
    },
    {
      icon: <Layers className="w-5 h-5 text-orange-500" />,
      title: 'Multi‑Branch Selector',
      desc: 'Pick Computer, Electronics or Mechanical groups — all related branches are included automatically.'
    },
    {
      icon: <Download className="w-5 h-5 text-pink-500" />,
      title: 'PDF Report Export',
      desc: 'Download a personalized admission strategy sheet with CAP form order and comparison matrix.'
    },
    {
      icon: <MapPin className="w-5 h-5 text-teal-500" />,
      title: 'Region‑Wise Filtering',
      desc: 'Filter across Pune, Mumbai, Nashik, Nagpur, Amravati, Aurangabad, Konkan and all of Maharashtra.'
    }
  ];

  return (
    <div className="w-full flex flex-col items-center">

      {/* ── Hero Banner ───────────────────────────────────── */}
      <section
        className="w-full relative min-h-[520px] sm:min-h-[620px] flex items-center justify-center bg-slate-950 text-white overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-right"
        style={{ backgroundImage: 'linear-gradient(to right, rgba(9,14,26,0.97) 45%, rgba(9,14,26,0.35) 100%), url("/background.png")' }}
      >
        <div className="absolute top-1/4 left-0 w-80 h-80 rounded-full bg-primary/8 blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-200 font-semibold text-[11px] sm:text-xs tracking-widest uppercase">
                Direct Second Year Engineering · Maharashtra 2025‑26
              </span>
            </div>

            <h2 className="font-display font-extrabold text-[2.25rem] sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-white">
              DSE College Predictor
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-400 bg-clip-text text-transparent">
                Maharashtra 2025‑26
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl font-medium leading-relaxed">
              Predict the best engineering colleges and branches you can get based on official previous year CAP cutoffs. Build a winning options strategy and download your personalised report.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-200 text-xs sm:text-sm font-semibold">
              {['CAP Round I Cutoff Analysis', 'Admission Probability Matrix', 'Strategic CAP Form Ordering', 'PDF Report Download'].map(item => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={onStartPredicting}
                className="btn-primary group inline-flex items-center gap-3 text-sm sm:text-base px-7 py-4"
              >
                <span>Predict My Colleges</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-5 h-[320px]" />
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section id="stats" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-7 grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center text-center py-3 px-4
                ${idx === 1 || idx === 3 ? 'border-l border-slate-100 dark:border-slate-800' : ''}
                ${idx >= 2 ? 'border-t border-slate-100 dark:border-slate-800 lg:border-t-0' : ''}
                lg:border-l lg:first:border-l-0`}
            >
              <span className="font-display font-extrabold text-2xl sm:text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {stat.value}
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 mt-1">
                {stat.label}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {stat.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────── */}
      <section id="features" className="w-full bg-white dark:bg-[#0B0F19] border-t border-slate-100 dark:border-slate-900 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white">
              Smart Tools for DSE Admissions
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
              Everything you need to make confident choices during Maharashtra's Centralized Admission Process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  {feat.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-sm sm:text-[15px] text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
