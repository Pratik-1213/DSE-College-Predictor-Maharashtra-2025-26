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
      <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 py-7 px-4 sm:px-6 lg:px-8 font-sans text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-display font-extrabold text-sm text-white tracking-wide block">DSE College Predictor Maharashtra</span>
            <p className="text-slate-400 font-medium">Made with ❤️ for Diploma students seeking Engineering admissions.</p>
          </div>
          <div className="text-left sm:text-right space-y-1 font-medium text-[11px]">
            <p className="text-slate-400">&copy; {new Date().getFullYear()} DSE Predictor Portal. All Rights Reserved.</p>
            <p className="text-slate-600">Results are advisory. Verify with the official CET Cell handbook.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
