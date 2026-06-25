import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, MapPin, Building2, GraduationCap, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { CollegeRecord } from '../types';

interface CollegeSearchProps {
  dataset: CollegeRecord[];
  onBack: () => void;
}

const ALL_CATEGORIES = [
  'GOPEN', 'GOBC', 'GSEBC', 'GEWS', 'GSC', 'GST', 'GNTA', 'GNTB', 'GNTC', 'GNTD',
  'LOPEN', 'LOBC', 'LSEBC', 'LSC', 'LST',
  'TFWS', 'EWS',
  'PWDOPEN', 'PWDOBC', 'PWDSC', 'PWDST',
  'DEFROPEN', 'DEFROBC',
];

const CAT_LABELS: Record<string, string> = {
  GOPEN: 'Open (M)', GOBC: 'OBC (M)', GSEBC: 'SEBC (M)', GEWS: 'EWS (M)',
  GSC: 'SC (M)', GST: 'ST (M)', GNTA: 'NT-A (M)', GNTB: 'NT-B (M)',
  GNTC: 'NT-C (M)', GNTD: 'NT-D (M)',
  LOPEN: 'Open (F)', LOBC: 'OBC (F)', LSEBC: 'SEBC (F)', LSC: 'SC (F)', LST: 'ST (F)',
  TFWS: 'TFWS', EWS: 'EWS',
  PWDOPEN: 'PWD-Open', PWDOBC: 'PWD-OBC', PWDSC: 'PWD-SC', PWDST: 'PWD-ST',
  DEFROPEN: 'DEFR-Open', DEFROBC: 'DEFR-OBC',
};

const REGIONS = ['Pune', 'Mumbai', 'Nashik', 'Nagpur', 'Amravati', 'Aurangabad', 'Konkan'];

export default function CollegeSearch({ dataset, onBack }: CollegeSearchProps) {
  const [query, setQuery]         = useState('');
  const [region, setRegion]       = useState('All');
  const [district, setDistrict]   = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [cutoffMin, setCutoffMin] = useState('');
  const [cutoffMax, setCutoffMax] = useState('');

  const handleRegionChange = (val: string) => {
    setRegion(val);
    setDistrict('All');
  };

  // Get unique college types from data
  const collegeTypes = useMemo(() => {
    const s = new Set<string>();
    dataset.forEach(r => s.add(r.type));
    return ['All', ...Array.from(s).sort()];
  }, [dataset]);

  // Unique districts filtered by selected region
  const uniqueDistricts = useMemo(() => {
    const s = new Set<string>();
    dataset
      .filter(r => region === 'All' || r.region === region)
      .forEach(r => { if (r.district) s.add(r.district); });
    return ['All', ...Array.from(s).sort()];
  }, [dataset, region]);

  // Group records by college name — all branches under one card
  const collegeGroups = useMemo(() => {
    const groups: Record<string, { info: CollegeRecord; branches: CollegeRecord[] }> = {};
    for (const rec of dataset) {
      const key = rec.collegeName.trim(); // group strictly by college name
      if (!groups[key]) {
        groups[key] = { info: rec, branches: [] };
      }
      groups[key].branches.push(rec);
    }
    // Sort branches alphabetically within each college
    return Object.values(groups).map(g => ({
      ...g,
      branches: g.branches.sort((a, b) => a.branch.localeCompare(b.branch))
    }));
  }, [dataset]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const minPct = cutoffMin !== '' ? parseFloat(cutoffMin) : null;
    const maxPct = cutoffMax !== '' ? parseFloat(cutoffMax) : null;
    return collegeGroups.filter(g => {
      if (region !== 'All' && g.info.region !== region) return false;
      if (district !== 'All' && g.info.district !== district) return false;
      if (typeFilter !== 'All' && g.info.type !== typeFilter) return false;
      if (minPct !== null || maxPct !== null) {
        const hasMatch = g.branches.some(b =>
          Object.values(b.cutoffs).some(e => {
            if (e.percentile === null) return false;
            if (minPct !== null && e.percentile < minPct) return false;
            if (maxPct !== null && e.percentile > maxPct) return false;
            return true;
          })
        );
        if (!hasMatch) return false;
      }
      if (q) {
        const nameMatch = g.info.collegeName.toLowerCase().includes(q);
        const branchMatch = g.branches.some(b => b.branch.toLowerCase().includes(q));
        const codeMatch = g.info.choiceCode.includes(q);
        if (!nameMatch && !branchMatch && !codeMatch) return false;
      }
      return true;
    });
  }, [collegeGroups, query, region, district, typeFilter, cutoffMin, cutoffMax]);

  const toggleExpand = (key: string) => {
    setExpandedCode(prev => prev === key ? null : key);
  };

  const groupKey = (g: { info: CollegeRecord }) => g.info.collegeName.trim();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
            College & Cutoff Explorer
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Search any college to view its previous year CAP cutoffs across all categories
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by college name, branch, or choice code…"
            className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
            style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={region}
              onChange={e => handleRegionChange(e.target.value)}
              className="border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
              style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
            >
              <option value="All">All Regions</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
              style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
            >
              {uniqueDistricts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
              style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
            >
              {collegeTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
          </div>

          {/* Cutoff range */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="number"
              min="0" max="100" step="0.1"
              value={cutoffMin}
              onChange={e => setCutoffMin(e.target.value)}
              placeholder="Min %"
              className="border border-slate-200 px-2 py-2 rounded-lg text-xs font-semibold w-20 focus:outline-none focus:border-primary"
              style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
            />
            <span className="text-slate-400 text-xs">–</span>
            <input
              type="number"
              min="0" max="100" step="0.1"
              value={cutoffMax}
              onChange={e => setCutoffMax(e.target.value)}
              placeholder="Max %"
              className="border border-slate-200 px-2 py-2 rounded-lg text-xs font-semibold w-20 focus:outline-none focus:border-primary"
              style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
            />
            {(cutoffMin !== '' || cutoffMax !== '') && (
              <button
                onClick={() => { setCutoffMin(''); setCutoffMax(''); }}
                className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="ml-auto text-xs font-bold text-slate-500 self-center">
            {filtered.length} college{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-display font-bold text-sm text-slate-600">No colleges found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try a different name, branch, or remove filters</p>
          </div>
        )}

        {filtered.slice(0, 80).map(g => {
          const key   = groupKey(g);
          const open  = expandedCode === key;

          // Find which categories have at least one non-null value across all branches
          const availableCats = ALL_CATEGORIES.filter(cat =>
            g.branches.some(b => {
              const e = b.cutoffs[cat];
              return e && e.percentile !== null;
            })
          );

          return (
            <div
              key={key}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* College header row */}
              <button
                onClick={() => toggleExpand(key)}
                className="w-full text-left px-4 sm:px-5 py-4 flex items-start sm:items-center gap-3 cursor-pointer group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      g.info.type.includes('Government')
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : g.info.type === 'Aided'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {g.info.type}
                    </span>
                    {g.info.autonomous && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 uppercase">
                        AUTO
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400">
                      <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
                      {g.info.region}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {g.branches.length} branch{g.branches.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-[13px] sm:text-sm text-slate-900 leading-snug group-hover:text-primary transition-colors">
                    {g.info.collegeName}
                  </h3>
                </div>
                <div className="shrink-0 text-slate-400 mt-0.5">
                  {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded: cutoff data */}
              {open && (
                <div className="border-t border-slate-100">

                  {/* ── Mobile: one card per branch ── */}
                  <div className="sm:hidden divide-y divide-slate-100">
                    {g.branches.map((branch, i) => {
                      const branchCats = availableCats.filter(cat => {
                        const e = branch.cutoffs[cat];
                        return e && e.percentile !== null;
                      });
                      return (
                        <div key={i} className="px-4 py-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-[12px] text-slate-900 leading-snug">{branch.branch}</span>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0 mt-0.5">{branch.choiceCode}</span>
                          </div>
                          {branchCats.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic">No cutoff data available</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {branchCats.map(cat => {
                                const entry = branch.cutoffs[cat];
                                const pct   = entry?.percentile ?? null;
                                const rank  = entry?.rank ?? null;
                                const isLady = cat.startsWith('L');
                                return (
                                  <div key={cat} className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg border text-center min-w-[64px] ${isLady ? 'bg-pink-50 border-pink-200' : 'bg-slate-50 border-slate-200'}`}>
                                    <span className={`text-[9px] font-bold uppercase tracking-wide mb-0.5 ${isLady ? 'text-pink-500' : 'text-slate-400'}`}>
                                      {CAT_LABELS[cat] ?? cat}
                                    </span>
                                    <span className="font-extrabold text-[13px] text-slate-900">{pct}%</span>
                                    {rank !== null && (
                                      <span className="text-[9px] text-slate-400 mt-0.5">Rank {rank.toLocaleString('en-IN')}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Desktop: full scrollable table ── */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap sticky left-0 bg-slate-50 min-w-[180px]">
                            Branch
                          </th>
                          <th className="text-center px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">
                            Code
                          </th>
                          {availableCats.map(cat => (
                            <th key={cat} className={`text-center px-3 py-2.5 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap ${cat.startsWith('L') ? 'text-pink-400' : 'text-slate-500'}`}>
                              {CAT_LABELS[cat] ?? cat}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {g.branches.map((branch, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800 sticky left-0 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap max-w-xs truncate" title={branch.branch}>
                              {branch.branch}
                            </td>
                            <td className="px-3 py-3 text-center font-mono text-[10px] text-slate-500 whitespace-nowrap">
                              {branch.choiceCode}
                            </td>
                            {availableCats.map(cat => {
                              const entry = branch.cutoffs[cat];
                              const pct   = entry?.percentile ?? null;
                              const rank  = entry?.rank ?? null;
                              return (
                                <td key={cat} className="px-3 py-3 text-center whitespace-nowrap">
                                  {pct !== null ? (
                                    <div className="space-y-0.5">
                                      <div className="font-bold text-slate-900">{pct}%</div>
                                      {rank !== null && (
                                        <div className="text-[9px] text-slate-400">Rank {rank.toLocaleString('en-IN')}</div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {filtered.length > 80 && (
          <p className="text-center text-[11px] text-slate-400 font-medium py-4">
            Showing 80 of {filtered.length} results. Refine your search to narrow down.
          </p>
        )}
      </div>
    </div>
  );
}
