import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, ArrowLeft, Filter, SlidersHorizontal, Download, ArrowUpDown, 
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

export default function ResultsDashboard({ results, profile, onBack }: ResultsDashboardProps) {
  // Advanced filters state
  const [sortBy, setSortBy] = useState<'prob' | 'cutoff' | 'govt' | 'auto'>('cutoff');
  const [filterGovt, setFilterGovt] = useState(false);
  const [filterAuto, setFilterAuto] = useState(false);
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [minProbability, setMinProbability] = useState<number>(0);
  const [chanceFilter, setChanceFilter] = useState<string>('All');
  
  // Mobile filters drawer open state
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Comparison list state (Max 3 colleges)
  const [compareList, setCompareList] = useState<PredictionResult[]>([]);

  // 1. Get unique regions present in results for filtering
  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    results.forEach(r => regions.add(r.college.region));
    return ['All', ...Array.from(regions)];
  }, [results]);

  // 2. Filter & Sort prediction results
  const processedResults = useMemo(() => {
    let list = [...results];

    // Filter: Government only
    if (filterGovt) {
      list = list.filter(r => r.college.type === 'Government' || r.college.type === 'Government Autonomous');
    }

    // Filter: Autonomous only
    if (filterAuto) {
      list = list.filter(r => r.college.autonomous);
    }

    // Filter: Region specific
    if (filterRegion !== 'All') {
      list = list.filter(r => r.college.region === filterRegion);
    }

    // Filter: Minimum probability
    if (minProbability > 0) {
      list = list.filter(r => r.probability >= minProbability);
    }

    // Filter: Chance status
    if (chanceFilter !== 'All') {
      list = list.filter(r => r.chanceStatus === chanceFilter);
    }

    // Sort By logic
    if (sortBy === 'prob') {
      list.sort((a, b) => b.probability - a.probability || b.cutoffPercent - a.cutoffPercent);
    } else if (sortBy === 'cutoff') {
      // Sort by previous cutoff percentage descending (highest cutoff/prestige first)
      list.sort((a, b) => b.cutoffPercent - a.cutoffPercent);
    } else if (sortBy === 'govt') {
      // Government colleges first, then sorted by previous cutoff percentage descending
      const isGovt = (r: PredictionResult) => r.college.type.includes('Government') ? 1 : 0;
      list.sort((a, b) => isGovt(b) - isGovt(a) || b.cutoffPercent - a.cutoffPercent);
    } else if (sortBy === 'auto') {
      // Autonomous colleges first, then sorted by previous cutoff percentage descending
      const isAuto = (r: PredictionResult) => r.college.autonomous ? 1 : 0;
      list.sort((a, b) => isAuto(b) - isAuto(a) || b.cutoffPercent - a.cutoffPercent);
    }

    return list;
  }, [results, sortBy, filterGovt, filterAuto, filterRegion, minProbability, chanceFilter]);

  // 3. Compute stats based on current processed results
  const stats: DashboardStats = useMemo(() => {
    return getDashboardStats(processedResults);
  }, [processedResults]);

  // 4. Generate option form order strategy
  const strategyColleges = useMemo(() => {
    return generateCapStrategy(processedResults);
  }, [processedResults]);

  // 5. PDF generation handler
  const handleDownloadPdf = () => {
    generatePdfReport(profile, processedResults, strategyColleges, compareList);
  };

  // 6. Handle comparison selection
  const handleToggleCompare = (item: PredictionResult) => {
    const isSelected = compareList.some(c => c.college.choiceCode === item.college.choiceCode);
    if (isSelected) {
      setCompareList(compareList.filter(c => c.college.choiceCode !== item.college.choiceCode));
    } else {
      if (compareList.length >= 3) {
        alert("You can select a maximum of 3 colleges to compare side-by-side.");
        return;
      }
      setCompareList([...compareList, item]);
    }
  };

  const handleRemoveCompare = (choiceCode: string) => {
    setCompareList(compareList.filter(c => c.college.choiceCode !== choiceCode));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  // Color mapping utility for gauge & status tags
  const getChanceDetails = (status: string) => {
    switch (status) {
      case 'Safe':
        return { color: '#16A34A', bgClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
      case 'High Chance':
        return { color: '#2563EB', bgClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' };
      case 'Moderate Chance':
        return { color: '#F59E0B', bgClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' };
      case 'Low Chance':
        return { color: '#EA580C', bgClass: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' };
      case 'Dream':
        return { color: '#DC2626', bgClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' };
      default:
        return { color: '#64748B', bgClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-slate-100">
      
      {/* Back Button & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 text-left">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors duration-200 cursor-pointer"
            aria-label="Back to Form"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-950 dark:text-white leading-tight">
              Predictor Results Dashboard
            </h2>
            <p className="text-[11px] text-text-muted font-semibold mt-0.5">
              Candidate: {profile.name} &bull; Marks: {profile.percentage}% &bull; Category: {profile.category}
            </p>
          </div>
        </div>

        {/* Action button: Download PDF */}
        <button 
          onClick={handleDownloadPdf}
          className="btn-primary inline-flex items-center space-x-2 text-xs sm:text-sm self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4.5 h-4.5" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* 1. Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Matched Colleges</span>
            <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white leading-none mt-1 block">
              {stats.totalMatched}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Highest Chance</span>
            <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white leading-none mt-1 block">
              {stats.highestProbability}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Govt. Colleges</span>
            <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white leading-none mt-1 block">
              {stats.governmentCount}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Autonomous Colleges</span>
            <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white leading-none mt-1 block">
              {stats.autonomousCount}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Best Match Recommendation Highlight Card */}
      {stats.bestRecommended && (
        <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-blue-500/30 text-left flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          {/* Background overlay circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-1/3 -top-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

          <div className="space-y-3 max-w-2xl relative z-10">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-white font-extrabold text-[10px] tracking-wide uppercase border border-white/20">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>🏆 Best Recommended Match</span>
            </span>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight leading-snug">
              {stats.bestRecommended.collegeName}
            </h3>
            <p className="text-slate-200 font-sans text-xs sm:text-sm font-semibold">
              Course Branch: <span className="text-white font-bold">{stats.bestRecommended.branch}</span> &bull; Cutoff Required: <span className="text-white font-bold">{stats.bestRecommended.cutoffPercent}%</span>
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 relative z-10 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
            {/* Probability Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="w-full h-full gauge-svg" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#FFFFFF" strokeWidth="3" 
                          strokeDasharray="100.53" strokeDashoffset={100.53 - (stats.bestRecommended.probability / 100) * 100.53} />
                </svg>
                <span className="absolute font-display font-extrabold text-sm sm:text-base">{stats.bestRecommended.probability}%</span>
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase mt-1">Probability</span>
            </div>

            {/* status Tag */}
            <div className="text-right flex flex-col justify-center">
              <span className="text-[10px] text-slate-200 font-bold uppercase tracking-wider block leading-none">Admission Status</span>
              <span className="inline-flex px-3.5 py-1.5 rounded-xl bg-white text-blue-800 font-extrabold text-xs uppercase shadow-sm border border-slate-100 mt-1">
                {stats.bestRecommended.chanceStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main content grid: Filters on left, Colleges on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 3. Advanced Filters Sidebar (Desktop) */}
        <aside className="hidden lg:col-span-3 lg:flex flex-col space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm text-left">
          <div className="flex items-center space-x-2 font-display font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
            <Filter className="w-4 h-4 text-primary" />
            <span>Advanced Filters</span>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="cutoff">Highest Cutoff (Prestige)</option>
              <option value="prob">Highest Probability</option>
              <option value="govt">Government First</option>
              <option value="auto">Autonomous First</option>
            </select>
          </div>

          {/* Management / Type Checkbox */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Management</label>
            <div className="flex flex-col space-y-2 text-xs font-semibold">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={filterGovt} 
                  onChange={(e) => setFilterGovt(e.target.checked)}
                  className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 w-4 h-4 cursor-pointer"
                />
                <span>Government Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={filterAuto} 
                  onChange={(e) => setFilterAuto(e.target.checked)}
                  className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 w-4 h-4 cursor-pointer"
                />
                <span>Autonomous Only</span>
              </label>
            </div>
          </div>

          {/* Region filter selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Region</label>
            <select 
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none"
            >
              {uniqueRegions.map(reg => (
                <option key={reg} value={reg}>{reg === 'All' ? 'All Regions' : reg}</option>
              ))}
            </select>
          </div>

          {/* Chance filter selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chance Status</label>
            <select 
              value={chanceFilter} 
              onChange={(e) => setChanceFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Chances</option>
              <option value="Safe">Safe Only</option>
              <option value="High Chance">High Chance Only</option>
              <option value="Moderate Chance">Moderate Chance Only</option>
              <option value="Low Chance">Low Chance Only</option>
              <option value="Dream">Dream Only</option>
            </select>
          </div>

          {/* Probability range slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Min Probability</span>
              <span className="text-primary font-bold">{minProbability}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="95" 
              step="5"
              value={minProbability}
              onChange={(e) => setMinProbability(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </aside>

        {/* Mobile Filters Toggle Button & Drawer Trigger */}
        <div className="lg:hidden col-span-1 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm w-full">
          <button 
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Filters & Sorting</span>
          </button>
          <span className="text-[11.5px] font-bold text-text-muted">
            {processedResults.length} Matched Options
          </span>
        </div>

        {/* Mobile Filters Drawer Overlay */}
        {showFiltersMobile && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
            <div className="w-80 bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col space-y-6 overflow-y-auto text-left relative">
              <button 
                onClick={() => setShowFiltersMobile(false)}
                className="absolute right-4 top-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
              
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                Filters & Sorting
              </h3>

              <div className="space-y-4 pt-2">
                {/* Sort selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort Options</label>
                  <select 
                    value={sortBy} 
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="cutoff">Highest Cutoff (Prestige)</option>
                    <option value="prob">Highest Probability</option>
                    <option value="govt">Government First</option>
                    <option value="auto">Autonomous First</option>
                  </select>
                </div>

                {/* Management select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Management</label>
                  <div className="flex flex-col space-y-2 text-xs font-semibold">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={filterGovt} 
                        onChange={(e) => setFilterGovt(e.target.checked)}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      <span>Government Only</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={filterAuto} 
                        onChange={(e) => setFilterAuto(e.target.checked)}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      <span>Autonomous Only</span>
                    </label>
                  </div>
                </div>

                {/* Region select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Region</label>
                  <select 
                    value={filterRegion} 
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    {uniqueRegions.map(reg => (
                      <option key={reg} value={reg}>{reg === 'All' ? 'All Regions' : reg}</option>
                    ))}
                  </select>
                </div>

                {/* Chance select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chance Status</label>
                  <select 
                    value={chanceFilter} 
                    onChange={(e) => setChanceFilter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-xs font-semibold"
                  >
                    <option value="All">All Chances</option>
                    <option value="Safe">Safe Only</option>
                    <option value="High Chance">High Chance Only</option>
                    <option value="Moderate Chance">Moderate Chance Only</option>
                    <option value="Low Chance">Low Chance Only</option>
                    <option value="Dream">Dream Only</option>
                  </select>
                </div>

                {/* range slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Min Probability</span>
                    <span className="text-primary font-bold">{minProbability}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="95" 
                    step="5"
                    value={minProbability}
                    onChange={(e) => setMinProbability(parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <button 
                onClick={() => setShowFiltersMobile(false)}
                className="btn-primary w-full py-3 text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* 4. Recommendations Cards List Column */}
        <div className="lg:col-span-9 space-y-6">
          
          <div className="flex justify-between items-center text-left">
            <div>
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Top College Recommendations
              </h3>
              <p className="text-[11px] text-text-muted font-medium mt-0.5">
                Showing top matches ordered by your preferences.
              </p>
            </div>
            <span className="hidden sm:inline-flex text-xs font-bold text-text-muted bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg select-none">
              {processedResults.length} Options Found
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {processedResults.slice(0, 10).map((item, index) => {
              const chance = getChanceDetails(item.chanceStatus);
              const isSelectedForCompare = compareList.some(c => c.college.choiceCode === item.college.choiceCode);

              return (
                <div 
                  key={item.college.choiceCode}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left relative overflow-hidden group"
                >
                  {/* index Circle */}
                  <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-display font-extrabold text-[10px] sm:text-xs flex items-center justify-center text-slate-500 dark:text-slate-400">
                    {index + 1}
                  </div>

                  {/* Top Header Row with Checkbox */}
                  <div className="flex justify-between items-start pl-7 pb-2.5 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-text-muted tracking-wider uppercase block">Choice Code &bull; {item.college.choiceCode}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">{item.college.region} Region</span>
                    </div>
                    {/* Compare Selection Checkbox */}
                    <label className="flex items-center space-x-1.5 cursor-pointer select-none text-[10.5px] font-bold text-slate-500 hover:text-primary">
                      <input 
                        type="checkbox" 
                        checked={isSelectedForCompare}
                        onChange={() => handleToggleCompare(item)}
                        className="rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Compare</span>
                    </label>
                  </div>

                  {/* Body Content */}
                  <div className="py-4 space-y-3">
                    <h4 className="font-display font-extrabold text-[13.5px] text-slate-900 dark:text-white leading-tight min-h-[38px]">
                      {item.college.collegeName}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="text-text-muted text-[10px] font-medium block uppercase tracking-wider">Branch / Course</span>
                        <span className="leading-snug truncate block max-w-[150px] font-bold text-slate-900 dark:text-slate-100" title={item.college.branch}>
                          {item.college.branch}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted text-[10px] font-medium block uppercase tracking-wider">College Type</span>
                        <span className="leading-snug block font-bold text-slate-900 dark:text-slate-100">
                          {item.college.type}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10.5px] font-bold border-t border-slate-100 dark:border-slate-800/40 pt-3">
                      <div className="text-left">
                        <span className="text-text-muted font-medium text-[9px] block uppercase">Prev Cutoff</span>
                        <span>{item.cutoffPercent}% <span className="text-[8px] font-bold text-slate-400">({item.matchedCutoffCategory})</span></span>
                      </div>
                      <div className="text-center">
                        <span className="text-text-muted font-medium text-[9px] block uppercase">Your Score</span>
                        <span className="text-slate-900 dark:text-white">{profile.percentage}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-text-muted font-medium text-[9px] block uppercase">Difference</span>
                        <span className={item.difference >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {item.difference >= 0 ? `+${item.difference}%` : `${item.difference}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Probability Gauge Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3.5">
                    {/* Status Badge */}
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-bold uppercase border ${chance.bgClass}`}>
                      {item.chanceStatus}
                    </span>

                    {/* SVG Gauge */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="relative w-10 h-10 flex items-center justify-center">
                        <svg className="w-full h-full gauge-svg" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke={chance.color} strokeWidth="2.5" 
                                  strokeDasharray="100.53" strokeDashoffset={100.53 - (item.probability / 100) * 100.53} />
                        </svg>
                        <span className="absolute font-display font-extrabold text-[9px]">{item.probability}%</span>
                      </div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Admission Chance</span>
                    </div>
                  </div>

                </div>
              );
            })}

            {/* Empty state notice */}
            {processedResults.length === 0 && (
              <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-800/10 border border-slate-200 dark:border-slate-800 p-10 rounded-2xl text-center flex flex-col items-center justify-center min-h-[220px]">
                <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  No colleges found matching filter options.
                </h3>
                <p className="text-[11px] text-text-muted font-medium mt-1">
                  Try adjusting the probability range slider, clearing check filters, or selecting additional branches/regions in your preferences.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 5. College Comparison Matrix Drawer */}
      <ComparisonSection 
        compareList={compareList}
        onRemove={handleRemoveCompare}
        onClear={handleClearCompare}
      />

      {/* 6. Option Form Strategy Generator */}
      {processedResults.length > 0 && (
        <CapStrategy strategyColleges={strategyColleges} />
      )}

      {/* 7. Analytics Dashboard: Charts */}
      {processedResults.length > 0 && (
        <ChartsSection results={processedResults} />
      )}

      {/* Report PDF Card banner */}
      {processedResults.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Generate Your Personalized CAP Strategy Report
            </h4>
            <p className="text-[11px] text-text-muted font-medium">
              Report contains Top 10 predicted colleges, Side-by-Side comparison, CAP form strategic order choices and offline worksheets.
            </p>
          </div>
          <button 
            onClick={handleDownloadPdf}
            className="btn-primary inline-flex items-center space-x-2 text-xs sm:text-sm shrink-0 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      )}

      {/* Disclaimer disclaimer info text */}
      <p className="text-[10px] text-text-muted italic leading-relaxed pt-2 select-none">
        * Admission predictions and probabilities are based on previous year CAP Round I Cutoff percentages. Actual cutoffs of AY 2025-26 may vary based on student registration numbers, paper difficulty levels, and merit ranking statistics. Use this predictor for advisory purposes only.
      </p>

    </div>
  );
}
