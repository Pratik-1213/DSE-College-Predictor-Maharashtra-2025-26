import React from 'react';
import { PredictionResult } from '../types';

interface ChartsSectionProps {
  results: PredictionResult[];
}

const SEGMENTS = [
  { key: 'Safe' as const,            color: '#16A34A', label: 'Safe' },
  { key: 'High Chance' as const,     color: '#2563EB', label: 'High' },
  { key: 'Moderate Chance' as const, color: '#F59E0B', label: 'Moderate' },
  { key: 'Low Chance' as const,      color: '#EA580C', label: 'Low' },
  { key: 'Dream' as const,           color: '#DC2626', label: 'Dream' },
];

export default function ChartsSection({ results }: ChartsSectionProps) {
  const total = results.length || 1;

  // ── Donut data ──────────────────────────────────────────────────────────────
  const counts = SEGMENTS.map(s => ({ ...s, count: results.filter(r => r.chanceStatus === s.key).length }))
    .filter(s => s.count > 0);

  const radius = 48;
  const circ = 2 * Math.PI * radius;
  let cumulative = 0;

  // ── Region bars ─────────────────────────────────────────────────────────────
  const regionMap: Record<string, number> = {};
  results.forEach(r => { regionMap[r.college.region] = (regionMap[r.college.region] || 0) + 1; });
  const topRegions = Object.entries(regionMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxRegion = topRegions[0]?.count || 1;

  // ── Branch bars ─────────────────────────────────────────────────────────────
  const branchMap: Record<string, number> = {};
  results.forEach(r => {
    let name = r.college.branch;
    if (name.includes('Computer Science and Engineering')) name = 'CSE';
    else if (name.includes('Computer Engineering')) name = 'Computer Engg';
    else if (name.includes('Information Technology')) name = 'IT';
    else if (name.includes('Electronics and Telecommunication')) name = 'EXTC';
    else if (name.includes('Artificial Intelligence and Data Science') || name.includes('AI') && name.includes('Data Science')) name = 'AI & DS';
    else if (name.includes('Mechanical Engineering')) name = 'Mechanical';
    else if (name.includes('Electrical Engineering')) name = 'Electrical';
    branchMap[name] = (branchMap[name] || 0) + 1;
  });
  const topBranches = Object.entries(branchMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxBranch = topBranches[0]?.count || 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

      {/* ── Card 1: Donut ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <h3 className="font-display font-extrabold text-sm text-slate-900">
          Probability Distribution
        </h3>

        <div className="flex items-center justify-between gap-4">
          {/* Donut */}
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full gauge-svg" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="11" className="text-slate-100" />
              {counts.map((seg, i) => {
                const dash = (seg.count / total) * circ;
                const offset = circ - (cumulative / total) * circ;
                cumulative += seg.count;
                return (
                  <circle key={i} cx="56" cy="56" r={radius} fill="none"
                    stroke={seg.color} strokeWidth="11"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeDashoffset={offset}
                    style={{ transition: 'all 0.5s ease' }}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-extrabold text-lg text-slate-800">{results.length}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            {counts.map((seg, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-700 truncate">{seg.label}</span>
                </div>
                <span className="text-slate-500 shrink-0">{seg.count}</span>
              </div>
            ))}
            {counts.length === 0 && <p className="text-[11px] text-slate-400 italic">No data</p>}
          </div>
        </div>
      </div>

      {/* ── Card 2: Regions ────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <h3 className="font-display font-extrabold text-sm text-slate-900">
          Region‑Wise Opportunities
        </h3>
        <div className="flex flex-col gap-3">
          {topRegions.map((r, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-700 truncate max-w-[65%]">{r.name}</span>
                <span className="text-primary font-bold">{r.count}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.max(6, Math.round((r.count / maxRegion) * 100))}%` }}
                />
              </div>
            </div>
          ))}
          {topRegions.length === 0 && <p className="text-[11px] text-slate-400 italic text-center py-4">No data</p>}
        </div>
      </div>

      {/* ── Card 3: Branches ───────────────────────────── */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col gap-4">
        <h3 className="font-display font-extrabold text-sm text-slate-900">
          Branch‑Wise Opportunities
        </h3>
        <div className="flex flex-col gap-3">
          {topBranches.map((b, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-700 truncate max-w-[65%]">{b.name}</span>
                <span className="text-secondary font-bold">{b.count}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${Math.max(6, Math.round((b.count / maxBranch) * 100))}%` }}
                />
              </div>
            </div>
          ))}
          {topBranches.length === 0 && <p className="text-[11px] text-slate-400 italic text-center py-4">No data</p>}
        </div>
      </div>

    </div>
  );
}
