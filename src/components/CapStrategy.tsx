import React from 'react';
import { Award, Target, ShieldCheck, CheckCircle2, Clipboard } from 'lucide-react';
import { PredictionResult } from '../types';

interface CapStrategyProps {
  strategyColleges: PredictionResult[];
}

export default function CapStrategy({ strategyColleges }: CapStrategyProps) {
  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Safe':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      case 'High Chance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'Moderate Chance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'Low Chance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-900';
      case 'Dream':
        return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-900';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStrategyMarker = (status: string) => {
    switch (status) {
      case 'Dream':
        return {
          icon: <Award className="w-4 h-4 text-red-500" />,
          label: 'Dream Target',
          colorClass: 'text-red-500 bg-red-500/10 border-red-500/20'
        };
      case 'High Chance':
      case 'Moderate Chance':
        return {
          icon: <Target className="w-4 h-4 text-blue-500" />,
          label: 'Realistic Match',
          colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
        };
      default:
        return {
          icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
          label: 'Safe Backup',
          colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        };
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Choice Code ${code} copied to clipboard!`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm text-left space-y-6">
      
      {/* Description header */}
      <div className="space-y-2">
        <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
          Recommended CAP Form Option Order
        </h3>
        <p className="text-[12px] text-text-muted font-medium leading-relaxed">
          In Maharashtra CAP admissions, option forms are processed from <strong>Option 1 down to Option 300</strong>. Placing dream options at the top gives you a chance at a better allotment, while placing realistic options in the middle and safe backups at the bottom secures your seat.
        </p>
      </div>

      {/* Strategy order list */}
      <div className="flex flex-col space-y-3.5 relative pl-1 sm:pl-3">
        {/* Timeline Line */}
        <div className="absolute left-[13px] sm:left-[21px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 pointer-events-none" />

        {strategyColleges.map((item, index) => {
          const marker = getStrategyMarker(item.chanceStatus);
          return (
            <div 
              key={index}
              className="flex items-start space-x-3.5 relative z-10"
            >
              {/* Index Circle Indicator */}
              <div className="w-6.5 h-6.5 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-slate-200 dark:border-slate-800 font-display font-extrabold text-[10px] sm:text-xs flex items-center justify-center shrink-0 shadow-sm">
                {index + 1}
              </div>

              {/* Option Details Card */}
              <div className="w-full bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5">
                
                {/* Left Side Info */}
                <div className="space-y-1.5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Strategy Pill */}
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase ${marker.colorClass}`}>
                      {marker.icon}
                      <span>{marker.label}</span>
                    </span>

                    {/* Chance Badge */}
                    <span className={`inline-flex px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase ${getBadgeClass(item.chanceStatus)}`}>
                      {item.chanceStatus}
                    </span>
                  </div>

                  <h4 className="font-display font-extrabold text-[13.5px] text-slate-900 dark:text-white leading-tight">
                    {item.college.collegeName}
                  </h4>
                  <p className="text-[11px] text-text-muted font-semibold">
                    {item.college.branch} &bull; <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{item.college.type}</span>
                  </p>
                </div>

                {/* Right Side Stats & Choice Code */}
                <div className="flex items-center justify-between sm:justify-end sm:space-x-5 shrink-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-3.5 sm:pt-0">
                  <div className="text-left sm:text-right font-sans text-xs">
                    <span className="text-text-muted block font-semibold text-[10px]">Previous Cutoff</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{item.cutoffPercent}% <span className="text-[9px] font-bold text-slate-400">({item.matchedCutoffCategory})</span></span>
                  </div>

                  {/* Choice Code Block */}
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-left select-none relative group/btn">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-text-muted block font-bold leading-none uppercase">Choice Code</span>
                      <span className="font-mono font-bold text-[12.5px] tracking-wider text-slate-900 dark:text-white leading-none">
                        {item.college.choiceCode}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleCopyCode(item.college.choiceCode)}
                      className="ml-3 hover:text-primary text-slate-400 dark:text-slate-500 dark:hover:text-secondary cursor-pointer transition-colors duration-150"
                      title="Copy choice code"
                    >
                      <Clipboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
