import React from 'react';
import { ArrowRight, CheckCircle, Brain, BarChart2, ShieldAlert, Layers, Download, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onStartPredicting: () => void;
}

export default function HeroSection({ onStartPredicting }: HeroSectionProps) {
  const stats = [
    { value: '682+', label: 'Engineering Colleges', desc: 'Across Maharashtra' },
    { value: '150+', label: 'Branches / Courses', desc: 'Direct Second Year' },
    { value: '50,000+', label: 'CAP Cutoff Records', desc: 'AY 2025-26 Analysis' },
    { value: '100%', label: 'Free & Accurate', desc: 'No Registration Required' }
  ];

  const features = [
    {
      icon: <Brain className="w-5 h-5 text-blue-500" />,
      title: 'AI-like College Prediction',
      desc: 'Advanced probability models map your profile to previous cutoffs dynamically.'
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-purple-500" />,
      title: 'CAP Cutoff Analysis',
      desc: 'In-depth review of CAP Round I closing ranks and percentage thresholds.'
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-green-500" />,
      title: 'Safe, Moderate & Dream Split',
      desc: 'Colleges categorized by likelihood of admission to secure your seats.'
    },
    {
      icon: <Layers className="w-5 h-5 text-orange-500" />,
      title: 'Multi Branch Selector',
      desc: 'Select career groups (Computer, Electronics, Mechanical) with a single click.'
    },
    {
      icon: <Download className="w-5 h-5 text-pink-500" />,
      title: 'PDF Report Download',
      desc: 'Export personalized admission strategy sheets and comparison tables instantly.'
    },
    {
      icon: <MapPin className="w-5 h-5 text-teal-500" />,
      title: 'Region Wise Filtering',
      desc: 'Filter opportunities across Pune, Mumbai, Kolhapur, Sangli, and more.'
    }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section Container */}
      <section 
        className="w-full relative min-h-[550px] sm:min-h-[650px] flex items-center justify-center bg-slate-950 text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-right md:bg-right-bottom"
        style={{ backgroundImage: 'linear-gradient(to right, rgba(11, 15, 25, 0.95) 40%, rgba(11, 15, 25, 0.3) 100%), url("/background.png")' }}
      >
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/30 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>DIRECT SECOND YEAR ENGINEERING (DSE) 2025-26</span>
            </div>
            
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
              DSE College Predictor <br />
              <span className="bg-gradient-to-r from-blue-400 via-primary to-secondary bg-clip-text text-transparent">
                Maharashtra 2025-26
              </span>
            </h2>

            <p className="text-slate-300 font-sans text-base sm:text-lg max-w-xl font-medium leading-relaxed">
              Predict the best engineering colleges and branches you can get based on official previous year CAP cutoffs. Make informed decisions and build a winning options strategy.
            </p>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans font-semibold text-xs sm:text-sm text-slate-200">
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <span>CAP Round I Cutoff Analysis</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <span>Admission Probability Matrix</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <span>Strategic Form Ordering</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <span>Downloadable PDF Reports</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button 
                onClick={onStartPredicting}
                className="btn-primary group inline-flex items-center space-x-3 text-sm sm:text-base px-7 py-4 cursor-pointer"
              >
                <span>Predict My Colleges</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Hero Right spacer (to let the background image's student show) */}
          <div className="hidden lg:block lg:col-span-5 h-[350px]" />
        </div>
      </section>

      {/* Floating Statistics Bar */}
      <section id="stats" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20">
        <div className="w-full glass-effect rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 bg-white dark:bg-slate-900 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center justify-center text-center ${
                idx > 1 ? 'pt-4 lg:pt-0' : idx > 0 ? 'pt-0' : ''
              } lg:pt-0 lg:px-4`}
            >
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-primary dark:text-secondary">
                {stat.value}
              </span>
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 mt-1">
                {stat.label}
              </span>
              <span className="text-[10px] sm:text-xs text-text-muted font-medium mt-0.5">
                {stat.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="w-full max-w-7xl py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 dark:text-white">
            Smart Features for Direct Second Year Admissions
          </h2>
          <p className="text-text-muted font-sans text-sm sm:text-base font-medium leading-relaxed">
            Equipped with intelligent tools to guide candidate choice fillings during the Centralized Admission Process (CAP) of Maharashtra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col space-y-4 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                {feat.icon}
              </div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {feat.title}
              </h3>
              <p className="text-text-muted font-sans text-xs sm:text-sm font-medium leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
