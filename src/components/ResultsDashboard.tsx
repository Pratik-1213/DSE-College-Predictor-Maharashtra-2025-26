import React, { useState, useMemo } from 'react';
import {
  CheckCircle, ArrowLeft, Filter, SlidersHorizontal, Download, X,
  HelpCircle, Sparkles, Building, MapPin, Gauge, GraduationCap
} from 'lucide-react';
import { PredictionResult, StudentProfile, DashboardStats } from '../types';
import { getDashboardStats, generateCapStrategy } from '../utils/predictionEngine';
import { generatePdfReport } from '../utils/PdfGenerator';
import ChartsSection from './ChartsSection';
import ComparisonSection from './ComparisonSection';
import CapStrategy from './CapStrategy';

interface ResultsDashboardProps {
  results: PredictionResult[];
  profile: StudentProfile;
  onBack: () => void;
}

const CHANCE_STYLES: Record<string, { color: string; bg: string; border: string; text: string }> = {
  Safe: { color: '#16A34A', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-700' },
  'High Chance': { color: '#2563EB', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-700' },
  'Moderate Chance': { color: '#F59E0B', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-700' },
  'Low Chance': { color: '#EA580C', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-700' },
  Dream: { color: '#DC2626', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-700' },
};

export default function ResultsDashboard({ results, profile, onBack }: ResultsDashboardProps) {
  const [sortBy, setSortBy] = useState<'prob' | 'cutoff' | 'govt' | 'auto'>('cutoff');
  const [filterGovt, setFilterGovt] = useState(false);
  const [filterAuto, setFilterAuto] = useState(false);
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [minProbability, setMinProbability] = useState(0);
  const [chanceFilter, setChanceFilter] = useState('All');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [compareList, setCompareList] = useState<PredictionResult[]>([]);

  const uniqueRegions = useMemo(() => {
    const s = new Set<string>();
    results.forEach(r => s.add(r.college.region));
    return ['All', ...Array.from(s).sort()];
  }, [results]);

  // Districts available for the selected region
  const uniqueDistricts = useMemo(() => {
    const s = new Set<string>();
    results
      .filter(r => filterRegion === 'All' || r.college.region === filterRegion)
      .forEach(r => { if (r.college.district) s.add(r.college.district); });
    return ['All', ...Array.from(s).sort()];
  }, [results, filterRegion]);

  // Reset district when region changes
  const handleRegionChange = (val: string) => {
    setFilterRegion(val);
    setFilterDistrict('All');
  };

  const processedResults = useMemo(() => {
    let list = [...results];
    if (filterGovt) list = list.filter(r => r.college.type === 'Government' || r.college.type === 'Government Autonomous' || r.college.type === 'University Department');
    if (filterAuto) list = list.filter(r => r.college.autonomous);
    if (filterRegion !== 'All') list = list.filter(r => r.college.region === filterRegion);
    if (filterDistrict !== 'All') list = list.filter(r => r.college.district === filterDistrict);
    if (minProbability > 0) list = list.filter(r => r.probability >= minProbability);
    if (chanceFilter !== 'All') list = list.filter(r => r.chanceStatus === chanceFilter);

    if (sortBy === 'prob') list.sort((a, b) => b.probability - a.probability || b.cutoffPercent - a.cutoffPercent);
    else if (sortBy === 'cutoff') list.sort((a, b) => b.cutoffPercent - a.cutoffPercent);
    else if (sortBy === 'govt') {
      const g = (r: PredictionResult) => (r.college.type.includes('Government') || r.college.type === 'University Department') ? 1 : 0;
      list.sort((a, b) => g(b) - g(a) || b.cutoffPercent - a.cutoffPercent);
    } else if (sortBy === 'auto') {
      list.sort((a, b) => (b.college.autonomous ? 1 : 0) - (a.college.autonomous ? 1 : 0) || b.cutoffPercent - a.cutoffPercent);
    }
    return list;
  }, [results, sortBy, filterGovt, filterAuto, filterRegion, filterDistrict, minProbability, chanceFilter]);

  const stats: DashboardStats = useMemo(() => getDashboardStats(processedResults), [processedResults]);
  const strategyColleges = useMemo(() => generateCapStrategy(processedResults), [processedResults]);

  const handleDownloadPdf = () => generatePdfReport(profile, processedResults, strategyColleges, compareList);

  const handleToggleCompare = (item: PredictionResult) => {
    const already = compareList.some(c => c.college.choiceCode === item.college.choiceCode);
    if (already) {
      setCompareList(compareList.filter(c => c.college.choiceCode !== item.college.choiceCode));
    } else {
      if (compareList.length >= 3) { alert('Select a maximum of 3 colleges to compare.'); return; }
      setCompareList([...compareList, item]);
    }
  };

  const FiltersContent = () => (
    <div className="space-y-5">
      {/* Sort */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sort By</label>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
        >
          <option value="cutoff">Highest Cutoff (Prestige)</option>
          <option value="prob">Highest Probability</option>
          <option value="govt">Government First</option>
          <option value="auto">Autonomous First</option>
        </select>
      </div>

      {/* Management toggles */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Management</label>
        {[
          { label: 'Government Only', val: filterGovt, set: setFilterGovt },
          { label: 'Autonomous Only', val: filterAuto, set: setFilterAuto },
        ].map(({ label, val, set }) => (
          <label key={label} className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={val}
              onChange={e => set(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-primary cursor-pointer"
            />
            {label}
          </label>
        ))}
      </div>

      {/* Region */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Region</label>
        <select
          value={filterRegion}
          onChange={e => handleRegionChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
        >
          {uniqueRegions.map(r => <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>)}
        </select>
      </div>

      {/* District */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">District</label>
        <select
          value={filterDistrict}
          onChange={e => setFilterDistrict(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
        >
          {uniqueDistricts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
        </select>
      </div>

      {/* Chance Status */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Chance Status</label>
        <select
          value={chanceFilter}
          onChange={e => setChanceFilter(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
        >
          <option value="All">All Chances</option>
          <option value="Safe">Safe</option>
          <option value="High Chance">High Chance</option>
          <option value="Moderate Chance">Moderate Chance</option>
          <option value="Low Chance">Low Chance</option>
          <option value="Dream">Dream</option>
        </select>
      </div>

      {/* Min Probability Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Min Probability</label>
          <span className="text-xs font-bold text-primary">{minProbability}%</span>
        </div>
        <input
          type="range"
          min="0" max="95" step="5"
          value={minProbability}
          onChange={e => setMinProbability(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>0%</span><span>50%</span><span>95%</span>
        </div>
      </div>

      {/* Reset */}
      {(filterGovt || filterAuto || filterRegion !== 'All' || filterDistrict !== 'All' || chanceFilter !== 'All' || minProbability > 0) && (
        <button
          onClick={() => { setFilterGovt(false); setFilterAuto(false); setFilterRegion('All'); setFilterDistrict('All'); setChanceFilter('All'); setMinProbability(0); }}
          className="w-full text-xs font-bold text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-300 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Reset Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

      {/* ── Header row ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
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
              Prediction Results
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {profile.name} &bull; {profile.percentage}% &bull; {profile.category}
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="btn-primary inline-flex items-center gap-2 text-xs sm:text-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* ── Stats Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: <Building className="w-5 h-5" />, label: 'Matched', value: stats.totalMatched, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: <Gauge className="w-5 h-5" />, label: 'Top Chance', value: `${stats.highestProbability}%`, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { icon: <GraduationCap className="w-5 h-5" />, label: 'Govt. Colleges', value: stats.governmentCount, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { icon: <CheckCircle className="w-5 h-5" />, label: 'Autonomous', value: stats.autonomousCount, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
              {s.icon}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{s.label}</span>
              <span className="font-display font-extrabold text-lg sm:text-xl text-slate-900 leading-none mt-0.5 block">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Best Recommended Banner ──────────────────────── */}
      {stats.bestRecommended && (
        <div className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg border border-blue-500/20 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-1/3 -top-16 w-60 h-60 rounded-full bg-white/5 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
            <div className="space-y-2.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold tracking-widest uppercase">
                <Sparkles className="w-3 h-3 fill-white" />
                Best Recommended Match
              </span>
              <h3 className="font-display font-extrabold text-lg sm:text-2xl leading-snug">
                {stats.bestRecommended.collegeName}
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">
                <span className="text-white font-bold">{stats.bestRecommended.branch}</span>
                &nbsp;&bull;&nbsp;Cutoff: <span className="text-white font-bold">{stats.bestRecommended.cutoffPercent}%</span>
              </p>
            </div>

            <div className="flex items-center gap-5 shrink-0 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
              {/* Probability gauge */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full gauge-svg" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#FFFFFF" strokeWidth="3"
                      strokeDasharray="94.25" strokeDashoffset={94.25 - (stats.bestRecommended.probability / 100) * 94.25} />
                  </svg>
                  <span className="absolute font-display font-extrabold text-xs">{stats.bestRecommended.probability}%</span>
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase mt-1 text-blue-200">Probability</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">Chance</span>
                <span className="inline-flex mt-1 px-3 py-1.5 rounded-lg bg-white text-blue-800 font-extrabold text-xs uppercase shadow-sm">
                  {stats.bestRecommended.chanceStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid: Filters + Cards ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Filters Sidebar — Desktop */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 font-display font-extrabold text-sm text-slate-900 pb-4 mb-5 border-b border-slate-100">
            <Filter className="w-4 h-4 text-primary" />
            <span>Filters</span>
          </div>
          <FiltersContent />
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <button
            onClick={() => setShowFiltersMobile(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Filters &amp; Sort</span>
          </button>
          <span className="text-[11px] font-semibold text-slate-500">
            {processedResults.length} results
          </span>
        </div>

        {/* Mobile Filter Drawer */}
        {showFiltersMobile && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFiltersMobile(false)} />
            <div className="relative ml-auto w-72 sm:w-80 max-w-full bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
              <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-slate-100 z-10">
                <span className="font-display font-extrabold text-sm text-slate-900">Filters &amp; Sort</span>
                <button onClick={() => setShowFiltersMobile(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex-1">
                <FiltersContent />
              </div>
              <div className="sticky bottom-0 bg-white p-4 border-t border-slate-100">
                <button onClick={() => setShowFiltersMobile(false)} className="btn-primary w-full justify-center py-3 text-sm">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* College Cards Column */}
        <div className="lg:col-span-9 space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                Top College Recommendations
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Ordered by your selected preferences.
              </p>
            </div>
            <span className="hidden sm:inline-flex text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg select-none">
              {processedResults.length} options
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processedResults.slice(0, 10).map((item, index) => {
              const cs = CHANCE_STYLES[item.chanceStatus] ?? CHANCE_STYLES['Safe'];
              const isSelected = compareList.some(c => c.college.choiceCode === item.college.choiceCode);

              return (
                <div
                  key={item.college.choiceCode}
                  className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4 text-left relative"
                >
                  {/* Rank badge */}
                  <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-slate-100 font-display font-extrabold text-[10px] flex items-center justify-center text-slate-500">
                    {index + 1}
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start pl-8">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase block">
                        Code · {item.college.choiceCode}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                        {item.college.region}
                      </span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] font-bold text-slate-400 hover:text-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCompare(item)}
                        className="w-3.5 h-3.5 rounded border-slate-300 accent-primary cursor-pointer"
                      />
                      <span>Compare</span>
                    </label>
                  </div>

                  {/* Body */}
                  <div className="space-y-3">
                    <h4 className="font-display font-extrabold text-[13px] sm:text-[14px] text-slate-900 leading-snug">
                      {item.college.collegeName}
                    </h4>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Branch</span>
                        <span className="font-bold text-slate-800 leading-snug line-clamp-2" title={item.college.branch}>
                          {item.college.branch}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Type</span>
                        <span className="font-bold text-slate-800">
                          {item.college.type}
                          {item.college.autonomous && <span className="ml-1 text-[8px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">AUTO</span>}
                        </span>
                      </div>
                    </div>

                    {/* Cutoff row */}
                    <div className="grid grid-cols-3 gap-2 text-[10.5px] font-bold border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-[9px] text-slate-400 font-medium block uppercase mb-0.5">Prev Cutoff</span>
                        <span className="text-slate-800">{item.cutoffPercent}%</span>
                        <span className="text-[8px] text-slate-400 ml-1">({item.matchedCutoffCategory})</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] text-slate-400 font-medium block uppercase mb-0.5">Your Score</span>
                        <span className="text-slate-900">{profile.percentage}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-medium block uppercase mb-0.5">Gap</span>
                        <span className={item.difference >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {item.difference >= 0 ? '+' : ''}{item.difference}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border ${cs.bg} ${cs.border} ${cs.text}`}>
                      {item.chanceStatus}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative w-9 h-9 flex items-center justify-center">
                        <svg className="w-full h-full gauge-svg" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-100" />
                          <circle cx="18" cy="18" r="15" fill="none" stroke={cs.color} strokeWidth="2.5"
                            strokeDasharray="94.25" strokeDashoffset={94.25 - (item.probability / 100) * 94.25} />
                        </svg>
                        <span className="absolute font-display font-extrabold text-[9px] text-slate-800">{item.probability}%</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">Chance</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {processedResults.length === 0 && (
              <div className="col-span-1 md:col-span-2 bg-slate-50 border border-slate-200 p-10 rounded-2xl text-center flex flex-col items-center justify-center min-h-[200px]">
                <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
                <h3 className="font-display font-extrabold text-sm text-slate-700">
                  No results match the current filters.
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-sm">
                  Try reducing the min probability, removing management filters, or selecting a different region.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Comparison Matrix ────────────────────────────── */}
      <ComparisonSection compareList={compareList} onRemove={code => setCompareList(compareList.filter(c => c.college.choiceCode !== code))} onClear={() => setCompareList([])} />

      {/* ── CAP Strategy ─────────────────────────────────── */}
      {processedResults.length > 0 && <CapStrategy strategyColleges={strategyColleges} />}

      {/* ── Analytics Charts ─────────────────────────────── */}
      {processedResults.length > 0 && <ChartsSection results={processedResults} />}

      {/* ── PDF Banner ───────────────────────────────────── */}
      {processedResults.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
              Download Your Personalised CAP Strategy Report
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Includes top 10 colleges, CAP form order, comparison matrix and offline worksheets.
            </p>
          </div>
          <button onClick={handleDownloadPdf} className="btn-primary inline-flex items-center gap-2 text-xs sm:text-sm shrink-0">
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-400 italic leading-relaxed pb-2">
        * Predictions are based on CAP Round I cutoffs from 2024‑25. Actual cutoffs for 2025‑26 may vary. Use this tool for advisory purposes only.
      </p>
    </div>
  );
}
