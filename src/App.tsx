import React, { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PredictionForm from './components/PredictionForm';
import LoadingScreen from './components/LoadingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import CollegeSearch from './components/CollegeSearch';
import { StudentProfile, PredictionResult } from './types';
import { predictColleges } from './utils/predictionEngine';

// Import local JSON cutoff data
import cutoffDataRaw from './data/cutoff_data.json';
import { CollegeRecord } from './types';

// Cast the JSON import to our CollegeRecord array
const cutoffDataset = cutoffDataRaw as CollegeRecord[];

export default function App() {
  const [view, setView] = useState<'landing' | 'predict' | 'loading' | 'results' | 'search'>('landing');

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([]);
  const [shortlist, setShortlist] = useState<PredictionResult[]>([]);

  const handleToggleShortlist = (item: PredictionResult) => {
    setShortlist(prev => {
      const exists = prev.some(s => s.college.choiceCode === item.college.choiceCode);
      return exists ? prev.filter(s => s.college.choiceCode !== item.college.choiceCode) : [...prev, item];
    });
  };

  // Handle form submission
  const handleFormSubmit = (profile: StudentProfile) => {
    setStudentProfile(profile);
    
    // Execute prediction calculations
    const results = predictColleges(profile, cutoffDataset);
    setPredictionResults(results);
    
    // Move to loading animation screen
    setView('loading');
  };

  // Handle loading animation completion
  const handleLoadingComplete = () => {
    setView('results');
    // Scroll to top of results dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle direct navigation from header links
  const handleNavigate = (targetView: 'landing' | 'predict' | 'results' | 'search') => {
    if (targetView === 'results' && predictionResults.length === 0) {
      setView('predict');
    } else {
      setView(targetView);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Navigation Header */}
      <Header
        onNavigate={handleNavigate}
        activeView={view === 'loading' ? 'predict' : view}
        hasResults={predictionResults.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center">
        {view === 'landing' && (
          <HeroSection
            onStartPredicting={() => setView('predict')}
            onSearchColleges={() => setView('search')}
          />
        )}

        {view === 'predict' && (
          <div className="w-full bg-[#F8FAFC] min-h-screen">
            <PredictionForm
              onSubmit={handleFormSubmit}
              onBackToHome={() => setView('landing')}
            />
          </div>
        )}

        {view === 'loading' && (
          <div className="w-full flex items-center justify-center bg-[#F8FAFC] min-h-screen px-4">
            <LoadingScreen onComplete={handleLoadingComplete} />
          </div>
        )}

        {view === 'results' && studentProfile && (
          <div className="w-full bg-[#F8FAFC]">
            <ResultsDashboard
              results={predictionResults}
              profile={studentProfile}
              shortlist={shortlist}
              onToggleShortlist={handleToggleShortlist}
              onClearShortlist={() => setShortlist([])}
              onBack={() => setView('predict')}
            />
          </div>
        )}

        {view === 'search' && (
          <div className="w-full bg-[#F8FAFC] min-h-screen">
            <CollegeSearch
              dataset={cutoffDataset}
              onBack={() => setView('landing')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 font-sans text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-6">

          {/* Brand */}
          <div className="space-y-1.5">
            <span className="font-display font-extrabold text-sm text-white tracking-wide block">DSE College Predictor Maharashtra</span>
            <p className="text-slate-400 font-medium">Made with ❤️ for Diploma students seeking Engineering admissions.</p>
            <p className="text-slate-600 text-[11px]">&copy; {new Date().getFullYear()} DSE Predictor Portal. All Rights Reserved.</p>
          </div>

          {/* Developer credit */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Developed by</p>
            <p className="font-display font-extrabold text-white text-sm">Pratik Sachin Kumbhar</p>
            <div className="space-y-1 text-[11px] font-medium">
              <a href="mailto:pratik.1213.coep@gmail.com" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                pratik.1213.coep@gmail.com
              </a>
              <a href="tel:+917385546546" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                +91 73855 46546
              </a>
              <span className="flex items-center gap-1.5 text-slate-500">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Kolhapur / Pune, Maharashtra
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <a href="https://www.linkedin.com/in/pratik-kumbhar-1213praa29b/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors text-[11px] font-semibold">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a href="https://github.com/Pratik-1213" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[11px] font-semibold">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-[11px] font-medium text-slate-600 max-w-xs space-y-1">
            <p className="text-slate-500 font-semibold">Disclaimer</p>
            <p>Results are advisory only. Actual 2026-27 cutoffs may vary. Always verify with the official CET Cell handbook before submitting your CAP option form.</p>
          </div>

        </div>
      </footer>
    </div>
  );
}
