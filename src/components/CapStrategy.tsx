import React, { useState } from 'react';
import { Award, Target, ShieldCheck, Copy, Check } from 'lucide-react';
import { PredictionResult } from '../types';

interface CapStrategyProps {
  strategyColleges: PredictionResult[];
}

const CHANCE_BADGE: Record<string, string> = {
  Safe: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'High Chance': 'bg-blue-100 text-blue-800 border-blue-200',
  'Moderate Chance': 'bg-amber-100 text-amber-800 border-amber-200',
  'Low Chance': 'bg-orange-100 text-orange-800 border-orange-200',
  Dream: 'bg-red-100 text-red-800 border-red-200',
};

function getMarker(status: string) {
  if (status === 'Dream') return {
    icon: <Award className="w-3.5 h-3.5 shrink-0" />,
    label: 'Dream', colorClass: 'text-red-600 bg-red-500/10 border-red-500/20',
    dot: 'bg-red-500'
  };
  if (status === 'Low Chance') return {
    icon: <Award className="w-3.5 h-3.5 shrink-0" />,
    label: 'Aspirational', colorClass: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
    dot: 'bg-orange-500'
  };
  if (status === 'Moderate Chance') return {
    icon: <Target className="w-3.5 h-3.5 shrink-0" />,
    label: 'Realistic', colorClass: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-500'
  };
  if (status === 'High Chance') return {
    icon: <Target className="w-3.5 h-3.5 shrink-0" />,
    label: 'Good Chance', colorClass: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    dot: 'bg-blue-500'
  };
  return {
    icon: <ShieldCheck className="w-3.5 h-3.5 shrink-0" />,
    label: 'Safe Backup', colorClass: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
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
    <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm space-y-5">

      <div className="space-y-1.5">
        <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
          Recommended CAP Option Form Order
        </h3>
        <p className="text-[12px] text-slate-500 font-medium leading-relaxed max-w-2xl">
          Maharashtra CAP processes options <strong className="text-slate-700">top-to-bottom and freezes you at the first allotment</strong>. Dream &amp; Low Chance colleges go first (you want to try for the best seat before settling), Moderate in the middle, and Safe backups at the bottom.
        </p>
      </div>

      <div className="flex flex-col gap-3 relative pl-2 sm:pl-4">
        {/* Timeline line */}
        <div className="absolute left-[11px] sm:left-[19px] top-3 bottom-3 w-px bg-slate-100 pointer-events-none" />

        {strategyColleges.map((item, index) => {
          const marker = getMarker(item.chanceStatus);
          const isCopied = copiedCode === item.college.choiceCode;

          return (
            <div key={index} className="flex items-start gap-3 relative z-10">
              {/* Number bubble */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white font-display font-extrabold text-[10px] sm:text-xs flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {index + 1}
              </div>

              {/* Card */}
              <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 p-3.5 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-slate-300 transition-colors">

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
                  <h4 className="font-display font-extrabold text-[13px] text-slate-900 leading-tight">
                    {item.college.collegeName}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {item.college.branch}
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="uppercase text-[10px] font-bold">{item.college.type}</span>
                  </p>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Cutoff</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {item.cutoffPercent}%
                      <span className="text-[9px] text-slate-400 ml-1">({item.matchedCutoffCategory})</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.college.choiceCode)}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:border-primary px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer group"
                    title="Copy choice code"
                  >
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block leading-none">Code</span>
                      <span className="font-mono font-bold text-[11px] text-slate-900 leading-none">
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
