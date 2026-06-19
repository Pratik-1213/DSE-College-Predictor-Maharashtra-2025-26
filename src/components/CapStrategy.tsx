import React, { useState } from 'react';
import { Award, Target, ShieldCheck, Copy, Check } from 'lucide-react';
import { PredictionResult } from '../types';

interface CapStrategyProps {
  strategyColleges: PredictionResult[];
}

const CHANCE_BADGE: Record<string, string> = {
  Safe: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'High Chance': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Moderate Chance': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Low Chance': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Dream: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
};

function getMarker(status: string) {
  if (status === 'Dream') return {
    icon: <Award className="w-3.5 h-3.5 shrink-0" />,
    label: 'Dream', colorClass: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
    dot: 'bg-red-500'
  };
  if (status === 'High Chance' || status === 'Moderate Chance') return {
    icon: <Target className="w-3.5 h-3.5 shrink-0" />,
    label: 'Realistic', colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    dot: 'bg-blue-500'
  };
  return {
    icon: <ShieldCheck className="w-3.5 h-3.5 shrink-0" />,
    label: 'Safe Backup', colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    dot: 'bg-emerald-500'
  };
}

export default function CapStrategy({ strategyColleges }: CapStrategyProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-5">

      <div className="space-y-1.5">
        <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
          Recommended CAP Option Form Order
        </h3>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
          Maharashtra CAP processes options <strong className="text-slate-700 dark:text-slate-300">top-to-bottom</strong>. Put dream colleges first for the best shot, realistic ones in the middle, and safe backups at the bottom.
        </p>
      </div>

      <div className="flex flex-col gap-3 relative pl-2 sm:pl-4">
        {/* Timeline line */}
        <div className="absolute left-[11px] sm:left-[19px] top-3 bottom-3 w-px bg-slate-100 dark:bg-slate-800 pointer-events-none" />

        {strategyColleges.map((item, index) => {
          const marker = getMarker(item.chanceStatus);
          const isCopied = copiedCode === item.college.choiceCode;

          return (
            <div key={index} className="flex items-start gap-3 relative z-10">
              {/* Number bubble */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-display font-extrabold text-[10px] sm:text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {index + 1}
              </div>

              {/* Card */}
              <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">

                {/* Left */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase ${marker.colorClass}`}>
                      {marker.icon}{marker.label}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase ${CHANCE_BADGE[item.chanceStatus] ?? CHANCE_BADGE['Safe']}`}>
                      {item.chanceStatus}
                    </span>
                  </div>
                  <h4 className="font-display font-extrabold text-[13px] text-slate-900 dark:text-white leading-tight">
                    {item.college.collegeName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {item.college.branch}
                    <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                    <span className="uppercase text-[10px] font-bold">{item.college.type}</span>
                  </p>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Cutoff</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {item.cutoffPercent}%
                      <span className="text-[9px] text-slate-400 ml-1">({item.matchedCutoffCategory})</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.college.choiceCode)}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer group"
                    title="Copy choice code"
                  >
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Code</span>
                      <span className="font-mono font-bold text-[11px] text-slate-900 dark:text-white leading-none">
                        {item.college.choiceCode}
                      </span>
                    </div>
                    {isCopied
                      ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      : <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary shrink-0" />
                    }
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
