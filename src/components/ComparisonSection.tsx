import React from 'react';
import { Trash2, HelpCircle } from 'lucide-react';
import { PredictionResult } from '../types';

interface ComparisonSectionProps {
  compareList: PredictionResult[];
  onRemove: (choiceCode: string) => void;
  onClear: () => void;
}

const BADGE: Record<string, string> = {
  Safe: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'High Chance': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Moderate Chance': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Low Chance': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Dream: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
};

const ROWS = [
  { label: 'Choice Code', render: (r: PredictionResult) => <span className="font-mono text-[11px]">{r.college.choiceCode}</span> },
  { label: 'Branch', render: (r: PredictionResult) => <span className="text-[11px] leading-snug">{r.college.branch}</span> },
  { label: 'College Type', render: (r: PredictionResult) => r.college.type },
  { label: 'Region', render: (r: PredictionResult) => r.college.region },
  {
    label: 'Prev. Cutoff',
    render: (r: PredictionResult) => (
      <span className="font-bold text-slate-900 dark:text-white">
        {r.cutoffPercent}%
        <span className="ml-1 text-[10px] font-medium text-slate-400">({r.matchedCutoffCategory})</span>
      </span>
    )
  },
  {
    label: 'My Probability',
    render: (r: PredictionResult) => (
      <span className="font-bold text-primary dark:text-blue-400 text-sm">{r.probability}%</span>
    )
  },
  {
    label: 'Chance Status',
    render: (r: PredictionResult) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${BADGE[r.chanceStatus] ?? ''}`}>
        {r.chanceStatus}
      </span>
    )
  },
];

export default function ComparisonSection({ compareList, onRemove, onClear }: ComparisonSectionProps) {
  if (compareList.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[180px]">
        <HelpCircle className="w-9 h-9 text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="font-display font-extrabold text-sm text-slate-700 dark:text-slate-300">
          No colleges selected for comparison
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-xs">
          Tick the <strong>Compare</strong> checkbox on up to 3 college cards to see them side-by-side.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            College Comparison
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {compareList.length} of 3 colleges selected
          </p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-xs transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-bold text-slate-600 dark:text-slate-400 w-[25%]">Specification</th>
              {compareList.map((item, idx) => (
                <th key={idx} className="p-4 font-bold text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800 w-[25%] relative">
                  <div className="pr-7 text-[12px] leading-snug line-clamp-2" title={item.college.collegeName}>
                    {item.college.collegeName}
                  </div>
                  <button
                    onClick={() => onRemove(item.college.choiceCode)}
                    className="absolute right-3 top-4 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </th>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                <th key={`empty-${i}`} className="p-4 italic text-slate-400 dark:text-slate-600 border-l border-slate-200 dark:border-slate-800 w-[25%]">
                  Slot empty
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {ROWS.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/10'}>
                <td className="p-4 font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wide">{row.label}</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100 dark:border-slate-800 font-semibold">
                    {row.render(item)}
                  </td>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                  <td key={`ec-${i}`} className="p-4 border-l border-slate-100 dark:border-slate-800" />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {compareList.map((item, idx) => (
          <div key={idx} className="relative bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
            <button
              onClick={() => onRemove(item.college.choiceCode)}
              className="absolute right-3 top-3 text-slate-400 hover:text-red-500 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="pr-7 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Option {idx + 1}</span>
              <h4 className="font-display font-extrabold text-sm text-slate-900 dark:text-white leading-snug">{item.college.collegeName}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.college.branch}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold border-t border-slate-200 dark:border-slate-700 pt-3">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase mb-0.5">Code</span>
                <span className="font-mono text-slate-900 dark:text-white">{item.college.choiceCode}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase mb-0.5">Type</span>
                <span className="text-slate-800 dark:text-slate-200">{item.college.type}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase mb-0.5">Cutoff</span>
                <span className="text-slate-900 dark:text-white font-bold">{item.cutoffPercent}%
                  <span className="text-[10px] text-slate-400 ml-1">({item.matchedCutoffCategory})</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase mb-0.5">My Chance</span>
                <span className="text-primary dark:text-blue-400 font-bold">{item.probability}%
                  <span className="ml-1 text-[9px]">({item.chanceStatus})</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
