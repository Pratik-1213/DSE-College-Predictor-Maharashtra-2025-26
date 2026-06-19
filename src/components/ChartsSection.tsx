import React from 'react';
import { PredictionResult } from '../types';

interface ChartsSectionProps {
  results: PredictionResult[];
}

export default function ChartsSection({ results }: ChartsSectionProps) {
  // 1. Calculate Probability Distribution (Safe, High Chance, Moderate Chance, Low Chance, Dream)
  const statusCounts = {
    Safe: results.filter(r => r.chanceStatus === 'Safe').length,
    'High Chance': results.filter(r => r.chanceStatus === 'High Chance').length,
    'Moderate Chance': results.filter(r => r.chanceStatus === 'Moderate Chance').length,
    'Low Chance': results.filter(r => r.chanceStatus === 'Low Chance').length,
    Dream: results.filter(r => r.chanceStatus === 'Dream').length
  };

  const total = results.length || 1;
  const statusPercentages = {
    Safe: Math.round((statusCounts.Safe / total) * 100),
    'High Chance': Math.round((statusCounts['High Chance'] / total) * 100),
    'Moderate Chance': Math.round((statusCounts['Moderate Chance'] / total) * 100),
    'Low Chance': Math.round((statusCounts['Low Chance'] / total) * 100),
    Dream: Math.round((statusCounts.Dream / total) * 100)
  };

  // SVG Donut Chart Calculation
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  const donutSegments = [
    { label: 'Safe', count: statusCounts.Safe, percent: statusPercentages.Safe, color: '#16A34A' }, // Green
    { label: 'High', count: statusCounts['High Chance'], percent: statusPercentages['High Chance'], color: '#2563EB' }, // Blue
    { label: 'Moderate', count: statusCounts['Moderate Chance'], percent: statusPercentages['Moderate Chance'], color: '#F59E0B' }, // Yellow
    { label: 'Low', count: statusCounts['Low Chance'], percent: statusPercentages['Low Chance'], color: '#EA580C' }, // Orange
    { label: 'Dream', count: statusCounts.Dream, percent: statusPercentages.Dream, color: '#DC2626' } // Red
  ].filter(s => s.count > 0);

  // 2. Region-Wise Opportunities (Top 5 regions)
  const regionCounts: Record<string, number> = {};
  results.forEach(r => {
    regionCounts[r.college.region] = (regionCounts[r.college.region] || 0) + 1;
  });

  const topRegions = Object.entries(regionCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxRegionCount = topRegions.length > 0 ? Math.max(...topRegions.map(r => r.count)) : 1;

  // 3. Branch-Wise Opportunities (Top 5 branches)
  const branchCounts: Record<string, number> = {};
  results.forEach(r => {
    // Standardize naming slightly for visualization
    let name = r.college.branch;
    if (name.includes('Computer Science and Engineering')) name = 'CSE';
    else if (name.includes('Computer Engineering')) name = 'Computer Engg.';
    else if (name.includes('Information Technology')) name = 'IT';
    else if (name.includes('Electronics and Telecommunication')) name = 'EXTC';
    else if (name.includes('Artificial Intelligence and Data Science')) name = 'AI & DS';
    else if (name.includes('Mechanical Engineering')) name = 'Mechanical';
    else if (name.includes('Electrical Engineering')) name = 'Electrical';
    
    branchCounts[name] = (branchCounts[name] || 0) + 1;
  });

  const topBranches = Object.entries(branchCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxBranchCount = topBranches.length > 0 ? Math.max(...topBranches.map(b => b.count)) : 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
      
      {/* Card 1: Donut Chart - Probability Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
        <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white text-left mb-4">
          Probability Distribution
        </h3>
        
        <div className="flex items-center justify-around h-full py-2">
          {/* Donut Circle */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full gauge-svg" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} className="gauge-bg" strokeWidth="12" />
              {donutSegments.map((seg, idx) => {
                const strokeDashoffset = circumference - (seg.count / total) * circumference;
                const rotationOffset = (currentOffset / total) * circumference;
                currentOffset += seg.count;

                return (
                  <circle
                    key={idx}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transform: `rotate(${(rotationOffset / circumference) * 360}deg)`,
                      transformOrigin: '60px 60px',
                      transition: 'all 0.5s ease'
                    }}
                  />
                );
              })}
            </svg>
            <div className="absolute flex flex-col justify-center items-center">
              <span className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-100">
                {results.length}
              </span>
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                Matches
              </span>
            </div>
          </div>

          {/* Legends */}
          <div className="flex flex-col space-y-1.5 text-left font-sans text-[11px] font-semibold pl-4">
            {donutSegments.map((seg, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-slate-700 dark:text-slate-300">
                  {seg.label}
                </span>
                <span className="text-text-muted">
                  ({seg.count})
                </span>
              </div>
            ))}
            {donutSegments.length === 0 && (
              <span className="text-text-muted">No data available</span>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Region-Wise Opportunities */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white text-left mb-4">
            Region Wise Opportunities
          </h3>
          <div className="space-y-4">
            {topRegions.map((region, idx) => {
              const widthPct = Math.max(12, Math.round((region.count / maxRegionCount) * 100));
              return (
                <div key={idx} className="flex flex-col space-y-1 text-left">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{region.name}</span>
                    <span className="text-primary font-bold">{region.count} colleges</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topRegions.length === 0 && (
              <p className="text-text-muted text-xs py-4 text-center font-semibold">No region data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Branch-Wise Opportunities */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white text-left mb-4">
            Branch Wise Opportunities
          </h3>
          <div className="space-y-4">
            {topBranches.map((branch, idx) => {
              const widthPct = Math.max(12, Math.round((branch.count / maxBranchCount) * 100));
              return (
                <div key={idx} className="flex flex-col space-y-1 text-left">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{branch.name}</span>
                    <span className="text-secondary font-bold">{branch.count} options</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" 
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {topBranches.length === 0 && (
              <p className="text-text-muted text-xs py-4 text-center font-semibold">No branch data available</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
