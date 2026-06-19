import React from 'react';
import { Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { PredictionResult } from '../types';

interface ComparisonSectionProps {
  compareList: PredictionResult[];
  onRemove: (choiceCode: string) => void;
  onClear: () => void;
}

export default function ComparisonSection({ compareList, onRemove, onClear }: ComparisonSectionProps) {
  if (compareList.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[220px]">
        <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-200">
          No Colleges Selected for Comparison
        </h3>
        <p className="text-[11px] text-text-muted font-medium mt-1 max-w-sm">
          Select the "Compare" checkbox on up to 3 college cards in the recommendations list to see them side-by-side.
        </p>
      </div>
    );
  }

  // Get color for chance badges
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
            College Comparison Matrix
          </h3>
          <p className="text-[11px] text-text-muted font-medium mt-0.5">
            Comparing {compareList.length} of max 3 engineering colleges side-by-side.
          </p>
        </div>
        <button 
          onClick={onClear}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-bold text-xs transition-colors duration-150 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Responsive comparison grid (Cards on Mobile, Table on Desktop) */}
      <div className="hidden sm:block overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-bold text-slate-700 dark:text-slate-300 w-1/4">Specification</th>
              {compareList.map((item, idx) => (
                <th key={idx} className="p-4 font-bold text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-800 relative w-1/4">
                  <div className="pr-6 truncate max-w-[190px]" title={item.college.collegeName}>
                    {item.college.collegeName}
                  </div>
                  <button 
                    onClick={() => onRemove(item.college.choiceCode)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-red-500 cursor-pointer"
                    aria-label="Remove from comparison"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </th>
              ))}
              {/* Empty slot placeholders */}
              {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                <th key={idx + compareList.length} className="p-4 font-bold text-text-muted italic border-l border-slate-200 dark:border-slate-800 w-1/4">
                  Slot empty
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-800/10 font-bold">Choice Code</td>
              {compareList.map((item, idx) => (
                <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800 font-mono text-slate-900 dark:text-white">
                  {item.college.choiceCode}
                </td>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800" />)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-800/10 font-bold">Branch Name</td>
              {compareList.map((item, idx) => (
                <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800 text-[11px] leading-snug">
                  {item.college.branch}
                </td>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800" />)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-800/10 font-bold">College Type</td>
              {compareList.map((item, idx) => (
                <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-100">
                  {item.college.type}
                </td>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800" />)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-800/10 font-bold">Region Location</td>
              {compareList.map((item, idx) => (
                <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800">
                  {item.college.region} ({item.college.location})
                </td>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800" />)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-800/10 font-bold">Previous Year Cutoff</td>
              {compareList.map((item, idx) => (
                <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-100 font-bold">
                  {item.cutoffPercent}% <span className="text-[10px] text-text-muted">({item.matchedCutoffCategory})</span>
                </td>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800" />)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-800/10 font-bold">My Probability</td>
              {compareList.map((item, idx) => (
                <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-primary font-bold text-sm">
                    <span>{item.probability}%</span>
                  </div>
                </td>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800" />)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-800/10 font-bold">Chance Category</td>
              {compareList.map((item, idx) => (
                <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800">
                  <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase border ${getBadgeClass(item.chanceStatus)}`}>
                    {item.chanceStatus}
                  </span>
                </td>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l border-slate-200 dark:border-slate-800" />)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Stack Cards */}
      <div className="block sm:hidden space-y-4">
        {compareList.map((item, idx) => (
          <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 relative text-left">
            <button 
              onClick={() => onRemove(item.college.choiceCode)}
              className="absolute right-3 top-3 text-slate-400 hover:text-red-500 cursor-pointer"
              aria-label="Remove from comparison"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="space-y-1 pr-6">
              <h4 className="font-display font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Choice {idx + 1}
              </h4>
              <span className="font-display font-extrabold text-sm text-slate-900 dark:text-white leading-tight block">
                {item.college.collegeName}
              </span>
              <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                {item.college.branch}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold border-t border-slate-200 dark:border-slate-800 pt-3">
              <div>
                <span className="text-text-muted block">Choice Code:</span>
                <span className="font-mono text-slate-900 dark:text-white">{item.college.choiceCode}</span>
              </div>
              <div>
                <span className="text-text-muted block">Type / Management:</span>
                <span className="text-slate-900 dark:text-white">{item.college.type}</span>
              </div>
              <div>
                <span className="text-text-muted block">Previous Cutoff:</span>
                <span className="text-slate-900 dark:text-white font-bold">{item.cutoffPercent}% ({item.matchedCutoffCategory})</span>
              </div>
              <div>
                <span className="text-text-muted block">Probability Chance:</span>
                <span className="text-primary dark:text-secondary font-bold text-xs">{item.probability}% ({item.chanceStatus})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
